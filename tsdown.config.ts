import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/index.ts", "./src/cli.ts"],
	unbundle: true,
	platform: "node",
	dts: true,
	exports: {
		enabled: true,
		bin: {
			pt: "./src/cli.ts",
		},
	},
	tsconfig: "./tsconfig.lib.json",
});
