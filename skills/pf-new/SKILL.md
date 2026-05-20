---
name: pf-new
description: "Маршрутизатор задач PiFlow. Классифицирует запрос пользователя и направляет в подходящий режим: pf-debug, pf-refactor, pf-quick или pf-full."
---

# pf-new — Task Router

## Overview

Entry point for all PiFlow tasks. Analyses user input, classifies intent, and delegates to the appropriate `pf-*` command. Always confirms the classification with the user before proceeding.

## When to Use

Triggered when the user wants to start new work and does not explicitly invoke a specific `pf-*` command. Also triggered by `pf new`, `pf n`, or implicit "I want to..." requests.

## Classification Rules

| Keywords / Signals                          | Mode     | Delegates To  |
| ------------------------------------------- | -------- | ------------- |
| bug, fix, error, crash, broken, fails       | Debug    | `pf-debug`    |
| refactor, cleanup, restructure, simplify    | Refactor | `pf-refactor` |
| Short description (< 15 words), clear scope | Quick    | `pf-quick`    |
| Everything else, ambiguous or large scope   | Full     | `pf-full`     |

## Workflow

1. **Parse input** — Extract keywords, scope indicators, and context from user message.
2. **Classify** — Apply rules above. If multiple modes match, prefer the more specific one (debug > refactor > quick > full).
3. **Confirm** — Present classification to user with rationale:
   ```
   Detected mode: [mode]
   Reason: [brief explanation]
   Proceed? [Y / change mode]
   ```
4. **Delegate** — Invoke the chosen `pf-*` skill with the original user input.
5. **If user overrides** — Respect the override and delegate to the requested mode.

## Skills Injected

- `using-superpowers` — skill discovery
- `brainstorming` — if classification is ambiguous, quick brainstorm to clarify scope

## Notes

- The router never executes work directly — it only classifies and delegates.
- If the user explicitly names a mode (`pf debug`, `pf full`, etc.), skip classification and go straight to that skill.
