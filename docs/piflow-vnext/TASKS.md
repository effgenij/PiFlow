# TASKS: PiFlow vNext Overlay Package

## Status

Draft implementation backlog for transfer into `~/dev/piflow`.

## Execution Notes

- Develop in `~/dev/piflow`, not `~/dev/pf`.
- Use a feature branch or worktree, e.g. `piflow-vnext-overlay-install`.
- During development keep only the local package installed:

```bash
pi remove git:github.com/effgenij/piflow
# keep ../../dev/piflow while developing
```

- Do not vendor upstream skills.
- Do not modify upstream skill files.
- Make `/pf-doctor` useful early; it is the safety net for install/migration issues.

---

## Phase 0 — Baseline and Cleanup

### 0.1 Confirm development location

- [x] `cd ~/dev/piflow`
- [x] Confirm it is a git repository.
- [x] Check current branch.
- [x] Create branch `piflow-vnext-overlay-install` or equivalent.

Acceptance:

- Work happens in `~/dev/piflow`.
- Branch/worktree is isolated from main stable work.

### 0.2 Remove duplicate active PiFlow package

- [x] Run `pi list`.
- [x] Confirm both `../../dev/piflow` and `git:github.com/effgenij/piflow` are active.
- [x] Remove the git package during local development:

```bash
pi remove git:github.com/effgenij/piflow
```

- [x] Run `pi list` again.

Acceptance:

- Only one PiFlow source remains active.
- Local development package remains active.

### 0.3 Inventory current PiFlow package

- [x] Inspect existing `package.json`.
- [x] Inspect existing `extensions/`.
- [x] Inspect existing `skills/`.
- [x] Inspect existing `prompts/`.
- [x] Identify old or duplicate resources.
- [x] Do not delete yet; record candidates for migration.

Acceptance:

- A short migration note exists in project docs or implementation notes.

---

## Phase 1 — Package Manifest and Resource Boundary

### 1.1 Update package manifest

- [x] Ensure `package.json` has `pi-package` keyword.
- [x] Ensure `pi.extensions` points to `./extensions`.
- [x] Ensure `pi.skills` points to `./skills`.
- [x] Ensure `pi.prompts` points to `./prompts`.
- [x] Add peer dependencies for Pi extension imports if needed:

```json
{
  "peerDependencies": {
    "@earendil-works/pi-coding-agent": "*",
    "typebox": "*"
  }
}
```

Acceptance:

- `pi install ../../dev/piflow` loads only intended PiFlow-owned resources.
- No upstream skill folders are bundled in PiFlow.

### 1.2 Define PiFlow-owned directories

Create or normalize:

```text
extensions/piflow/
skills/piflow-router/
skills/piflow-full/
skills/piflow-quick/
skills/piflow-debug/
skills/piflow-refactor/
skills/piflow-frontend/
skills/piflow-context/
skills/piflow-review/
prompts/
```

Acceptance:

- PiFlow resources are clearly namespaced.
- No ambiguous top-level skill names that could collide with upstream skills.

### 1.3 Remove vendored upstream skills from package resources

- [x] Search for copied Superpowers skills.
- [x] Search for copied Matt Pocock skills.
- [x] Search for copied Vercel/Anthropic skills.
- [x] Remove them from PiFlow package resource manifest.
- [x] Keep only references/detection logic.

Acceptance:

- PiFlow package does not load third-party upstream skills from inside the PiFlow repo.

---

## Phase 2 — Extension Commands

### 2.1 Create extension entrypoint

Implement:

```text
extensions/piflow/index.ts
```

Responsibilities:

- Register PiFlow commands.
- Load config.
- Expose doctor/status helpers.
- Avoid heavy work on startup.

Acceptance:

- Pi starts without errors with local PiFlow package installed.

### 2.2 Register commands

Implement commands:

```text
/pf-new
/pf-full
/pf-quick
/pf-debug
/pf-refactor
/pf-status
/pf-doctor
/pf-clean
```

