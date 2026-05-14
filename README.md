# PiFlow

PiFlow is a lightweight, markdown-first, spec-driven development workflow kit for Pi Coding Agent.

It standardizes routine engineering work through:

- **Skills** as workflow/protocol commands.
- **Subagents** as execution roles.
- **Templates** as durable artifact formats.
- **Verification gates** as human-readable evidence before done.

PiFlow v1 is personal-first and reusable-second: optimized for fast daily use, but structured so it can later become a full Pi package or extension.

## Core decisions

- Default mode: **review-confirm**.
- Optional mode: **auto-advance**.
- Source of truth: markdown artifacts under a project-local hidden folder.
- Runtime tracker: Pi todo/subagent state only for the current session.
- v1 implementation style: **skills-as-commands**, not custom extension commands.

## Project artifact layout

When used inside a project, PiFlow writes task state to:

```text
.pi-os/
  specs/
    <task-slug>/
      state.md
      brief.md
      plan.md
      decisions.md
      verification.md
      review.md
```

## Kit layout

```text
piflow/
  skills/      # workflow and phase skills
  agents/      # role subagent definitions
  templates/   # spec artifact templates
  docs/        # operating model, package map, best practices
```

## Main workflows

```text
piflow-router
  → piflow-feature | piflow-debug | piflow-refactor | piflow-review

Manual phases:
  piflow-research-phase
  piflow-spec-phase
  piflow-plan-phase
  piflow-implement-phase
  piflow-verify-phase
  piflow-review-phase
  piflow-decision-phase
```

## Safety profile

Never auto:

- install new packages without confirmation;
- run destructive commands;
- modify production configs/secrets;
- create large new architecture without confirmed plan;
- publish packages/extensions;
- commit or push changes;
- delete existing specs/state without explicit approval.

Ask before:

- adding dependencies;
- changing public APIs;
- changing database/schema/contracts;
- broad refactors touching many files;
- switching selected workflow.

## Install in Pi

### From GitHub

Install PiFlow directly from the GitHub repository:

```bash
pi install git:git@github.com:effgenij/PiFlow.git
```

For a project-local install that is written to the current project's `.pi/settings.json`:

```bash
pi install -l git:git@github.com:effgenij/PiFlow.git
```

Project-local installs are useful when you want a project to automatically load PiFlow for anyone opening it with Pi.

### From a local checkout

From a project where you want PiFlow available:

```bash
pi install -l /Users/effgenij/dev/piflow
```

Or copy/symlink only the skills into `.pi/skills/` during development.

## Recommended existing Pi packages

Already installed and useful for PiFlow:

- `context-mode` — large output processing, searchable session knowledge, test/log analysis.
- `@tintinweb/pi-subagents` — role agents and background/parallel work.
- `@juicesharp/rpiv-todo` — live task tracking.
- `@juicesharp/rpiv-ask-user-question` — structured review/confirm questions.
- `@juicesharp/rpiv-args` — skill arguments.
- `@ff-labs/pi-fff` — fast file/content search.
- `@robhowley/pi-structured-return` — compact test/build/lint output.
- `pi-lens` — LSP, diagnostics, ast-grep, code quality feedback.
- `pi-gitnexus` — call graph, impact analysis, debug/refactor/review support.
- `graphify-pi` — durable codebase/corpus knowledge graphs.
- `@plannotator/pi-extension` — human annotation/review gates for plans and diffs.
- `pi-web-access` — docs/package/web research.
- `pi-docparser` — local document parsing when specs arrive as PDFs/Office files.
- `@aliou/pi-guardrails` — path/permission safety rules.
- `pi-skill-palette` — faster manual skill selection.

Useful candidates from `pi.dev/packages` to evaluate later:

- `@juicesharp/rpiv-pi` — similar skill-based ship-loop; compare before duplicating ideas.
- `pi-depo` — declarative package manager for Pi resources.
- `pi-lsp-lite` — lighter diagnostics if `pi-lens` is too heavy.
- `@nqbao/pi-sandbox` — OS-level sandboxing for safer autonomous execution.
- `pi-obsidian` — if PiFlow artifacts should sync with an Obsidian vault.
