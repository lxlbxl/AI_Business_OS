"""
AI Business OS - Logging Script
Appends work session summaries to the memory log.

Usage:
    python logging_script.py --task "Task description" --output "What was produced" --learnings "Key insights"
"""

import argparse
import json
from datetime import datetime
from pathlib import Path

# Configuration
OS_ROOT = Path(__file__).parent.parent
LOGS_DIR = OS_ROOT / "05_Memory" / "Work_Logs"

def get_current_log_file():
    """Get or create the current month's log file."""
    current_month = datetime.now().strftime("%Y-%m")
    log_file = LOGS_DIR / f"{current_month}.md"
    
    if not log_file.exists():
        log_file.write_text(f"""# 📓 Work Log: {datetime.now().strftime("%B %Y")}

## Purpose
Daily record of work sessions, outputs, learnings, and next steps.

---

""")
    
    return log_file

def append_log_entry(task: str, output: str, learnings: str, next_steps: str = ""):
    """Append a new log entry to today's section."""
    log_file = get_current_log_file()
    today = datetime.now().strftime("%Y-%m-%d")
    current_time = datetime.now().strftime("%H:%M")
    
    entry = f"""
## {today} - {current_time}

### Task
{task}

### Output
{output}

### Learnings
{learnings}

### Next Steps
{next_steps if next_steps else "- [ ] TBD"}

---
"""
    
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(entry)
    
    print(f"✅ Log entry added to {log_file.name}")
    return True

def quick_log(message: str):
    """Quick one-liner log entry."""
    log_file = get_current_log_file()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    entry = f"- **{timestamp}:** {message}\n"
    
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(entry)
    
    print(f"📝 Quick log added")
    return True

def main():
    parser = argparse.ArgumentParser(description="Log work sessions to AI Business OS")
    parser.add_argument("--task", "-t", help="Task description")
    parser.add_argument("--output", "-o", help="What was produced")
    parser.add_argument("--learnings", "-l", help="Key insights or learnings")
    parser.add_argument("--next", "-n", help="Next steps", default="")
    parser.add_argument("--quick", "-q", help="Quick one-line log message")
    
    args = parser.parse_args()
    
    if args.quick:
        quick_log(args.quick)
    elif args.task and args.output and args.learnings:
        append_log_entry(args.task, args.output, args.learnings, args.next)
    else:
        print("Usage:")
        print("  Full log: python logging_script.py -t 'Task' -o 'Output' -l 'Learnings'")
        print("  Quick log: python logging_script.py -q 'Quick message'")

if __name__ == "__main__":
    main()
