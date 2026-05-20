---
name: pf-full
description: "Полный жизненный цикл PiFlow через OpenSpec: explore → propose → design → ADR → spec → apply → archive. Для крупных задач с формальными артефактами."
---

# pf-full — Full Lifecycle

## Overview

Complete software delivery lifecycle powered by OpenSpec artifacts. Moves through structured phases with review gates. Each phase produces a tangible artifact that feeds the next phase.

## When to Use

- Large features, new subsystems, architecture changes
- Tasks that need formal design documentation
- Work requiring traceability from idea to implementation
- User explicitly invokes `pf full`

## Workflow

### Phase 1 — Explore

- Skill: `brainstorming`
- Skill: `grill-me`
- Goal: Clarify intent, surface constraints, validate the problem
- Output: Shared understanding (no artifact yet)

### Phase 2 — Propose

- Skill: `grill-me` (stress-test the proposal)
- Skill: `openspec-propose`
- Goal: Create OpenSpec proposal with design, specs, tasks
- Output: `proposal.md` in OpenSpec change directory

### Phase 3 — Design

- Skill: `c4-diagrams`
- Goal: Visualise architecture with C4 model
- Output: Diagrams embedded in proposal or separate design doc

### Phase 4 — ADR

- Skill: `architectural-decision-records`
- Goal: Record key decisions with context and consequences
- Output: ADR document in `docs/adr/`

### Phase 5 — Spec

- Skill: `gherkin-authoring`
- Goal: Write BDD acceptance criteria for all tasks
- Output: Gherkin scenarios linked to proposal tasks

### Phase 6 — Apply

- User chooses strategy:
  - `subagent-driven-development` — parallel independent tasks
  - `test-driven-development` — strict TDD loop
- Skill: `openspec-apply-change`
- Goal: Implement all tasks from the proposal

### Phase 7 — Archive

- Skill: `openspec-archive-change`
- Goal: Finalise and archive the completed change

## Skills Injected

`brainstorming`, `grill-me`, `openspec-propose`, `c4-diagrams`, `architectural-decision-records`, `gherkin-authoring`, `openspec-apply-change`, `subagent-driven-development`, `test-driven-development`, `openspec-archive-change`, `verification-before-completion`

## State Tracking

All state is tracked via OpenSpec artifacts in the change directory. Phase progress is implicit from which artifacts exist.
