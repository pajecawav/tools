import type { ArgsDef, CommandDef } from "citty";
import { defineCommand } from "citty";
import { execa } from "execa";
import { createRequire } from "node:module";

export const format: CommandDef<ArgsDef> = defineCommand({
	meta: {
		name: "format",
		description: "Format all files",
	},
	async run({ args }) {
		const require = createRequire(import.meta.url);
		const prettierBin = require.resolve("prettier/bin/prettier.cjs");

		const files = args._.length ? args._ : ["."];

		const result = await execa(prettierBin, ["--write", ...files], {
			stdout: "inherit",
			stderr: "inherit",
		});

		process.exit(result.exitCode);
	},
});
