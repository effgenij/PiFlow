/**
 * PiFlow — Doctor (/pf-doctor)
 *
 * Diagnoses:
 * - PiFlow package sources (local, git, npm)
 * - Missing upstream skills
 * - Duplicate PiFlow installs
 * - Optional packages
 * - Duplicate skills by name
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync } from "node:fs";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { detectSubagentBackends } from "./subagents/index.js";

// ─── Upstream skill requirements ─────────────────────────────────────────────

const REQUIRED_UPSTREAM = [
	"brainstorming",
	"writing-plans",
	"systematic-debugging",
	"test-driven-development",
	"verification-before-completion",
	"requesting-code-review",
	"receiving-code-review",
	"using-git-worktrees",
	"dispatching-parallel-agents",
	"subagent-driven-development",
];

const MATT_POCOCK_SKILLS = ["grill-me"];

const FRONTEND_SKILLS = [
	"frontend-design",
	"vercel-react-best-practices",
	"web-design-guidelines",
	"vercel-composition-patterns",
];

const OPTIONAL_PACKAGES = [
	"context-mode",
	"pi-web-access",
	"pi-lens",
	"pi-docparser",
	"graphify-pi",
	"@juicesharp/rpiv-todo",
	"@juicesharp/rpiv-ask-user-question",
	"@robhowley/pi-structured-return",
	"pi-simplify",
	"@tintinweb/pi-subagents",
	"pi-subagents",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findSkillsDirs(): string[] {
	const candidates = [
		join(homedir(), ".agents", "skills"),
		join(homedir(), ".pi", "agent", "skills"),
	];
	return candidates.filter((d) => existsSync(d));
}

function getMissingSkills(skillsDirs: string[], required: string[]): string[] {
	return required.filter((s) =>
		skillsDirs.every((d) => !existsSync(join(d, s, "SKILL.md"))),
	);
}

function getSkillName(skillMdPath: string): string | null {
	try {
		const content = readFileSync(skillMdPath, "utf-8");
		const match = content.match(/^---\n[\s\S]*?name:\s*(.+)\n/);
		return match ? match[1].trim() : null;
	} catch {
		return null;
	}
}

function findPiflowSources(piListOutput: string): string[] {
	const lines = piListOutput.split("\n");
	const sources: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || !/piflow/i.test(trimmed)) continue;

		const isPathDetail = line.startsWith("    ") || line.startsWith("\t");
		if (isPathDetail) continue;

		sources.push(trimmed);
	}

	return sources;
}

function findDuplicateSkills(skillsDirs: string[]): Map<string, string[]> {
	const nameToPaths = new Map<string, string[]>();

	for (const dir of skillsDirs) {
		try {
			const entries = readdirSync(dir, { withFileTypes: true });
			for (const entry of entries) {
				if (entry.isDirectory()) {
					const skillMd = join(dir, entry.name, "SKILL.md");
					if (existsSync(skillMd)) {
						const name = getSkillName(skillMd);
						if (name) {
							const existing = nameToPaths.get(name) ?? [];
							existing.push(skillMd);
							nameToPaths.set(name, existing);
						}
					}
				}
			}
		} catch {
			// skip unreadable dirs
		}
	}

	// Only return duplicates
	for (const [name, paths] of nameToPaths) {
		if (paths.length <= 1) nameToPaths.delete(name);
	}

	return nameToPaths;
}

// ─── Doctor implementation ───────────────────────────────────────────────────

export async function runDoctor(pi: ExtensionAPI): Promise<string> {
	const lines: string[] = ["PiFlow Doctor", "══════════════════", ""];

	const skillsDirs = findSkillsDirs();

	// 1. PiFlow package source
	lines.push("## Пакет PiFlow");
	try {
		const result = await pi.exec("pi", ["list"]);
		if (result.code === 0 && result.stdout) {
			const piflowSources = findPiflowSources(result.stdout);
			if (piflowSources.length === 0) {
				lines.push("  [WARN] PiFlow не найден в pi list");
			} else if (piflowSources.length === 1) {
				lines.push(`  [OK] ${piflowSources[0]}`);
			} else {
				lines.push(`  [WARN] Найдено несколько источников PiFlow:`);
				for (const source of piflowSources) {
					lines.push(`    - ${source}`);
				}
				lines.push(`  Совет: удали дубликат через pi remove <source>`);
			}
		} else {
			lines.push("  [WARN] Не удалось выполнить pi list");
		}
	} catch {
		lines.push("  [WARN] pi CLI недоступен");
	}

	// 2. Required upstream skills
	lines.push("");
	lines.push("## Обязательные скиллы (Superpowers)");
	const missingRequired = getMissingSkills(skillsDirs, REQUIRED_UPSTREAM);
	if (missingRequired.length === 0) {
		lines.push("  [OK] Все обязательные скиллы установлены");
	} else {
		for (const s of missingRequired) {
			lines.push(`  [MISSING] ${s}`);
		}
	}

	// 3. Matt Pocock skills
	lines.push("");
	lines.push("## Скиллы Matt Pocock");
	const missingMatt = getMissingSkills(skillsDirs, MATT_POCOCK_SKILLS);
	if (missingMatt.length === 0) {
		lines.push("  [OK] Все установлены");
	} else {
		for (const s of missingMatt) {
			lines.push(`  [MISSING] ${s}`);
		}
	}

	// 4. Frontend skills
	lines.push("");
	lines.push("## Frontend скиллы");
	const missingFrontend = getMissingSkills(skillsDirs, FRONTEND_SKILLS);
	if (missingFrontend.length === 0) {
		lines.push("  [OK] Все установлены");
	} else {
		for (const s of missingFrontend) {
			lines.push(`  [MISSING] ${s}`);
		}
		if (missingFrontend.includes("frontend-design")) {
			lines.push(
				`  Установка: npx skills add https://github.com/anthropics/skills --skill frontend-design`,
			);
		}
	}

	// 5. Optional packages
	lines.push("");
	lines.push("## Опциональные пакеты");
	let packageList = "";
	try {
		const result = await pi.exec("pi", ["list"]);
		if (result.code === 0) packageList = result.stdout ?? "";
	} catch {
		packageList = "";
	}
	for (const pkg of OPTIONAL_PACKAGES) {
		if (packageList.includes(pkg)) {
			lines.push(`  [OK] ${pkg}`);
		} else {
			lines.push(`  [—] ${pkg}`);
		}
	}
	lines.push(
		"  Классификация: required = PiFlow core skills, recommended = Matt/frontend skills, optional = packages above, overlap = subagent backends.",
	);

	// 6. Subagent backends
	lines.push("");
	lines.push("## Subagent backend candidates");
	const backends = await detectSubagentBackends(pi);
	lines.push("  [OK] none — inline execution, supported by v1");
	lines.push(
		backends.tintinweb
			? "  [OK] @tintinweb/pi-subagents"
			: "  [—] @tintinweb/pi-subagents",
	);
	lines.push(
		backends["pi-subagents"]
			? "  [OK] pi-subagents"
			: "  [—] pi-subagents (recommended to evaluate for workflow-oriented agents)",
	);
	lines.push("  PiFlow не устанавливает и не выбирает backend автоматически.");

	// 7. Duplicate skills
	lines.push("");
	lines.push("## Дубликаты скиллов");
	const duplicates = findDuplicateSkills(skillsDirs);
	if (duplicates.size === 0) {
		lines.push("  [OK] Дубликатов не обнаружено");
	} else {
		for (const [name, paths] of duplicates) {
			lines.push(`  [WARN] "${name}" найден в нескольких местах:`);
			for (const p of paths) {
				lines.push(`    - ${p}`);
			}
		}
	}

	return lines.join("\n");
}
