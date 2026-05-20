/**
 * PiFlow Extension vNext
 *
 * Orchestrates OpenSpec + Superpowers + specialised skills workflow.
 * Registers /pf-* commands and injects relevant skills
 * into the system prompt based on current phase.
 *
 * Commands:
 *   /pf-new [task]       — router: classifies task → delegates to pf-*
 *   /pf-full [idea]      — full cycle: explore → propose → design → adr → apply → archive
 *   /pf-quick [task]     — quick cycle: brainstorm → plan → apply (ADR by recommendation)
 *   /pf-debug [issue]    — debug: 2 parallel subagents → root cause → pf-quick apply
 *   /pf-refactor [scope] — refactor: parallel architecture + complexity analysis → apply
 *   /pf-status           — show active changes, worktrees, phases
 *   /pf-explore [idea]   — explore: think through ideas and requirements
 *   /pf-doctor           — diagnose missing skills, duplicate installs
 *   /pf-clean            — dry-run cleanup for old PiFlow resources
 *   /pf-feature [idea]   — alias for /pf-full
 *
 * Skills are NEVER overridden — only injected as named references into the
 * system prompt so the agent knows which ones to invoke. Original skill files
 * remain untouched and auto-update when superpowers updates.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { PhaseState } from "./types.js";
import { registerCommands, handleBeforeAgentStart } from "./commands.js";

export default function piflowExtension(pi: ExtensionAPI) {
	const state: PhaseState = {
		mode: null,
		changeName: null,
		applyStrategy: null,
	};

	// Register all /pf-* commands
	registerCommands(pi, state);

	// before_agent_start — inject skills based on current phase
	pi.on("before_agent_start", async (event) => {
		return handleBeforeAgentStart(pi, state, event);
	});
}
