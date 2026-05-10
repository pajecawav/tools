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
