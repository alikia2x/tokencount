import { For, type JSX } from "solid-js";

interface FAQType {
	question: string;
	answer: JSX.Element;
}

const faqData: FAQType[] = [
	{
		question: "What are tokens?",
		answer: (
			<>
				Tokens are chunks of text that language models process as individual units. A token
				can be a word, a subword, or even a single character — depending on how the model's
				tokenizer splits the text. For example, "Hello, world!" might be tokenized into 3–5
				tokens depending on the model.
			</>
		),
	},
	{
		question: "Why do token counts differ between models?",
		answer: (
			<>
				Each model family uses its own tokenizer with different vocabularies and algorithms.
				This means the same text can yield different token counts across models.
			</>
		),
	},
	{
		question: "Why does token count matter?",
		answer: (
			<>
				LLMs have a maximum context window measured in tokens. Knowing your token count
				helps you estimate costs (most APIs bill per token) and stay within context limits
				when crafting prompts or processing documents.
			</>
		),
	},
	{
		question: "Is this counter accurate?",
		answer: (
			<>
				Yes, our counter aligns with the official results for most models. The only
				exceptions are Gemini and Kimi, for which we provide highly accurate estimations.
				Please note that real token usage in production may be slightly higher (by a few to
				a few dozen tokens) than these figures, due to the addition of special tokens
				required by specific model architectures or system prompts.
			</>
		),
	},
	{
		question: "Is my data private?",
		answer: (
			<>
				Yes. Our token counter runs entirely within your browser. While it does need to
				download some dictionary files initially to perform accurate tokenization, all
				processing happens locally on your device, and none of your text data is ever sent
				to or stored on our servers.
			</>
		),
	},
	{
		question: "Where is Claude?",
		answer: (
			<>
				Unfortunately, it is currently impossible to count tokens for Claude models locally
				because Anthropic has not publicly released their tokenizer vocabularies. If you
				need to count tokens for Claude models, we recommend using{" "}
				<a
					href="https://claude-tokenizer.vercel.app/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-neutral-700 dark:text-neutral-300 underline underline-offset-4 hover:text-neutral-900 dark:hover:text-neutral-100"
				>
					this website by Shaf
				</a>
				. However, please be aware that the site sends your text content to their server to
				forward to Anthropic's internal servers, so privacy-focused users may check their
				corresponding privacy policy first.
			</>
		),
	},
];

function FAQItem(props: FAQType) {
	return (
		<details class="py-3 md:even:pl-6 group">
			<summary class="marker:content-none flex items-center justify-between cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
				<span>{props.question}</span>
				<svg
					class="faq-chevron w-4 h-4 shrink-0 ml-2 transition-transform duration-200 group-open:rotate-180"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
					/>
				</svg>
			</summary>
			<div class="faq-content">
				<div>
					<p class="pt-2 leading-relaxed">{props.answer}</p>
				</div>
			</div>
		</details>
	);
}

export function FAQ() {
	return (
		<section class="mt-16 text-sm text-neutral-500 dark:text-neutral-400">
			<h2 class="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
				Frequently Asked Questions
			</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
				<For each={faqData}>
					{(item) => <FAQItem question={item.question} answer={item.answer} />}
				</For>
			</div>
		</section>
	);
}
