/**
 * PiFlow Extension v2
 *
 * Orchestrates OpenSpec + Superpowers + specialised skills workflow.
 * Registers /pf-* commands and injects relevant skills
 * into the system prompt based on current phase.
 *
 * Commands:
 *   /pf-new [task]      — router: classifies task → delegates to pf-*
 *   /pf-full [idea]     — full cycle: explore → propose → design → adr → apply → archive
 *   /pf-quick [task]    — quick cycle: brainstorm → plan → apply (ADR by recommendation)
 *   /pf-debug [issue]   — debug: 2 parallel subagents → root cause → pf-quick apply
 *   /pf-refactor [scope]— refactor: parallel architecture + complexity analysis → apply
 *   /pf-status          — show active changes, worktrees, phases
 *
 * Skills are NEVER overridden — only injected as named references into the
 * system prompt so the agent knows which ones to invoke. Original skill files
 * remain untouched and auto-update when superpowers updates.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

// ─── Types ───────────────────────────────────────────────────────────────────

type PiflowMode = "full" | "quick" | "explore" | "debug" | "refactor" | null;
type OpenspecPhase =
	| "explore"
	| "propose"
	| "design"
	| "adr"
	| "spec"
	| "apply";

interface PhaseState {
	mode: PiflowMode;
	changeName: string | null;
	applyStrategy: "subagent" | "tdd" | null;
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

// ─── Task classifier ─────────────────────────────────────────────────────────

const DEBUG_PATTERNS =
	/\b(bug|fix|error|crash|exception|fault|fail|broken|debug|traceback|stack\s*trace|issue)\b/i;
const REFACTOR_PATTERNS =
	/\b(refactor|cleanup|clean\s*up|simplify|architecture|complexity|tech\s*debt|restructure|reorganize)\b/i;
const EXPLORE_PATTERNS =
	/\b(explore|investigate|research|understand|how\s*does|why\s*does|explain)\b/i;

function classifyTask(task: string): PiflowMode {
	if (!task) return "full";
	if (DEBUG_PATTERNS.test(task)) return "debug";
	if (REFACTOR_PATTERNS.test(task)) return "refactor";
	if (EXPLORE_PATTERNS.test(task)) return "explore";

	// Short description → quick
	const wordCount = task.trim().split(/\s+/).length;
	if (wordCount <= 15) return "quick";

	return "full";
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

		// All applyRequires done → apply
		if (
			applyRequires.every((id) =>
				artifacts.find((a) => a.id === id && a.status === "done"),
			)
		)
			return "apply";

		// Check artifact pipeline in order
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

// ─── System prompt injection ──────────────────────────────────────────────────

function buildSkillBlock(skills: string[], context: string): string {
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

// ─── Apply strategy prompt ───────────────────────────────────────────────────

function buildApplyChoicePrompt(): string {
	return `

## PiFlow — выбор стратегии apply

Планы готовы к реализации. Выбери стратегию:

1. **subagent-driven-development** — автономное выполнение через субагенты с двухэтапным ревью. Быстрее, меньше ручного контроля.
2. **test-driven-development (manual)** — ручной RED-GREEN-REFACTOR с шагами. Больше контроля, медленнее.

Спроси пользователя какую стратегию предпочесть, если ещё не выбрал.
---`;
}

// ─── Extension entry point ────────────────────────────────────────────────────

export default function piflowExtension(pi: ExtensionAPI) {
	const state: PhaseState = {
		mode: null,
		changeName: null,
		applyStrategy: null,
	};

	// ── /pf-new — маршрутизатор ─────────────────────────────────────────────
	pi.registerCommand("pf-new", {
		description:
			"Router: classifies task and delegates to appropriate pf-* command",
		handler: async (args, ctx) => {
			const task = args.trim();
			if (!task) {
				ctx.ui.notify(
					"PiFlow: опиши задачу после /pf-new, например: /pf-new add dark mode",
					"warning",
				);
				return;
			}

			const mode = classifyTask(task);
			const labels: Record<string, string> = {
				full: "Full lifecycle (explore → propose → design → adr → apply)",
				quick: "Quick (brainstorm → plan → apply)",
				debug: "Debug (parallel root cause analysis → fix)",
				refactor: "Refactor (architecture + complexity analysis → apply)",
				explore: "Explore (requirements + design research)",
			};

			const confirmed = await ctx.ui.select(
				`PiFlow: determined mode "${mode}" — ${labels[mode ?? "full"]}. Confirm?`,
				[
					`Yes, /pf-${mode}`,
					"/pf-full",
					"/pf-quick",
					"/pf-debug",
					"/pf-refactor",
					"/pf-explore",
				],
			);

			if (!confirmed) return;

			const targetMode = confirmed.startsWith("Yes")
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
			// Dependency check
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
			ctx.ui.notify("PiFlow: режим quick активирован", "info");

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
			ctx.ui.notify("PiFlow: режим refactor активирован", "info");

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

			// Current mode
			if (state.mode) {
				lines.push(`\nActive mode: ${state.mode}`);
				if (state.changeName) lines.push(`Active change: ${state.changeName}`);
				if (state.applyStrategy)
					lines.push(`Apply strategy: ${state.applyStrategy}`);
			} else {
				lines.push("\nNo active PiFlow mode");
			}

			// OpenSpec changes
			const changes = await getAllChanges(pi);
			if (changes.length > 0) {
				lines.push(`\nOpenSpec changes (${changes.length}):`);
				for (const c of changes) {
					lines.push(`  • ${c.name} — phase: ${c.phase}`);
				}
			} else {
				lines.push("\nNo active OpenSpec changes");
			}

			// Worktrees
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

			// ADRs
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

	// ── Legacy alias: /pf-feature → /pf-full ────────────────────────────────
	pi.registerCommand("pf-feature", {
		description: "Alias for /pf-full (full feature lifecycle)",
		handler: async (_args, _ctx) => {
			pi.sendUserMessage(`/pf-full ${_args}`);
		},
	});

	// ── before_agent_start — inject skills based on current phase ────────────
	pi.on("before_agent_start", async (event) => {
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

			// Pick skill set for current phase
			if (phase === "apply") {
				skills =
					state.applyStrategy === "tdd" ? SKILLS.apply_tdd : SKILLS.apply;
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
	});
}
