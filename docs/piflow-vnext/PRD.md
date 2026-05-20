# PRD: PiFlow vNext — Overlay Workflow Package for Pi Agent

## Status

Draft for transfer into `~/dev/piflow`.

## Background

PiFlow currently exists in multiple workflow versions and is installed in a way that can create duplicate resources. The current Pi settings include both a local development package and a git package for PiFlow:

- `../../dev/piflow`
- `git:github.com/effgenij/piflow`

This makes it hard to know which commands, skills, prompts, or extensions are active. The next version should be cleaner, easier to install, and should avoid copying upstream skills that are better maintained by their original authors.

The desired workflow combines ideas from:

- OpenSpec for long-lived spec lifecycle and change governance.
- Superpowers for disciplined engineering workflows: brainstorming, planning, TDD, debugging, verification, review, and worktrees.
- Matt Pocock skills for `grill-me` style interrogation, PRD/destination docs, vertical slicing, TDD, and fresh-context review.
- XPowers for Pi-oriented workflow commands, agents, model routing, and orchestration ideas.
- Anthropic `frontend-design` for distinctive production-grade UI work.
- Vercel agent skills for React/Next.js performance, web design/accessibility review, and scalable composition patterns.

The target user is a solo frontend developer. The workflow should be rigorous without becoming enterprise-heavy.

## Problem

The current PiFlow setup has four core problems:

1. **Installation confusion** — multiple PiFlow sources can be active at once.
2. **Duplicate files/resources** — copied or vendored skills can conflict with upstream skills and each other.
3. **Over-heavy workflows for small tasks** — full spec-driven development is useful for large changes, but inefficient for small frontend fixes.
4. **Weak composition model** — PiFlow should use original upstream skills and add personal/project instructions, not fork or rewrite everything.

## Goals

PiFlow vNext should:

1. Install as a normal Pi package via `pi install`.
2. Ship only PiFlow-owned orchestration resources.
3. Detect and compose upstream skills instead of vendoring them.
4. Provide a task router that asks for confirmation before choosing a workflow.
5. Support full, quick, debug, refactor, and frontend-focused flows.
6. Be context-driven: gather relevant project context before planning or coding.
7. Keep artifacts proportional to risk and task size.
8. Support but not require subagents.
9. Provide doctor/cleanup tooling to detect duplicate installs and missing recommendations.
10. Remain personal and solo-developer friendly.

## Non-goals

PiFlow vNext will not:

1. Vendor or modify Superpowers, Matt Pocock, Anthropic, or Vercel skills.
2. Replace OpenSpec.
3. Require every change to use full OpenSpec lifecycle.
4. Require a specific subagent package.
5. Become a full multi-agent platform like `agent-pi` or `pi-agent-suite`.
6. Enforce team-oriented git discipline by default.
7. Automatically delete user files without a dry-run and confirmation.

## Target Installation Model

Primary installation:

```bash
pi install git:github.com/effgenij/PiFlow
```

Future npm installation:

```bash
pi install npm:piflow
```

Local development installation:

```bash
pi install ../../dev/piflow
```

Temporary local test:

```bash
pi -e ../../dev/piflow
```

PiFlow should be installed from only one source at a time.

## Required Package Shape

PiFlow should be a Pi package with a `package.json` manifest:

```json
{
  "name": "piflow",
  "version": "0.1.0",
  "description": "PiFlow — personal workflow overlay for OpenSpec, Superpowers, frontend skills, and context-driven Pi agent work.",
  "keywords": ["pi-package", "pi", "agent-skills", "openspec", "superpowers"],
  "pi": {
    "extensions": ["./extensions"],
    "skills": ["./skills"],
    "prompts": ["./prompts"]
  },
  "peerDependencies": {
    "@earendil-works/pi-coding-agent": "*",
    "typebox": "*"
  }
}
```

Expected repository structure:

```text
PiFlow/
  package.json
  README.md
  extensions/
    piflow/
      index.ts
      commands.ts
      config.ts
      doctor.ts
      routing.ts
      skill-registry.ts
      context.ts
      adapters/
        subagents-none.ts
        subagents-tintinweb.ts
        subagents-nicobailon.ts
  skills/
    piflow-router/
      SKILL.md
    piflow-full/
      SKILL.md
    piflow-quick/
      SKILL.md
    piflow-debug/
      SKILL.md
    piflow-refactor/
      SKILL.md
    piflow-frontend/
      SKILL.md
    piflow-context/
      SKILL.md
    piflow-review/
      SKILL.md
  prompts/
    pf-new.md
    pf-full.md
    pf-quick.md
    pf-debug.md
    pf-refactor.md
```

