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

6. **Execute implementation via superpowers:executing-plans**

   Announce: "I'm using the superpowers:executing-plans skill to execute this change."

   Then follow the **superpowers:executing-plans** skill exactly:

   **Step 6a — Load and Review**
   - Read all context files from step 4
   - Review tasks.md critically — identify any gaps or blockers
   - If concerns: raise them before proceeding
   - If no concerns: create a TodoWrite list from tasks.md and proceed

   **Step 6b — Setup Workspace**
   - Use **superpowers:using-git-worktrees** to ensure you are in an isolated worktree
   - The worktree branch name should match the change name

   **Step 6c — Execute Tasks**
   For each task in tasks.md:
   1. Mark as in_progress
   2. Follow each step exactly as described
   3. Run verifications (tests, lint, type checks) after each task
   4. Mark as completed only when verified

   **STOP immediately if:**
   - A blocker or missing dependency is encountered
   - A test fails and the fix is not obvious
   - An instruction contradicts the spec
     Ask for clarification rather than guessing.

   **Step 6d — Complete Development**
   After all tasks are verified:
   - Announce: "I'm using the superpowers:finishing-a-development-branch skill to complete this work."
   - Use **superpowers:finishing-a-development-branch** to finalize
   - After branch is finished: suggest archive with `/opsx-archive`

**Output During Implementation**

```
## Implementing: <change-name> (schema: <schema-name>)

Setting up worktree for branch: <branch-name>

Working on task 3/7: <task description>
[...implementation + verification...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation + verification...]
✓ Task complete
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

- Always use superpowers:executing-plans — never implement inline without it
- Always read context files before starting (from the apply instructions output)
- Always set up an isolated worktree via superpowers:using-git-worktrees
- Run verifications after each task — don't batch them at the end
- Pause on errors, blockers, or unclear requirements — don't guess
- Use contextFiles from CLI output, don't assume specific file names

**Fluid Workflow Integration**

This skill supports the "actions on a change" model:

- **Can be invoked anytime**: Before all artifacts are done (if tasks exist), after partial implementation, interleaved with other actions
- **Allows artifact updates**: If implementation reveals design issues, suggest updating artifacts - not phase-locked, work fluidly
