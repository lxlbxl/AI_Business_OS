/**
 * AI Business OS - Backend API Server
 * Uses Claude Code CLI for AI interactions
 * Port: 7890
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 7890;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configuration
const OS_ROOT = path.resolve(__dirname, '../..');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Simple user store (in production, use a database)
const users = {
  admin: {
    id: '1',
    username: 'admin',
    passwordHash: '',
    name: 'Alex',
    role: 'ceo'
  }
};

// Initialize default admin password on startup
(async () => {
  users.admin.passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  console.log('Admin password configured');
})();

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users[username];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = users[req.user.username];

    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ============ FILE ROUTES ============

app.get('/api/files', authMiddleware, async (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const fullPath = path.join(OS_ROOT, relativePath);

    // Security: Ensure path is within OS_ROOT
    if (!fullPath.startsWith(OS_ROOT)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
      const items = await fs.readdir(fullPath, { withFileTypes: true });
      const files = await Promise.all(
        items
          .filter(item => !item.name.startsWith('.') || item.name === '.agent')
          .map(async (item) => {
            const itemPath = path.join(fullPath, item.name);
            const itemStats = await fs.stat(itemPath);
            return {
              name: item.name,
              path: path.join(relativePath, item.name).replace(/\\/g, '/'),
              isDirectory: item.isDirectory(),
              size: itemStats.size,
              modified: itemStats.mtime
            };
          })
      );

      // Sort: directories first, then alphabetically
      files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      res.json({ type: 'directory', items: files, path: relativePath });
    } else {
      const content = await fs.readFile(fullPath, 'utf-8');
      res.json({ type: 'file', content, path: relativePath });
    }
  } catch (error) {
    console.error('File read error:', error);
    res.status(500).json({ error: 'Failed to read path' });
  }
});

app.put('/api/files', authMiddleware, async (req, res) => {
  try {
    const { path: relativePath, content } = req.body;
    const fullPath = path.join(OS_ROOT, relativePath);

    // Security check
    if (!fullPath.startsWith(OS_ROOT)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await fs.writeFile(fullPath, content, 'utf-8');
    res.json({ message: 'File saved successfully' });
  } catch (error) {
    console.error('File write error:', error);
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// ============ CLAUDE CODE CLI INTEGRATION ============

/**
 * Execute Claude Code CLI with a prompt
 * This gives Claude full access to the file system and tools
 */
async function executeClaudeCode(prompt, cwd = OS_ROOT) {
  return new Promise((resolve, reject) => {
    const args = [
      '--print',           // Non-interactive mode, print response
      '--output-format', 'text',  // Plain text output
      prompt
    ];

    console.log(`[Claude Code] Executing in ${cwd}`);
    console.log(`[Claude Code] Prompt: ${prompt.substring(0, 100)}...`);

    const claude = spawn('claude', args, {
      cwd: cwd,
      env: { ...process.env },
      shell: true
    });

    let stdout = '';
    let stderr = '';

    claude.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    claude.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    claude.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        console.error(`[Claude Code] Error: ${stderr}`);
        reject(new Error(stderr || `Claude Code exited with code ${code}`));
      }
    });

    claude.on('error', (error) => {
      reject(error);
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      claude.kill();
      reject(new Error('Claude Code execution timed out (5 minutes)'));
    }, 5 * 60 * 1000);
  });
}

/**
 * Build system context prompt for AI-COO behavior
 */
function buildSystemPrompt(userName, userRole) {
  return `You are the AI-COO for the AI Business OS. You are running inside the OS directory and have full access to all files.

IMPORTANT CONTEXT FILES TO READ:
- 00_Governance/Decision_Authority.md - Your authority levels
- 00_Governance/Guardrails.md - What you must never do
- 01_Strategy/North_Star.md - The goal
- 01_Strategy/Current_Bottleneck.md - Current focus
- System/Agents/ai_coo.md - Your full operating instructions

OPERATING RULES:
- 🟢 Level 1 (Auto): Research, drafts, organizing - do immediately
- 🟡 Level 2 (Notify): Priority changes - do and report
- 🟠 Level 3 (Approve): External comms, finances - ask first
- 🔴 Level 4 (Never): Payments, contracts, credentials

Current user: ${userName} (${userRole})

When you need to save decisions or create approval requests, write to:
- 03_Operations/Decision_Log/ for logging decisions
- 03_Operations/Pending_Approvals/ for things needing human approval

Be concise, actionable, and always state the authority level for your recommendations.`;
}

// ============ CHAT / AI ROUTES ============

app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    // Build the full prompt with context
    const systemPrompt = buildSystemPrompt(req.user.name, req.user.role);
    const fullPrompt = `${systemPrompt}

USER REQUEST:
${message}

Please help with this request. If you need to read files for context, do so. If you need to make changes, explain what you're doing.`;

    const response = await executeClaudeCode(fullPrompt, OS_ROOT);

    res.json({
      message: response,
      source: 'claude-code-cli'
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: `Claude Code CLI error: ${error.message}`,
      hint: 'Make sure Claude Code CLI is installed and authenticated on the VPS'
    });
  }
});

// ============ WORKFLOW ROUTES ============

