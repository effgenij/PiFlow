# Pi Coding Agent Resource Audit for PiFlow

Date: 2026-05-14

This audit classifies the currently installed Pi packages and loose skills by usefulness for PiFlow.

## Current global settings

Global settings file:

```text
/Users/effgenij/.pi/agent/settings.json
```

Relevant settings:

```json
{
  "defaultProvider": "kilocode",
  "defaultModel": "openai/gpt-5.5",
  "defaultThinkingLevel": "medium",
  "powerline": "nerd",
  "theme": "terminal"
}
```

No project-level settings were found at:

- `/Users/effgenij/.pi/settings.json`
- `/Users/effgenij/dev/.pi/settings.json`

## Strong keep — core PiFlow infrastructure

These directly support PiFlow's planned operating model and should stay installed.

| Package | Resources | Why it matters for PiFlow |
|---|---|---|
| `npm:context-mode` | extension + skills: `context-mode`, `ctx-*` | Essential for processing large test/build/log output, indexing research, preserving context, and avoiding context-window flooding. PiFlow verification and research phases should rely on it. |
| `npm:@tintinweb/pi-subagents` | extension | Essential for PiFlow role separation: researcher, planner, implementer, verifier, reviewer, debugger. Enables background/parallel agents and custom `.pi/agents` definitions. |
| `npm:@juicesharp/rpiv-todo` | extension | Useful runtime tracker for PiFlow phases. Durable source of truth remains markdown, but todo overlay helps current session execution. |
| `npm:@juicesharp/rpiv-ask-user-question` | extension | Essential for PiFlow's default review-confirm mode and structured confirmation gates. |
| `npm:@juicesharp/rpiv-args` | extension | Useful for skills-as-commands. Lets manual PiFlow phase skills receive shell-style arguments cleanly. |
| `npm:@ff-labs/pi-fff` | extension | Fast fuzzy file and grep tools. Useful in research, planning, debugging, and review phases. |
| `npm:@robhowley/pi-structured-return` | extension + skill: `structured-return` | Important for compact validation output from tests, linters, builds, and security checks. Complements context-mode. |
| `npm:pi-lens` | extension + skills: `ast-grep`, `lsp-navigation` | Important for code intelligence, diagnostics, LSP navigation, ast-grep, and feedback after edits. Useful in refactor/debug/implementation/review. |
| `npm:pi-gitnexus` | extension + skills: `gitnexus-debugging`, `gitnexus-exploring`, `gitnexus-impact-analysis`, `gitnexus-pr-review`, `gitnexus-refactoring` | Strong fit for PiFlow debug, safe refactor, impact analysis, and PR review workflows. |
| `npm:pi-web-access` | extension + skill: `librarian` | Useful for current documentation, package research, GitHub repo analysis, and external best-practice lookup in research phase. |
| `npm:@plannotator/pi-extension` | extension + skills | Strong fit for human review gates: plan annotation, code/PR review, and reviewed goal/spec packages. Especially useful for default review-confirm mode. |
| `npm:@aliou/pi-guardrails` | extension | Fits PiFlow safety profile: path access, permission gates, and protection against destructive or sensitive actions. |

## Keep if you use the feature

These are useful, but not central to PiFlow's four core workflows.

| Package | Resources | Keep if... | PiFlow relevance |
|---|---|---|---|
| `npm:graphify-pi` | extension + skill: `graphify` | You want durable knowledge graphs for codebases/docs/corpora. | Useful for architecture exploration and long-lived knowledge, but heavier than needed for every PiFlow task. |
| `npm:pi-docparser` | extension + skill: `parse-document` | You often receive PDFs, DOCX, PPTX, XLSX, CSV, or images as requirements/spec inputs. | Helpful for importing external specs into PiFlow `brief.md`; otherwise optional. |
| `npm:pi-init` | skill: `init` | You frequently initialize/update `AGENTS.md`. | Useful before PiFlow adoption in a new repo; not needed every day after AGENTS.md exists. |
| `npm:pi-skill-palette` | extension | You like command-palette UX for selecting skills. | Nice with many PiFlow manual phase skills, but not required. |
| `npm:pi-simplify` | extension | You want automatic clarity/maintainability review of recently changed code. | Could overlap with PiFlow review phase; keep if its feedback is useful and not noisy. |
| `npm:pi-kilocode` | extension/provider | You use Kilo Code as the model provider. | Required only because current `defaultProvider` is `kilocode`. Do not remove unless changing provider/model config. |

## Mostly cosmetic / UX-only

These do not affect PiFlow's engineering quality. Remove only if you want a leaner UI.

