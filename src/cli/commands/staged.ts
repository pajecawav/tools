import type { CommandDef } from "citty";
import { defineCommand } from "citty";
import lintStaged from "lint-staged";
import { loadConfig } from "#/src/config.js";

export const staged: CommandDef = defineCommand({
	meta: {
		name: "staged",
		description: "Lint staged files",
	},
	async run() {
		const { config } = await loadConfig();

		const success = await lintStaged({ config: config.staged });

		if (!success) {
			process.exit(1);
		}
	},
});
