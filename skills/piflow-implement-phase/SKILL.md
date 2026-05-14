---
name: piflow-implement-phase
description: Manually run PiFlow's implementation phase after a confirmed plan. Executes only the approved scope, updates implementation notes, and prepares for verification.
---

# PiFlow Implement Phase

Run only after `plan.md` is approved in review-confirm mode.

## Preconditions

- `brief.md` exists.
- `plan.md` exists.
- Plan is approved or user explicitly overrides.

## Rules

- Implement only the confirmed plan.
- Stop if the plan is wrong, incomplete, or unsafe.
- Do not add dependencies without confirmation.
- Do not change public API/schema/contracts without confirmation.
- Add/update meaningful tests when feasible.
- Prefer narrow validation while developing.

## Output

Prepare notes for `verification.md`:

- files changed;
- tests added/updated;
- checks run during implementation;
- deviations from plan;
- risks/follow-ups.

## Next step

Run `piflow-verify-phase`.