## Upstream Skill Strategy

PiFlow must use upstream skills as external resources.

Recommended upstream skills:

### Superpowers

- `brainstorming`
- `writing-plans`
- `systematic-debugging`
- `test-driven-development`
- `verification-before-completion`
- `requesting-code-review`
- `receiving-code-review`
- `using-git-worktrees`
- `dispatching-parallel-agents`
- `subagent-driven-development`

### Matt Pocock

- `grill-me`

### Frontend

- `frontend-design`
- `vercel-react-best-practices`
- `web-design-guidelines`
- `vercel-composition-patterns`

PiFlow should not install these automatically by default. It should detect whether they exist and recommend installation commands.

Known missing skill in current environment:

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
```

## Commands

PiFlow vNext should expose these commands:

```text
/pf-new       Route a task into an appropriate workflow and ask for confirmation.
/pf-full      Run full OpenSpec-backed workflow.
/pf-quick     Run lightweight spec-lite workflow.
/pf-debug     Run reproduce-first debugging workflow.
/pf-refactor  Run safe refactoring workflow.
/pf-status    Show PiFlow state, active changes, and package health summary.
/pf-doctor    Diagnose missing skills, duplicate installs, and optional packages.
/pf-clean     Dry-run cleanup for old PiFlow resources and duplicate installs.
```

## Router Behavior

`/pf-new` should classify the user request, propose a flow, explain why, and ask for confirmation.

Example:

```text
User: /pf-new поправить скролл в модалке

PiFlow:
Похоже на bugfix.
Предлагаю: pf-debug.

Почему:
- описан симптом;
- нужно воспроизведение;
- полная OpenSpec-спека не нужна.

Запустить pf-debug?
1. Да
2. Выбрать другой flow
3. Уточнить задачу
```

Routing rules:

| Signal                                                  | Proposed flow                   |
| ------------------------------------------------------- | ------------------------------- |
| bug, broken, fails, regression, unexpected behavior     | `pf-debug`                      |
| small change, quick, text/state/style tweak             | `pf-quick`                      |
| new feature, architecture, module, significant behavior | `pf-full`                       |
| refactor, simplify, split, improve structure            | `pf-refactor`                   |
| UI, component, page, layout, design                     | add frontend overlay            |
| React, Next.js, data fetching, bundle, performance      | add Vercel React best practices |
| boolean props, component API, compound components       | add Vercel composition patterns |
| accessibility, UX audit, design review                  | add web design guidelines       |

## Workflow Requirements

### `pf-full`

For large features, architectural changes, new systems, or risky refactors.

Flow:

```text
intent
→ context packet
→ grill-me / brainstorming
→ OpenSpec proposal
→ requirements / scenarios
→ design
→ ADR if needed
→ tasks
→ implementation plan
→ TDD / execution
→ frontend overlays if UI
→ verification
→ review
→ archive
```

Artifacts:

- OpenSpec change artifacts.
- ADR only when architectural decision is significant.
- Context packet when useful.

### `pf-quick`

For small tasks where full OpenSpec is too heavy.

Flow:

```text
intent
→ quick context
→ quick spec packet
→ tiny plan
→ implementation
→ verification
```

Artifact budget:

- 0 files for trivial changes.
- 1 quick spec file for non-trivial changes.

Suggested quick spec format:

```md
# Quick Spec

## Intent

## Scope

## Non-goals

## Acceptance

## Verification
```

### `pf-debug`

For bugs and unexpected behavior.

Flow:

```text
symptom
→ reproduction
→ expected vs actual
→ isolate
→ hypotheses
→ instrumentation
→ fix
→ regression test/check
→ verification
```

Hard rule:

```text
Do not propose or implement a fix before reproducing or clearly explaining why reproduction is impossible.
```

### `pf-refactor`

For structure changes and cleanup.

Flow:

```text
diagnosis
→ classify risk
→ safety net
→ target shape
→ step plan
→ small edits
→ verification after meaningful steps
→ review
```

Modes:

- `quick` for local, low-risk refactors.
- `full` for architectural or public API changes.

### `piflow-frontend`

This is an overlay, not a standalone flow.

Activate when task involves UI, React, Next.js, component API, design, accessibility, or frontend performance.

Composition:

- For new UI: `frontend-design` + project frontend overlay.
- For React/Next implementation: `vercel-react-best-practices`.
- For reusable component APIs: `vercel-composition-patterns`.
- For UI review/accessibility: `web-design-guidelines`.

## Context-driven Requirements

PiFlow should gather a context packet before major planning or implementation.

Quick context packet:

```md
# Context Packet

