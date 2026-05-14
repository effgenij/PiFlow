---
name: piflow-spec-phase
description: Manually create or rerun PiFlow's lightweight spec/brief phase. Produces .pi-os/specs/<slug>/brief.md with goal, non-goals, acceptance criteria, constraints, assumptions, and open questions.
---

# PiFlow Spec Phase

Create or update `brief.md`.

## Required sections

- Problem / goal.
- Context.
- Non-goals.
- Acceptance criteria.
- Constraints: Always / Ask first / Never.
- Assumptions.
- Open questions.

## Rules

- Keep it lightweight.
- Do not plan implementation details deeply here.
- Ask one question at a time only if the missing answer blocks useful planning.
- Prefer project inspection over asking when the answer is discoverable.

## Gate

In review-confirm mode, stop after drafting `brief.md` and ask user to confirm before planning.
