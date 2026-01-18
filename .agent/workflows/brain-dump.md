---
description: Process brain dump ideas and validate against strategy
---

# Brain Dump Workflow

## Steps

1. Read the brain dump content from `03_Operations/Incoming_Ideas.md`

2. Extract each distinct idea and structure it:
   - Idea title
   - Description
   - Type (Product/Content/Partnership/Experiment/Other)

3. For each idea, read and compare against:
   - `01_Strategy/North_Star.md`
   - `01_Strategy/Strategic_Vehicle.md`
   - `01_Strategy/Current_Bottleneck.md`

4. Score each idea (1-10) on:
   - North Star Alignment
   - Vehicle Fit
   - Bottleneck Impact

5. Triage based on average score:
   - **8-10 (ALIGNED)**: Create new project folder in `02_Projects/` with README.md, Context.md, Tasks.md
   - **5-7 (MAYBE)**: Flag for discussion
   - **1-4 (MISALIGNED)**: Move to `06_Archives/Icebox.md` with reason

6. Clear the processed content from Incoming_Ideas.md

7. Report summary:
   - How many ideas processed
   - How many projects created
   - How many ideas iceboxed
   - Any borderline ideas needing human input
