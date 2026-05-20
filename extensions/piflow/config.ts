/**
 * PiFlow — Config Loading
 *
 * Reads optional config from:
 *   ~/.pi/agent/piflow/config.json
 *   .piflow/config.json (project-local)
 *
 * Project-local overrides global. Missing config is fine — defaults are used.
 */

import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { PiflowConfig } from "./types.js";
import { DEFAULT_CONFIG } from "./types.js";

const GLOBAL_CONFIG_PATH = join(
	homedir(),
	".pi",
	"agent",
	"piflow",
	"config.json",
);
const LOCAL_CONFIG_PATH = join(process.cwd(), ".piflow", "config.json");

function readJsonSafe(filePath: string): Record<string, unknown> | null {
	try {
		if (!existsSync(filePath)) return null;
		const raw = readFileSync(filePath, "utf-8");
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function loadConfig(): PiflowConfig {
	const global = readJsonSafe(GLOBAL_CONFIG_PATH);
	const local = readJsonSafe(LOCAL_CONFIG_PATH);

	return {
		...DEFAULT_CONFIG,
		...(global ?? {}),
		...(local ?? {}),
		router: {
			...DEFAULT_CONFIG.router,
			...(global?.router ?? {}),
			...(local?.router ?? {}),
		},
		artifacts: {
			...DEFAULT_CONFIG.artifacts,
			...(global?.artifacts ?? {}),
			...(local?.artifacts ?? {}),
		},
		subagents: {
			...DEFAULT_CONFIG.subagents,
			...(global?.subagents ?? {}),
			...(local?.subagents ?? {}),
		},
	};
}

export { GLOBAL_CONFIG_PATH, LOCAL_CONFIG_PATH };