## Task

## Relevant files

## Existing patterns

## Project rules

## Verification commands
```

Full context packet:

```md
# Context Packet

## User intent

## Existing OpenSpec specs

## Active changes

## ADRs

## Domain concepts

## Frontend conventions

## Test strategy

## Risks

## Verification commands
```

Context packets should be written to disk only when useful. Avoid artifact spam for small tasks.

## Doctor Requirements

`/pf-doctor` should report:

1. PiFlow package source and version.
2. Whether PiFlow is installed more than once.
3. Missing PiFlow-owned resources.
4. Missing recommended upstream skills.
5. Duplicate skills by name.
6. Installed optional support packages.
7. Potential package conflicts.
8. Suggested commands to fix issues.

Current environment-specific checks should flag:

```text
Duplicate PiFlow sources:
- ../../dev/piflow
- git:github.com/effgenij/piflow
```

Suggested fix during development:

```bash
pi remove git:github.com/effgenij/piflow
```

## Optional Support Packages

PiFlow should detect these but not require them:

| Package                              | Recommendation                                           |
| ------------------------------------ | -------------------------------------------------------- |
| `context-mode`                       | Keep; useful for context-driven workflow.                |
| `pi-web-access`                      | Keep; useful for research.                               |
| `pi-lens`                            | Keep; useful for LSP, diagnostics, AST search.           |
| `pi-docparser`                       | Optional; useful for documents.                          |
| `graphify-pi`                        | Optional; useful for large codebase graph navigation.    |
| `@juicesharp/rpiv-todo`              | Keep; useful for visible task tracking.                  |
| `@juicesharp/rpiv-ask-user-question` | Keep; useful for router confirmations.                   |
| `@robhowley/pi-structured-return`    | Keep for now; compact CLI output.                        |
| `pi-simplify`                        | Optional; may overlap with PiFlow review.                |
| `pi-skill-palette`                   | Optional; less important if router-first.                |
| `@tintinweb/pi-subagents`            | Optional backend.                                        |
| `pi-subagents`                       | Candidate preferred backend for future PiFlow subagents. |

## Subagent Strategy

PiFlow vNext should not require subagents for v1.

It should provide an adapter layer so future versions can support:

- no subagents;
- `@tintinweb/pi-subagents`;
- `npm:pi-subagents` from nicobailon.

Preferred future direction: evaluate `npm:pi-subagents` as the default backend because it includes workflow-oriented agents such as scout, researcher, planner, worker, review, saved workflows, artifacts, and background jobs.

## Cleanup Strategy

`/pf-clean` should:

1. Run dry-run by default.
2. List duplicate PiFlow package sources.
3. List old PiFlow skills/prompts/extensions.
4. Never delete upstream skills.
5. Never delete user overlays.
6. Ask for explicit confirmation before removing anything.

## Success Criteria

PiFlow vNext is successful when:

1. It can be installed with `pi install git:github.com/effgenij/PiFlow`.
2. Only one PiFlow source is active.
3. `/pf-doctor` clearly reports package health.
4. `/pf-new` proposes a flow and asks before executing.
5. Full tasks use OpenSpec only when justified.
6. Small tasks can use quick flow without creating unnecessary artifacts.
7. Bugs go through reproduce-first debugging.
8. Refactors require a safety net and risk classification.
9. Frontend work composes Anthropic and Vercel skills when available.
10. Upstream skills remain original and separately updateable.

## Open Questions

1. Should PiFlow publish to npm as `piflow`, `pi-piflow`, or scoped package such as `@effgenij/piflow`?
2. Should `/pf-doctor` offer to run install commands or only print them?
3. Should project-local `.piflow/config.json` be created automatically or only on demand?
4. Which subagent backend should become recommended after testing: current `@tintinweb/pi-subagents`, `npm:pi-subagents`, or none?
