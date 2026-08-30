import { createRequire } from "node:module";
import path from "node:path";
import type { ArgsDef, CommandDef } from "citty";
import { defineCommand } from "citty";
import { execa } from "execa";
import { packageIsInstalled } from "#/src/utils.js";

interface FormatArgs extends ArgsDef {
	check: {
		type: "boolean";
		description: string;
	};
}

export const format: CommandDef<FormatArgs> = defineCommand<FormatArgs>({
	meta: {
		name: "format",
		description: "Format all files",
	},
	args: {
		check: {
			type: "boolean",
			description: "Check formatting without writing files",
		},
	},
	async run({ args }) {
		const require = createRequire(import.meta.url);

		const isOxfmt = packageIsInstalled("oxfmt");

		const bin = isOxfmt
			? path.join(path.dirname(path.dirname(require.resolve("oxfmt"))), "bin", "oxfmt")
			: require.resolve("prettier/bin/prettier.cjs");

		const files = args._.length ? args._ : ["."];

		const result = await execa(bin, [args.check ? "--check" : "--write", ...files], {
			reject: false,
			stdout: "inherit",
			stderr: "inherit",
		});

		process.exit(result.exitCode);
	},
});
