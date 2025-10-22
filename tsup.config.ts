import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	sourcemap: true,
	clean: true,
	dts: true,
	minify: false,
	target: "es2022",
	outDir: "dist",
	external: ["openmeteo", "i18next"],
	splitting: false,
	skipNodeModulesBundle: true,
	treeshake: true,
});
