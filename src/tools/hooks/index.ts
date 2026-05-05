import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";

const DEFAULT_HOOKS = {
	"pre-commit": "pt staged",
};

export const initHooks = async (): Promise<void> => {
	if (!fs.existsSync(".git")) {
		throw new Error("Must be run in the root of a git repository");
	}

	const initHuskyResult = await execa("husky", { stdout: "inherit", stderr: "inherit" });

	if (initHuskyResult.exitCode !== 0) {
		process.exit(initHuskyResult.exitCode);
	}

	const huskyDir = path.join(process.cwd(), ".husky");

	for (const [hook, command] of Object.entries(DEFAULT_HOOKS)) {
		const hookPath = path.join(huskyDir, hook);

		if (!fs.existsSync(hookPath)) {
			await fsp.writeFile(hookPath, command, { mode: 0o755 });
		}
	}
};
