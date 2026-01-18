# 📊 WEEKLY REVIEW ROUTINE

## Trigger
Run every Sunday evening or Monday morning.

---

## Instructions for AI

When this routine is invoked, perform a comprehensive weekly analysis:

### Step 1: Aggregate Weekly Data
Read ALL daily log entries from the past 7 days:
- `05_Memory/Work_Logs/[current-month].md`
- Look for entries from [today - 7 days] to [today]

**Extract:**
- Total tasks completed
- Hours logged (if tracked)
- Projects touched
- Blockers encountered
- Learnings accumulated

### Step 2: Progress Analysis
Compare actual work against strategic goals:

**Questions to answer:**
1. What % of tasks were HIGH priority?
2. What % addressed the Current Bottleneck?
3. What was actually shipped/delivered?
4. What was promised but not delivered?

**Calculate:**
- Strategic Alignment Score: (Aligned tasks / Total tasks) × 100
- Bottleneck Focus Score: (Bottleneck tasks / Total tasks) × 100
- Completion Rate: (Completed / Planned) × 100

### Step 3: Bottleneck Evaluation
Read:
- `01_Strategy/Current_Bottleneck.md`

**Assess:**
- Has the bottleneck been resolved? (Yes/Partially/No)
- If Yes: What's the NEW bottleneck?
- If No: Why not? What's blocking resolution?

**Recommendation:**
- KEEP current bottleneck if still the constraint
- UPDATE bottleneck if resolved or new constraint emerged

### Step 4: Next Week Planning
Based on analysis:
- What are the top 3 priorities for next week?
- What should be killed that we're still doing?
- What needs to START that we're avoiding?

### Step 5: Generate Weekly Report
Create file: `05_Memory/Work_Logs/Weekly_Reviews/[YYYY]-W[WW].md`

**Format:**
```markdown
# Weekly Review: Week [Number], [Year]
**Period:** [Start Date] - [End Date]

## 📊 Key Metrics
| Metric | This Week | Target | Status |
|--------|-----------|--------|--------|
| Strategic Alignment | X% | 80%+ | 🟢/🟡/🔴 |
| Bottleneck Focus | X% | 60%+ | 🟢/🟡/🔴 |
| Task Completion | X% | 90%+ | 🟢/🟡/🔴 |

## ✅ Wins
- Win 1
- Win 2
- Win 3

## ❌ Misses
- Miss 1
- Miss 2

## 🎓 Key Learnings
- Learning 1
- Learning 2

## 🔥 Bottleneck Status
**Current Bottleneck:** [From strategy]
**Status:** [Resolved / In Progress / Stuck]
**Recommendation:** [Keep / Update to X]

## 📋 Next Week Focus
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

## 🚫 Stop Doing
- [Thing to kill]

## 🔄 Start Doing
- [New initiative]

---
*Generated: [Timestamp]*
```

### Step 6: Update Strategy (If Needed)
If bottleneck has shifted:
- Update `01_Strategy/Current_Bottleneck.md`
- Move old bottleneck to history section

### Step 7: Present Summary
Highlight:
- One sentence: How did the week go?
- What's the biggest win?
- What's the biggest concern?
- What's the ONE change for next week?

---

## AI Prompt Version

```
Run my Weekly Review:

1. Read all logs from the past 7 days
2. Calculate: Strategic Alignment %, Bottleneck Focus %, Completion Rate
3. Evaluate if Current Bottleneck is still the constraint
4. Generate weekly report in 05_Memory/Work_Logs/Weekly_Reviews/
5. Update Current_Bottleneck.md if needed
6. Tell me: What worked? What didn't? What changes next week?

Be brutally honest. I need truth, not comfort.
```

---

*Routine Version: 1.0*
*Last Updated: 2026-01-19*
