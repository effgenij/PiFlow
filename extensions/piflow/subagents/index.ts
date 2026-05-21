import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { noneAdapter } from "./none.js";
import type { SubagentAdapter, SubagentBackend } from "./types.js";

export { noneAdapter } from "./none.js";
export type { SubagentAdapter, SubagentBackend } from "./types.js";

const OPTIONAL_BACKENDS: Array<Exclude<SubagentBackend, "none">> = [
	"pi-subagents",
];

const BACKEND_PACKAGE_NAMES: Record<
	Exclude<SubagentBackend, "none">,
	string
> = {
	"pi-subagents": "pi-subagents",
};

export async function detectSubagentBackends(
	pi: ExtensionAPI,
): Promise<Record<SubagentBackend, boolean>> {
	const detected: Record<SubagentBackend, boolean> = {
		none: true,
		"pi-subagents": false,
	};

	let packageList = "";
	try {
		const result = await pi.exec("pi", ["list"]);
		if (result.code === 0) packageList = result.stdout ?? "";
	} catch {
		packageList = "";
	}

	for (const backend of OPTIONAL_BACKENDS) {
		const packageName = BACKEND_PACKAGE_NAMES[backend];
		detected[backend] = packageList.includes(packageName);
	}

	return detected;
}

export function createSubagentAdapter(
	_backend: SubagentBackend,
): SubagentAdapter {
	// v1 intentionally supports only inline execution. Optional backend packages are
	// detected by /pf-doctor but not required by core workflows.
	return noneAdapter;
}
