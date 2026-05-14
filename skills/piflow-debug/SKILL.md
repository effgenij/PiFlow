---
name: piflow-debug
description: "Run PiFlow's debug workflow: reproduce/localize, identify root cause, plan the smallest fix, implement only after confirmation, add regression coverage, verify, and review."
---

# PiFlow Debug Workflow

Use for bugs, failures, errors, broken tests, or unexpected behavior.

## Required artifacts

Under `.pi-os/specs/<slug>/`:

- `state.md`
- `brief.md` — symptom, expected behavior, reproduction, root cause once known
- `plan.md` — smallest fix strategy and regression test plan
- `verification.md` — reproduction/fix evidence
- `review.md`
- `decisions.md`

## Phases

1. **Triage** — capture symptom, expected behavior, environment, reproduction steps.
2. **Investigate** — read code/logs/tests, use GitNexus/debugging tools when useful.
3. **Root cause** — record root cause or mark unknown with evidence.
4. **Plan fix** — smallest fix + regression test strategy. No code yet.
5. **Confirm** — user approves fix plan in review-confirm mode.
6. **Implement** — fix root cause, not just symptom.
7. **Verify** — prove bug is fixed and regression is covered or explain why not.
8. **Review** — check scope, tests, and risk.

## Debug quality bar

- Root cause must be separated from symptoms.
- If reproduction is impossible, record why and what substitute evidence was used.
- Prefer regression tests. If none are added, record a concrete reason.
- Do not make broad refactors while debugging unless explicitly approved.

## Verification gate

`verification.md` must include:

- original symptom/reproduction;
- root cause summary;
- fix evidence;
- regression test/check status;
- skipped checks and risks;
- final `Done | Not done | Blocked` decision.
