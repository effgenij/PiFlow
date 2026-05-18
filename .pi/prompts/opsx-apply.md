---
description: Implement tasks from an OpenSpec change (Experimental)
---

Implement tasks from an OpenSpec change.

**Input**: Optionally specify a change name (e.g., `/opsx-apply add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.
**Provided arguments**: $@

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., `/opsx-apply <other>`).

2. **Check status to understand the schema**

   ```bash
   openspec status --change "<name>" --json
   ```

   Parse the JSON to understand:
   - `schemaName`: The workflow being used (e.g., "spec-driven")
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

3. **Get apply instructions**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   This returns:
   - `contextFiles`: artifact ID -> array of concrete file paths (varies by schema)
   - Progress (total, complete, remaining)
   - Task list with status
   - Dynamic instruction based on current state

   **Handle states:**
   - If `state: "blocked"` (missing artifacts): show message, suggest using `/opsx-continue`
   - If `state: "all_done"`: congratulate, suggest archive
   - Otherwise: proceed to implementation

4. **Read context files**

   Read every file path listed under `contextFiles` from the apply instructions output.
   The files depend on the schema being used:
   - **spec-driven**: proposal, specs, design, tasks
   - Other schemas: follow the contextFiles from CLI output

5. **Show current progress**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - Remaining tasks overview
   - Dynamic instruction from CLI

6. **Execute implementation via `/sp-implement`**

   Announce: "Handing this off to `/sp-implement` to run the Superpowers implementation flow."

   Build a concise task brief from the context files and invoke `/sp-implement`:

   ```
   /sp-implement
   Change: <change-name>
   Spec: openspec/changes/<change-name>/specs/**/*.md
   Design: openspec/changes/<change-name>/design.md (if present)
   ADRs: adr/*.md (architectural commitments to honor)
   Tasks: openspec/changes/<change-name>/tasks.md
   ```

   `/sp-implement` will run the full Superpowers flow:
   - **Recon** (`sp-recon`) — codebase context gathering
   - **Research** (`sp-research`) — deep dive on complex areas
   - **Implementation** (`sp-implementer`) — code changes with TDD
   - **Code Review** (`sp-code-review`) — quality review against project standards
   - **Debug** (`sp-debug`) — if regressions appear
   - Branch finishing via the `finishing-a-development-branch` lifecycle skill

   After `/sp-implement` completes: suggest archive with `/opsx-archive`.

**Output During Implementation**

```
## Implementing: <change-name> (schema: <schema-name>)

Handing off to /sp-implement...
[Superpowers flow: Recon → Research → Implement → Review]
✓ Implementation complete
```

**Output On Completion**

```
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tasks complete! You can archive this change with `/opsx-archive`.
```

**Output On Pause (Issue Encountered)**

```
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
```

**Guardrails**

- Always delegate to `/sp-implement` — never implement inline without it
- Always read context files before building the brief (from the apply instructions output)
- Pass spec, design, ADRs, and tasks explicitly in the brief — don't assume sp-implement knows the context
- Use contextFiles from CLI output, don't assume specific file names

**Fluid Workflow Integration**

This skill supports the "actions on a change" model:

- **Can be invoked anytime**: Before all artifacts are done (if tasks exist), after partial implementation, interleaved with other actions
- **Allows artifact updates**: If implementation reveals design issues, suggest updating artifacts - not phase-locked, work fluidly
