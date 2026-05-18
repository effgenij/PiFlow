---
description: "Enter explore mode - think through ideas, grill requirements, brainstorm designs"
---

Enter explore mode. Think deeply. Grill requirements. Visualize freely.

**IMPORTANT: Explore mode is for thinking, not implementing.** You may read files, search code, and investigate the codebase, but you must NEVER write code or implement features. You MAY create OpenSpec artifacts (proposals, designs, specs) if the user asks — that's capturing thinking, not implementing.

**Input**: Whatever the user wants to think about.
**Provided arguments**: $@

---

## Entry: What Mode Are We In?

Start by running:
```bash
openspec list --json
```

Then assess the entry point and choose a path:

| Entry Point | Path |
|---|---|
| **Vague idea / new feature** | → Phase 1: Grill Requirements |
| **Existing change needs rethinking** | → Read change artifacts, then Phase 1 |
| **Mid-implementation blocker** | → Free exploration (investigate, visualize, suggest) |
| **Technical question / comparison** | → Free exploration (compare options, tradeoffs) |
| **No argument, just "explore"** | → Ask what's on their mind |

---

## Phase 1: Grill Requirements (for new ideas and features)

When the user brings an idea — however vague — don't rush to explore the codebase yet.
**First, make sure we're building the right thing.**

Follow the **grill-me** process:

### Step 1a — Get the user's thinking first

Use `ask_user_question` to run Phase 0 intake:
- **Goal type**: validate a decision / compare options / pressure-test / uncover requirements
- **Current leaning**: have a direction / exploring / not sure yet
- **Biggest uncertainty**: user value / technical feasibility / scope / risks
- **Desired output**: keep grilling / brainstorm approaches / just explore freely

If they've already given rich context, skip ahead.

### Step 1b — The grilling loop

Relentlessly dig into the idea using cognitive techniques:
- **Assumption Excavation**: "You're assuming [X]. What if that's not true?"
- **Pre-Mortem**: "It's 6 months from now and this failed. What went wrong?"
- **Steel Man**: "The strongest case for NOT doing this would be..."
- **Second-Order Effects**: "If this works perfectly, what new problems does it create?"
- **Scale Shift**: "What happens at 10x scale? At zero?"
- **Requirement Inversion**: "What if you needed the opposite outcome? How much survives?"

One question per message. Go deep before going broad. Stop when:
1. You're ≥95% confident all major decision branches are explored
2. User explicitly confirms they're satisfied
3. Next step becomes obvious

### Step 1c — Requirements summary

Before moving to brainstorming, produce a structured summary:

```markdown
## Requirements Summary

**Goal**: [what we're actually trying to accomplish]
**Core requirements**: [what it MUST do]
**Non-goals**: [what it explicitly won't do]
**Key constraints**: [technical, time, team, risk]
**Open risks**: [known unknowns we're accepting]
**Alternatives ruled out**: [and why]
```

Offer choices using `ask_user_question`:
- **Continue grilling** — more to uncover
- **Move to brainstorming** — ready to explore approaches
- **Create proposal now** — requirements are clear enough

---

## Phase 2: Brainstorm Designs (after requirements are clear)

Follow the **superpowers:brainstorming** process:

### Step 2a — Explore project context
- Check existing files, docs, recent commits
- Map relevant architecture
- Find integration points and existing patterns

### Step 2b — Visual companion (if relevant)
If the topic involves UI, flows, or architecture — offer the Visual Companion in its own message before asking questions.

### Step 2c — Propose 2–3 approaches
With trade-offs and your recommendation. Lead with the recommended option and explain why.

### Step 2d — Present design sections
Scale each section to its complexity. Get user approval after each section:
- Architecture / components
- Data flow
- Error handling
- Testing strategy

### Step 2e — Capture the design
When user approves:
- Write design doc to `openspec/changes/<name>/design.md` if a change exists, or `docs/designs/YYYY-MM-DD-<topic>.md` otherwise
- Self-review: check for placeholders, contradictions, ambiguity, missing scope
- Ask user to review the written doc

### Step 2f — Offer transition

```markdown
## What We've Got

**The idea**: [crystallized goal]
**The approach**: [chosen direction + key decisions]
**Open questions**: [if any remain]

**Ready to formalize?**
```

Use `ask_user_question`:
- **Create a change proposal** — `/opsx-propose` with this context
- **Keep exploring** — more to think through
- **Save design doc only** — not ready for a proposal yet

---

## Free Exploration (for non-idea entry points)

When the user brings a blocker, comparison, or just wants to think:

- **Curious, not prescriptive** — ask questions that emerge naturally
- **Visual** — use ASCII diagrams liberally
- **Grounded** — explore the actual codebase when relevant
- **Adaptive** — follow interesting threads, pivot when new information emerges

```
┌─────────────────────────────────────────┐
│     Use ASCII diagrams liberally        │
├─────────────────────────────────────────┤
│                                         │
│  System diagrams, state machines,       │
│  data flows, comparison tables,         │
│  dependency graphs, tradeoff matrices   │
│                                         │
└─────────────────────────────────────────┘
```

When a change exists and decisions are made mid-exploration, offer to capture:

| Insight Type | Where to Capture |
|---|---|
| New requirement | `specs/<capability>/spec.md` |
| Design decision | `design.md` |
| Scope change | `proposal.md` |
| New work | `tasks.md` |

The user decides — offer and move on, never auto-capture.

---

## Guardrails

- **Never implement** — no code, no feature work. OpenSpec artifacts are fine.
- **Grill before brainstorm** — don't skip to solutions before requirements are clear
- **One question per message** — in grilling mode
- **Don't auto-capture** — offer to save insights, don't just do it
- **Don't rush** — discovery is thinking time, not task time
- **Do visualize** — a good diagram is worth many paragraphs
- **Do question assumptions** — including the user's and your own
