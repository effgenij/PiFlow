---
name: piflow-full
description: "Полный жизненный цикл PiFlow через OpenSpec: explore → propose → design → ADR → spec → apply → archive. Для крупных задач с формальными артефактами."
license: MIT
---

# piflow-full — Full Lifecycle

Complete software delivery lifecycle powered by OpenSpec artifacts.

## When to Use

- Large features, new subsystems, architecture changes
- Tasks needing formal design documentation and traceability
- User explicitly invokes `/pf-full`

## Workflow Phases

### Phase 1 — Explore

- Skills: `brainstorming`, `grill-me`
- Goal: Clarify intent, surface constraints, validate the problem

### Phase 2 — Propose

- Skills: `grill-me`, `openspec-propose`
- Goal: Create OpenSpec proposal with design, specs, tasks

### Phase 3 — Design

- Skills: `c4-diagrams`
- Goal: Visualise architecture with C4 model

### Phase 4 — ADR

- Skills: `architectural-decision-records`
- Goal: Record key decisions with context and consequences

### Phase 5 — Spec

- Skills: `gherkin-authoring`
- Goal: Write BDD acceptance criteria

### Phase 6 — Apply

- User chooses strategy: `subagent-driven-development` or `test-driven-development`
- Skills: `openspec-apply-change`, chosen apply strategy

### Phase 7 — Archive

- Skills: `openspec-archive-change`
- Goal: Finalise and archive the completed change

## Skills Referenced (by name)

`brainstorming`, `grill-me`, `openspec-propose`, `c4-diagrams`, `architectural-decision-records`, `gherkin-authoring`, `openspec-apply-change`, `openspec-archive-change`, `subagent-driven-development`, `test-driven-development`, `writing-plans`, `verification-before-completion`, `finishing-a-development-branch`, `using-git-worktrees`, `requesting-code-review`

## State Tracking

All state is tracked via OpenSpec artifacts. Phase progress is implicit from which artifacts exist.
