import fs from "node:fs";
import type { ArgsDef, CommandDef } from "citty";
import { defineCommand } from "citty";
import { consola } from "consola";
import { execa } from "execa";
import lintStaged from "lint-staged";
import { loadConfig } from "#/src/config.js";
import { getPackageManager } from "#/src/utils.js";

interface StagedArgs extends ArgsDef {
	changeset: {
		type: "boolean";
		description: string;
	};
}

const checkChangeset = async (): Promise<boolean> => {
	// Repos without changesets and merge commits don't need one
	if (!fs.existsSync(".changeset") || fs.existsSync(".git/MERGE_HEAD")) {
		return true;
	}

	const packageManager = getPackageManager();

	const changesetCommand =
		packageManager === "bun"
			? { file: "bunx", args: ["changeset", "status"] }
			: packageManager === "pnpm"
				? { file: "pnpm", args: ["exec", "changeset", "status"] }
				: { file: "npx", args: ["changeset", "status"] };

	const result = await execa(changesetCommand.file, changesetCommand.args, {
		reject: false,
		stdout: "inherit",
		stderr: "inherit",
	});

	if (result.exitCode !== 0) {
		consola.error("Add a changeset and `git add` it, or commit with --no-verify to skip.");

		return false;
	}

	return true;
};

export const staged: CommandDef<StagedArgs> = defineCommand<StagedArgs>({
	meta: {
		name: "staged",
		description: "Lint staged files",
	},
	args: {
		changeset: {
			type: "boolean",
			description: "Require a changeset (overrides tools.config.ts)",
		},
	},
	async run({ args }) {
		const { config } = await loadConfig();

		if ((args.changeset ?? config.changesets) && !(await checkChangeset())) {
			process.exit(1);
		}

		const success = await lintStaged({ config: config.staged });

		if (!success) {
			process.exit(1);
		}
	},
});
