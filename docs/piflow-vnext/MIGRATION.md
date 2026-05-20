# PiFlow vNext Migration Notes

## Resource boundary

PiFlow vNext owns only these package resources:

- `extensions/piflow/**`
- `skills/piflow-*/SKILL.md`
- `prompts/pf-*.md`
- `docs/piflow-vnext/**`

Upstream Superpowers, Matt Pocock, Vercel, Anthropic, Graphify, Context Mode, and other third-party skills stay outside this package. PiFlow references those skills by name and reports missing ones through `/pf-doctor`; it does not vendor or modify them.

## Current migration candidates

The old single-file extension and old prompt/skill names have been removed from the package tree in favor of vNext resources:

- `extensions/piflow.ts` → `extensions/piflow/**`
- `prompts/opsx-*.md` → `/pf-*` prompts and OpenSpec skill references
- `skills/pf-*` → `skills/piflow-*`
- `skills/openspec-*` → external OpenSpec skills, not PiFlow-owned vNext resources

## Duplicate local/git install cleanup

During local development keep only the local package active:

```bash
pi install ../../dev/piflow
pi remove git:github.com/effgenij/piflow
```

Use `/pf-doctor` to identify duplicate PiFlow package sources and duplicate skill names before cleanup.
