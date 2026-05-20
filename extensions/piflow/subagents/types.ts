import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export type SubagentBackend = "none" | "tintinweb" | "pi-subagents";

export interface SubagentAdapter {
	backend: SubagentBackend;
	description: string;
	isAvailable(pi: ExtensionAPI): Promise<boolean>;
	explain(): string;
}