Acceptance:

- Commands appear in Pi command list.
- Each command has a short description.
- Commands can run in no-op/stub mode initially.

### 2.3 Implement safe command argument handling

- [x] Parse freeform command args.
- [x] Preserve original user intent text.
- [x] Do not execute shell commands from args.

Acceptance:

- `/pf-new add button loading state` receives `add button loading state` as task text.

---

## Phase 3 — Doctor and Install Health

### 3.1 Detect PiFlow package sources

`/pf-doctor` should inspect Pi settings and `pi list`-equivalent state where practical.

Detect:

- local path installs containing `piflow`;
- git installs containing `effgenij/piflow` or `effgenij/PiFlow`;
- npm installs named `piflow`, `pi-piflow`, or scoped variants if used later.

Acceptance:

- Current duplicate state would be reported as a warning.

### 3.2 Detect required PiFlow resources

Check for:

- PiFlow extension loaded.
- PiFlow skills available.
- PiFlow prompts available.

Acceptance:

- Missing PiFlow-owned resources are reported with exact names.

### 3.3 Detect recommended upstream skills

Check for:

Superpowers:

- [x] `brainstorming`
- [x] `writing-plans`
- [x] `systematic-debugging`
- [x] `test-driven-development`
- [x] `verification-before-completion`
- [x] `requesting-code-review`
- [x] `receiving-code-review`
- [x] `using-git-worktrees`

Matt:

- [x] `grill-me`

Frontend:

- [x] `frontend-design`
- [x] `vercel-react-best-practices`
- [x] `web-design-guidelines`
- [x] `vercel-composition-patterns`

Acceptance:

