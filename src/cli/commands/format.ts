import { createRequire } from "node:module";
import path from "node:path";
import type { ArgsDef, CommandDef } from "citty";
import { defineCommand } from "citty";
import { execa } from "execa";
import { packageIsInstalled } from "#/src/utils.js";

export const format: CommandDef<ArgsDef> = defineCommand({
	meta: {
		name: "format",
		description: "Format all files",
	},
	async run({ args }) {
		const require = createRequire(import.meta.url);

		const isOxfmt = packageIsInstalled("oxfmt");

		const bin = isOxfmt
			? path.join(path.dirname(path.dirname(require.resolve("oxfmt"))), "bin", "oxfmt")
			: require.resolve("prettier/bin/prettier.cjs");

		const files = args._.length ? args._ : ["."];

		const result = await execa(bin, ["--write", ...files], {
			stdout: "inherit",
			stderr: "inherit",
		});

		process.exit(result.exitCode);
	},
});
