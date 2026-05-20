---
name: piflow-refactor
description: "Режим рефакторинга PiFlow: параллельный стратегический анализ (improve-codebase-architecture) и тактический (complexity-optimizer). Результаты сливаются в единый план, применяется с выбранным пользователем подходом."
license: MIT
---

# piflow-refactor — Refactor Mode

Two complementary analyses in parallel — strategic (architecture) and tactical (complexity).

## When to Use

- User wants to clean up, restructure, or simplify existing code
- Keywords: refactor, cleanup, restructure, simplify, improve architecture
- Explicit `/pf-refactor` invocation

## Workflow

### Step 1 — Scope Definition

- Identify target module, subsystem, or entire codebase
- Clarify constraints (preserve external behaviour, cannot change public API)
- Confirm scope with user

### Step 2 — Parallel Analysis (dispatching-parallel-agents)

#### Track A: Strategic

- Skill: `improve-codebase-architecture`
- Focus: domain boundaries, module coupling, testability, consistency

#### Track B: Tactical

- Skill: `complexity-optimizer`
- Focus: algorithmic complexity, hot paths, nested loops

### Step 3 — Merge into Unified Plan

- Combine both tracks, group by dependency order
- Flag risks and trade-offs, present to user for review

### Step 4 — Apply

- User chooses strategy:
  - **Subagent** — `subagent-driven-development`
  - **Sequential** — step by step with verification
  - **TDD** — `test-driven-development` if behaviour preservation is critical

## Skills Referenced (by name)

`improve-codebase-architecture`, `complexity-optimizer`, `dispatching-parallel-agents`, `writing-plans`, `subagent-driven-development`, `test-driven-development`, `verification-before-completion`

## Modes

- `quick` — local, low-risk refactors
- `full` — architectural or public API changes (escalates to OpenSpec)

## Notes

- Always verify tests pass before and after each step.
- If bugs found during refactor, suggest `piflow-debug` for those.
