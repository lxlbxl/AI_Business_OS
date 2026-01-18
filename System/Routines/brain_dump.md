# 🧠 BRAIN DUMP ROUTINE

## Trigger
User pastes unstructured thoughts, ideas, or transcripts into `03_Operations/Incoming_Ideas.md`

---

## Instructions for AI

When this routine is invoked, perform the following:

### Step 1: Extract Ideas
Parse the brain dump content and identify:
- Distinct ideas or opportunities
- Potential projects
- Tasks or action items
- Questions to research

**For each, create a structured entry:**
```
Idea: [Short title]
Description: [What it is]
Type: [Product / Content / Partnership / Experiment / Other]
First Thought: [Initial gut reaction on viability]
```

### Step 2: Strategic Alignment Check
For EACH extracted idea, read and compare against:
- `01_Strategy/North_Star.md`
- `01_Strategy/Strategic_Vehicle.md`
- `01_Strategy/Current_Bottleneck.md`

**Score each idea (1-10):**
- North Star Alignment: Does this directly contribute to the goal?
- Vehicle Fit: Does this fit the current strategic path?
- Bottleneck Impact: Does this help solve the current bottleneck?

**Calculate: Total Score = Average of the three**

### Step 3: Triage Decision

| Score Range | Decision | Action |
|-------------|----------|--------|
| 8-10 | ✅ ALIGNED | Create Project Brief → `02_Projects/` |
| 5-7 | 🟡 MAYBE | Flag for discussion, add context |
| 1-4 | ❌ MISALIGNED | Move to `06_Archives/Icebox.md` |

### Step 4: For ALIGNED Ideas (8-10)
Create a new project folder: `02_Projects/[Project_Name]/`

Generate files:
1. **README.md**
```markdown
# [Project Name]

## Goal
[Clear outcome this project will achieve]

## Strategic Link
- **North Star Connection:** [How this hits the goal]
- **Bottleneck Address:** [How this solves current blocker]

## Status
🟡 Planning

## Key Milestones
- [ ] Milestone 1
- [ ] Milestone 2
- [ ] Milestone 3

## Created
[Date]
```

2. **Context.md** (empty, for research)
3. **Tasks.md** (initial task list)

### Step 5: For MISALIGNED Ideas (1-4)
Append to `06_Archives/Icebox.md`:
```markdown
| [Date] | [Idea Title] | [Reason: Low score on X, Y, Z] | [Review in 90 days] |
```

### Step 6: Clear Incoming Ideas
After processing, clear the brain dump section in `03_Operations/Incoming_Ideas.md`

### Step 7: Report
Provide summary:
- X ideas processed
- Y projects created
- Z ideas icebox'd
- Any ideas that were borderline and need human input

---

## AI Prompt Version

```
Process my brain dump. For each idea:

1. Extract and structure it
2. Score 1-10 on alignment with North Star, Strategic Vehicle, and Current Bottleneck
3. If 8+: Create project in 02_Projects/
4. If <5: Archive to 06_Archives/Icebox.md with reason
5. If 5-7: Flag for my review

Be honest. Most ideas should go to the icebox - that's the point.
```

---

*Routine Version: 1.0*
*Last Updated: 2026-01-19*
