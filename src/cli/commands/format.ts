import type { ArgsDef, CommandDef } from "citty";
import { defineCommand } from "citty";
import { consola } from "consola";
import { execa } from "execa";
import { resolveFormatterBin } from "#/src/cli/run.js";

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
		const bin = resolveFormatterBin();

		if (!bin) {
			consola.error("Neither oxfmt nor prettier is installed");
			process.exit(1);
		}

		const files = args._.length ? args._ : ["."];

		const result = await execa(bin, [args.check ? "--check" : "--write", ...files], {
			reject: false,
			stdout: "inherit",
			stderr: "inherit",
		});

		process.exit(result.exitCode);
	},
});