- Missing skills are listed.
- For `frontend-design`, show:

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
```

### 3.4 Detect optional packages

Report installed/missing:

- [x] `context-mode`
- [x] `pi-web-access`
- [x] `pi-lens`
- [x] `pi-docparser`
- [x] `graphify-pi`
- [x] `@juicesharp/rpiv-todo`
- [x] `@juicesharp/rpiv-ask-user-question`
- [x] `@robhowley/pi-structured-return`
- [x] `pi-simplify`
- [x] `@tintinweb/pi-subagents`
- [x] `pi-subagents`

Acceptance:

- Doctor classifies packages as required, recommended, optional, or potential overlap.

### 3.5 Detect duplicate skills by name

- [x] Scan Pi skill locations.
- [x] Group by frontmatter `name`.
- [x] Report duplicates.

Acceptance:

- Duplicate skill names are visible with file paths.

---

## Phase 4 — Router

### 4.1 Implement classifier

Classify task into proposed flow:

- `pf-debug`
- `pf-quick`
- `pf-full`
- `pf-refactor`

Also classify overlays:

- frontend overlay;
- React/Next performance overlay;
- composition overlay;
- web design/accessibility review overlay.

Acceptance:

- Classifier returns flow, overlays, confidence, and reasons.

### 4.2 Ask confirmation before routing

Use available structured question UI if present.

Behavior:

```text
Proposed flow: pf-debug
Reasons:
- symptom detected
- reproduction required
Run this flow?
```

Options:

- yes;
- choose another flow;
- clarify task.

Acceptance:

- `/pf-new` does not silently launch a workflow.

### 4.3 Manual override

Support:

```text
/pf-new --flow quick <task>
/pf-new --flow full <task>
/pf-new --flow debug <task>
/pf-new --flow refactor <task>
```

Acceptance:

- Explicit flow still shows a short confirmation unless configured otherwise.

---

## Phase 5 — Workflow Skills

### 5.1 `piflow-router` skill

Create `skills/piflow-router/SKILL.md`.

Responsibilities:

- Explain routing policy.
- Require confirmation.
- Define artifact budget.
- Point to other PiFlow skills.

Acceptance:

- Skill is concise and does not duplicate all workflow details.

### 5.2 `piflow-full` skill

Create full lifecycle overlay:

```text
intent
→ context packet
→ grill-me / brainstorming
→ OpenSpec proposal
→ requirements / scenarios
→ design
→ ADR if needed
→ tasks
→ implementation plan
→ TDD / execution
→ frontend overlays if UI
→ verification
→ review
→ archive
```

Acceptance:

- Skill delegates to upstream skills by name.
- Skill does not copy upstream instructions.

### 5.3 `piflow-quick` skill

Create quick spec-lite workflow:

```text
intent
→ quick context
→ quick spec packet if useful
→ tiny plan
→ implementation
→ verification
```

Acceptance:

- Explicitly avoids OpenSpec by default.
- Has 0–1 file artifact budget.

### 5.4 `piflow-debug` skill

Create reproduce-first bugfix workflow:

```text
symptom
→ reproduction
→ expected vs actual
→ isolate
→ hypotheses
→ instrumentation
→ fix
→ regression test/check
→ verification
```

Acceptance:

- Hard gate: no fix before reproduction or explicit reproduction-impossible explanation.

### 5.5 `piflow-refactor` skill

Create safe refactor workflow:

```text
diagnosis
→ classify risk
→ safety net
→ target shape
→ step plan
→ small edits
→ verification
→ review
```

Acceptance:

- Supports quick and full modes.
- Escalates to OpenSpec for architectural/public API changes.

### 5.6 `piflow-frontend` overlay skill

Create frontend overlay:

- Use `frontend-design` for new UI or visual redesign.
- Use `vercel-react-best-practices` for React/Next code.
- Use `vercel-composition-patterns` for component API design/refactor.
- Use `web-design-guidelines` for UI/accessibility review.

Acceptance:

- Overlay contains personal/frontend preferences but does not duplicate upstream skill docs.

### 5.7 `piflow-context` skill

Create context packet workflow.

Acceptance:

- Defines quick and full context packet formats.
- Writes context packet only when useful.

### 5.8 `piflow-review` skill

Create review overlay:

- Fresh-context review for significant work.
- Verify against PRD/spec/tasks.
- Use frontend review skills when UI is touched.
- Require verification evidence before completion.

Acceptance:

- Does not duplicate `requesting-code-review` or `verification-before-completion`; composes them.

---

## Phase 6 — Prompts

### 6.1 Create prompt templates

Create:

```text
prompts/pf-new.md
prompts/pf-full.md
prompts/pf-quick.md
prompts/pf-debug.md
prompts/pf-refactor.md
```

Acceptance:

- Prompts are short entrypoints, not full duplicated skills.
- Prompts reference PiFlow skills and expected behavior.

---

## Phase 7 — Context and Config

### 7.1 Add config loading

Support optional config locations:

```text
~/.pi/agent/piflow/config.json
.piflow/config.json
```

Initial config options:

```json
{
  "router": {
    "confirmBeforeRun": true
  },
  "artifacts": {
    "quick": "session-or-one-file",
    "contextPackets": "when-useful"
  },
  "subagents": {
    "backend": "none"
  }
}
```

Acceptance:

- Missing config is fine.
- Defaults match agreed behavior.

### 7.2 Add project overlay files on demand

Optional project files:

```text
.piflow/overlays/frontend.md
.piflow/overlays/testing.md
.piflow/overlays/architecture.md
```

Acceptance:

- PiFlow does not create these automatically unless user asks or a command requires it.

---

## Phase 8 — Subagent Adapter Layer

### 8.1 Define adapter interface

Create adapter abstraction for:

- no subagent backend;
- `@tintinweb/pi-subagents`;
- `npm:pi-subagents`.

Acceptance:

- Core workflows do not directly depend on one subagent package.

### 8.2 Implement `none` adapter

Behavior:

- Inline execution only.
- Explain that subagents are optional.

Acceptance:

- All v1 workflows work without subagent package.

### 8.3 Detect installed backend candidates

Doctor should report:

- current `@tintinweb/pi-subagents` if installed;
- `npm:pi-subagents` if installed;
- recommendation to evaluate `npm:pi-subagents` for workflow-oriented agents.

Acceptance:

- PiFlow does not install or switch backend automatically.

---

## Phase 9 — Clean and Migration Tools

### 9.1 Implement `/pf-clean` dry-run

Dry-run reports:

- duplicate PiFlow package sources;
- old PiFlow skills;
- old PiFlow prompts;
- old PiFlow extensions;
- suggested `pi remove` commands.

Acceptance:

- No files are deleted by default.

### 9.2 Add explicit cleanup confirmation

If user chooses cleanup:

- [x] Show exact files/packages to remove.
- [x] Ask confirmation.
- [x] Never delete upstream skills.
- [x] Never delete user overlays.

Acceptance:

- Cleanup is safe and reversible where possible.

---

## Phase 10 — README and Usage Docs

### 10.1 Update README installation

Document:

```bash
pi install git:github.com/effgenij/PiFlow
```

Local dev:

```bash
pi install ../../dev/piflow
```

Temporary test:

```bash
pi -e ../../dev/piflow
```

Acceptance:

- README names `pi install` as canonical install method.

### 10.2 Document upstream skills

Explain that PiFlow does not vendor upstream skills.

List recommended install commands, including:

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
```

