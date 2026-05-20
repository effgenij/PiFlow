/**
 * PiFlow — Shared Types
 */

export type PiflowMode =
	| "full"
	| "quick"
	| "explore"
	| "debug"
	| "refactor"
	| null;

export type OpenspecPhase =
	| "explore"
	| "propose"
	| "design"
	| "adr"
	| "spec"
	| "apply";

export interface PhaseState {
	mode: PiflowMode;
	changeName: string | null;
	applyStrategy: "subagent" | "tdd" | null;
}

export interface PiflowConfig {
	router: {
		confirmBeforeRun: boolean;
	};
	artifacts: {
		quick: "session-or-one-file";
		contextPackets: "when-useful";
	};
	subagents: {
		backend: "none";
	};
}

export const DEFAULT_CONFIG: PiflowConfig = {
	router: {
		confirmBeforeRun: true,
	},
	artifacts: {
		quick: "session-or-one-file",
		contextPackets: "when-useful",
	},
	subagents: {
		backend: "none",
	},
};
