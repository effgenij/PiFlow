---
name: piflow-plan-phase
description: Manually create or rerun PiFlow's read-only planning phase. Produces plan.md with files, steps, assumptions, test strategy, verification commands, and risks. No code is written.
---

# PiFlow Plan Phase

Create or update `plan.md` from `brief.md` and research findings.

## Rules

- Stay read-only.
- No code changes in this phase.
- Use structured plan sections: files, steps, tests, verification, risks, assumptions.
- Tag uncertain decision points as `[ASSUMPTION]`.
- Prefer smallest scoped implementation.

## Gate

In review-confirm mode, stop after `plan.md` and ask for approval before implementation.

Implementation may not start until plan is approved.
