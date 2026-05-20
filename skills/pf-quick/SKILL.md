---
name: pf-quick
description: "Быстрый путь PiFlow: brainstorm → plan → apply. Без OpenSpec артефактов. Для задач среднего размера с чёткой областью."
---

# pf-quick — Quick Path

## Overview

Streamlined workflow for medium-complexity tasks. Skips formal OpenSpec artifacts and goes straight from ideation to implementation. ADR is recommended but not automatic — the agent asks when a non-trivial decision is made.

## When to Use

- Features with clear scope (identified by `pf-new` or explicit `pf quick`)
- Tasks too small for the full lifecycle but too complex for a single edit
- User wants speed over formal documentation
- Bug fixes that need design thought before implementation

## Workflow

### Step 1 — Brainstorm

- Skill: `brainstorming`
- Goal: Clarify requirements, explore approaches, pick a direction
- Output: Shared understanding of scope and approach

### Step 2 — Plan

- Skill: `writing-plans`
- Goal: Break the approach into concrete, ordered implementation steps
- Output: Implementation plan (markdown file in project root or `.pi/plans/`)

### Step 3 — Apply

- User chooses strategy before implementation starts:
  - **Subagent** — `subagent-driven-development` for independent parallel tasks
  - **TDD** — `test-driven-development` for strict red-green-refactor loop
  - **Direct** — sequential implementation without parallelism
- Skill: chosen apply strategy
- Goal: Execute the plan step by step

### ADR (Conditional)

- Skill: `architectural-decision-records`
- Triggered when: agent encounters a non-trivial design decision during any step
- Agent asks: "This decision seems worth recording. Create an ADR?"
- If yes: write ADR to `docs/adr/` and continue

## Skills Injected

`brainstorming`, `writing-plans`, `subagent-driven-development`, `test-driven-development`, `architectural-decision-records` (conditional), `verification-before-completion`

## Notes

- No OpenSpec artifacts are created — this is the key difference from `pf-full`.
- If scope grows beyond expectations, suggest switching to `pf-full`.
