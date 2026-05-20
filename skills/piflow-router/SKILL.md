---
name: piflow-router
description: "Маршрутизатор задач PiFlow. Классифицирует запрос пользователя и направляет в подходящий режим с подтверждением."
license: MIT
---

# piflow-router — Task Router

Entry point for all PiFlow tasks via `/pf-new`.

## Classification Rules

| Keywords / Signals                          | Mode     | Delegates To  |
| ------------------------------------------- | -------- | ------------- |
| bug, fix, error, crash, broken, fails       | Debug    | `pf-debug`    |
| refactor, cleanup, restructure, simplify    | Refactor | `pf-refactor` |
| Short description (< 15 words), clear scope | Quick    | `pf-quick`    |
| Everything else, ambiguous or large scope   | Full     | `pf-full`     |
| explore, investigate, research, understand  | Explore  | `pf-explore`  |

## Overlay Detection

| Signal                                     | Overlay           |
| ------------------------------------------ | ----------------- |
| UI, component, layout, design              | `piflow-frontend` |
| React, Next.js, hooks, bundle, performance | `piflow-frontend` |
| Component API, composition, boolean props  | `piflow-frontend` |
| Accessibility, UX audit, design review     | `piflow-frontend` |

## Workflow

1. **Parse input** — extract keywords, scope, context.
2. **Classify** — apply rules. Multiple matches: debug > refactor > quick > full.
3. **Detect overlays** — frontend, React, composition, a11y signals.
4. **Confirm** — present classification with rationale and ask user.
5. **Delegate** — invoke chosen `/pf-*` command.
6. **Manual override** — support `--flow <mode>` flag.

## Skills Referenced

- `brainstorming` — if classification is ambiguous
- `grill-me` — if intent is unclear
- All `piflow-*` skills — potential delegation targets

## Notes

- The router never executes work directly — only classifies and delegates.
- Always asks for confirmation before routing.
