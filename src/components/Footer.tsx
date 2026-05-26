import pkg from "../../package.json";

const Footer = () => {
	return (
		<footer class="border-t border-neutral-200 dark:border-neutral-700 mt-16 pt-6 pb-8">
			<div class="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
				<p>
					© {new Date().getFullYear()}{" "}
					<a
						href="https://alikia2x.com"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
					>
						alikia2x
					</a>
				</p>
				<span>v{pkg.version}</span>
			</div>
		</footer>
	);
};

export default Footer;
