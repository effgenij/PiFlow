---
name: pf-refactor
description: "Режим рефакторинга PiFlow: параллельный стратегический анализ (improve-codebase-architecture) и тактический (complexity-optimizer). Результаты сливаются в единый план, применяется с выбранным пользователем подходом."
---

# pf-refactor — Refactor Mode

## Overview

Runs two complementary analyses in parallel — one strategic (architecture-level) and one tactical (code-level complexity). Results are merged into a unified refactoring plan that the user reviews before applying.

## When to Use

- User wants to clean up, restructure, or simplify existing code
- Keywords: refactor, cleanup, restructure, simplify, improve architecture
- Explicit `pf refactor` invocation

## Workflow

### Step 1 — Scope Definition

- Identify target: specific module, subsystem, or entire codebase
- Clarify constraints: must preserve external behaviour, cannot change public API, etc.
- Confirm scope with user

### Step 2 — Parallel Analysis (dispatching-parallel-agents)

#### Track A: Strategic Analysis

- Skill: `improve-codebase-architecture`
- Focus: domain boundaries, module coupling, testability, consistency
- Informed by: `CONTEXT.md` domain language, `docs/adr/` past decisions
- Output: Strategic refactoring opportunities (rename modules, extract domains, etc.)

#### Track B: Tactical Analysis

- Skill: `complexity-optimizer`
- Focus: algorithmic complexity, N+1 queries, nested loops, hot paths
- Output: Tactical optimisation opportunities (O(n²) → O(n log n), caching, etc.)

### Step 3 — Merge into Unified Plan

- Combine both tracks into a single prioritised plan
- Group by dependency order (what must happen first)
- Flag risks and trade-offs
- Present plan to user for review

### Step 4 — Apply

- User chooses strategy:
  - **Subagent** — `subagent-driven-development` for independent refactorings
  - **Sequential** — step by step with verification after each change
  - **TDD** — `test-driven-development` if behaviour preservation is critical
- Skill: chosen apply strategy
- Goal: Execute refactoring plan with tests passing at each step

## Skills Injected

`improve-codebase-architecture`, `complexity-optimizer`, `dispatching-parallel-agents`, `subagent-driven-development`, `test-driven-development`, `writing-plans`, `verification-before-completion`

## Notes

- Always verify existing tests pass before and after each refactoring step.
- If refactoring uncovers bugs, suggest switching to `pf-debug` for those.
