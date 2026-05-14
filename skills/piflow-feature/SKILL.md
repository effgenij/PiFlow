---
name: piflow-feature
description: "Run PiFlow's lightweight spec-driven feature workflow: clarify, brief, plan, implement, verify, and review with markdown artifacts and review-confirm gates."
---

# PiFlow Feature Workflow

Use for new behavior or meaningful product/code changes.

## Artifact folder

`.pi-os/specs/<slug>/`

Required artifacts:

- `state.md`
- `brief.md`
- `plan.md`
- `decisions.md`
- `verification.md`
- `review.md`

Use templates from `templates/spec/` in the PiFlow kit when available.

## Phases

1. **Research** — inspect code/docs/packages as needed. Read-only.
2. **Spec** — write/update `brief.md` with goal, non-goals, acceptance criteria, constraints, assumptions.
3. **Plan** — write/update `plan.md`. No code yet.
4. **Confirm** — in review-confirm mode, user must approve plan before implementation.
5. **Implement** — execute only the confirmed plan.
6. **Verify** — write evidence-based `verification.md`.
7. **Review** — write `review.md` and final decision.
8. **Decision capture** — update `decisions.md` with durable trade-offs.

## Gates

Require confirmation:

- after routing/classification;
- after `brief.md`;
- after `plan.md`;
- before implementation;
- after verification if files changed.

Can auto-advance:

- read-only research;
- template drafting;
- formatting artifacts.

## Verification gate

Feature is not done unless `verification.md` includes:

- acceptance criteria status;
- commands/checks run;
- evidence/results;
- skipped checks and reasons;
- risks/follow-ups;
- final `Done | Not done | Blocked` decision.

## Subagent usage

Use role agents when helpful:

- `researcher` for docs/code discovery;
- `planner` for read-only planning;
- `implementer` for scoped edits;
- `verifier` for checks/evidence;
- `reviewer` for fresh-context review.

## Scope control

Do not expand beyond the confirmed plan. If new scope appears, stop and update `brief.md`/`plan.md` for confirmation.
