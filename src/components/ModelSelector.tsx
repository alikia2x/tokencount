import { For, createSignal, createEffect, onCleanup } from "solid-js";
import type { Accessor } from "solid-js";
import type { ModelFamily } from "../utils/models";
import { countOpenAITokens, countHFTokens } from "../utils/tokenizer";

const CUSTOM_FAMILY_ID = "custom";

interface ModelSelectorProps {
	families: ModelFamily[];
	text: Accessor<string>;
	selectedFamilyId: Accessor<string>;
	onFamilySelect: (familyId: string) => void;
	onTokenCount: (familyId: string, count: number | null) => void;
	selectedModelIndices: Accessor<Record<string, number>>;
	onModelIndexChange: (familyId: string, index: number) => void;
	customModelId: Accessor<string>;
	onCustomModelIdChange: (value: string) => void;
}

const FamilyCard = (props: {
	family: ModelFamily;
	text: Accessor<string>;
	selectedFamilyId: Accessor<string>;
	selectedIndex: Accessor<number>;
	onSelect: (familyId: string) => void;
	onTokenCount: (familyId: string, count: number | null) => void;
	onIndexChange: (index: number) => void;
}) => {
	const [tokenCount, setTokenCount] = createSignal<number | null>(null);
	const [hfLoading, setHfLoading] = createSignal(false);
	const [hfError, setHfError] = createSignal<string | null>(null);
	let cancelled = false;
	let currentCallId = 0;

	onCleanup(() => {
		cancelled = true;
	});

	const countTokens = async () => {
		const callId = ++currentCallId;
		const t = props.text().trim();
		if (!t) {
			setTokenCount(0);
			props.onTokenCount(props.family.id, 0);
			return;
		}

		if (props.family.tokenizerType === "openai") {
			const variant = props.family.models[props.selectedIndex()];
			if (variant?.openaiModel) {
				const count = await countOpenAITokens(t, variant.openaiModel);
				if (!cancelled && callId === currentCallId) {
					setTokenCount(count);
					props.onTokenCount(props.family.id, count);
				}
			} else {
				if (!cancelled && callId === currentCallId) {
					setTokenCount(null);
					props.onTokenCount(props.family.id, null);
				}
			}
			return;
		}

		const variant = props.family.models[props.selectedIndex()];
		if (!variant?.hfModelId) {
			if (!cancelled && callId === currentCallId) {
				setTokenCount(null);
				props.onTokenCount(props.family.id, null);
			}
			return;
		}

		// Delay showing "…" by 200ms — if count finishes before that, skip loading entirely
		const loadingTimeout = setTimeout(() => {
			if (!cancelled && callId === currentCallId) {
				setHfLoading(true);
			}
		}, 200);

		setHfError(null);
		countHFTokens(t, variant.hfModelId)
			.then((count) => {
				if (!cancelled && callId === currentCallId) {
					clearTimeout(loadingTimeout);
					setTokenCount(count);
					props.onTokenCount(props.family.id, count);
					setHfLoading(false);
				}
			})
			.catch((err: Error) => {
				if (!cancelled && callId === currentCallId) {
					clearTimeout(loadingTimeout);
					setHfError(err.message);
					setTokenCount(null);
					props.onTokenCount(props.family.id, null);
					setHfLoading(false);
				}
			});
	};

	createEffect(() => {
		props.text();
		props.selectedIndex();
		countTokens();
	});

	const handleSelect = (e: Event) => {
		const idx = Number((e.currentTarget as HTMLSelectElement).value);
		props.onIndexChange(idx);
		props.onSelect(props.family.id);
	};

	const isSelected = () => props.family.id === props.selectedFamilyId();
	const variant = props.family.models[props.selectedIndex()];
	const hasModelId = variant?.hfModelId;

	return (
		<div
			class="flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors"
			classList={{
				"bg-neutral-100 dark:bg-neutral-700 border-neutral-400 dark:border-neutral-500":
					isSelected(),
				"bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700":
					!isSelected(),
			}}
			onClick={() => props.onSelect(props.family.id)}
		>
			<div class="flex items-center gap-4 min-w-0">
				<span class="text-sm font-semibold text-neutral-900 dark:text-white w-28 shrink-0">
					{props.family.name}
				</span>
				{props.family.models.length > 0 && (
					<select
						value={props.selectedIndex()}
						onChange={handleSelect}
						class="text-sm bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md px-2.5 py-1.5 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-400 cursor-pointer min-w-0"
					>
						<For each={props.family.models}>
							{(model, idx) => <option value={idx()}>{model.displayName}</option>}
						</For>
					</select>
				)}
			</div>
			<div class="text-sm tabular-nums shrink-0 ml-4 text-neutral-900 dark:text-white">
				{hfLoading() && (
					<span class="text-neutral-400 dark:text-neutral-500 italic">…</span>
				)}
				{!hfLoading() &&
					tokenCount() !== null &&
					`${tokenCount()!.toLocaleString()} tokens`}
				{!hfLoading() && props.family.tokenizerType === "hf" && !hasModelId && (
					<span class="text-neutral-400 dark:text-neutral-500">—</span>
				)}
				{hfError() && (
					<span class="text-red-600 dark:text-red-400 text-xs">Error: {hfError()}</span>
				)}
			</div>
		</div>
	);
};

