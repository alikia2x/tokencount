import type { Accessor, Setter } from "solid-js";

interface TextInputProps {
	text: Accessor<string>;
	setText: Setter<string>;
}

const TextInput = (props: TextInputProps) => {
	const handleClear = () => {
		props.setText("");
	};

	return (
		<div class="w-full">
			<textarea
				value={props.text()}
				onInput={(e) => props.setText(e.currentTarget.value)}
				placeholder="Paste or type your text here…"
				rows="12"
				class="w-full p-5 text-base text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-y min-h-[300px] focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent transition-shadow placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
			/>
			<div class="mt-2 flex items-center justify-between text-sm text-neutral-400 dark:text-neutral-500">
				<button
					type="button"
					onClick={handleClear}
					class={
						`px-2.5 py-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700
				 dark:hover:text-neutral-200 transition-colors ` +
						(props.text().length > 0 && "invisible")
					}
				>
					Clear
				</button>
				<span class="tabular-nums">{props.text().length.toLocaleString()} characters</span>
			</div>
		</div>
	);
};

export default TextInput;
