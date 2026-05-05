import { initHooks } from "#/src/tools/hooks/index.js";
import { initPrettier } from "#/src/tools/prettier/index.js";
import type { ArgsDef, CommandDef } from "citty";
import { defineCommand } from "citty";

export const init: CommandDef<ArgsDef> = defineCommand({
	meta: {
		name: "init",
		description: "Initialize tools",
	},
	async run() {
		await initHooks();
		// TODO: prompt prettier or oxfmt
		await initPrettier();
	},
});
