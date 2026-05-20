# PiFlow v2 — Установка и использование

PiFlow — pi package. Оркестратор поверх OpenSpec + Superpowers + специализированных навыков.

---

## Установка

### 1. Установить piflow

```bash
pi install git:github.com/effgenij/piflow
```

Или с привязкой к версии:

```bash
pi install git:github.com/effgenij/piflow@v2.0.0
```

Обновление:

```bash
pi update --extension git:github.com/effgenij/piflow
```

### 2. Установить pi-пакеты (один раз)

```bash
# Утилиты
pi install npm:@ff-labs/pi-fff                 # FFF — Flensburg Frontend Framework
pi install npm:@robhowley/pi-structured-return  # structured_return tool
pi install npm:pi-skill-palette                  # Skill palette UI
pi install npm:pi-terminal-theme                 # Terminal theme
pi install npm:pi-powerline-footer                # Powerline footer
pi install npm:pi-simplify                        # Code simplification

# AI & Code Intelligence
pi install npm:@tintinweb/pi-subagents            # Subagent orchestration
pi install npm:pi-lens                             # AST-grep + LSP navigation
pi install npm:graphify-pi                         # Knowledge graphs from code
pi install npm:pi-docparser                        # Document parsing (PDF, DOCX, etc.)
pi install npm:pi-web-access                       # Web research & librarian skill
pi install npm:pi-init                             # AGENTS.md generator
pi install npm:pi-kilocode                         # Kilocode integration

# Planning & Review
pi install npm:context-mode                        # Context window optimization

# Superpowers (brainstorming, TDD, debugging, worktrees, etc.)

# Ask user question dialog
pi install npm:@juicesharp/rpiv-ask-user-question  # Structured user questions
pi install npm:@juicesharp/rpiv-todo               # Todo task tracking
pi install npm:@juicesharp/rpiv-args               # Args parsing
```

### 4. Установить глобальные навыки (один раз)

Все навыки ставятся через `npx skills add`:

```bash
# Superpowers (14 навыков: brainstorming, TDD, debugging, worktrees и т.д.)
npx skills add obra/superpowers

# Matt Pocock
npx skills add https://github.com/mattpocock/skills --skill grill-me
npx skills add https://github.com/mattpocock/skills --skill improve-codebase-architecture

# Intent-Driven Template
npx skills add https://github.com/intent-driven-dev/intent-driven-template --skill c4-diagrams
npx skills add https://github.com/intent-driven-dev/intent-driven-template --skill architectural-decision-records
npx skills add https://github.com/intent-driven-dev/intent-driven-template --skill openspec-git-discipline

# Complexity Optimizer
npx skills add https://github.com/kappaemme-git/codex-complexity-optimizer --skill complexity-optimizer

# Gherkin Authoring (нет на skills.sh — вручную)
git clone --depth 1 https://github.com/intent-driven-dev/intent-driven-template /tmp/idt
mkdir -p ~/.agents/skills
cp -r /tmp/idt/.agents/skills/gherkin-authoring ~/.agents/skills/
rm -rf /tmp/idt
```

### 5. Настроить проект (per-project)

```bash
cd /path/to/your-project
openspec init --tools pi

# Скопировать piflow-схему
pi install git:github.com/effgenij/piflow   # если ещё не установлен
cp -r $(pi list --path git:github.com/effgenij/piflow)/openspec-schema/piflow-spec openspec/schemas/

echo "schema: piflow-spec" > openspec/config.yaml
```

### 6. Перезапустить pi

Команды `/pf-*` появятся автоматически.

---

## Команды

| Команда                | Что делает                                                                        |
| ---------------------- | --------------------------------------------------------------------------------- |
| `/pf-new [task]`       | Маршрутизатор: классифицирует задачу → делегирует на нужный `/pf-*`               |
| `/pf-full [idea]`      | Полный цикл: explore → propose → design → adr → spec → apply → archive (OpenSpec) |
| `/pf-quick [task]`     | Быстро: brainstorm → plan → apply (ADR по рекомендации)                           |
| `/pf-explore [idea]`   | Только исследование: grill-me + brainstorming                                     |
| `/pf-debug [issue]`    | Дебаг: 2 параллельных подхода → root cause → fix через pf-quick                   |
| `/pf-refactor [scope]` | Рефакторинг: архитектура + сложность → единый план → apply                        |
| `/pf-status`           | Статус: активные changes, worktrees, фазы, ADR-ы                                  |

### Маршрутизация `/pf-new`

| Ключевые слова                    | Режим          |
| --------------------------------- | -------------- |
| bug, fix, error, crash, exception | `/pf-debug`    |
| refactor, cleanup, simplify       | `/pf-refactor` |
| explore, investigate, how does    | `/pf-explore`  |
| короткое описание (≤15 слов)      | `/pf-quick`    |
| всё остальное                     | `/pf-full`     |

---

## Скиллы по фазам

### Full lifecycle (pf-full)

| Фаза    | Скиллы                                                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| explore | `brainstorming`, `grill-me`                                                                                                                                                                       |
| propose | `grill-me`                                                                                                                                                                                        |
| design  | `c4-diagrams`                                                                                                                                                                                     |
| adr     | `architectural-decision-records`                                                                                                                                                                  |
| spec    | `gherkin-authoring`                                                                                                                                                                               |
| apply   | `writing-plans`, `subagent-driven-development` или `test-driven-development`, `requesting-code-review`, `verification-before-completion`, `finishing-a-development-branch`, `using-git-worktrees` |

### Быстрые режимы

| Режим    | Скиллы                                                                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| quick    | `brainstorming`, `writing-plans`, `subagent-driven-development`, `test-driven-development`, `verification-before-completion`, `finishing-a-development-branch`       |
| debug    | `systematic-debugging`, `test-driven-development`, `verification-before-completion`                                                                                  |
| refactor | `improve-codebase-architecture`, `complexity-optimizer`, `writing-plans`, `subagent-driven-development`, `test-driven-development`, `verification-before-completion` |

### Выбор стратегии apply

На этапе apply пользователь выбирает:

1. **subagent-driven-development** — автономное выполнение через субагенты с двухэтапным ревью
2. **TDD manual** — ручной RED-GREEN-REFACTOR, шаг за шагом

---

## Структура проекта после установки

```
your-project/
├── adr/                          ← ADR (вне openspec/, персистентны)
├── openspec/
│   ├── config.yaml               ← schema: piflow-spec
│   ├── schemas/piflow-spec/      ← скопирована из пакета
│   └── changes/
│       └── <name>/
│           ├── proposal.md
│           ├── specs/
│           ├── design.md
│           ├── adr → ../../../adr/
│           └── tasks.md
└── .pi/
    └── settings.json             ← piflow в packages[]
```
