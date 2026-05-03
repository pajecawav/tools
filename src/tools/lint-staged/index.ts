import defu from "defu";
import type { Configuration } from "lint-staged";

export type StagedConfig = Configuration;

export const defineLintStagedConfig = (config?: StagedConfig): StagedConfig => {
	return defu(config, {
		"*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}": [
			"prettier --write",
			() => "eslint .",
			() => "pnpm lint:tsc",
		],
		"*.{json,md,yml,yaml,css}": "prettier --write",
	});
};
