import defu from "defu";
import type { Configuration } from "lint-staged";
import { packageIsInstalled } from "#/src/utils.js";

export type StagedConfig = Configuration;

export const defineLintStagedConfig = (config?: StagedConfig): StagedConfig => {
	const hasOxfmt = packageIsInstalled("oxfmt");
	const hasPrettier = packageIsInstalled("prettier");
	const formatter = hasOxfmt ? "oxfmt" : hasPrettier ? "prettier" : null;

	const hasOxlint = packageIsInstalled("oxlint") ? "oxlint" : null;

	const hasTypescript = packageIsInstalled("typescript") ? "tsc" : null;

	return defu(config, {
		"*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}": [
			formatter && `${formatter} --write`,
			hasOxlint && (() => "oxlint ."),
			hasTypescript && (() => `${hasTypescript} -b --noEmit`),
		].filter(x => x !== null),
		"*.{json,md,yml,yaml,css,scss,sass}": `${formatter} --write`,
	});
};
