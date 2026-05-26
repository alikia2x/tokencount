type WorkerResponse =
	| { id: string; type: "result"; count: number }
	| { id: string; type: "error"; message: string };

let worker: Worker | null = null;
let workerLoading: Promise<Worker> | null = null;
const pending = new Map<
	string,
	{ resolve: (count: number) => void; reject: (err: Error) => void }
>();

function getWorker(): Promise<Worker> {
	if (worker) return Promise.resolve(worker);
	if (workerLoading) return workerLoading;
	workerLoading = (async () => {
		const w = new Worker(new URL("../workers/tokenizer.worker.ts", import.meta.url), {
			type: "module",
		});
		w.onmessage = (e: MessageEvent<WorkerResponse>) => {
			const { id } = e.data;
			const p = pending.get(id);
			if (!p) return;
			pending.delete(id);
			if (e.data.type === "result") {
				p.resolve(e.data.count);
			} else {
				p.reject(new Error(e.data.message));
			}
		};
		w.onerror = () => {
			const err = new Error("Tokenizer worker error");
			for (const [, p] of pending) p.reject(err);
			pending.clear();
		};
		worker = w;
		return w;
	})();
	return workerLoading;
}

function sendRequest(
	type: "count-openai" | "count-hf",
	payload: Record<string, string>
): Promise<number> {
	const id = crypto.randomUUID();
	return getWorker().then(
		(w) =>
			new Promise<number>((resolve, reject) => {
				pending.set(id, { resolve, reject });
				w.postMessage({ id, type, ...payload });
			})
	);
}

export async function countOpenAITokens(text: string, modelName: string): Promise<number> {
	const trimmed = text.trim();
	if (!trimmed || !modelName) return 0;
	return sendRequest("count-openai", { text: trimmed, modelName });
}

export async function countHFTokens(text: string, modelId: string): Promise<number> {
	const trimmed = text.trim();
	if (!trimmed || !modelId) return 0;
	return sendRequest("count-hf", { text: trimmed, modelId });
}
