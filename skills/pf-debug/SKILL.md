---
name: pf-debug
description: "Режим отладки PiFlow: два параллельных подхода к поиску корневой причины — systematic-debugging и Matt Pocock reproduce→minimise→hypothesise→instrument→fix. Результаты сливаются, фикс через pf-quick."
---

# pf-debug — Debug Mode

## Overview

Launches two independent debugging approaches in parallel, each with a different methodology. Results are merged to identify the root cause with higher confidence. Once found, the fix is applied via `pf-quick`.

## When to Use

- User reports a bug, error, crash, or unexpected behaviour
- Keywords: bug, fix, error, crash, broken, fails, not working
- Explicit `pf debug` invocation

## Workflow

### Step 1 — Reproduce

- Gather reproduction steps from user
- Confirm the issue is reproducible
- Both approaches share the same reproduction baseline

### Step 2 — Parallel Diagnosis (dispatching-parallel-agents)

#### Approach A: Systematic Debugging

- Skill: `systematic-debugging`
- Methods: root-cause-tracing, defense-in-depth analysis
- Output: Root cause hypothesis with evidence chain

#### Approach B: Matt Pocock Method

- Steps: **Reproduce → Minimise → Hypothesise → Instrument → Fix**
- Minimise: strip away everything unrelated to the bug
- Hypothesise: form 2-3 hypotheses from the minimal case
- Instrument: add logging/asserts to confirm which hypothesis is correct
- Output: Confirmed root cause with minimal reproduction

### Step 3 — Merge Results

- Compare findings from both approaches
- If they agree: high confidence in root cause
- If they disagree: investigate discrepancies, ask user for input
- Output: Confirmed root cause description

### Step 4 — Apply Fix

- Delegate to `pf-quick` with the fix scope
- The fix goes through brainstorm → plan → apply for safety
- Verify fix resolves the original reproduction case

## Skills Injected

`systematic-debugging`, `dispatching-parallel-agents`, `pf-quick`, `verification-before-completion`

## Notes

- Parallel diagnosis is the key differentiator — two perspectives catch blind spots.
- If the bug is trivial (e.g., typo), skip parallel mode and fix directly.
