import type { PreTrainedTokenizer } from "@huggingface/transformers";

type EncodeFn = (text: string) => number[];

const openaiEncoderCache = new Map<string, EncodeFn>();

async function getOpenAIEncoder(modelName: string): Promise<EncodeFn> {
	const cached = openaiEncoderCache.get(modelName);
	if (cached) return cached;
	const { encode } = await import(`./openai/${modelName}.ts`);
	openaiEncoderCache.set(modelName, encode);
	return encode;
}

export async function countOpenAITokens(
	text: string,
	modelName: string,
): Promise<number> {
	const trimmed = text.trim();
	if (!trimmed || !modelName) return 0;
	const encode = await getOpenAIEncoder(modelName);
	return encode(trimmed).length;
}

const tokenizerCache = new Map<string, PreTrainedTokenizer>();
const pendingLoads = new Map<string, Promise<PreTrainedTokenizer>>();

async function loadTokenizer(modelId: string): Promise<PreTrainedTokenizer> {
	const cachedTokenizer = tokenizerCache.get(modelId);
	if (cachedTokenizer) {
		return cachedTokenizer;
	}

	const pending = pendingLoads.get(modelId);
	if (pending) return pending;

	const loadPromise = (async () => {
		const { AutoTokenizer } = await import("@huggingface/transformers");
		const tokenizer = await AutoTokenizer.from_pretrained(modelId);
		tokenizerCache.set(modelId, tokenizer);
		pendingLoads.delete(modelId);
		return tokenizer;
	})();

	pendingLoads.set(modelId, loadPromise);
	return loadPromise;
}

export async function countHFTokens(text: string, modelId: string): Promise<number> {
	const trimmed = text.trim();
	if (!trimmed || !modelId) return 0;

	const tokenizer = await loadTokenizer(modelId);
	const encoded = await tokenizer.encode(trimmed);

	if (Array.isArray(encoded)) {
		return encoded.length;
	}
	if (encoded && typeof encoded === "object" && "input_ids" in encoded) {
		return (encoded as { input_ids: number[] }).input_ids.length;
	}
	return 0;
}
