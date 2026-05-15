import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

declare const process: { env: Record<string, string | undefined> };

type OptionInput = {
	label: string;
	description: string;
	preview?: string;
};

type QuestionInput = {
	question: string;
	header: string;
	options: OptionInput[];
	multiSelect?: boolean;
};

type ToolParams = {
	questions: QuestionInput[];
	timeoutMs?: number;
};

type Answer = {
	questionIndex: number;
	question: string;
	kind: "option" | "custom" | "chat" | "multi";
	answer: string | null;
	selected?: string[];
	notes?: string;
	preview?: string;
};

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;
const MAX_QUESTIONS = 4;
const CUSTOM = "Type something.";
const CHAT = "Chat about this";
const RESERVED_LABELS = new Set([
	"other",
	CUSTOM.toLowerCase(),
	CHAT.toLowerCase(),
]);
const DEFAULT_TIMEOUT_MS = Number.parseInt(
	process.env.PI_ACP_ASK_TIMEOUT_MS ?? "120000",
	10,
);
const TOOL_NAME = process.env.PI_ACP_ASK_TOOL_NAME || "ask_user_question_acp";

const paramsSchema = Type.Object({
	questions: Type.Array(
		Type.Object({
			question: Type.String({
				description:
					"The complete question to ask; should end with a question mark.",
			}),
			header: Type.String({
				maxLength: 16,
				description: "Short chip label for the question.",
			}),
			options: Type.Array(
				Type.Object({
					label: Type.String({
						maxLength: 60,
						description: "Concise option label.",
					}),
					description: Type.String({
						description: "Explanation of the option or trade-off.",
					}),
					preview: Type.Optional(
						Type.String({
							description:
								"Optional markdown/code preview. Shown as text in ACP/RPC fallback.",
						}),
					),
				}),
				{ minItems: MIN_OPTIONS, maxItems: MAX_OPTIONS },
			),
			multiSelect: Type.Optional(
				Type.Boolean({
					description:
						"Allow multiple options. Uses a typed selection prompt in ACP/RPC.",
				}),
			),
		}),
		{ minItems: 1, maxItems: MAX_QUESTIONS },
	),
	timeoutMs: Type.Optional(
		Type.Number({
			description:
				"Dialog timeout in milliseconds. Defaults to PI_ACP_ASK_TIMEOUT_MS or 120000.",
		}),
	),
});

function validate(params: ToolParams): string | null {
	if (!Array.isArray(params.questions) || params.questions.length === 0)
		return "At least one question is required.";
	if (params.questions.length > MAX_QUESTIONS)
		return `Ask at most ${MAX_QUESTIONS} questions per call.`;

	const seenQuestions = new Set<string>();
	for (const [questionIndex, q] of params.questions.entries()) {
		const questionKey = q.question.trim().toLowerCase();
		if (!questionKey) return `Question ${questionIndex + 1} is empty.`;
		if (seenQuestions.has(questionKey))
			return `Question ${questionIndex + 1} duplicates a previous question.`;
		seenQuestions.add(questionKey);

		if (
			!Array.isArray(q.options) ||
			q.options.length < MIN_OPTIONS ||
			q.options.length > MAX_OPTIONS
		) {
			return `Question ${questionIndex + 1} must have ${MIN_OPTIONS}-${MAX_OPTIONS} options.`;
		}

		const seenLabels = new Set<string>();
		for (const option of q.options) {
			const labelKey = option.label.trim().toLowerCase();
			if (!labelKey)
				return `Question ${questionIndex + 1} contains an empty option label.`;
			if (RESERVED_LABELS.has(labelKey))
				return `Option label "${option.label}" is reserved.`;
			if (seenLabels.has(labelKey))
				return `Question ${questionIndex + 1} contains duplicate option label "${option.label}".`;
			seenLabels.add(labelKey);
		}
	}
	return null;
}

function formatQuestion(q: QuestionInput): string {
	const lines = [`${q.header ? `[${q.header}] ` : ""}${q.question}`];
	for (const [index, option] of q.options.entries()) {
		lines.push(`${index + 1}. ${option.label} — ${option.description}`);
		if (option.preview?.trim())
			lines.push(`   Preview: ${option.preview.trim()}`);
	}
	return lines.join("\n");
}

function normalizeTimeout(
	timeoutMs: number | undefined,
): { timeout?: number } | undefined {
	const timeout =
		typeof timeoutMs === "number" && Number.isFinite(timeoutMs)
			? timeoutMs
			: DEFAULT_TIMEOUT_MS;
	return timeout > 0 ? { timeout } : undefined;
}

function parseMultiSelection(
	raw: string | undefined,
	options: OptionInput[],
): string[] | null {
	if (!raw?.trim()) return null;
	const labels = new Map(
		options.map((option) => [option.label.toLowerCase(), option.label]),
	);
	const selected: string[] = [];

	for (const token of raw
		.split(/[\n,;]+/)
		.map((part) => part.trim())
		.filter(Boolean)) {
		const asNumber = Number.parseInt(token, 10);
		const byNumber = Number.isFinite(asNumber)
			? options[asNumber - 1]?.label
			: undefined;
		const byLabel = labels.get(token.toLowerCase());
		const value = byNumber ?? byLabel;
		if (value && !selected.includes(value)) selected.push(value);
	}

	return selected.length > 0 ? selected : null;
}

