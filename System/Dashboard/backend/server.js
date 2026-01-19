/**
 * AI Business OS - Backend API Server
 * Port: 7890
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 7890;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configuration
const OS_ROOT = path.resolve(__dirname, '../..');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Initialize Anthropic client
let anthropic = null;
if (ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
}

// Simple user store (in production, use a database)
const users = {
  admin: {
    id: '1',
    username: 'admin',
    // Default password: 'admin123' - CHANGE THIS!
    passwordHash: '$2a$10$XQxBtXXWvQZ5X5X5X5X5XO5X5X5X5X5X5X5X5X5X5X5X5X5X5X5',
    name: 'Alex',
    role: 'ceo'
  }
};

// Initialize default admin password on startup
(async () => {
  users.admin.passwordHash = await bcrypt.hash('admin123', 10);
  console.log('Default admin credentials: admin / admin123');
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

// ============ CHAT / AI ROUTES ============

// Load system context for AI
async function loadSystemContext() {
  const contextFiles = [
    '00_Governance/Decision_Authority.md',
    '00_Governance/Guardrails.md',
    '01_Strategy/North_Star.md',
    '01_Strategy/Strategic_Vehicle.md',
    '01_Strategy/Current_Bottleneck.md',
    'System/Agents/ai_coo.md'
  ];
  
  let context = '';
  for (const file of contextFiles) {
    try {
      const content = await fs.readFile(path.join(OS_ROOT, file), 'utf-8');
      context += `\n\n=== ${file} ===\n${content}`;
    } catch (e) {
      // File may not exist yet
    }
  }
  return context;
}

app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    if (!anthropic) {
      return res.status(500).json({ 
        error: 'Anthropic API key not configured. Set ANTHROPIC_API_KEY in .env' 
      });
    }
    
    const { message, conversationHistory = [] } = req.body;
    const systemContext = await loadSystemContext();
    
    const systemPrompt = `You are the AI-COO for the AI Business OS. You operate within a governance framework with defined decision authority levels.

CURRENT CONTEXT:
${systemContext}

OPERATING RULES:
1. You operate within the authority levels defined in Decision_Authority.md
2. Level 1 (🟢 Green): Execute autonomously and report
3. Level 2 (🟡 Yellow): Execute but notify the human
4. Level 3 (🟠 Orange): Request approval before acting
5. Level 4 (🔴 Red): Never do - these are guardrails

When responding:
- Be concise and actionable
- Always state what authority level applies to your recommendations
- If you need to take action, specify which level it falls under
- Log important decisions and reasoning
- Align all suggestions with the North Star goal

Current user: ${req.user.name} (${req.user.role})`;

    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages
    });

    const assistantMessage = response.content[0].text;
    
    res.json({
      message: assistantMessage,
      usage: response.usage
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
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
    if (!anthropic) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }
    
    const workflowPath = path.join(OS_ROOT, `.agent/workflows/${req.params.id}.md`);
    const workflowContent = await fs.readFile(workflowPath, 'utf-8');
    const systemContext = await loadSystemContext();
    
    const prompt = `Execute the following workflow:

${workflowContent}

SYSTEM CONTEXT:
${systemContext}

Execute this workflow now and provide a detailed report of actions taken or recommendations.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: 'You are the AI-COO executing a defined workflow. Follow the steps precisely and report on each.',
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({
      result: response.content[0].text,
      workflow: req.params.id
    });
  } catch (error) {
    console.error('Workflow error:', error);
    res.status(500).json({ error: 'Failed to run workflow' });
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

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    aiConfigured: !!anthropic,
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
║  🤖 AI Configured: ${anthropic ? 'Yes' : 'No - Set ANTHROPIC_API_KEY'}            
║                                                        ║
║  Default login: admin / admin123                       ║
║  ⚠️  Change password after first login!                ║
╚════════════════════════════════════════════════════════╝
  `);
});