app.get('/api/workflows', authMiddleware, async (req, res) => {
  try {
    const workflowsPath = path.join(OS_ROOT, '.agent/workflows');
    const files = await fs.readdir(workflowsPath);

    const workflows = await Promise.all(
      files.filter(f => f.endsWith('.md')).map(async (file) => {
        const content = await fs.readFile(path.join(workflowsPath, file), 'utf-8');
        const descMatch = content.match(/description:\s*(.+)/);
        return {
          id: file.replace('.md', ''),
          name: file.replace('.md', '').replace(/-/g, ' '),
          description: descMatch ? descMatch[1] : 'No description',
          file: file
        };
      })
    );

    res.json(workflows);
  } catch (error) {
    console.error('Workflows error:', error);
    res.status(500).json({ error: 'Failed to load workflows' });
  }
});

app.post('/api/workflows/:id/run', authMiddleware, async (req, res) => {
  try {
    const workflowId = req.params.id;
    const workflowPath = path.join(OS_ROOT, `.agent/workflows/${workflowId}.md`);

    // Check if workflow exists
    try {
      await fs.access(workflowPath);
    } catch {
      return res.status(404).json({ error: `Workflow '${workflowId}' not found` });
    }

    // Read the workflow
    const workflowContent = await fs.readFile(workflowPath, 'utf-8');

    // Build prompt to execute the workflow
    const prompt = `You are the AI-COO. Execute the following workflow:

WORKFLOW FILE: .agent/workflows/${workflowId}.md

${workflowContent}

Execute this workflow now. Read any files mentioned, perform the steps, and provide a detailed report of:
1. What you did
2. What you found
3. Any recommendations or next steps
4. Any items that need human approval (save these to 03_Operations/Pending_Approvals/)`;

    const response = await executeClaudeCode(prompt, OS_ROOT);

    res.json({
      result: response,
      workflow: workflowId
    });
  } catch (error) {
    console.error('Workflow error:', error);
    res.status(500).json({ error: `Failed to run workflow: ${error.message}` });
  }
});

// ============ APPROVALS ROUTES ============

app.get('/api/approvals', authMiddleware, async (req, res) => {
  try {
    const approvalsPath = path.join(OS_ROOT, '03_Operations/Pending_Approvals');

    try {
      const files = await fs.readdir(approvalsPath);
      const approvals = await Promise.all(
        files.filter(f => f.endsWith('.md')).map(async (file) => {
          const content = await fs.readFile(path.join(approvalsPath, file), 'utf-8');
          return {
            id: file.replace('.md', ''),
            filename: file,
            content: content,
            created: (await fs.stat(path.join(approvalsPath, file))).mtime
          };
        })
      );
      res.json(approvals);
    } catch (e) {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to load approvals' });
  }
});

app.post('/api/approvals/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { notes } = req.body;
    const pendingPath = path.join(OS_ROOT, `03_Operations/Pending_Approvals/${req.params.id}.md`);
    const approvedPath = path.join(OS_ROOT, `03_Operations/Approved_Actions/${req.params.id}.md`);

    let content = await fs.readFile(pendingPath, 'utf-8');
    content += `\n\n---\n**STATUS:** ✅ Approved\n**Approved By:** ${req.user.name}\n**Date:** ${new Date().toISOString()}\n**Notes:** ${notes || 'None'}`;

    await fs.writeFile(approvedPath, content);
    await fs.unlink(pendingPath);

    res.json({ message: 'Approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve' });
  }
});

app.post('/api/approvals/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const pendingPath = path.join(OS_ROOT, `03_Operations/Pending_Approvals/${req.params.id}.md`);
    const rejectedPath = path.join(OS_ROOT, `03_Operations/Decision_Log/${req.params.id}-REJECTED.md`);

    let content = await fs.readFile(pendingPath, 'utf-8');
    content += `\n\n---\n**STATUS:** ❌ Rejected\n**Rejected By:** ${req.user.name}\n**Date:** ${new Date().toISOString()}\n**Reason:** ${reason || 'No reason provided'}`;

    await fs.writeFile(rejectedPath, content);
    await fs.unlink(pendingPath);

    res.json({ message: 'Rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject' });
  }
});

// ============ STATUS ROUTE ============

app.get('/api/status', async (req, res) => {
  // Check if Claude Code CLI is available
  let claudeCodeAvailable = false;
  try {
    await executeClaudeCode('echo "test"', OS_ROOT);
    claudeCodeAvailable = true;
  } catch (e) {
    claudeCodeAvailable = false;
  }

  res.json({
    status: 'online',
    version: '1.0.0',
    claudeCodeAvailable,
    osRoot: OS_ROOT
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║         AI BUSINESS OS - API Server                    ║
╠════════════════════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}                        ║
║  📁 OS Root: ${OS_ROOT.substring(0, 35)}...              
║  🤖 Mode: Claude Code CLI Integration                  ║
║                                                        ║
║  Default login: admin / admin123                       ║
║  ⚠️  Change password after first login!                ║
║                                                        ║
║  Make sure Claude Code CLI is installed and           ║
║  authenticated on this machine!                        ║
╚════════════════════════════════════════════════════════╝
  `);
});
