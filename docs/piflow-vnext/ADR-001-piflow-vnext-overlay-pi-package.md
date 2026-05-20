# ADR-001: Build PiFlow vNext as a Pi Package Overlay

## Status

Proposed

## Context

PiFlow is intended to become a personal workflow layer for Pi Agent that combines:

- OpenSpec for full spec-driven development lifecycle.
- Superpowers for engineering discipline and workflow skills.
- Matt Pocock-style `grill-me` and PRD/task-slicing practices.
- Anthropic and Vercel frontend skills for UI, React, Next.js, accessibility, and composition.
- Optional Pi subagent packages for specialist agents.

The current environment has PiFlow installed from two sources:

- local path: `../../dev/piflow`
- git package: `git:github.com/effgenij/piflow`

This can cause duplicate commands, duplicate skills, stale resources, and unclear behavior.

The user wants to use original upstream skills rather than copying or modifying them. The user also wants a clean installation experience, ideally through `pi install`, and wants PiFlow to remain tailored for a solo frontend developer.

Pi supports package installation via:

```bash
pi install git:github.com/user/repo
pi install npm:package
pi install ./local/path
```

A Pi package can expose extensions, skills, prompts, and themes through `package.json` under the `pi` manifest key.

## Decision

PiFlow vNext will be implemented as a **Pi package overlay**.

It will be installed with:

```bash
pi install git:github.com/effgenij/PiFlow
```

During local development, it may be installed with:

```bash
pi install ../../dev/piflow
```

PiFlow will ship only PiFlow-owned orchestration resources:

- extension commands;
- router logic;
- workflow overlay skills;
- prompts;
- doctor and cleanup utilities;
- optional subagent adapter code.

PiFlow will not vendor, copy, fork, or modify upstream skills from:

- Superpowers;
- Matt Pocock skills;
- Anthropic skills;
- Vercel agent skills.

Instead, PiFlow will detect those upstream skills at runtime and compose them with PiFlow overlays and project context.

The package will expose resources using a Pi package manifest:

```json
{
  "pi": {
    "extensions": ["./extensions"],
    "skills": ["./skills"],
    "prompts": ["./prompts"]
  }
}
```

PiFlow will include `/pf-doctor` to detect missing upstream skills, duplicate PiFlow installs, optional support packages, and stale resources.

## Rationale

An overlay package fits the project better than vendoring or rewriting existing workflows because:

1. **Original upstream skills remain updateable** — Superpowers, Matt Pocock, Anthropic, and Vercel skills can evolve independently.
2. **Installation is cleaner** — `pi install` becomes the canonical install path.
3. **Duplicates are reduced** — PiFlow owns only its router and overlays.
4. **Personal customization is preserved** — project/user overlays can add local preferences without editing upstream skill files.
5. **Pi philosophy is respected** — Pi is designed to be extended through packages, skills, prompts, and extensions.
6. **Workflow complexity stays proportional** — PiFlow can route small tasks to quick flows and large tasks to OpenSpec.

## Considered Options

### Option 1: Vendor all skills inside PiFlow

PiFlow would copy Superpowers, Matt Pocock, Anthropic, and Vercel skills into its own repository.

Pros:

- Reproducible snapshot.
- Single package contains everything.
- No external skill installation required.

Cons:

- Causes duplicate skill files.
- Harder to update upstream skills.
- Conflicts with user preference to use original skills.
- Larger package.
- More responsibility to maintain third-party content.

Rejected because it directly conflicts with the desired clean installation and original-skill composition model.

### Option 2: Fork and customize upstream skills

PiFlow would fork upstream skills and edit them to include personal instructions.

Pros:

- Full control over behavior.
- Custom instructions can be embedded directly.

Cons:

- Diverges from upstream.
- Updates become manual and risky.
- Hard to know whether behavior comes from upstream or PiFlow.
- More duplication.

Rejected because overlays provide customization without forking.

### Option 3: Shell installer that copies files into Pi directories

PiFlow would use a curl/bash installer that copies extensions, skills, and prompts into `~/.pi/agent`.

Pros:

- Easy to script.
- Can install multiple dependencies at once.

Cons:

- Bypasses Pi package management.
- Harder to remove/update cleanly.
- More likely to create duplicate files.
- Harder to inspect active package source with `pi list`.

Rejected as the primary install path. A helper script may exist later, but `pi install` must be canonical.

### Option 4: Pi package overlay

PiFlow ships only its own resources and composes external skills at runtime.

Pros:

- Clean `pi install` lifecycle.
- No vendored upstream skill duplication.
- Easy to remove with `pi remove`.
- Works with local development packages and git packages.
- Supports doctor/cleanup diagnostics.
- Best fit for solo custom workflow.

Cons:

- Requires external skills to be installed separately.
- Doctor logic must handle missing dependencies gracefully.
- Runtime composition is more complex than copying files.

Accepted.

## Consequences

### Positive

- PiFlow has a clean package boundary.
- Upstream skills remain original.
- Duplicate file risk is reduced.
- The package can be installed, removed, and updated with Pi commands.
- The workflow can evolve without rewriting upstream skill content.
- The same package can support local development, git installation, and future npm publication.

### Negative

- First-run setup requires dependency checks.
- Users may need to install recommended upstream skills manually.
- PiFlow must handle absent skills without failing cryptically.
- Some behavior depends on resources outside the PiFlow repository.

### Follow-up Work

- Implement `/pf-doctor` before advanced workflow automation.
- Add clear README installation modes.
- Add duplicate PiFlow source detection.
- Add recommended upstream skill detection.
- Add optional subagent backend detection.
- Add a migration guide from current duplicate install state.

## Current Environment Recommendation

During development, keep the local package:

```text
../../dev/piflow
```

Remove the duplicate git package:

```bash
pi remove git:github.com/effgenij/piflow
```

When vNext is stable, switch to:

```bash
pi remove ../../dev/piflow
pi install git:github.com/effgenij/PiFlow
```
