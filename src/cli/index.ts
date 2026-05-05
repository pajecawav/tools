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
		format: () => import("./commands/format.js").then(mod => mod.format),
		prepare: () => import("./commands/prepare.js").then(mod => mod.prepare),
		init: () => import("./commands/init.js").then(mod => mod.init),
	},
});

await runMain(main);
