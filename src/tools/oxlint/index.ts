import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import defu from "defu";
import { type OxlintConfig } from "oxlint";

const CONFIG_FILE_NAME = "oxlint.config.ts";
const CONFIG_TEMPLATE = `
import { defineOxlintConfig } from "@pajecawav/tools";

export default defineOxlintConfig();
`.trim();

const defaultConfig: OxlintConfig = {
	plugins: ["unicorn", "typescript", "oxc"],
	categories: {
		correctness: "error",
		suspicious: "warn",
		perf: "warn",
	},
	options: {
		typeAware: true,
	},
	rules: {
		"no-shadow": "off",
		"no-underscore-dangle": "off",
		"typescript/consistent-return": "off",
		"typescript/no-explicit-any": "off",
		"typescript/no-unsafe-type-assertion": "off",
		"unicorn/consistent-function-scoping": "off",
	},
};

export const defineOxlintConfig = (config?: OxlintConfig): OxlintConfig => {
	return defu(config, defaultConfig);
};

export const initOxlint = async (): Promise<void> => {
	const configPath = path.join(process.cwd(), CONFIG_FILE_NAME);

	if (!fs.existsSync(configPath)) {
		await fsp.writeFile(configPath, CONFIG_TEMPLATE, { mode: 0o644 });
	}
};