const CustomCard = (props: {
	text: Accessor<string>;
	selectedFamilyId: Accessor<string>;
	modelId: Accessor<string>;
	onSelect: (familyId: string) => void;
	onTokenCount: (familyId: string, count: number | null) => void;
	onModelIdChange: (value: string) => void;
}) => {
	const [tokenCount, setTokenCount] = createSignal<number | null>(null);
	const [loading, setLoading] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	let cancelled = false;
	let inputRef: HTMLInputElement | undefined;

	onCleanup(() => {
		cancelled = true;
	});

	const countTokens = async () => {
		const t = props.text().trim();
		const id = props.modelId().trim();

		if (!t || !id) {
			setTokenCount(0);
			props.onTokenCount(CUSTOM_FAMILY_ID, 0);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const count = await countHFTokens(t, id);
			if (!cancelled) {
				setTokenCount(count);
				props.onTokenCount(CUSTOM_FAMILY_ID, count);
				setLoading(false);
			}
		} catch (err: unknown) {
			if (!cancelled) {
				const msg = err instanceof Error ? err.message : String(err);
				setError(msg);
				setTokenCount(null);
				props.onTokenCount(CUSTOM_FAMILY_ID, null);
				setLoading(false);
			}
		}
	};

	createEffect(() => {
		props.text();
		props.modelId();
		countTokens();
	});

	const isSelected = () => props.selectedFamilyId() === CUSTOM_FAMILY_ID;

	return (
		<div
			class="flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors"
			classList={{
				"bg-neutral-100 dark:bg-neutral-700 border-neutral-400 dark:border-neutral-500":
					isSelected(),
				"bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700":
					!isSelected(),
			}}
			onClick={() => {
				props.onSelect(CUSTOM_FAMILY_ID);
				inputRef?.focus();
			}}
		>
			<div class="flex items-center gap-4 min-w-0 flex-1">
				<span class="text-sm font-semibold text-neutral-900 dark:text-white w-28 shrink-0">
					Custom
				</span>
				<input
					ref={inputRef}
					type="text"
					value={props.modelId()}
					onInput={(e) => {
						e.stopPropagation();
						props.onModelIdChange(e.currentTarget.value);
					}}
					onClick={(e) => e.stopPropagation()}
					onFocus={() => props.onSelect(CUSTOM_FAMILY_ID)}
					placeholder="hf/model-id"
					class="text-sm bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md px-2.5 py-1.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 min-w-0 flex-1 max-w-[280px]"
				/>
			</div>
			<div class="text-sm tabular-nums shrink-0 ml-4 text-neutral-900 dark:text-white">
				{loading() && <span class="text-neutral-400 dark:text-neutral-500 italic">…</span>}
				{!loading() && tokenCount() !== null && `${tokenCount()!.toLocaleString()} tokens`}
				{!loading() && error() && (
					<span class="text-red-600 dark:text-red-400 text-xs">{error()}</span>
				)}
			</div>
		</div>
	);
};

const ModelSelector = (props: ModelSelectorProps) => {
	return (
		<div class="flex flex-col gap-2 w-full">
			<For each={props.families}>
				{(family) => (
					<FamilyCard
						family={family}
						text={props.text}
						selectedFamilyId={props.selectedFamilyId}
						selectedIndex={() => props.selectedModelIndices()[family.id] ?? 0}
						onSelect={props.onFamilySelect}
						onTokenCount={props.onTokenCount}
						onIndexChange={(index) => props.onModelIndexChange(family.id, index)}
					/>
				)}
			</For>
			<CustomCard
				text={props.text}
				selectedFamilyId={props.selectedFamilyId}
				modelId={props.customModelId}
				onSelect={props.onFamilySelect}
				onTokenCount={props.onTokenCount}
				onModelIdChange={props.onCustomModelIdChange}
			/>
		</div>
	);
};

export default ModelSelector;
