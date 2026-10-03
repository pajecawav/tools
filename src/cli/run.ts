import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { consola } from "consola";
import { execa } from "execa";
import { packageIsInstalled } from "#/src/utils.js";

/**
 * Resolve a bin script of an installed package.
 * Falls back to the bare bin name when the package is not resolvable
 * from here (relying on `node_modules/.bin` in `PATH` of package scripts).
 */
export const resolvePackageBin = (packageName: string, binName: string = packageName): string => {
	const require = createRequire(import.meta.url);

	try {
		const packageJsonPath = require.resolve(`${packageName}/package.json`);
		const raw: unknown = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
		// oxlint-disable-next-line typescript/no-unsafe-type-assertion
		const bin = (
			typeof raw === "object" && raw !== null && "bin" in raw ? raw.bin : undefined
		) as string | Record<string, string> | undefined;
		const binPath =
			typeof bin === "string"
				? bin
				: bin !== null && bin !== undefined && binName in bin
					? bin[binName]
					: undefined;

		if (binPath) {
			return path.join(path.dirname(packageJsonPath), binPath);
		}
	} catch {
		// Not resolvable from this module (e.g. not a peer dependency), use PATH lookup
	}

	return binName;
};

export const resolveFormatterBin = (): string | null => {
	if (packageIsInstalled("oxfmt")) {
		return resolvePackageBin("oxfmt");
	}

	if (packageIsInstalled("prettier")) {
		return resolvePackageBin("prettier");
	}

	return null;
};

export interface TaskResult {
	label: string;
	exitCode: number;
}

interface RunTaskOptions {
	shell?: boolean;
}

const taskEnv = (): NodeJS.ProcessEnv => ({
	...process.env,
	FORCE_COLOR: "1",
});

/** Run a command and prefix each output line with a task label. */
export const runTask = (
	label: string,
	command: string,
	args: string[] = [],
	options: RunTaskOptions = {},
): Promise<TaskResult> => {
	const tagged = consola.withTag(label);
	const child = options.shell
		? execa(command, { reject: false, all: true, shell: true, env: taskEnv() })
		: execa(command, args, { reject: false, all: true, env: taskEnv() });

	const stream = child.all;

	if (stream) {
		stream.setEncoding("utf8");

		void (async () => {
			let buffer = "";

			try {
				for await (const chunk of stream) {
					buffer += chunk;
					const lines = buffer.split("\n");
					buffer = lines.pop() ?? "";

					for (const line of lines) {
						tagged.log(line);
					}
				}

				if (buffer.length > 0) {
					tagged.log(buffer);
				}
			} catch {
				// Stream errors surface through the child process result
			}
		})();
	}

	return child.then(result => ({ label, exitCode: result.exitCode ?? 1 }));
};