function textFallback(params: ToolParams, reason: string) {
	const questions = params.questions.map(formatQuestion).join("\n\n");
	return {
		content: [
			{
				type: "text" as const,
				text: `${reason}\n\nPlease answer in chat:\n\n${questions}`,
			},
		],
		details: {
			answers: [],
			cancelled: true,
			error: "ui_unavailable",
			fallback: "chat",
		},
	};
}

function summarize(answers: Answer[]): string {
	return answers
		.map((answer) => {
			if (answer.kind === "multi")
				return `${answer.question}: ${(answer.selected ?? []).join(", ")}`;
			if (answer.kind === "chat")
				return `${answer.question}: user chose to chat`;
			return `${answer.question}: ${answer.answer ?? "cancelled"}`;
		})
		.join("\n");
}

export default function register(pi: ExtensionAPI) {
	pi.registerTool({
		name: TOOL_NAME,
		label: "ACP Ask User Question",
		description:
			"Ask the user one or more structured questions. This compact implementation is ACP/RPC-friendly: it uses ctx.ui.select/input instead of ctx.ui.custom, so clients that support Pi extension_ui_request can show native dialogs.",
		promptSnippet: `Ask the user up to ${MAX_QUESTIONS} structured questions using ACP/RPC-compatible dialogs`,
		promptGuidelines: [
			`Use ${TOOL_NAME} when requirements are ambiguous and a concrete user decision is needed.`,
			`Ask 1-${MAX_QUESTIONS} questions per invocation; each question must have ${MIN_OPTIONS}-${MAX_OPTIONS} concise options with descriptions.`,
			"Prefer single-select questions. Use multiSelect only when multiple answers are genuinely valid.",
			"Do not add reserved options like 'Other', 'Type something.', or 'Chat about this'; the tool adds chat/custom escape hatches where appropriate.",
			"If the ACP client cannot display dialogs, the tool returns a chat fallback; continue by asking the shown question in plain text.",
		],
		parameters: paramsSchema,

		async execute(
			_toolCallId: string,
			params: unknown,
			signal: AbortSignal | undefined,
			_onUpdate: unknown,
			ctx: any,
		) {
			const typed = params as ToolParams;
			const validationError = validate(typed);
			if (validationError) {
				return {
					content: [{ type: "text" as const, text: validationError }],
					isError: true,
					details: { answers: [], cancelled: true, error: "validation" },
				};
			}

			if (!ctx.hasUI || !ctx.ui)
				return textFallback(typed, "Interactive UI is not available.");
			if (signal?.aborted)
				return textFallback(
					typed,
					"Question was aborted before it could be shown.",
				);

			const dialogOptions = normalizeTimeout(typed.timeoutMs);
			const answers: Answer[] = [];

			try {
				for (const [questionIndex, question] of typed.questions.entries()) {
					if (signal?.aborted) break;
					const prompt = formatQuestion(question);

					if (question.multiSelect) {
						const raw = await ctx.ui.input(
							`${prompt}\n\nSelect one or more options by number or label, separated by commas. Type '${CHAT}' to discuss instead.`,
							"1, 3",
							dialogOptions,
						);
						if (!raw)
							return textFallback(
								typed,
								"No answer was received before the dialog closed.",
							);
						if (raw.trim().toLowerCase() === CHAT.toLowerCase()) {
							answers.push({
								questionIndex,
								question: question.question,
								kind: "chat",
								answer: null,
							});
							continue;
						}
						const selected = parseMultiSelection(raw, question.options);
						if (!selected)
							return textFallback(
								typed,
								"The multi-select answer could not be parsed.",
							);
						answers.push({
							questionIndex,
							question: question.question,
							kind: "multi",
							answer: selected.join(", "),
							selected,
						});
						continue;
					}

					const labels = question.options.map((option) => option.label);
					const hasPreview = question.options.some((option) =>
						option.preview?.trim(),
					);
					const choices = hasPreview
						? [...labels, CHAT]
						: [...labels, CUSTOM, CHAT];
					const selected = await ctx.ui.select(prompt, choices, dialogOptions);

					if (!selected)
						return textFallback(
							typed,
							"No answer was received before the dialog closed.",
						);
					if (selected === CHAT) {
						answers.push({
							questionIndex,
							question: question.question,
							kind: "chat",
							answer: null,
						});
						continue;
					}
					if (selected === CUSTOM) {
						const custom = await ctx.ui.input(
							question.question,
							"Type your answer...",
							dialogOptions,
						);
						if (!custom)
							return textFallback(
								typed,
								"No custom answer was received before the dialog closed.",
							);
						answers.push({
							questionIndex,
							question: question.question,
							kind: "custom",
							answer: custom,
						});
						continue;
					}

					const option = question.options.find(
						(candidate) => candidate.label === selected,
					);
					answers.push({
						questionIndex,
						question: question.question,
						kind: "option",
						answer: selected,
						preview: option?.preview,
					});
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				return textFallback(typed, `Dialog failed: ${message}`);
			}

			if (answers.length === 0)
				return textFallback(typed, "No answer was collected.");

			return {
				content: [
					{
						type: "text" as const,
						text: `User answered:\n${summarize(answers)}`,
					},
				],
				details: { answers, cancelled: false },
			};
		},
	});
}
