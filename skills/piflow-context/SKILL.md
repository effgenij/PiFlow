---
name: piflow-context
description: "Контекстный пакет PiFlow: собирает релевантную информацию о проекте перед планированием и реализацией."
license: MIT
---

# piflow-context — Context Packet

Defines quick and full context packet formats for PiFlow workflows.

## When to Use

- Before major planning or implementation
- When starting a new `pf-full` or `pf-quick` flow
- When the agent needs grounding in project context

## Quick Context Packet

```md
# Context Packet

## Task

## Relevant files

## Existing patterns

## Project rules

## Verification commands
```

## Full Context Packet

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

## Notes

- Context packets are written to disk only when useful.
- Avoid artifact spam for small tasks.
- Quick flow uses quick packet; full flow uses full packet.
