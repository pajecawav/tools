import type { ArgsDef, CommandDef } from "citty";
import { defineCommand } from "citty";
import { consola } from "consola";
import { initHooks } from "#/src/tools/hooks/index.js";
import { initOxfmt } from "#/src/tools/oxfmt/index.js";
import { initPrettier } from "#/src/tools/prettier/index.js";

export const init: CommandDef<ArgsDef> = defineCommand({
	meta: {
		name: "init",
		description: "Initialize tools",
	},
	async run() {
		const formatter = await consola
			.prompt("Which formatter would you like to use?", {
				type: "select",
				options: ["oxfmt", "prettier"],
				initial: "oxfmt",
				cancel: "reject",
			})
			.catch(() => process.exit(1));

		consola.info("Initializing hooks...");
		await initHooks();

		consola.info(`Initializing ${formatter}...`);
		const initFormatter = formatter === "oxfmt" ? initOxfmt : initPrettier;

		await initFormatter();
	},
});
