---
name: piflow-quick
description: "Быстрый путь PiFlow: brainstorm → plan → apply. Без OpenSpec артефактов. Для задач среднего размера с чёткой областью."
license: MIT
---

# piflow-quick — Quick Path

Streamlined workflow for medium-complexity tasks. Skips formal OpenSpec artifacts.

## When to Use

- Features with clear scope
- Tasks too small for full lifecycle but too complex for a single edit
- Bug fixes needing design thought before implementation
- User explicitly invokes `/pf-quick`

## Workflow

### Step 1 — Brainstorm

- Skill: `brainstorming`
- Goal: Clarify requirements, pick a direction

### Step 2 — Plan

- Skill: `writing-plans`
- Goal: Break approach into concrete implementation steps

### Step 3 — Apply

- User chooses strategy:
  - **Subagent** — `subagent-driven-development`
  - **TDD** — `test-driven-development`
  - **Direct** — sequential implementation
- Goal: Execute the plan step by step

### ADR (Conditional)

- Skill: `architectural-decision-records`
- Triggered when: agent encounters a non-trivial design decision
- Agent asks: "This decision seems worth recording. Create an ADR?"

## Skills Referenced (by name)

`brainstorming`, `writing-plans`, `subagent-driven-development`, `test-driven-development`, `verification-before-completion`, `finishing-a-development-branch`, `architectural-decision-records` (conditional)

## Artifact Budget

- 0 files for trivial changes
- 1 quick spec file for non-trivial changes (optional)

## Notes

- No OpenSpec artifacts created — key difference from `piflow-full`.
- If scope grows, suggest switching to `piflow-full`.
