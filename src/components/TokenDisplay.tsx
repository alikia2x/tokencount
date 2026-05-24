interface TokenDisplayProps {
	tokenCount: number;
	charCount: number;
	loading: boolean;
}

const TokenDisplay = (props: TokenDisplayProps) => {
	return (
		<div class="flex flex-col items-start">
			<div class="flex items-baseline gap-2">
				<span
					class="text-6xl font-light tabular-nums text-neutral-900 dark:text-white leading-none"
					classList={{
						"opacity-50 animate-pulse": props.loading && props.tokenCount === 0,
					}}
				>
					{props.loading && props.tokenCount === 0
						? "…"
						: props.tokenCount.toLocaleString()}
				</span>
				<span class="text-2xl text-neutral-400 dark:text-neutral-500">
					tokens
				</span>
			</div>
		</div>
	);
};

export default TokenDisplay;
