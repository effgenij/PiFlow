import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { SubagentAdapter } from "./types.js";

export const noneAdapter: SubagentAdapter = {
	backend: "none",
	description: "Inline execution; no optional subagent package is required.",
	async isAvailable(_pi: ExtensionAPI): Promise<boolean> {
		return true;
	},
	explain(): string {
		return [
			"Subagent backend: none",
			"PiFlow will run workflows inline in the current agent session.",
			"Optional packages such as pi-subagents can be evaluated later, but v1 does not require them.",
		].join("\n");
	},
};
