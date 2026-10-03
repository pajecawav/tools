import type { CommandDef } from "citty";
import { defineCommand } from "citty";
import { consola } from "consola";
import type { TaskResult } from "#/src/cli/run.js";
import { resolveFormatterBin, resolvePackageBin, runTask } from "#/src/cli/run.js";
import { loadConfig } from "#/src/config.js";
import { getPackageJson, hasTsconfigReferences, packageIsInstalled } from "#/src/utils.js";

interface Step {
	label: string;
	task: Promise<TaskResult> | null;
	skipReason?: string;
}

type Outcome =
	| { label: string; status: "pass" }
	| { label: string; status: "fail"; exitCode: number }
	| { label: string; status: "skip"; reason: string | undefined };

const runSteps = async (steps: Step[]): Promise<Outcome[]> => {
	return Promise.all(
		steps.map(async (step): Promise<Outcome> => {
			if (!step.task) {
				return { label: step.label, status: "skip", reason: step.skipReason };
			}

			const result = await step.task;

			return result.exitCode === 0
				? { label: step.label, status: "pass" }
				: { label: result.label, status: "fail", exitCode: result.exitCode };
		}),
	);
};

export const lint: CommandDef = defineCommand({
	meta: {
		name: "lint",
		description: "Run all linters in parallel",
	},
	async run() {
		const { config } = await loadConfig();

		const steps: Step[] = [];

		const oxlint = packageIsInstalled("oxlint")
			? runTask("oxlint", resolvePackageBin("oxlint"), ["."])
			: null;
		steps.push({
			label: "oxlint",
			task: oxlint,
			skipReason: oxlint ? undefined : "oxlint is not installed",
		});

		const formatterBin = resolveFormatterBin();
		const format = formatterBin ? runTask("format", formatterBin, ["--check", "."]) : null;
		steps.push({
			label: "format",
			task: format,
			skipReason: formatterBin ? undefined : "neither oxfmt nor prettier is installed",
		});

		const typecheck = config.lint.typecheck;
		let typecheckTask: Promise<TaskResult> | null = null;
		let typecheckSkipReason: string | undefined;

		if (typecheck === false) {
			typecheckSkipReason = "disabled in tools.config.ts";
		} else if (typeof typecheck === "string") {
			typecheckTask = runTask("typecheck", typecheck, [], { shell: true });
		} else if (packageIsInstalled("typescript")) {
			const args = hasTsconfigReferences() ? ["-b", "--noEmit"] : ["--noEmit"];
			typecheckTask = runTask("typecheck", resolvePackageBin("typescript", "tsc"), args);
		} else {
			typecheckSkipReason = "typescript is not installed";
		}

		steps.push({
			label: "typecheck",
			task: typecheckTask,
			skipReason: typecheckSkipReason,
		});

		const isPrivate = getPackageJson()?.["private"] === true;
		const publintEnabled = config.lint.publint ?? !isPrivate;
		const publint =
			publintEnabled && packageIsInstalled("publint")
				? runTask("publint", resolvePackageBin("publint"))
				: null;
		steps.push({
			label: "publint",
			task: publint,
			skipReason: publint
				? undefined
				: publintEnabled
					? "publint is not installed"
					: "disabled for private packages",
		});

		const outcomes = await runSteps(steps);

		for (const outcome of outcomes) {
			if (outcome.status === "skip") {
				consola.warn(`${outcome.label}: skipped (${outcome.reason})`);
			}
		}

		const failed = outcomes.filter(outcome => outcome.status === "fail");

		if (failed.length > 0) {
			consola.error(`Failed: ${failed.map(outcome => outcome.label).join(", ")}`);
			process.exit(1);
		}

		const passed = outcomes.filter(outcome => outcome.status === "pass").length;
		consola.success(`Lint passed (${passed} tasks)`);
	},
});
