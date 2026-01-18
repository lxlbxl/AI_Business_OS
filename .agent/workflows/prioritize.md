---
description: Activate the Ruthless Prioritizer agent to analyze and kill low-impact tasks
---

# Ruthless Prioritizer Workflow

## Steps

1. Read strategic context:
   - `01_Strategy/North_Star.md`
   - `01_Strategy/Current_Bottleneck.md`

2. Read current tasks from `03_Operations/Master_Todo.md`

3. For each task, score 1-10 on:
   - **Impact Score**: How directly does this move toward the North Star?
   - **Bottleneck Score**: Does this address the current constraint?
   - **Urgency Score**: What happens if this isn't done this week?

4. Calculate total score (out of 30) for each task

5. Triage:
   - **25-30**: ✅ DO FIRST - High priority
   - **18-24**: 🟡 CONSIDER - Only if high-priority tasks are done
   - **Below 18**: ❌ KILL - Remove or icebox

6. For each task recommended to kill, explain:
   - Why it's not moving the needle
   - What the opportunity cost is
   - What should be done instead

7. Provide output:
   - Clean, prioritized KEEP list with reasoning
   - KILL list with reasons
   - DEFER list for things that might matter later
