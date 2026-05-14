---
name: piflow-refactor
description: Run PiFlow's safe refactor workflow: impact analysis, behavior-preserving plan, confirmation, scoped changes, verification, and review.
---

# PiFlow Safe Refactor Workflow

Use for rename, extract, move, split, simplify, or restructure tasks.

## Required artifacts

Under `.pi-os/specs/<slug>/`:

- `state.md`
- `brief.md` — refactor goal and non-goals
- `plan.md` — impact, affected files, behavior-preservation strategy
- `verification.md` — proof behavior is unchanged or explicit breaking change record
- `review.md`
- `decisions.md`

## Phases

1. **Research/impact** — inspect references, call graph, tests, public API boundaries.
2. **Spec** — define desired structural change and non-goals.
3. **Plan** — behavior-preserving steps and rollback risks. No code yet.
4. **Confirm** — user approves refactor plan.
5. **Implement** — smallest safe transformation.
6. **Verify** — tests/static checks plus behavior-preservation evidence.
7. **Review** — check accidental behavior changes and scope creep.

## Impact analysis

Use available tools:

- LSP references/definitions;
- ast-grep for structural patterns;
- GitNexus impact analysis when indexed;
- search for public API and test coverage.

## Refactor quality bar

- Public behavior unchanged unless explicitly approved.
- Public API/contract changes require confirmation.
- Broad multi-file refactors require plan confirmation.
- Do not mix feature work with refactor unless explicitly approved.

## Verification gate

`verification.md` must include:

- impacted files/areas;
- checks proving behavior preservation;
- tests run and results;
- any breaking changes;
- risks/follow-ups;
- final `Done | Not done | Blocked` decision.
