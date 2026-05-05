import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import defu from "defu";
import type { OxfmtConfig } from "oxfmt";

const CONFIG_FILE_NAME = "oxfmt.config.ts";
const CONFIG_TEMPLATE = `
import { defineOxfmtConfig } from "@pajecawav/tools";

export default defineOxfmtConfig();
`.trim();

const defaultConfig: OxfmtConfig = {
	printWidth: 100,
	useTabs: true,
	tabWidth: 4,
	arrowParens: "avoid",
	trailingComma: "all",
	sortPackageJson: false,
	ignorePatterns: [],
	sortImports: {
		newlinesBetween: false,
	},
	overrides: [
		{
			files: ["*.md"],
			options: {
				useTabs: false,
			},
		},
		{
			files: ["tsconfig.json", "tsconfig.*.json"],
			options: {
				parser: "json",
				trailingComma: "none",
			},
		},
	],
};

export const defineOxfmtConfig = (config?: OxfmtConfig): OxfmtConfig => {
	return defu(config, defaultConfig);
};

export const initOxfmt = async (): Promise<void> => {
	const configPath = path.join(process.cwd(), CONFIG_FILE_NAME);

	if (!fs.existsSync(configPath)) {
		await fsp.writeFile(configPath, CONFIG_TEMPLATE, { mode: 0o644 });
	}
};
