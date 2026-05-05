import defu from "defu";
import type { Configuration } from "lint-staged";
import { packageIsInstalled } from "#/src/utils.js";

export type StagedConfig = Configuration;

export const defineLintStagedConfig = (config?: StagedConfig): StagedConfig => {
	const formatter = packageIsInstalled("oxfmt") ? "oxfmt" : "prettier";

	return defu(config, {
		"*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}": [
			`${formatter} --write`,
			() => "eslint .",
			() => "tsc -b --noEmit",
		],
		"*.{json,md,yml,yaml,css}": `${formatter} --write`,
	});
};
