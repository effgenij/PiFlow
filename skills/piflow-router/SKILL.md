---
name: piflow-router
description: Route a development request into the right PiFlow workflow. Use for feature, bug/debug, refactor, or review requests when the user has not explicitly chosen a workflow. Creates/updates markdown-first state under .pi-os/specs and defaults to review-confirm mode.
---

# PiFlow Router

Route the user's request into the minimum sufficient PiFlow workflow.

## Inputs

- User request.
- Existing `.pi-os/specs/<slug>/state.md` if continuing work.
- Project context from `AGENTS.md`, README, package manifests, and nearby files when relevant.

## Default mode

Use `review-confirm` unless the user explicitly asks for `auto-advance`.

## Classification

Choose one workflow:

| Intent                                              | Workflow skill    |
| --------------------------------------------------- | ----------------- |
| New behavior, product change, feature               | `piflow-feature`  |
| Bug, error, failing test, unexpected behavior       | `piflow-debug`    |
| Rename, extract, move, restructure, simplify safely | `piflow-refactor` |
| Diff, PR, changed files, merge risk                 | `piflow-review`   |

Choose strictness:

| Strictness  | Signals                                                           |
| ----------- | ----------------------------------------------------------------- |
| `tiny`      | localized, low-risk, obvious, no public contract                  |
| `normal`    | meaningful code change or unclear acceptance criteria             |
| `high-risk` | auth/security/payment/data/schema/API/multi-module/broad refactor |

## Required actions

1. Create or identify a task slug.
2. Ensure `.pi-os/specs/<slug>/state.md` exists for non-trivial work.
3. Record workflow, mode, strictness, current phase, and next action.
4. Explain the routing decision briefly.
5. In review-confirm mode, ask for confirmation before entering the selected workflow.

## Confirmation prompt

Ask:

```text
I classified this as <workflow> with <strictness> strictness in review-confirm mode.
Proceed, switch workflow, or adjust strictness/mode?
```

Use structured choices when available:

- Proceed;
- Switch workflow;
- Adjust strictness/mode;
- Stop.

## Manual overrides

If the user asks to rerun a phase, do not re-route. Invoke the relevant manual phase skill:

- `piflow-research-phase`
- `piflow-spec-phase`
- `piflow-plan-phase`
- `piflow-implement-phase`
- `piflow-verify-phase`
- `piflow-review-phase`
- `piflow-decision-phase`

## Safety

Never auto-install dependencies, run destructive commands, modify secrets/production config, commit/push/publish, or delete specs/state.
