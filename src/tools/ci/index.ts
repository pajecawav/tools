import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

export interface CiWorkflowOptions {
	packageManager: "pnpm" | "bun";
	test: boolean;
	e2e: boolean;
	nodeVersionFile: boolean;
	bunVersionFile: boolean;
}

const WORKFLOW_PATH = path.join(".github", "workflows", "ci.yml");

const run = (name: string, command: string): string[] => [
	`            - name: ${name}`,
	`              run: ${command}`,
];

export const renderCiWorkflow = (options: CiWorkflowOptions): string => {
	const { packageManager } = options;
	const lines: string[] = [
		"name: CI",
		"",
		"on:",
		"    push:",
		"        branches: [master]",
		"    pull_request:",
		"        branches: [master]",
		"",
		"jobs:",
		"    ci:",
		"        runs-on: ubuntu-latest",
		"        steps:",
		"            - uses: actions/checkout@v7",
		"",
	];

	if (packageManager === "pnpm") {
		lines.push("            - uses: pnpm/action-setup@v6", "");

		if (options.nodeVersionFile) {
			lines.push(
				"            - uses: actions/setup-node@v7",
				"              with:",
				"                  node-version-file: .node-version",
				"                  cache: pnpm",
				"",
			);
		} else {
			lines.push(
				"            - uses: actions/setup-node@v7",
				"              with:",
				"                  cache: pnpm",
				"",
			);
		}
	} else {
		lines.push("            - uses: oven-sh/setup-bun@v2");

		if (options.bunVersionFile) {
			lines.push("              with:", "                  bun-version-file: .bun-version");
		}

		lines.push(
			"",
			"            - name: Cache bun packages",
			"              uses: actions/cache@v6",
			"              with:",
			"                  path: ~/.bun/install/cache",
			"                  key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}",
			"",
		);
	}

	const pmRun = (script: string): string =>
		packageManager === "pnpm" ? `pnpm run ${script}` : `bun run ${script}`;

	lines.push(
		...run(
			"Install dependencies",
			packageManager === "pnpm"
				? "pnpm install --frozen-lockfile"
				: "bun install --frozen-lockfile",
		),
	);
	lines.push("");
	lines.push(...run("Build", pmRun("build")));
	lines.push("");
	lines.push(...run("Lint", pmRun("lint")));

	if (options.test) {
		lines.push("");
		lines.push(...run("Test", pmRun("test")));
	}

	if (options.e2e) {
		lines.push("");
		lines.push(
			...run(
				"Install Playwright browsers",
				packageManager === "pnpm"
					? "pnpm exec playwright install chromium --with-deps"
					: "bunx playwright install chromium --with-deps",
			),
		);
		lines.push("");
		lines.push(...run("E2E", pmRun("e2e")));
	}

	lines.push("");

	return lines.join("\n");
};

export const ciWorkflowExists = (): boolean => fs.existsSync(WORKFLOW_PATH);

export const writeCiWorkflow = async (options: CiWorkflowOptions): Promise<string> => {
	await fsp.mkdir(path.dirname(WORKFLOW_PATH), { recursive: true });
	await fsp.writeFile(WORKFLOW_PATH, renderCiWorkflow(options), { mode: 0o644 });

	return WORKFLOW_PATH;
};
