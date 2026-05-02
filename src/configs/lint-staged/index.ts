import defu from "defu";
import type { Configuration } from "lint-staged";

export const defineLintStagedConfig = (config?: Configuration): Configuration => {
	return defu(config, {
		"*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}": [
			"prettier --write",
			() => "eslint .",
			() => "pnpm lint:tsc",
		],
		"*.{json,md,yml,yaml,css}": "prettier --write",
	});
};
