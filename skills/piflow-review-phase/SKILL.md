---
name: piflow-review-phase
description: Manually run or rerun PiFlow's review phase. Reviews diff/result against brief, plan, decisions, and verification, then writes review.md with Approved, Changes requested, or Blocked.
---

# PiFlow Review Phase

Review should happen in a fresh mindset, ideally via reviewer subagent.

## Inputs

- `brief.md`
- `plan.md`
- `decisions.md`
- `verification.md`
- git diff / changed files

## Rules

- Do not implement fixes unless explicitly asked.
- Separate blocking from non-blocking findings.
- Check acceptance criteria and scope.
- Check test quality and skipped validation.
- Check security/data/privacy risks.

## Output

Write/update `review.md` with:

- decision: `Approved | Changes requested | Blocked`;
- summary;
- blocking findings;
- non-blocking findings;
- acceptance criteria check;
- suggested fixes or follow-ups.
