# PiFlow — Установка и использование

Оркестратор поверх OpenSpec + obra/Superpowers skills.  
Extension инжектирует нужные скиллы в нужной фазе — оригинальные файлы скиллов не трогаются.

---

## Команды

| Команда              | Что делает                                                      |
| -------------------- | --------------------------------------------------------------- |
| `/pf-feature [idea]` | Полный цикл: explore → propose (OpenSpec) → apply (Superpowers) |
| `/pf-quick [task]`   | Быстро без OpenSpec: brainstorm → plan → implement              |
| `/pf-explore [idea]` | Только исследование: grill-me + brainstorming                   |
| `/pf-debug [issue]`  | Дебаг: systematic-debugging + root-cause-tracing + TDD          |

OpenSpec команды (`/opsx-propose`, `/opsx-apply` и др.) остаются доступны как есть.

---

## Скиллы по фазам

| Фаза    | Скиллы                                                                                                                                                         |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| explore | `grill-me`, `brainstorming`                                                                                                                                    |
| propose | — (openspec управляет артефактами)                                                                                                                             |
| apply   | `writing-plans`, `subagent-driven-development`, `test-driven-development`, `verification-before-completion`, `finishing-a-development-branch`                  |
| quick   | `brainstorming`, `writing-plans`, `subagent-driven-development`, `test-driven-development`, `verification-before-completion`, `finishing-a-development-branch` |
| debug   | `systematic-debugging`, `test-driven-development`, `verification-before-completion`                                                                            |

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

### 2. Superpowers skills

```bash
# Открыть в браузере и следовать инструкции
open https://skills.sh/obra/superpowers
```

### 3. Инициализировать OpenSpec в вашем проекте

```bash
cd /path/to/your-project
openspec init --tools pi
```

### 4. Подключить piflow-схему и extension

```bash
git clone https://github.com/effgenij/PiFlow.git /tmp/piflow --depth 1

# Схема (ADR + superpowers apply instruction)
cp -r /tmp/piflow/openspec/schemas ./openspec/schemas

# Extension — оркестратор
cp -r /tmp/piflow/.pi/extensions ./.pi/extensions
```

### 5. Указать схему

```bash
echo "schema: piflow-spec" > openspec/config.yaml
```

### 6. Перезапустить pi

Перезапустите IDE или сессию pi — команды `/pf-*` появятся автоматически.

---

## Проверка

```bash
# Схема
cat openspec/config.yaml
# → schema: piflow-spec

# Extension на месте
ls .pi/extensions/
# → piflow.ts  tsconfig.json

# Команды в pi (после перезапуска)
# /pf-feature  /pf-quick  /pf-explore  /pf-debug
```

---

## Структура

```
your-project/
├── adr/                          ← ADR (вне openspec/, персистентны)
├── openspec/
│   ├── config.yaml               ← schema: piflow-spec
│   ├── schemas/
│   │   └── piflow-spec/          ← схема с ADR артефактом
│   └── changes/
│       └── <name>/
│           ├── proposal.md
│           ├── specs/
│           ├── design.md
│           ├── adr → ../../../adr/
│           └── tasks.md
└── .pi/
    ├── extensions/
    │   └── piflow.ts             ← оркестратор
    └── prompts/                  ← стандартные opsx-* (не трогаем)
```
