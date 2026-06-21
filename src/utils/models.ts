export interface ModelVariant {
	hfModelId: string;
	displayName: string;
	/** Dynamic import name for src/utils/openai/ e.g. "gpt-4o" → loads src/utils/openai/gpt-4o.ts */
	openaiModel?: string;
}

export interface ModelFamily {
	id: string;
	name: string;
	/** "openai" uses gpt-tokenizer (cl100k_base); "hf" uses AutoTokenizer */
	tokenizerType: "openai" | "hf";
	models: ModelVariant[];
}

const OPENAI_VARIANTS: ModelVariant[] = [
	{ hfModelId: "", displayName: "GPT-5.x", openaiModel: "o200k_base" },
	{ hfModelId: "", displayName: "GPT-4o", openaiModel: "o200k_base" },
	{ hfModelId: "", displayName: "GPT-4", openaiModel: "cl100k_base" },
	{ hfModelId: "", displayName: "GPT-OSS", openaiModel: "o200k_harmony" },
];

const DEEPSEEK_VARIANTS: ModelVariant[] = [
	{ hfModelId: "deepseek-ai/DeepSeek-V4-Pro", displayName: "V4 Pro" },
	{ hfModelId: "deepseek-ai/DeepSeek-V4-Pro", displayName: "V4 Flash" },
	{ hfModelId: "deepseek-ai/DeepSeek-V3.2", displayName: "V3.2" },
	{ hfModelId: "deepseek-ai/DeepSeek-V3.1", displayName: "V3.1" },
];

const GLM_VARIANTS: ModelVariant[] = [
	{ hfModelId: "zai-org/GLM-5.1", displayName: "GLM 5.2" },
	{ hfModelId: "zai-org/GLM-5.1", displayName: "GLM 5.1" },
	{ hfModelId: "zai-org/GLM-5.1", displayName: "GLM 5" },
	{ hfModelId: "zai-org/GLM-5.1", displayName: "GLM 4.7" },
];

const KIMI_VARIANTS: ModelVariant[] = [
	{ hfModelId: "alikia2x/k2.7-tokenizer", displayName: "K2.7 Code" },
	{ hfModelId: "alikia2x/k2.6-tokenizer", displayName: "K2.6" },
	{ hfModelId: "alikia2x/k2.6-tokenizer", displayName: "K2.5" },
];

const MIMO_VARIANTS: ModelVariant[] = [
	{ hfModelId: "XiaomiMiMo/MiMo-V2.5", displayName: "V2.5" },
	{ hfModelId: "XiaomiMiMo/MiMo-V2.5-Pro", displayName: "V2.5 Pro" },
	{ hfModelId: "XiaomiMiMo/MiMo-V2-Flash", displayName: "V2 Flash" },
];

const QWEN_VARIANTS: ModelVariant[] = [
	{ hfModelId: "Qwen/Qwen3.6-35B-A3B", displayName: "Qwen 3.7" },
	{ hfModelId: "Qwen/Qwen3.6-35B-A3B", displayName: "Qwen 3.6" },
	{ hfModelId: "Qwen/Qwen3.6-35B-A3B", displayName: "Qwen 3.5" },
	{ hfModelId: "Qwen/Qwen3.6-35B-A3B", displayName: "Qwen 3" },
];

const MINIMAX_VARIANTS: ModelVariant[] = [
	{ hfModelId: "MiniMaxAI/MiniMax-M2.5", displayName: "M3" },
	{ hfModelId: "MiniMaxAI/MiniMax-M2.5", displayName: "M2.7" },
	{ hfModelId: "MiniMaxAI/MiniMax-M2.5", displayName: "M2.5" },
];

const GEMINI_VARIANTS: ModelVariant[] = [
	{ hfModelId: "google/gemma-4-31B", displayName: "3.5 Flash" },
	{ hfModelId: "google/gemma-4-31B", displayName: "3.1 Pro" },
	{ hfModelId: "google/gemma-4-31B", displayName: "3.1 Flash Lite" },
];

export const MODEL_FAMILIES: ModelFamily[] = [
	{ id: "openai", name: "GPT", tokenizerType: "openai", models: OPENAI_VARIANTS },
	{ id: "gemini", name: "Gemini", tokenizerType: "hf", models: GEMINI_VARIANTS },
	{ id: "deepseek", name: "DeepSeek", tokenizerType: "hf", models: DEEPSEEK_VARIANTS },
	{ id: "glm", name: "GLM", tokenizerType: "hf", models: GLM_VARIANTS },
	{ id: "kimi", name: "Kimi", tokenizerType: "hf", models: KIMI_VARIANTS },
	{ id: "mimo", name: "MiMo", tokenizerType: "hf", models: MIMO_VARIANTS },
	{ id: "qwen", name: "Qwen", tokenizerType: "hf", models: QWEN_VARIANTS },
	{ id: "minimax", name: "MiniMax", tokenizerType: "hf", models: MINIMAX_VARIANTS },
];

export function getFamilyById(id: string): ModelFamily | undefined {
	return MODEL_FAMILIES.find((f) => f.id === id);
}
