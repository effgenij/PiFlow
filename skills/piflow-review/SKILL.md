---
name: piflow-review
description: "Review overlay для PiFlow: fresh-context review значимых изменений, верификация против спеки, проверка через upstream скиллы."
license: MIT
---

# piflow-review — Review Overlay

Fresh-context review for significant work, composing upstream review skills.

## When to Use

- After completing a significant feature or refactor
- Before merging or archiving a change
- When explicitly requesting review

## Workflow

1. **Gather context** — read PRD, spec, tasks, recent changes
2. **Verify against spec** — check implementation matches requirements
3. **Apply frontend review** — if UI was touched, use `web-design-guidelines`
4. **Request code review** — skill: `requesting-code-review`
5. **Require verification evidence** — skill: `verification-before-completion`

## Skills Referenced (by name)

`requesting-code-review`, `verification-before-completion`, `web-design-guidelines` (if UI), `frontend-design` (if UI)

## Notes

- Does NOT duplicate `requesting-code-review` or `verification-before-completion` — composes them.
- Fresh context means reviewing as if seeing the code for the first time.
