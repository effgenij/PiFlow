# PiFlow — Установка и использование

Кастомный OpenSpec-воркфлоу: **grill-me → brainstorm → propose → implement → archive** с интеграцией `@teelicht/pi-superagents`.

---

## Что вы получите

| Команда | Что делает |
|---|---|
| `/opsx-explore` | Grill-me по требованиям → `/sp-brainstorm` для дизайна |
| `/opsx-propose` | Генерирует proposal → specs → design → ADR → tasks |
| `/opsx-apply` | Делегирует реализацию в `/sp-implement` (Recon → TDD → Review) |
| `/opsx-archive` | Архивирует изменение после merge |

---

## Требования

```bash
node --version   # >= 18
pi --version     # любая версия pi
```

---

## Установка

### 1. OpenSpec CLI

```bash
npm install -g @fission-ai/openspec
```

### 2. Superpowers для pi

```bash
# Extension с агентами (sp-implement, sp-brainstorm и др.)
pi install npm:@teelicht/pi-superagents

# Skills (peer dependency) — открыть ссылку и следовать инструкции
open https://skills.sh/obra/superpowers
```

### 3. Инициализировать OpenSpec в вашем проекте

```bash
cd /path/to/your-project

# Создаёт openspec/ и .pi/ с командами
openspec init --tools pi
```

### 4. Подключить piflow-схему

```bash
# Скопировать схему из этого репо в ваш проект
git clone https://github.com/effgenij/PiFlow.git /tmp/piflow --depth 1

cp -r /tmp/piflow/openspec/schemas your-project/openspec/schemas
cp /tmp/piflow/.pi/prompts/opsx-explore.md your-project/.pi/prompts/opsx-explore.md
cp /tmp/piflow/.pi/prompts/opsx-apply.md   your-project/.pi/prompts/opsx-apply.md
```

> Если вы уже находитесь внутри вашего проекта:
> ```bash
> git clone https://github.com/effgenij/PiFlow.git /tmp/piflow --depth 1
> cp -r /tmp/piflow/openspec/schemas ./openspec/schemas
> cp /tmp/piflow/.pi/prompts/opsx-explore.md ./.pi/prompts/opsx-explore.md
> cp /tmp/piflow/.pi/prompts/opsx-apply.md   ./.pi/prompts/opsx-apply.md
> ```

### 5. Указать схему

```bash
# В корне вашего проекта
echo "schema: piflow-spec" > openspec/config.yaml
```

### 6. Перезапустить pi

Перезапустите IDE или сессию pi — slash-команды подхватятся автоматически.

---

## Проверка установки

```bash
# Должен показать список изменений (пустой в новом проекте)
openspec list

# Должен показать текущую схему
cat openspec/config.yaml
# → schema: piflow-spec

# Убедиться что команды на месте
ls .pi/prompts/
# → opsx-apply.md  opsx-archive.md  opsx-explore.md  opsx-propose.md
```

---

## Использование

### Новая фича — начните с explore

```
/opsx-explore "ваша идея"
```

Агент проведёт вас через:
1. **Grill-me** — докопается до реальных требований
2. **`/sp-brainstorm`** — структурирует дизайн с вариантами
3. Предложит создать proposal

---

### Создать proposal

```
/opsx-propose "добавить авторизацию через OAuth"
```

Создаёт в `openspec/changes/<name>/`:
```
proposal.md   — зачем
specs/        — что должна делать система
design.md     — как реализовать
tasks.md      — чеклист
```
И в `adr/` (в корне проекта, не внутри openspec/):
```
adr/0001-<decision>.md   — архитектурные решения
```

---

### Реализовать

```
/opsx-apply
```

Передаёт в `/sp-implement` полный brief. Запускается:
- **Recon** — анализ кодовой базы
- **Research** — исследование сложных мест
- **Implementation** — код с TDD
- **Code Review** — проверка стандартов
- **Debug** — если появились регрессии
- Ветка финализируется автоматически

---

### Архивировать после merge

```
/opsx-archive
```

---

## Структура после первого использования

```
your-project/
├── adr/                              ← ADR (вне openspec/, персистентны)
│   └── 0001-use-postgres.md
├── openspec/
│   ├── config.yaml                   ← schema: piflow-spec
│   ├── schemas/
│   │   └── piflow-spec/              ← кастомная схема из piflow
│   ├── changes/
│   │   └── add-oauth/                ← активное изменение
│   │       ├── proposal.md
│   │       ├── specs/
│   │       ├── design.md
│   │       └── tasks.md
│   └── specs/                        ← итоговые спеки (после archive)
└── .pi/
    ├── prompts/
    │   ├── opsx-explore.md           ← grill-me + sp-brainstorm
    │   ├── opsx-propose.md
    │   ├── opsx-apply.md             ← sp-implement
    │   └── opsx-archive.md
    └── skills/
        └── openspec-*/
```
