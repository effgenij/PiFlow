---
name: piflow-decision-phase
description: Manually capture durable PiFlow decisions after or during a workflow. Updates decisions.md with trade-offs, alternatives, accepted risks, and revisit triggers.
---

# PiFlow Decision Phase

Use when a durable decision is made or a trade-off should survive the session.

## Capture only durable facts

Good entries:

- architecture choice;
- accepted limitation;
- rejected alternative;
- public API/schema decision;
- testing strategy decision;
- safety exception with rationale.

Avoid:

- transient progress logs;
- raw command output;
- obvious restatements;
- unreviewed guesses.

## Output

Update `decisions.md`:

- date;
- decision;
- why;
- alternatives considered;
- reversibility;
- revisit trigger.

## Gate

If the decision changes scope, public contracts, dependencies, or risk profile, ask for confirmation before continuing.
