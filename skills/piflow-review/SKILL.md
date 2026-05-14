---
name: piflow-review
description: Run PiFlow's code/PR review workflow: inspect diff against intent/spec, assess risks, check tests and validation, and produce a blocking/non-blocking review artifact.
---

# PiFlow Review Workflow

Use for reviewing local diffs, pull requests, or completed workflow changes.

## Inputs

- User-provided PR/diff or current git diff.
- Relevant `.pi-os/specs/<slug>/` artifacts if present.
- Project rules from `AGENTS.md`/README.
- Validation output if available.

## Required artifact

Write/update:

- `.pi-os/specs/<slug>/review.md` when tied to a spec;
- otherwise `.pi-os/reports/review-<date>-<slug>.md`.

## Workflow

1. Identify intended change.
2. Inspect diff.
3. Check acceptance criteria/spec alignment.
4. Check scope control.
5. Check tests and validation evidence.
6. Check maintainability and project conventions.
7. Check security/data/privacy risks.
8. Decide: `Approved | Changes requested | Blocked`.

## Review categories

- Correctness.
- Scope control.
- Maintainability.
- Tests.
- Validation.
- Security/data/privacy.
- Documentation/spec freshness.

## Output requirements

`review.md` must include:

- summary;
- blocking findings;
- non-blocking findings;
- acceptance criteria table;
- skipped/missing validation;
- final decision.

Do not implement fixes unless the user explicitly switches to implementation.
