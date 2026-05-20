/**
 * PiFlow — Command Definitions
 *
 * All /pf-* commands:
 *   /pf-new, /pf-full, /pf-quick, /pf-debug, /pf-refactor,
 *   /pf-status, /pf-explore, /pf-doctor, /pf-clean, /pf-feature (alias)
 *
 * All user-facing prompts are in RUSSIAN (existing convention).
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { PhaseState, PiflowMode, OpenspecPhase } from "./types.js";
import { classifyTask, parseFlowOverride } from "./routing.js";
import { runDoctor } from "./doctor.js";
import { createSubagentAdapter } from "./subagents/index.js";

function findPiflowSources(piListOutput: string): string[] {
	return piListOutput
		.split("\n")
		.filter((line) => {
			const trimmed = line.trim();
			if (!trimmed || !/piflow/i.test(trimmed)) return false;
			return !(line.startsWith("    ") || line.startsWith("\t"));
		})
		.map((line) => line.trim());
}

// ─── Skill sets per phase ────────────────────────────────────────────────────

const SKILLS: Record<string, string[]> = {
	explore: ["brainstorming", "grill-me"],
	propose: ["grill-me"],
	design: ["c4-diagrams"],
	adr: ["architectural-decision-records"],
	spec: ["gherkin-authoring"],
	apply: [
		"writing-plans",
		"subagent-driven-development",
		"test-driven-development",
		"requesting-code-review",
		"verification-before-completion",
		"finishing-a-development-branch",
		"using-git-worktrees",
	],
	apply_tdd: [
		"writing-plans",
		"test-driven-development",
		"requesting-code-review",
		"verification-before-completion",
		"finishing-a-development-branch",
		"using-git-worktrees",
	],
	quick: [
		"brainstorming",
		"writing-plans",
		"subagent-driven-development",
		"test-driven-development",
		"verification-before-completion",
		"finishing-a-development-branch",
	],
	debug: [
		"systematic-debugging",
		"test-driven-development",
		"verification-before-completion",
	],
	refactor: [
		"improve-codebase-architecture",
		"complexity-optimizer",
		"writing-plans",
		"subagent-driven-development",
		"test-driven-development",
		"verification-before-completion",
	],
};

// ─── Required skills check ───────────────────────────────────────────────────

const REQUIRED_SKILLS = [
	"grill-me",
	"brainstorming",
	"c4-diagrams",
	"gherkin-authoring",
	"architectural-decision-records",
	"openspec-git-discipline",
	"improve-codebase-architecture",
	"complexity-optimizer",
	"writing-plans",
	"subagent-driven-development",
	"test-driven-development",
	"systematic-debugging",
	"verification-before-completion",
	"finishing-a-development-branch",
	"requesting-code-review",
	"using-git-worktrees",
];

function findSkillsDir(): string {
	const candidates = [
		join(homedir(), ".agents", "skills"),
		join(homedir(), ".pi", "agent", "skills"),
	];
	for (const dir of candidates) {
		if (existsSync(dir)) return dir;
	}
	return candidates[0];
}

function getMissingSkills(): string[] {
	const skillsDir = findSkillsDir();
	return REQUIRED_SKILLS.filter(
		(s) => !existsSync(join(skillsDir, s, "SKILL.md")),
	);
}

// ─── OpenSpec helpers ─────────────────────────────────────────────────────────

async function getActiveChange(
	pi: ExtensionAPI,
): Promise<{ name: string } | null> {
	try {
		const result = await pi.exec("openspec", ["list", "--json"]);
		if (result.code !== 0) return null;
		const changes = JSON.parse(result.stdout);
		if (!Array.isArray(changes) || changes.length === 0) return null;
		return changes[0];
	} catch {
		return null;
	}
}

async function getOpenspecPhase(
	pi: ExtensionAPI,
	changeName: string,
): Promise<OpenspecPhase> {
	try {
		const result = await pi.exec("openspec", [
			"status",
			"--change",
			changeName,
			"--json",
		]);
		if (result.code !== 0) return "explore";
		const status = JSON.parse(result.stdout);

		const artifacts: Array<{ id: string; status: string }> =
			status.artifacts ?? [];
		const applyRequires: string[] = status.applyRequires ?? ["tasks"];

		if (
			applyRequires.every((id) =>
				artifacts.find((a) => a.id === id && a.status === "done"),
			)
		)
			return "apply";

		const pipeline: OpenspecPhase[] = ["propose", "spec", "design", "adr"];
		for (const phase of pipeline) {
			const artifact = artifacts.find(
				(a) => a.id === phase || (phase === "propose" && a.id === "proposal"),
			);
			if (!artifact || artifact.status !== "done") return phase;
		}

		return "explore";
	} catch {
		return "explore";
	}
}

async function getAllChanges(
	pi: ExtensionAPI,
): Promise<Array<{ name: string; phase: string }>> {
	try {
		const result = await pi.exec("openspec", ["list", "--json"]);
		if (result.code !== 0) return [];
		const changes = JSON.parse(result.stdout);
		if (!Array.isArray(changes)) return [];

		const enriched = [];
		for (const c of changes) {
			const phase = await getOpenspecPhase(pi, c.name);
			enriched.push({ name: c.name, phase });
		}
		return enriched;
	} catch {
		return [];
	}
}

// ─── System prompt injection helpers ─────────────────────────────────────────

export function buildSkillBlock(skills: string[], context: string): string {
	if (skills.length === 0) return "";
	return `

---
## PiFlow — активные скиллы (${context})

Перед любым действием проверь и прими следующие скиллы в указанном порядке:
${skills.map((s, i) => `${i + 1}. \`${s}\``).join("\n")}

Правило: если скилл применим хотя бы на 1% — прими его и следуй ему.
---`;
}

function buildStatusBlock(
	mode: PiflowMode,
	phase: OpenspecPhase | null,
	changeName: string | null,
	applyStrategy: "subagent" | "tdd" | null,
): string {
	const parts = ["\n## PiFlow — статус"];

	if (mode === "full" && changeName && phase) {
		parts.push(
			`- Режим: **full** (полный цикл через OpenSpec)`,
			`- Изменение: \`${changeName}\``,
			`- Фаза: **${phase}**`,
		);
	} else if (mode === "quick") {
		parts.push("- Режим: **quick** (быстрый путь к реализации)");
	} else if (mode === "explore") {
		parts.push("- Режим: **explore** (исследование требований)");
	} else if (mode === "debug") {
		parts.push("- Режим: **debug** (поиск первопричины)");
	} else if (mode === "refactor") {
		parts.push("- Режим: **refactor** (архитектурный анализ + оптимизация)");
	}

	if (applyStrategy) {
		parts.push(
			`- Стратегия apply: **${applyStrategy === "subagent" ? "subagent-driven-development" : "TDD (manual)"}**`,
		);
	}

	return parts.join("\n");
}

function buildApplyChoicePrompt(): string {
	return `

## PiFlow — выбор стратегии apply

Планы готовы к реализации. Выбери стратегию:

1. **subagent-driven-development** — автономное выполнение через субагенты с двухэтапным ревью. Быстрее, меньше ручного контроля.
2. **test-driven-development (manual)** — ручной RED-GREEN-REFACTOR с шагами. Больше контроля, медленнее.

Спроси пользователя какую стратегию предпочесть, если ещё не выбрал.
---`;
}

// ─── Hook handler ─────────────────────────────────────────────────────────────

export async function handleBeforeAgentStart(
	pi: ExtensionAPI,
	state: PhaseState,
	event: { systemPrompt: string },
): Promise<{ systemPrompt: string } | undefined> {
	if (state.mode === null) return undefined;

	let skills: string[] = [];
	let context = "";
	let phase: OpenspecPhase | null = null;
	let showApplyChoice = false;

	if (state.mode === "full") {
		const change = await getActiveChange(pi);
		if (change) {
			state.changeName = change.name;
			phase = await getOpenspecPhase(pi, change.name);
		} else {
			phase = "explore";
		}

		if (phase === "apply") {
			skills = state.applyStrategy === "tdd" ? SKILLS.apply_tdd : SKILLS.apply;
			if (!state.applyStrategy) showApplyChoice = true;
		} else {
			skills = SKILLS[phase] ?? SKILLS.explore;
		}
		context = `full / ${phase}`;
	} else if (state.mode === "quick") {
		skills = SKILLS.quick;
		context = "quick";
	} else if (state.mode === "explore") {
		skills = SKILLS.explore;
		context = "explore";
	} else if (state.mode === "debug") {
		skills = SKILLS.debug;
		context = "debug";
	} else if (state.mode === "refactor") {
		skills = SKILLS.refactor;
		context = "refactor";
	}

	const statusBlock = buildStatusBlock(
		state.mode,
		phase,
		state.changeName,
		state.applyStrategy,
	);
	const skillBlock = buildSkillBlock(skills, context);
	const applyChoiceBlock = showApplyChoice ? buildApplyChoicePrompt() : "";

	if (!statusBlock && !skillBlock && !applyChoiceBlock) return undefined;

	return {
		systemPrompt:
			event.systemPrompt + statusBlock + skillBlock + applyChoiceBlock,
	};
}

// ─── Register all commands ────────────────────────────────────────────────────

export function registerCommands(pi: ExtensionAPI, state: PhaseState): void {
	// ── /pf-new — маршрутизатор ─────────────────────────────────────────────
	pi.registerCommand("pf-new", {
		description:
			"Router: classifies task and delegates to appropriate pf-* command",
		handler: async (args, ctx) => {
			const rawTask = args.trim();
			if (!rawTask) {
				ctx.ui.notify(
					"PiFlow: опиши задачу после /pf-new, например: /pf-new add dark mode",
					"warning",
				);
				return;
			}

			// Check for --flow override
			const { cleanArgs, explicitMode } = parseFlowOverride(rawTask);
			const task = cleanArgs || rawTask;

			let mode: PiflowMode;
			let reasons: string[];

			if (explicitMode) {
				mode = explicitMode;
				reasons = [`Явный выбор: --flow ${explicitMode}`];
			} else {
				const result = classifyTask(task);
				mode = result.mode;
				reasons = result.reasons;
			}

			const labels: Record<string, string> = {
				full: "Full lifecycle (explore → propose → design → adr → apply)",
				quick: "Quick (brainstorm → plan → apply)",
				debug: "Debug (parallel root cause analysis → fix)",
				refactor: "Refactor (architecture + complexity analysis → apply)",
				explore: "Explore (requirements + design research)",
			};

			const reasonsText =
				reasons.length > 0 ? `\nПричина: ${reasons.join("; ")}` : "";

			const confirmed = await ctx.ui.select(
				`PiFlow: режим "${mode}" — ${labels[mode ?? "full"]}.${reasonsText}\nПодтвердить?`,
				[
					`Да, /pf-${mode}`,
					"/pf-full",
					"/pf-quick",
					"/pf-debug",
					"/pf-refactor",
					"/pf-explore",
				],
			);

			if (!confirmed) return;

			const targetMode = confirmed.startsWith("Да")
				? (mode ?? "full")
				: (confirmed.replace("/pf-", "") as PiflowMode);
			pi.sendUserMessage(`/pf-${targetMode} ${task}`);
		},
	});

	// ── /pf-full — полный lifecycle ─────────────────────────────────────────
	pi.registerCommand("pf-full", {
		description:
			"Full lifecycle: explore → propose → design → adr → apply → archive (OpenSpec + Superpowers)",
		handler: async (args, ctx) => {
			const missing = getMissingSkills();
			if (missing.length > 0) {
				ctx.ui.notify(
					`PiFlow: missing skills: ${missing.join(", ")}. Install to ~/.agents/skills/`,
					"warning",
				);
			}

			state.mode = "full";
			state.changeName = null;
			state.applyStrategy = null;

			const idea = args.trim();
			ctx.ui.notify("PiFlow: режим full активирован", "info");

			const prompt = idea ? `/opsx-explore ${idea}` : "/opsx-explore";
			pi.sendUserMessage(prompt);
		},
	});

	// ── /pf-quick — быстрый путь ────────────────────────────────────────────
	pi.registerCommand("pf-quick", {
		description:
			"Quick: brainstorm → plan → apply with Superpowers (ADR by recommendation)",
		handler: async (args, ctx) => {
			state.mode = "quick";
			state.changeName = null;
			state.applyStrategy = null;

			const task = args.trim();
			const adapter = createSubagentAdapter("none");
			ctx.ui.notify(
				`PiFlow: режим quick активирован\n${adapter.explain()}`,
				"info",
			);

			const prompt = task
				? `Нужно выполнить задачу: ${task}\n\nПрими скиллы brainstorming и writing-plans.\n\nПосле создания плана — спроси какую стратегию apply предпочесть:\n1. subagent-driven-development (автономно, быстрее)\n2. TDD manual (RED-GREEN-REFACTOR, больше контроля)\n\nЕсли это решение может затронуть другие проекты или повториться — спроси: "Это решение стоит зафиксировать как ADR? Рекомендую да, если затрагивает архитектуру или кросс-модульные изменения."`
				: "Опиши задачу которую нужно выполнить.";

			pi.sendUserMessage(prompt);
		},
	});

	// ── /pf-explore — исследование ───────────────────────────────────────────
	pi.registerCommand("pf-explore", {
		description: "Explore: grill-me requirements + brainstorming design",
		handler: async (args, ctx) => {
			state.mode = "explore";
			state.changeName = null;

			const idea = args.trim();
			ctx.ui.notify("PiFlow: режим explore активирован", "info");

			const prompt = idea ? `/opsx-explore ${idea}` : "/opsx-explore";
			pi.sendUserMessage(prompt);
		},
	});

	// ── /pf-debug — отладка ─────────────────────────────────────────────────
	pi.registerCommand("pf-debug", {
		description:
			"Debug: parallel systematic-debugging + diagnose → root cause → pf-quick apply",
		handler: async (args, ctx) => {
			state.mode = "debug";
			state.changeName = null;

			const issue = args.trim();
			ctx.ui.notify("PiFlow: режим debug активирован", "info");

			const prompt = issue
				? `Нужно отладить проблему: ${issue}\n\nЗапусти ДВА параллельных подхода:\n\n**Подход 1 — systematic-debugging (Superpowers):**\n4-фазный процесс: root-cause-tracing → defense-in-depth → condition-based-waiting → verification.\n\n**Подход 2 — diagnose (Matt Pocock style):**\nreproduce → minimise → hypothesise → instrument → fix → regression-test.\n\nОбъедини результаты обоих подходов:\n1. Сравни root cause гипотезы\n2. Если совпадают — высокая уверенность\n3. Если расходятся — представь обе и спроси\n4. После определения root cause — переходи к фиксу через pf-quick\n\nПрими скилл systematic-debugging и следуй ему.`
				: "Опиши проблему которую нужно отладить.";

			pi.sendUserMessage(prompt);
		},
	});

	// ── /pf-refactor — рефакторинг ──────────────────────────────────────────
	pi.registerCommand("pf-refactor", {
		description:
			"Refactor: parallel architecture analysis + complexity optimization → unified plan → apply",
		handler: async (args, ctx) => {
			state.mode = "refactor";
			state.changeName = null;
			state.applyStrategy = null;

			const scope = args.trim();
			const adapter = createSubagentAdapter("none");
			ctx.ui.notify(
				`PiFlow: режим refactor активирован\n${adapter.explain()}`,
				"info",
			);

			const scopeText = scope
				? `Область рефакторинга: ${scope}`
				: "Область рефакторинга: весь проект (укажи конкретные зоны после анализа)";

			const prompt = `${scopeText}\n\nЗапусти ПАРАЛЛЕЛЬНЫЙ анализ:\n\n**Анализ 1 — improve-codebase-architecture:**\nНайди возможности углубления архитектуры. Проверь доменный язык, связи между модулями, границы ответственности. Стратегический уровень.\n\n**Анализ 2 — complexity-optimizer:**\nПроанализируй сложность конкретных модулей. Найди горячие точки (O(n²), вложенные циклы, N+1 queries). Тактический уровень.\n\nОбъедини результаты:\n1. Стратегические улучшения архитектуры\n2. Тактические точки оптимизации сложности\n3. Единый план с приоритетами\n\nПосле плана — спроси стратегию apply:\n1. subagent-driven-development (автономно)\n2. TDD manual (RED-GREEN-REFACTOR)\n\nПрими скиллы improve-codebase-architecture и complexity-optimizer.`;

			pi.sendUserMessage(prompt);
		},
	});

	// ── /pf-status — статус ─────────────────────────────────────────────────
	pi.registerCommand("pf-status", {
		description: "Show active OpenSpec changes, worktrees, phases, and ADRs",
		handler: async (_args, ctx) => {
			const lines: string[] = ["PiFlow Status", "══════════════"];

			if (state.mode) {
				lines.push(`\nActive mode: ${state.mode}`);
				if (state.changeName) lines.push(`Active change: ${state.changeName}`);
				if (state.applyStrategy)
					lines.push(`Apply strategy: ${state.applyStrategy}`);
			} else {
				lines.push("\nNo active PiFlow mode");
			}

			const changes = await getAllChanges(pi);
			if (changes.length > 0) {
				lines.push(`\nOpenSpec changes (${changes.length}):`);
				for (const c of changes) {
					lines.push(`  • ${c.name} — phase: ${c.phase}`);
				}
			} else {
				lines.push("\nNo active OpenSpec changes");
			}

			try {
				const wtResult = await pi.exec("git", [
					"worktree",
					"list",
					"--porcelain",
				]);
				if (wtResult.code === 0 && wtResult.stdout.trim()) {
					const worktrees = wtResult.stdout
						.trim()
						.split("\n\n")
						.filter(Boolean);
					if (worktrees.length > 1) {
						lines.push(`\nWorktrees (${worktrees.length}):`);
						for (const wt of worktrees) {
							const path = wt
								.split("\n")
								.find((l) => l.startsWith("worktree "))
								?.replace("worktree ", "");
							const branch = wt
								.split("\n")
								.find((l) => l.startsWith("branch "))
								?.replace("branch ", "")
								?.replace("refs/heads/", "");
							if (path) lines.push(`  • ${branch || "detached"} — ${path}`);
						}
					}
				}
			} catch {
				// git not available
			}

			try {
				const adrResult = await pi.exec("ls", ["-1", "adr/"]);
				if (adrResult.code === 0 && adrResult.stdout.trim()) {
					const adrFiles = adrResult.stdout.trim().split("\n");
					lines.push(`\nADRs (${adrFiles.length}):`);
					for (const f of adrFiles.slice(0, 10)) {
						lines.push(`  • ${f}`);
					}
					if (adrFiles.length > 10) {
						lines.push(`  ... and ${adrFiles.length - 10} more`);
					}
				}
			} catch {
				// no adr dir
			}

			ctx.ui.notify(lines.join("\n"), "info");
		},
	});

	// ── /pf-doctor — диагностика ────────────────────────────────────────────
	pi.registerCommand("pf-doctor", {
		description:
			"Diagnose missing skills, duplicate installs, and optional packages",
		handler: async (_args, ctx) => {
			const report = await runDoctor(pi);
			ctx.ui.notify(report, "info");
		},
	});

	// ── /pf-clean — очистка (dry-run plus explicit confirmation) ───────────
	pi.registerCommand("pf-clean", {
		description:
			"Dry-run cleanup for old PiFlow resources and duplicate installs",
		handler: async (args, ctx) => {
			const confirmCleanup = /(^|\s)--confirm(\s|$)/.test(args);
			const lines: string[] = [
				"PiFlow Clean (dry-run)",
				"═══════════════════════",
				"",
				"Анализ ресурсов для очистки...",
				"",
			];

			// Check for duplicate PiFlow sources
			try {
				const result = await pi.exec("pi", ["list"]);
				if (result.code === 0 && result.stdout) {
					const piflowSources = findPiflowSources(result.stdout);
					if (piflowSources.length > 1) {
						lines.push("## Дубликаты PiFlow");
						for (const source of piflowSources) {
							lines.push(`  [CLEAN] ${source}`);
						}
						lines.push("  Совет: pi remove <источник> для удаления дубликата");
						lines.push("");
					}
				}
			} catch {
				// pi not available
			}

			// Check for old skill directories
			const oldSkills = [
				"openspec-apply-change",
				"openspec-archive-change",
				"openspec-explore",
				"openspec-propose",
				"pf-debug",
				"pf-full",
				"pf-new",
				"pf-quick",
				"pf-refactor",
				"pf-status",
			];

			const skillsDir = findSkillsDir();
			const foundOld: string[] = [];
			for (const s of oldSkills) {
				if (existsSync(join(skillsDir, s))) {
					foundOld.push(s);
				}
			}

			if (foundOld.length > 0) {
				lines.push("## Старые скиллы PiFlow (в ~/.agents/skills/)");
				for (const s of foundOld) {
					lines.push(`  [CLEAN] ${s}/`);
				}
				lines.push(
					"  Примечание: не удаляет upstream скиллы — только старые PiFlow",
				);
				lines.push("");
			}

			const cleanupItems = lines.filter((l) => l.includes("[CLEAN]"));
			if (cleanupItems.length === 0) {
				lines.push("Очистка не требуется — всё чисто.");
			} else if (!confirmCleanup) {
				lines.push(
					"---",
					"Это dry-run. Ничего не удалено.",
					"Для реальной очистки используй: /pf-clean --confirm",
					"PiFlow никогда не удаляет upstream skills или пользовательские overlays автоматически.",
				);
			} else {
				const confirmed = await ctx.ui.confirm(
					"PiFlow Clean",
					`Удалить/отключить перечисленные ресурсы?\n\n${cleanupItems.join("\n")}\n\nUpstream skills и пользовательские overlays не трогаются.`,
				);
				lines.push(
					"---",
					confirmed
						? "Подтверждение получено. Автоматическое удаление пока не реализовано в v1; выполни показанные команды вручную."
						: "Очистка отменена пользователем. Ничего не удалено.",
				);
			}

			ctx.ui.notify(lines.join("\n"), "info");
		},
	});

	// ── Legacy alias: /pf-feature → /pf-full ────────────────────────────────
	pi.registerCommand("pf-feature", {
		description: "Alias for /pf-full (full feature lifecycle)",
		handler: async (args, _ctx) => {
			pi.sendUserMessage(`/pf-full ${args}`);
		},
	});
}
