# PiFlow

PiFlow is a Pi package that orchestrates OpenSpec, Superpowers, and specialised workflow skills through `/pf-*` commands.

## Installation

Canonical install from GitHub:

```bash
pi install git:github.com/effgenij/PiFlow
```

Local development install:

```bash
pi install ../../dev/piflow
```

Temporary extension test:

```bash
pi -e ../../dev/piflow
```

During local development, keep only one PiFlow source active. If both the local package and git package are installed, remove the git package:

```bash
pi remove git:github.com/effgenij/piflow
```

Check active sources with:

```bash
pi list
```

## Commands

- `/pf-new <task>` — classify a task, ask for confirmation, then route to the right workflow.
- `/pf-full <idea>` — full OpenSpec lifecycle: explore → propose → design/spec/ADR → apply → review/archive.
- `/pf-quick <task>` — lightweight path: brainstorm → plan → apply → verify.
- `/pf-debug <issue>` — reproduce-first debugging workflow.
- `/pf-refactor <scope>` — architecture + complexity analysis before refactoring.
- `/pf-status` — show current PiFlow/OpenSpec status.
- `/pf-doctor` — diagnose missing skills, duplicate installs, optional packages, and duplicate skill names.
- `/pf-clean` — dry-run cleanup report for old PiFlow resources; use `--confirm` for an explicit confirmation gate.

## Upstream skills

PiFlow does not vendor upstream skills. It references them by name and `/pf-doctor` reports missing skills/packages. This keeps upstream skills independently updateable.

Recommended upstream skill groups include:

- Superpowers: `brainstorming`, `writing-plans`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`.
- Matt-style pressure testing: `grill-me`.
- Frontend overlays: `frontend-design`, `vercel-react-best-practices`, `web-design-guidelines`, `vercel-composition-patterns`.

Install the Anthropic frontend skill when needed:

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
```

## Package boundary

PiFlow-owned resources are namespaced under:

- `extensions/piflow/**`
- `skills/piflow-*/SKILL.md`
- `prompts/pf-*.md`
- `docs/piflow-vnext/**`

Third-party upstream skills should not be copied into this package.
