---
name: piflow-debug
description: "Режим отладки PiFlow: два параллельных подхода к поиску корневой причины — systematic-debugging и Matt Pocock reproduce→minimise→hypothesise→instrument→fix. Результаты сливаются, фикс через piflow-quick."
license: MIT
---

# piflow-debug — Debug Mode

Two independent debugging approaches in parallel. Results merged for higher confidence.

## When to Use

- User reports a bug, error, crash, or unexpected behaviour
- Keywords: bug, fix, error, crash, broken, fails, not working
- Explicit `/pf-debug` invocation

## Workflow

### Step 1 — Reproduce

- Gather reproduction steps from user
- Confirm the issue is reproducible
- Both approaches share the same reproduction baseline

### Step 2 — Parallel Diagnosis (dispatching-parallel-agents)

#### Approach A: Systematic Debugging

- Skill: `systematic-debugging`
- Methods: root-cause-tracing, defense-in-depth analysis

#### Approach B: Matt Pocock Method

- Steps: **Reproduce → Minimise → Hypothesise → Instrument → Fix**

### Step 3 — Merge Results

- Compare findings from both approaches
- Agree: high confidence. Disagree: investigate discrepancies

### Step 4 — Apply Fix

- Delegate to `piflow-quick` with the fix scope
- Verify fix resolves the original reproduction case

## Hard Rule

**No fix before reproduction** — or clear explanation why reproduction is impossible.

## Skills Referenced (by name)

`systematic-debugging`, `dispatching-parallel-agents`, `test-driven-development`, `verification-before-completion`, `piflow-quick` (for fix delegation)

## Notes

- If the bug is trivial (typo), skip parallel mode and fix directly.