| Package | Resources | Why optional |
|---|---|---|
| `npm:pi-terminal-theme` | theme | Current settings use `"theme": "terminal"`. Keep if you like the look; remove if you do not need this theme. |
| `npm:pi-powerline-footer` | extension | Current settings use `"powerline": "nerd"`. Pure status bar UX; not part of PiFlow. |

## Loose global skills outside package list

Locations inspected:

```text
/Users/effgenij/.agents/skills
/Users/effgenij/.pi/agent/skills
```

### Strong keep for PiFlow

| Skill | Why |
|---|---|
| `grill-me` | Directly useful for PiFlow spec clarification and requirement pressure-testing. |
| `find-docs` | Useful in PiFlow research phase when docs accuracy matters. |
| `skill-creator` | Useful because PiFlow itself is a skill/workflow kit and will need iteration. Note: appears in both `~/.agents/skills` and `~/.pi/agent/skills`; consider deduplicating if Pi warns about name collisions. |

### Keep if relevant to your projects

| Skill | Keep if... |
|---|---|
| `building-components` | You build component libraries/design-system components. |
| `storybook` | You use Storybook. |
| `web-design-guidelines` | You review UI/UX/accessibility. |
| `vercel-react-best-practices` | You work on React/Next.js code. |
| `vercel-composition-patterns` | You design/refactor React component APIs. |
| `redux-best-practices` | You work on Redux/React-Redux. |
| `redux-toolkit` | You work on Redux Toolkit/RTK Query/Next.js Redux. |
| `startup-pressure-test` | You want startup/product idea pressure testing. Not relevant to coding workflow itself. |
| `find-skills` | Useful when discovering additional installable skills. Optional if you rarely do that. |

### Probably not needed for PiFlow v1

| Skill | Why |
|---|---|
| `paseo` | PiFlow uses `@tintinweb/pi-subagents`; paseo is a separate agent-management CLI flow. Keep only if you actively use paseo. |
| `paseo-handoff` | Overlaps with subagent/handoff workflows; not core to PiFlow. |
| `paseo-loop` | PiFlow intentionally avoids infinite/autonomous loops in v1. Keep only for separate loop/babysit workflows. |
| `paseo-orchestrator` | No `SKILL.md` was found in the inspected folder, so it likely is not loaded as a normal skill. Review manually before deleting. |

## Suggested lean PiFlow profile

If you want a lean but capable PiFlow setup, keep these global packages:

```text
npm:context-mode
npm:@tintinweb/pi-subagents
npm:@juicesharp/rpiv-todo
npm:@juicesharp/rpiv-ask-user-question
npm:@juicesharp/rpiv-args
npm:@ff-labs/pi-fff
npm:@robhowley/pi-structured-return
npm:pi-lens
npm:pi-gitnexus
npm:pi-web-access
npm:@plannotator/pi-extension
npm:@aliou/pi-guardrails
npm:pi-kilocode        # only while defaultProvider=kilocode
```

Optional add-ons:

```text
npm:graphify-pi
npm:pi-docparser
npm:pi-init
npm:pi-skill-palette
npm:pi-simplify
npm:pi-terminal-theme
npm:pi-powerline-footer
```

## Possible removal candidates

Only remove after confirming you do not use them elsewhere.

### Low PiFlow value / cosmetic

```bash
pi remove npm:pi-terminal-theme
pi remove npm:pi-powerline-footer
```

If you remove them, also update settings if needed:

- `theme: "terminal"` depends on `pi-terminal-theme`.
- `powerline: "nerd"` may depend on `pi-powerline-footer`.

### Optional overlap / specialized

```bash
pi remove npm:graphify-pi
pi remove npm:pi-docparser
pi remove npm:pi-init
pi remove npm:pi-skill-palette
pi remove npm:pi-simplify
```

Reasons:

- `graphify-pi`: powerful but heavier; use only when persistent graph workflows matter.
- `pi-docparser`: needed only for local documents.
- `pi-init`: needed mainly for AGENTS.md initialization/update.
- `pi-skill-palette`: UX convenience only.
- `pi-simplify`: may overlap with PiFlow review skills.

### Do not remove unless replacing provider

```bash
pi remove npm:pi-kilocode
```

Current settings use:

```json
{
  "defaultProvider": "kilocode",
  "defaultModel": "openai/gpt-5.5"
}
```

Removing `pi-kilocode` without changing provider settings may break model access.

## Recommended next cleanup actions

1. Decide whether you want to keep UI cosmetics: `pi-terminal-theme`, `pi-powerline-footer`.
2. Decide whether persistent knowledge graphs are part of PiFlow daily use: `graphify-pi`.
3. Decide whether document parsing is common enough to keep globally: `pi-docparser`.
4. Deduplicate `skill-creator` if Pi reports collisions.
5. Consider installing PiFlow itself project-locally where needed:

```bash
pi install -l git:git@github.com:effgenij/PiFlow.git
```
