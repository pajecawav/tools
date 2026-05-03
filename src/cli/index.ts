#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import pkg from "../../package.json" with { type: "json" };

const main = defineCommand({
	meta: {
		name: "pt",
		description: "Personal tools",
		version: pkg.version,
	},
	subCommands: {
		staged: () => import("./commands/staged.js").then(mod => mod.staged),
	},
});

await runMain(main);
