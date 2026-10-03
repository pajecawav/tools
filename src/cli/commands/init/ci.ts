import fs from "node:fs";
import type { CommandDef } from "citty";
import { defineCommand } from "citty";
import { consola } from "consola";
import { ciWorkflowExists, writeCiWorkflow, type CiWorkflowOptions } from "#/src/tools/ci/index.js";
import { getPackageManager, packageIsInstalled } from "#/src/utils.js";

export const initCi: CommandDef = defineCommand({
	meta: {
		name: "init ci",
		description: "Create a GitHub Actions CI workflow",
	},
	async run() {
		if (!process.stdin.isTTY) {
			consola.error("pt init ci requires an interactive terminal");
			process.exit(1);
		}

		const detected = getPackageManager();

		const packageManagerAnswer = await consola
			.prompt("Which package manager does CI use?", {
				type: "select",
				options: ["pnpm", "bun"],
				initial: detected === "bun" ? "bun" : "pnpm",
				cancel: "reject",
			})
			.catch(() => process.exit(1));

		const test = await consola
			.prompt("Add a test step?", {
				type: "confirm",
				initial: packageIsInstalled("vitest"),
			})
			.catch(() => process.exit(1));

		const e2e = await consola
			.prompt("Add a Playwright e2e step?", {
				type: "confirm",
				initial: packageIsInstalled("@playwright/test"),
			})
			.catch(() => process.exit(1));

		if (ciWorkflowExists()) {
			const overwrite = await consola
				.prompt(".github/workflows/ci.yml already exists. Overwrite?", {
					type: "confirm",
					initial: false,
				})
				.catch(() => process.exit(1));

			if (!overwrite) {
				consola.info("Skipped");

				return;
			}
		}

		const workflowPath = await writeCiWorkflow({
			packageManager: packageManagerAnswer === "bun" ? "bun" : "pnpm",
			test,
			e2e,
			nodeVersionFile: fs.existsSync(".node-version"),
			bunVersionFile: fs.existsSync(".bun-version"),
		} satisfies CiWorkflowOptions);

		consola.success(`Created ${workflowPath}`);
	},
});
