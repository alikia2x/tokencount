import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";
import path from "node:path";

export default defineConfig({
	plugins: [devtools(), solidPlugin(), tailwindcss()],
	server: {
		port: 3000,
	},
	build: {
		target: "esnext",
	},
	worker: {
		format: "es",
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./src"),
		},
	},
});
