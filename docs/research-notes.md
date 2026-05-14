# PiFlow Research Notes

## Existing local systems inspected

### `ai-engineering-os-skills`

Current workflow:

```text
grill-feature → write-prd → to-vertical-slices → execute-task-tdd → review-diff → update-memory
```

Useful ideas to keep:

- skills as repeatable workflows;
- feature grilling before planning;
- PRD/ADR artifacts for durable decisions;
- vertical slices instead of layer-based task splits;
- TDD execution with validation gates;
- review before memory update/finish.

PiFlow changes:

- replace PRD-heavy default with lightweight spec folder;
- add smart router;
- add manual phase skills;
- add review-confirm default mode;
- make verification artifact mandatory per workflow.

### `brain-os-pi-v2`

Useful ideas to keep:

- project-local `.pi/` runtime;
- hooks/guardrails concept;
- generated startup context;
- cross-project patterns;
- gated memory capture;
- recommended packages: context-mode, plannotator, todo, ask-user-question, args.

PiFlow changes:

- do not build large DevMemory harness in v1;
- keep artifact state in `.pi-os/`;
- keep runtime state separate from durable spec state;
- focus on four core workflows: feature, debug, refactor, review.

## Pi package findings

Pi packages can bundle:

- `extensions/`;
- `skills/`;
- `prompts/`;
- `themes/`.

A package can declare resources through `package.json`:

```json
{
  "keywords": ["pi-package"],
  "pi": {
    "extensions": ["./extensions"],
    "skills": ["./skills"],
    "prompts": ["./prompts"],
    "themes": ["./themes"]
  }
}
```

Pi also auto-discovers conventional directories if no manifest is present.

## Installed packages to use

| Package                              | PiFlow use                                                      |
| ------------------------------------ | --------------------------------------------------------------- |
| `context-mode`                       | process large test/build/log output; searchable research memory |
| `@tintinweb/pi-subagents`            | role agents for research/planning/review/debug                  |
| `@juicesharp/rpiv-todo`              | live runtime task tracking                                      |
| `@juicesharp/rpiv-ask-user-question` | structured review/confirm gates                                 |
| `@juicesharp/rpiv-args`              | argument placeholders for manual skills                         |
| `@ff-labs/pi-fff`                    | fast search/navigation                                          |
| `@robhowley/pi-structured-return`    | compact validation command output                               |
| `pi-lens`                            | diagnostics, LSP, ast-grep, read-before-edit feedback           |
| `pi-gitnexus`                        | debug trace, impact analysis, PR/refactor review                |
| `graphify-pi`                        | durable knowledge graph when needed                             |
| `@plannotator/pi-extension`          | plan/code review annotation gates                               |
| `pi-web-access`                      | current docs/package research                                   |
| `pi-docparser`                       | parse local docs/spec inputs                                    |
| `@aliou/pi-guardrails`               | path and permission safety                                      |
| `pi-skill-palette`                   | discover/run PiFlow skills manually                             |

## Candidate packages from pi.dev/packages

| Package               | Why consider                                                                 |
| --------------------- | ---------------------------------------------------------------------------- |
| `@juicesharp/rpiv-pi` | similar research/design/plan/implement/validate ship-loop; compare before v2 |
| `pi-depo`             | declarative package manager for skills/extensions/hooks/MCP                  |
| `pi-lsp-lite`         | lightweight diagnostics alternative                                          |
| `@nqbao/pi-sandbox`   | OS-level sandbox for safer autonomous execution                              |
| `pi-obsidian`         | if specs should be mirrored into an Obsidian workflow                        |
| `pi-mcp-adapter`      | connect external MCP tools if PiFlow needs them later                        |

## Best-practice findings

From current writing on spec-driven/agentic development:

- Write specs that are clear enough to remove ambiguity but small enough to preserve attention.
- Plan first in read-only mode; execute only after plan review.
- Split large specs into smaller phase/component artifacts.
- Treat specs as executable artifacts tied to checks and tasks.
- Use named artifacts between workflow steps so agents do not drift.
- Human review should happen before implementation and at final verification.
- Use structured plan formats: files, changes, assumptions, verification.
- Tag assumptions explicitly so review is fast.
- Verification is a first-class loop, not a final paragraph.
- Start with a small harness and add complexity only when a bottleneck appears.

Sources searched included Pi docs/package catalog, Addy Osmani on AI-agent specs, and agentic engineering workflow guides discussing plan gates, verification loops, and named artifacts.
