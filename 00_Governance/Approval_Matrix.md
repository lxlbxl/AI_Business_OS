# ✅ APPROVAL MATRIX

> Specific actions that require human approval, organized by category.

---

## How to Use This Matrix

Before taking action, the AI-COO checks:
1. Is the action in this matrix?
2. What approval level is required?
3. Follow the appropriate process

---

## 💰 Financial Actions

| Action | Threshold | Approval Required | Urgency |
|--------|-----------|-------------------|---------|
| Approve expense | Any amount | ✅ Always | Standard |
| Change pricing | Any change | ✅ Always | Standard |
| Send invoice | > ₦100k or > €100 | ✅ Yes | Standard |
| Send invoice | ≤ ₦100k or ≤ €100 | 🟡 Notify | Standard |
| Recommend new tool/subscription | Monthly cost > $50 | ✅ Yes | Standard |
| Recommend new tool/subscription | Monthly cost ≤ $50 | 🟡 Notify | Standard |
| Refund request | Any | ✅ Always | Urgent |
| Discount offer | > 10% | ✅ Yes | Standard |
| Discount offer | ≤ 10% | 🟡 Notify | Standard |

---

## 📧 External Communications

| Action | Recipient | Approval Required | Urgency |
|--------|-----------|-------------------|---------|
| Send email | Existing client | ✅ Yes (first time), then template-OK | Standard |
| Send email | New prospect | ✅ Always | Standard |
| Send email | Partner/vendor | ✅ Always | Standard |
| Reply to inquiry | General inquiry | 🟡 Notify | Fast |
| Reply to complaint | Any | ✅ Always | Urgent |
| Social media post | Any platform | ✅ Always | Standard |
| Public statement | Any | ✅ Always | Standard |

---

## 📋 Project & Task Management

| Action | Scope | Approval Required | Urgency |
|--------|-------|-------------------|---------|
| Create new project | Aligned with strategy | 🟡 Notify | Standard |
| Create new project | Unclear alignment | ✅ Yes | Standard |
| Kill/archive project | Active project | ✅ Always | Standard |
| Change project priority | P1 → P2 or lower | ✅ Yes | Standard |
| Extend deadline | External commitment | ✅ Always | Urgent |
| Extend deadline | Internal only | 🟡 Notify | Standard |
| Assign task to team member | Standard work | 🟡 Notify | Standard |
| Assign task to team member | New responsibility | ✅ Yes | Standard |

---

## 🎯 Strategic Decisions

| Action | Type | Approval Required | Urgency |
|--------|------|-------------------|---------|
| Update North Star | Any change | ✅ Always + Discussion | Critical |
| Update Strategic Vehicle | Any change | ✅ Always + Discussion | Critical |
| Update Current Bottleneck | Resolution/new bottleneck | ✅ Yes | Standard |
| Update Brand Voice | Tone/positioning changes | ✅ Yes | Standard |
| Add to Icebox | Misaligned idea | 🟡 Notify | Standard |
| Resurrect from Icebox | Reactivate old idea | ✅ Yes | Standard |

---

## 👥 Team & HR

| Action | Type | Approval Required | Urgency |
|--------|------|-------------------|---------|
| Recommend hire | Any role | ✅ Always | Standard |
| Recommend termination | Any | ✅ Always + Discussion | Critical |
| Change role/responsibility | Any team member | ✅ Always | Standard |
| Performance feedback | Negative/corrective | ✅ Always | Standard |
| Performance feedback | Positive | 🟡 Notify | Standard |

---

## 🔒 Security & Access

| Action | Type | Approval Required | Urgency |
|--------|------|-------------------|---------|
| Grant system access | Any | ✅ Always | Standard |
| Revoke system access | Any | ✅ Always (unless emergency) | Urgent |
| Share confidential info | Any external party | ✅ Always | Standard |
| Create backup | Routine | 🟢 Auto | Standard |
| Restore from backup | Any | ✅ Always | Urgent |
| Delete files | Non-critical | 🟡 Notify | Standard |
| Delete files | Critical/irreplaceable | ✅ Always | Standard |

---

## ⏰ Approval Urgency Levels

| Level | Response Expected | Escalation |
|-------|-------------------|------------|
| **Standard** | Within 24 hours | Reminder at 12h, escalate at 24h |
| **Fast** | Within 4 hours | Reminder at 2h, escalate at 4h |
| **Urgent** | Within 1 hour | Immediate notification, escalate at 1h |
| **Critical** | Immediate | Block all related work until resolved |

---

## Approval Request Format

When creating an approval request in `Pending_Approvals/`:

```markdown
# Approval Request: [Short Title]

**ID:** APR-[YYYY-MM-DD]-[###]
**Created:** [Timestamp]
**Urgency:** [Standard/Fast/Urgent/Critical]
**Category:** [Financial/Communication/Project/Strategic/Team/Security]

## Action Requested
[Clear description of what needs approval]

## Context
[Why this action is needed, background information]

## Recommendation
[What the AI-COO recommends and why]

## Risks if Approved
[Potential downsides]

## Risks if Rejected
[What happens if we don't do this]

## Decision Needed By
[Date/time]

---
**STATUS:** 🔲 Pending | ✅ Approved | ❌ Rejected
**Decision By:** [Name]
**Decision Date:** [Date]
**Notes:** [Any conditions or modifications]
```

---

*Last Updated: 2026-01-19*
