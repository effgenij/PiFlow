/**
 * PiFlow — Task Classifier and Router
 *
 * Classifies freeform task text into a PiFlow mode.
 * Supports manual override via --flow flag.
 */

import type { PiflowMode } from "./types.js";

const DEBUG_PATTERNS =
	/\b(bug|fix|error|crash|exception|fault|fail|broken|debug|traceback|stack\s*trace|issue)\b|поправить|исправить|ошибк|баг|сломал|падает/i;
const REFACTOR_PATTERNS =
	/\b(refactor|cleanup|clean\s*up|simplify|architecture|complexity|tech\s*debt|restructure|reorganize)\b|упростить|рефактор|архитектур|сложност|тех\s*долг/i;
const EXPLORE_PATTERNS =
	/\b(explore|investigate|research|understand|how\s*does|why\s*does|explain)\b/i;

const FRONTEND_PATTERNS =
	/\b(ui|component|page|layout|design|modal|button|form|input|css|style|responsive|animation|frontend|select)\b|верстк|компонент|модалк|кнопк|скролл|фильтр/i;

const REACT_PATTERNS =
	/\b(react|next\.?js|nextjs|hook|usestate|useeffect|render|bundle|perf|lazy|ssr|ssg)\b/i;

const COMPOSITION_PATTERNS =
	/\b(composition|compound|render\s*prop|boolean\s*prop|prop\s*proliferation|component\s*api|reusable)\b/i;

const A11Y_PATTERNS =
	/\b(accessib|a11y|ux\s*audit|design\s*review|wcag|aria|screen\s*reader)\b/i;

export interface ClassificationResult {
	mode: PiflowMode;
	overlays: string[];
	confidence: "high" | "medium" | "low";
	reasons: string[];
}

export function classifyTask(task: string): ClassificationResult {
	if (!task) {
		return {
			mode: "full",
			overlays: [],
			confidence: "low",
			reasons: ["Пустой ввод — по умолчанию full"],
		};
	}

	const overlays: string[] = [];
	const reasons: string[] = [];
	let mode: PiflowMode = "full";
	let confidence: "high" | "medium" | "low" = "medium";

	// Detect overlays first
	if (FRONTEND_PATTERNS.test(task)) {
		overlays.push("frontend");
		reasons.push("Обнаружены UI/component сигналы");
	}
	if (REACT_PATTERNS.test(task)) {
		overlays.push("react");
		reasons.push("Обнаружены React/Next.js сигналы");
	}
	if (COMPOSITION_PATTERNS.test(task)) {
		overlays.push("composition");
		reasons.push("Обнаружены сигналы component API / composition");
	}
	if (A11Y_PATTERNS.test(task)) {
		overlays.push("a11y");
		reasons.push("Обнаружены accessibility сигналы");
	}

	// Classify flow
	if (DEBUG_PATTERNS.test(task)) {
		mode = "debug";
		confidence = "high";
		reasons.push("Обнаружены сигналы бага/ошибки");
	} else if (REFACTOR_PATTERNS.test(task)) {
		mode = "refactor";
		confidence = "high";
		reasons.push("Обнаружены сигналы рефакторинга");
	} else if (EXPLORE_PATTERNS.test(task)) {
		mode = "explore";
		confidence = "medium";
		reasons.push("Обнаружены сигналы исследования");
	} else {
		const wordCount = task.trim().split(/\s+/).length;
		if (/систем[ауые]|system|workflow|platform|нов(ую|ая|ое)/i.test(task)) {
			mode = "full";
			confidence = "medium";
			reasons.push("Обнаружен системный/новый scope — полный lifecycle");
		} else if (wordCount <= 15) {
			mode = "quick";
			confidence = "medium";
			reasons.push(`Короткое описание (${wordCount} слов) — quick path`);
		} else {
			mode = "full";
			confidence = "low";
			reasons.push("Неопределённый scope — полный lifecycle");
		}
	}

	return { mode, overlays, confidence, reasons };
}

/**
 * Parse --flow flag from args, return [cleanArgs, explicitMode].
 */
export function parseFlowOverride(args: string): {
	cleanArgs: string;
	explicitMode: PiflowMode;
} {
	const match = args.match(/--flow\s+(full|quick|debug|refactor|explore)/i);
	if (!match) return { cleanArgs: args, explicitMode: null };

	const mode = match[1].toLowerCase() as PiflowMode;
	const cleanArgs = args.replace(match[0], "").trim();
	return { cleanArgs, explicitMode: mode };
}
