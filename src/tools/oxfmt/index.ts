import defu from "defu";
import type { OxfmtConfig } from "oxfmt";

const defaultConfig: OxfmtConfig = {
	printWidth: 100,
	useTabs: true,
	tabWidth: 4,
	arrowParens: "avoid",
	trailingComma: "all",
	sortPackageJson: false,
	ignorePatterns: [],
	sortImports: true,
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
