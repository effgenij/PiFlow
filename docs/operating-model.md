# PiFlow Operating Model

## Purpose

PiFlow reduces prompt-writing effort by turning recurring development actions into standardized Pi skills, role subagents, and markdown artifacts.

It is intentionally lightweight: it should improve quality without making small tasks feel bureaucratic.

## Separation of concerns

### Skill = workflow/protocol

A skill decides:

- when it applies;
- which phases run;
- which artifacts must exist;
- which checks are required;
- where confirmation gates happen;
- when the task is allowed to move forward.

### Subagent = role

A subagent performs a bounded role:

- researcher;
- planner;
- implementer;
- verifier;
- reviewer;
- debugger.

Subagents should not own the workflow. They produce inputs for the skill protocol.

### Template = artifact format

Templates define durable outputs:

- `brief.md`;
- `plan.md`;
- `decisions.md`;
- `verification.md`;
- `review.md`;
- `state.md`.

## Router modes

### Review-confirm mode — default

The agent pauses for user confirmation after meaningful decision/change gates.

Require confirm:

- after routing/classification;
- after brief/spec;
- after plan;
- before implementation;
- after verification if files/code changed.

Can auto-advance:

- repo inspection;
- docs/package research;
- read-only analysis;
- template drafting;
- formatting artifacts.

### Auto-advance mode — optional

The agent proceeds to the next phase when the current phase passes its gate.

Still require explicit confirmation for safety-sensitive actions:

- dependency installation;
- destructive commands;
- production config/secrets changes;
- public API/schema/contract changes;
- broad refactors;
- commit/push/publish.

## Workflow classification

PiFlow router chooses the minimum sufficient workflow:

| Intent                          | Workflow          | Typical artifacts                            |
| ------------------------------- | ----------------- | -------------------------------------------- |
| New behavior/product change     | `piflow-feature`  | brief, plan, verification, review            |
| Bug/failure/error               | `piflow-debug`    | brief/root-cause, plan, verification, review |
| Rename/extract/move/restructure | `piflow-refactor` | impact, plan, verification, review           |
| Diff/PR review                  | `piflow-review`   | review, verification notes                   |

## Strictness classification

| Task size/risk | Required process                                          |
| -------------- | --------------------------------------------------------- |
| Tiny, low-risk | brief checklist + verification notes                      |
| Normal         | full `.pi-os/specs/<slug>/` artifact set                  |
| High-risk      | research + impact analysis + plan confirm + reviewer gate |

High-risk signals:

- auth/security/payment;
- data/schema/contracts;
- multi-module changes;
- production configuration;
- broad refactor;
- missing tests;
- unclear requirements.

## Done means evidence, not vibes

Every workflow has a verification gate. A task is not done until `verification.md` records:

- acceptance criteria status;
- commands/checks run;
- outputs or summarized evidence;
- skipped checks and reasons;
- risks and follow-ups;
- final done/not-done decision.

## Countermeasures baked into PiFlow

### Avoid ceremony creep

Router must pick the lightest process that protects quality. Tiny tasks do not need full PRDs.

### Avoid prompt soup

Keep the boundary strict:

- workflow logic in skills;
- role behavior in agents;
- artifact shape in templates.

### Avoid confirm fatigue

Review-confirm mode pauses only on decisions and meaningful changes, not on every read-only action.

### Avoid fake verification

`verification.md` must include evidence, skipped checks, and reasons. Pretty prose without checks is not a pass.

### Avoid overbuilding extensions

v1 uses skills-as-commands. Build a custom extension only after repeated workflows stabilize.
