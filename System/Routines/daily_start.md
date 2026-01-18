# 🌅 DAILY START ROUTINE

## Trigger
Run this routine at the start of each work day.

---

## Instructions for AI

When this routine is invoked, perform the following steps in order:

### Step 1: Load Strategic Context
Read and internalize:
- `01_Strategy/North_Star.md`
- `01_Strategy/Current_Bottleneck.md`
- `01_Strategy/Strategic_Vehicle.md`

**Extract:**
- The ONE goal
- The ONE bottleneck
- Key constraints

### Step 2: Review Yesterday
Read the most recent entry in:
- `05_Memory/Work_Logs/[current-month].md`

**Note:**
- What was accomplished
- Any blockers or open loops
- Promised next steps

### Step 3: Load Current Tasks
Read:
- `03_Operations/Master_Todo.md`
- `03_Operations/Task_Database.json`

**Identify:**
- All HIGH priority items
- Items due today
- Any misaligned tasks

### Step 4: Strategic Alignment Audit
For each task, check:
- Does it address the Current Bottleneck? (Yes/No)
- Does it move toward North Star? (Impact 1-10)
- Can it be killed, delegated, or automated?

**Rules:**
- Tasks below impact score of 7 → Challenge or Kill
- Tasks not addressing bottleneck → Move to backlog or kill
- Tasks that can be automated → Create automation first

### Step 5: Generate Daily Roadmap
Create file: `03_Operations/Daily_Plans/[YYYY-MM-DD].md`

**Format:**
```markdown
# Daily Roadmap: [Date]

## 🎯 Today's Focus
[One sentence: What is the SINGLE most important outcome today?]

## 📍 Strategic Context
- **North Star:** [Goal]
- **Current Bottleneck:** [Bottleneck]

## ✅ Today's Tasks (Prioritized)
1. [ ] [Most important task] - WHY: [connection to bottleneck]
2. [ ] [Second task] - WHY: [connection]
3. [ ] [Third task] - WHY: [connection]

## 🚫 NOT Doing Today (And Why)
- [Task killed/deferred] - REASON: [misalignment or low impact]

## ⚡ Quick Wins (< 15 min each)
- [ ] Quick task 1
- [ ] Quick task 2

## 📝 Notes
[Any context needed for the day]
```

### Step 6: Report Summary
Present a brief summary:
- What's the ONE thing to focus on
- What was ruthlessly cut
- Any concerns or recommendations

---

## AI Prompt Version

```
You are my business operations AI. Execute the Daily Start Routine:

1. Read: 01_Strategy/North_Star.md, 01_Strategy/Current_Bottleneck.md, 01_Strategy/Strategic_Vehicle.md
2. Read: Yesterday's entry in 05_Memory/Work_Logs/
3. Read: 03_Operations/Master_Todo.md
4. For each task, score 1-10 on impact toward North Star. Challenge anything below 7.
5. Generate today's Daily Roadmap in 03_Operations/Daily_Plans/[today's date].md
6. Report: What's the ONE focus? What was cut? Any red flags?

Be ruthless. My time is my most valuable asset.
```

---

*Routine Version: 1.0*
*Last Updated: 2026-01-19*
