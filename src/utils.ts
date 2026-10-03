import fs from "node:fs";
import path from "node:path";

export const findProjectRoot = (): string | null => {
	let dir = process.cwd();
	const root = path.parse(dir).root;

	while (dir !== root) {
		if (fs.existsSync(path.join(dir, "package.json"))) {
			return dir;
		}

		dir = path.dirname(dir);
	}

	return null;
};

export const getPackageJson = (): Record<string, unknown> | null => {
	const root = findProjectRoot();

	if (!root) {
		return null;
	}

	const raw = fs.readFileSync(path.join(root, "package.json"), "utf8");

	// oxlint-disable-next-line typescript/no-unsafe-type-assertion
	return JSON.parse(raw) as Record<string, unknown>;
};

export const packageIsInstalled = (packageName: string): boolean => {
	const pkg = getPackageJson();

	if (!pkg) {
		return false;
	}

	const dependencies = pkg["dependencies"];
	const devDependencies = pkg["devDependencies"];

	return (
		(typeof dependencies === "object" &&
			dependencies !== null &&
			packageName in dependencies) ||
		(typeof devDependencies === "object" &&
			devDependencies !== null &&
			packageName in devDependencies)
	);
};

export type PackageManager = "pnpm" | "bun" | "yarn" | "npm";

export const getPackageManager = (): PackageManager => {
	const packageManager = getPackageJson()?.["packageManager"];

	if (typeof packageManager === "string") {
		if (packageManager.startsWith("pnpm@")) {
			return "pnpm";
		}

		if (packageManager.startsWith("bun@")) {
			return "bun";
		}

		if (packageManager.startsWith("yarn@")) {
			return "yarn";
		}
	}

	return "npm";
};

export const hasTsconfigReferences = (): boolean => {
	const root = findProjectRoot();

	if (!root) {
		return false;
	}

	const tsconfigPath = path.join(root, "tsconfig.json");

	if (!fs.existsSync(tsconfigPath)) {
		return false;
	}

	const raw = fs.readFileSync(tsconfigPath, "utf8");

	try {
		const parsed: unknown = JSON.parse(raw);
		const references =
			typeof parsed === "object" && parsed !== null && "references" in parsed
				? parsed.references
				: undefined;

		return Array.isArray(references) && references.length > 0;
	} catch {
		// tsconfig.json may contain comments or trailing commas, fall back to a text check
		return /"references"\s*:\s*\[/.test(raw);
	}
};

export const detectIgnorePatterns = (): string[] => {
	const patterns: string[] = [];

	if (packageIsInstalled("nitro")) {
		patterns.push(".output", ".nitro");
	}

	if (packageIsInstalled("happy-css-modules")) {
		patterns.push("**/*.module.css.d.ts");
	}

	if (
		packageIsInstalled("@tanstack/react-router") ||
		packageIsInstalled("@tanstack/router-plugin")
	) {
		patterns.push("**/routeTree.gen.ts");
	}

	if (packageIsInstalled("vitest")) {
		patterns.push("coverage");
	}

	return patterns;
};
