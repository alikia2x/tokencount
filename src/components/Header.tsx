const Header = () => {
	return (
		<header class="mb-8">
			<div class="flex items-center justify-between">
				<h1 class="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
					Token Counter
				</h1>
				<a
					href="https://github.com/alikia2x/tokencount"
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
				>
					GitHub
				</a>
			</div>
			<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
				Paste text to count tokens across popular models.
			</p>
		</header>
	);
};

export default Header;
