/**
 * PiFlow Extension
 *
 * Orchestrates OpenSpec + Superpowers skills workflow.
 * Registers /pf-* commands and injects relevant skills
 * into the system prompt based on current phase.
 *
 * Commands:
 *   /pf-feature [idea]  — full cycle: explore → propose (openspec) → apply (superpowers)
 *   /pf-quick [task]    — quick cycle without openspec: brainstorm → plan → implement
 *   /pf-explore [idea]  — exploration + requirements only (grill-me + brainstorming)
 *   /pf-debug [issue]   — debug session (systematic-debugging + TDD + root-cause)
 *
 * Skills are NEVER overridden — only injected as named references into the
 * system prompt so the agent knows which ones to invoke. Original skill files
 * remain untouched and auto-update when superpowers updates.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// ─── Phase state ─────────────────────────────────────────────────────────────

type PiflowMode = "feature" | "quick" | "explore" | "debug" | null;

interface PhaseState {
	mode: PiflowMode;
	changeName: string | null;
}

// ─── Skill sets per phase ────────────────────────────────────────────────────

const SKILLS = {
	explore: ["grill-me", "brainstorming"],

	propose: [] as string[], // openspec ff handles artifact creation itself

	apply: [
		"writing-plans",
		"subagent-driven-development",
		"test-driven-development",
		"verification-before-completion",
		"finishing-a-development-branch",
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
};

// ─── OpenSpec helpers ─────────────────────────────────────────────────────────

async function getActiveChange(
	pi: ExtensionAPI,
): Promise<{ name: string } | null> {
	try {
		const result = await pi.exec("openspec", ["list", "--json"]);
		if (result.code !== 0) return null;
		const changes = JSON.parse(result.stdout);
		if (!Array.isArray(changes) || changes.length === 0) return null;
		// Most recently modified first
		return changes[0];
	} catch {
		return null;
	}
}

type OpenspecPhase = "explore" | "propose" | "apply";

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

		// All applyRequires artifacts are done → apply phase
		const allDone = applyRequires.every((id: string) =>
			artifacts.find((a) => a.id === id && a.status === "done"),
		);
		if (allDone) return "apply";

		// Proposal not started → explore phase
		const proposal = artifacts.find((a) => a.id === "proposal");
		if (!proposal || proposal.status !== "done") return "explore";

		// Otherwise in the middle of artifact generation → propose
		return "propose";
	} catch {
		return "explore";
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
): string {
	if (mode === "feature" && changeName && phase) {
		return `

## PiFlow — статус
- Режим: **feature** (полный цикл через OpenSpec)
- Изменение: \`${changeName}\`
- Фаза: **${phase}**`;
	}
	if (mode === "quick") {
		return `\n## PiFlow — режим: **quick** (без OpenSpec, прямо к реализации)`;
	}
	if (mode === "explore") {
		return `\n## PiFlow — режим: **explore** (исследование требований)`;
	}
	if (mode === "debug") {
		return `\n## PiFlow — режим: **debug** (поиск первопричины)`;
	}
	return "";
}

// ─── Extension entry point ────────────────────────────────────────────────────

export default function piflowExtension(pi: ExtensionAPI) {
	const state: PhaseState = { mode: null, changeName: null };

	// ── /pf-feature ─────────────────────────────────────────────────────────────
	pi.registerCommand("pf-feature", {
		description:
			"Full feature cycle: explore → propose (OpenSpec) → apply (Superpowers)",
		handler: async (args, ctx) => {
			state.mode = "feature";
			state.changeName = null; // will be detected from openspec list

			const idea = args.trim();
			ctx.ui.notify("PiFlow: режим feature активирован", "info");

			const prompt = idea ? `/opsx-explore ${idea}` : "/opsx-explore";

			pi.sendUserMessage(prompt);
		},
	});

	// ── /pf-quick ────────────────────────────────────────────────────────────────
	pi.registerCommand("pf-quick", {
		description:
			"Quick task without OpenSpec: brainstorm → plan → implement with Superpowers",
		handler: async (args, ctx) => {
			state.mode = "quick";
			state.changeName = null;

			const task = args.trim();
			ctx.ui.notify("PiFlow: режим quick активирован", "info");

			const prompt = task
				? `Нужно выполнить задачу: ${task}\n\nПрими скиллы brainstorming и writing-plans, затем реализуй через subagent-driven-development.`
				: "Опиши задачу которую нужно выполнить.";

			pi.sendUserMessage(prompt);
		},
	});

	// ── /pf-explore ──────────────────────────────────────────────────────────────
	pi.registerCommand("pf-explore", {
		description: "Explore idea: grill-me requirements + brainstorming design",
		handler: async (args, ctx) => {
			state.mode = "explore";
			state.changeName = null;

			const idea = args.trim();
			ctx.ui.notify("PiFlow: режим explore активирован", "info");

			const prompt = idea ? `/opsx-explore ${idea}` : "/opsx-explore";

			pi.sendUserMessage(prompt);
		},
	});

	// ── /pf-debug ────────────────────────────────────────────────────────────────
	pi.registerCommand("pf-debug", {
		description:
			"Debug session: systematic-debugging + root-cause-tracing + TDD",
		handler: async (args, ctx) => {
			state.mode = "debug";
			state.changeName = null;

			const issue = args.trim();
			ctx.ui.notify("PiFlow: режим debug активирован", "info");

			const prompt = issue
				? `Нужно отладить следующую проблему: ${issue}\n\nПрими скилл systematic-debugging и следуй ему.`
				: "Опиши проблему которую нужно отладить.";

			pi.sendUserMessage(prompt);
		},
	});

	// ── before_agent_start — inject skills based on current phase ────────────────
	pi.on("before_agent_start", async (event) => {
		if (state.mode === null) return undefined;

		let skills: string[] = [];
		let context = "";
		let phase: OpenspecPhase | null = null;

		if (state.mode === "feature") {
			// Detect active change and phase from openspec
			const change = await getActiveChange(pi);
			if (change) {
				state.changeName = change.name;
				phase = await getOpenspecPhase(pi, change.name);
			} else {
				phase = "explore";
			}

			skills = SKILLS[phase];
			context = `feature / ${phase}`;
		} else if (state.mode === "quick") {
			skills = SKILLS.quick;
			context = "quick";
		} else if (state.mode === "explore") {
			skills = SKILLS.explore;
			context = "explore";
		} else if (state.mode === "debug") {
			skills = SKILLS.debug;
			context = "debug";
		}

		const statusBlock = buildStatusBlock(state.mode, phase, state.changeName);
		const skillBlock = buildSkillBlock(skills, context);

		if (!statusBlock && !skillBlock) return undefined;

		return {
			systemPrompt: event.systemPrompt + statusBlock + skillBlock,
		};
	});
}