Acceptance:

- User understands why missing upstream skills are warnings, not bundled resources.

### 10.3 Document current environment migration

Add note:

```bash
pi remove git:github.com/effgenij/piflow
```

when local development package is active.

Acceptance:

- Duplicate install problem is easy to fix.

---

## Phase 11 — Verification

### 11.1 Package loading verification

Run:

```bash
pi list
```

Then start Pi and verify:

- [x] commands are registered;
- [x] no startup errors;
- [x] no duplicate PiFlow package source.

Acceptance:

- PiFlow package loads cleanly.

### 11.2 Doctor verification

Run:

```text
/pf-doctor
```

Acceptance:

- Reports installed and missing skills/packages accurately.
- Reports no false duplicate after cleanup.

### 11.3 Router verification

Test prompts:

```text
/pf-new поправить скролл в модалке
/pf-new добавить loading state в Button
/pf-new сделать новую систему фильтров
/pf-new упростить API компонента Select
```

Acceptance:

- Proposed flows are respectively debug, quick/frontend, full/frontend, refactor/composition.
- Router asks before executing.

### 11.4 Workflow smoke tests

Run each command in no-op or dry-run mode first:

```text
/pf-quick test task
/pf-debug test task
/pf-refactor test task
/pf-full test task
```

Acceptance:

- Commands produce expected workflow outline and next action.
- No command creates excessive files by default.

---

## Suggested Implementation Order

1. Phase 0: cleanup duplicate active package.
2. Phase 1: manifest/resource boundary.
3. Phase 2: command registration.
4. Phase 3: `/pf-doctor`.
5. Phase 4: `/pf-new` router confirmation.
6. Phase 5: workflow skills.
7. Phase 10: README updates.
8. Phase 11: verification.
9. Later: subagent adapters and `/pf-clean` full implementation.

## Definition of Done

- [x] PiFlow installs via `pi install ../../dev/piflow` locally.
- [x] PiFlow can later install via `pi install git:github.com/effgenij/PiFlow`.
- [x] Only one PiFlow source is active.
- [x] `/pf-doctor` identifies missing upstream skills and duplicate installs.
- [x] `/pf-new` asks before choosing flow.
- [x] PiFlow does not vendor upstream skills.
- [x] Quick tasks do not create OpenSpec artifacts.
- [x] Full tasks can route into OpenSpec.
- [x] Debug tasks require reproduction before fix.
- [x] Frontend tasks compose frontend-design and Vercel skills when installed.
