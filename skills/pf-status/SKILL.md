---
name: pf-status
description: "Статус-дашборд PiFlow: показывает активный режим, OpenSpec изменения и фазы, git worktrees, количество ADR. Только чтение."
---

# pf-status — Status Dashboard

## Overview

Read-only dashboard that displays the current state of all PiFlow work. Provides a snapshot of active modes, in-progress changes, worktrees, and architectural decisions.

## When to Use

- User wants to see what is currently in progress
- Before starting new work to check for conflicts
- Explicit `pf status` invocation
- Quick "what's going on?" questions

## Workflow

### Step 1 — Gather State

Read the following in parallel:

| Data Source                 | What to Check                                 |
| --------------------------- | --------------------------------------------- |
| OpenSpec changes directory  | List all change dirs, detect phase per change |
| Git worktrees               | `git worktree list`                           |
| Current branch              | `git branch --show-current`                   |
| ADR directory (`docs/adr/`) | Count ADR files                               |
| `.pi/plans/` directory      | List active plans                             |
| Active PiFlow mode          | Check for `pf-*` artifacts or session state   |

### Step 2 — Render Dashboard

Present a structured summary:

```
=== PiFlow Status ===

Mode:        [active mode or "none"]
Branch:      [current branch]

OpenSpec Changes:
  - change-slug/  [phase: explore | propose | design | adr | spec | apply | done]
  - ...

Worktrees:
  - [path]  →  [branch]

ADRs:        [count] documents in docs/adr/
Plans:       [count] plans in .pi/plans/
```

### Step 3 — Suggestions (Optional)

If active work is detected, suggest logical next steps:

- Change in "apply" phase → "Ready to continue implementation"
- Stale worktree → "Worktree has uncommitted changes, consider cleaning up"
- No active work → "Ready for a new task via pf-new"

## Skills Injected

None — this is a pure read-only status command.

## Notes

- Never modifies any files or state.
- If OpenSpec directory structure is missing, report "No OpenSpec changes found" gracefully.
