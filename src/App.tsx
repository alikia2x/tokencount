import { createSignal, createMemo, createEffect } from "solid-js";
import Header from "./components/Header";
import TextInput from "./components/TextInput";
import TokenDisplay from "./components/TokenDisplay";
import ModelSelector from "./components/ModelSelector";
import Footer from "./components/Footer";
import { MODEL_FAMILIES } from "./utils/models";
import { FAQ } from "./components/FAQ";

function persistedSignal<T>(key: string, fallback: T) {
	const stored = localStorage.getItem(key);
	const initial: T = stored !== null ? (JSON.parse(stored) as T) : fallback;
	const [value, setValue] = createSignal(initial);
	createEffect(() => localStorage.setItem(key, JSON.stringify(value())));
	return [value, setValue] as const;
}

const App = () => {
	const [text, setText] = createSignal("");

	const charCount = createMemo(() => text().trim().length);

	const [selectedFamilyId, setSelectedFamilyId] = persistedSignal("tc_family", "openai");
	const [familyTokenCounts, setFamilyTokenCounts] = createSignal<Record<string, number | null>>(
		{}
	);
	const [selectedModelIndices, setSelectedModelIndices] = persistedSignal<Record<string, number>>(
		"tc_models",
		{}
	);
	const [customModelId, setCustomModelId] = persistedSignal("tc_custom", "");

	const displayTokenCount = createMemo(() => {
		const count = familyTokenCounts()[selectedFamilyId()];
		return count;
	});

	const handleFamilySelect = (familyId: string) => {
		setSelectedFamilyId(familyId);
	};

	const handleTokenCount = (familyId: string, count: number | null) => {
		setFamilyTokenCounts((prev) => ({ ...prev, [familyId]: count }));
	};

	const handleModelIndexChange = (familyId: string, index: number) => {
		setSelectedModelIndices((prev) => ({ ...prev, [familyId]: index }));
	};

	return (
		<div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
			<div class="max-w-6xl mx-auto">
				<Header />

				<div class="flex flex-col lg:flex-row gap-8">
					<div class="flex-1 lg:min-w-0">
						<TextInput text={text} setText={setText} />
					</div>

					<div class="flex-1 lg:min-w-0 flex flex-col gap-8">
						<TokenDisplay tokenCount={displayTokenCount()} charCount={charCount()} />

						<ModelSelector
							families={MODEL_FAMILIES}
							text={text}
							selectedFamilyId={selectedFamilyId}
							onFamilySelect={handleFamilySelect}
							onTokenCount={handleTokenCount}
							selectedModelIndices={selectedModelIndices}
							onModelIndexChange={handleModelIndexChange}
							customModelId={customModelId}
							onCustomModelIdChange={setCustomModelId}
						/>
					</div>
				</div>

				<FAQ />

				<Footer />
			</div>
		</div>
	);
};

export default App;
