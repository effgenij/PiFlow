---
name: piflow-research-phase
description: Manually run or rerun PiFlow's read-only research phase for an existing or new spec. Inspects code, docs, packages, and external references, then updates brief/plan notes without implementing.
---

# PiFlow Research Phase

Run this phase when facts are missing.

## Rules

- Stay read-only.
- Inspect files before asking user about discoverable facts.
- Use external docs/package research when technology behavior may be stale.
- Record only decision-relevant findings.
- Mark assumptions as `[ASSUMPTION]`.

## Output

Update the relevant artifact:

- `brief.md` for context, constraints, open questions;
- `plan.md` for implementation-relevant findings;
- `decisions.md` for durable decisions discovered/confirmed.

## Gate

In review-confirm mode, summarize findings and ask whether to proceed to spec or plan.
