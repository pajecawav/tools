import type { ArgsDef, CommandDef } from "citty";
import { defineCommand } from "citty";
import { execa } from "execa";

export const prepare: CommandDef<ArgsDef> = defineCommand({
	meta: {
		name: "prepare",
	},
	async run() {
		const result = await execa("husky", { stdout: "inherit", stderr: "inherit" });

		if (result.exitCode !== 0) {
			process.exit(result.exitCode);
		}
	},
});
