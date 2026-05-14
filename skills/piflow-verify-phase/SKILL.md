---
name: piflow-verify-phase
description: Manually run or rerun PiFlow's verification gate. Produces human-readable verification.md with acceptance criteria status, commands/checks, evidence, skipped checks, and done decision.
---

# PiFlow Verify Phase

Verification is mandatory before a workflow is done.

## Inputs

- `brief.md` acceptance criteria.
- `plan.md` verification strategy.
- Changed files/diff.
- Project validation commands.

## Rules

- Use evidence, not vibes.
- Run the narrowest useful checks first.
- Use structured/compact output tools for noisy commands.
- If a check is skipped, record why and the risk.
- Do not mark done if required checks fail.

## Required `verification.md` sections

- Done decision: `Done | Not done | Blocked`.
- Acceptance criteria table.
- Commands/checks run.
- Manual checks.
- Skipped checks and reasons.
- Files changed.
- Risks/follow-ups.

## Gate

In review-confirm mode, stop after verification and ask user to review the evidence.
