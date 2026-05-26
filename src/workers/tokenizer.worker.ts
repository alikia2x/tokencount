/// <reference lib="webworker" />

import type { PreTrainedTokenizer } from "@huggingface/transformers";
import type { Tiktoken } from "js-tiktoken/lite";

type WorkerRequest =
	| { id: string; type: "count-openai"; text: string; modelName: string }
	| { id: string; type: "count-hf"; text: string; modelId: string };

type WorkerResponse =
	| { id: string; type: "result"; count: number }
	| { id: string; type: "error"; message: string };

type OpenAIModelName = "o200k_base" | "cl100k_base" | "o200k_harmony";
const openaiTokenizerCache = new Map<string, Tiktoken>();

async function getOpenAITokenizer(modelName: string): Promise<Tiktoken> {
	const cached = openaiTokenizerCache.get(modelName);
	if (cached) return cached;

	const { Tiktoken: TiktokenClass } = await import("js-tiktoken/lite");
	let tokenizer: Tiktoken;

	switch (modelName as OpenAIModelName) {
		case "cl100k_base": {
			const { default: cl100k_base } = await import("js-tiktoken/ranks/cl100k_base");
			tokenizer = new TiktokenClass(cl100k_base);
			break;
		}
		case "o200k_base":
		case "o200k_harmony": {
			const { default: o200k_base } = await import("js-tiktoken/ranks/o200k_base");
			tokenizer = new TiktokenClass(o200k_base);
			break;
		}
	}

	openaiTokenizerCache.set(modelName, tokenizer);
	return tokenizer;
}

async function countOpenAITokens(text: string, modelName: string): Promise<number> {
	const trimmed = text.trim();
	if (!trimmed || !modelName) return 0;

	const tokenizer = await getOpenAITokenizer(modelName);
	return tokenizer.encode(trimmed).length;
}

const tokenizerCache = new Map<string, PreTrainedTokenizer>();
const pendingLoads = new Map<string, Promise<PreTrainedTokenizer>>();

async function countHFTokens(text: string, modelId: string): Promise<number> {
	const trimmed = text.trim();
	if (!trimmed || !modelId) return 0;

	let loadPromise = pendingLoads.get(modelId);
	if (!loadPromise) {
		const cachedTokenizer = tokenizerCache.get(modelId);
		if (cachedTokenizer) {
			loadPromise = Promise.resolve(cachedTokenizer);
		} else {
			loadPromise = (async () => {
				const { AutoTokenizer } = await import("@huggingface/transformers");
				const tokenizer = await AutoTokenizer.from_pretrained(modelId);
				tokenizerCache.set(modelId, tokenizer);
				pendingLoads.delete(modelId);
				return tokenizer;
			})();
			pendingLoads.set(modelId, loadPromise);
		}
	}

	const tokenizer = await loadPromise;
	const encoded = tokenizer.encode(trimmed);

	if (Array.isArray(encoded)) return encoded.length;
	if (encoded && typeof encoded === "object" && "input_ids" in encoded) {
		return (encoded as { input_ids: number[] }).input_ids.length;
	}
	return 0;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
	const { id, type } = e.data;
	try {
		let count: number;
		switch (type) {
			case "count-openai":
				count = await countOpenAITokens(e.data.text, e.data.modelName);
				break;
			case "count-hf":
				count = await countHFTokens(e.data.text, e.data.modelId);
				break;
			default:
				throw new Error(`Unknown request type: ${type}`);
		}
		self.postMessage({ id, type: "result", count } satisfies WorkerResponse);
	} catch (err) {
		self.postMessage({
			id,
			type: "error",
			message: err instanceof Error ? err.message : String(err),
		} satisfies WorkerResponse);
	}
};
