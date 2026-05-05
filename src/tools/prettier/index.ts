import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import defaultConfig from "@pajecawav/prettier-config";
import { defu } from "defu";
import type { Config } from "prettier";

const CONFIG_FILE_NAME = "prettier.config.ts";
const CONFIG_TEMPLATE = `
import { definePrettierConfig } from "@pajecawav/tools";

export default definePrettierConfig();
`.trim();

export const definePrettierConfig = (config?: Config): Config => {
	return defu(config, defaultConfig);
};

export const initPrettier = async (): Promise<void> => {
	const configPath = path.join(process.cwd(), CONFIG_FILE_NAME);

	if (!fs.existsSync(configPath)) {
		await fsp.writeFile(configPath, CONFIG_TEMPLATE, { mode: 0o644 });
	}
};
