import defaultConfig from "@pajecawav/prettier-config";
import { defu } from "defu";
import type { Config } from "prettier";

export const definePrettierConfig = (config?: Config): Config => {
	return defu(config, defaultConfig);
};
