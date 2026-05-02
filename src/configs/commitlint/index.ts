import type { UserConfig } from "@commitlint/types";
import { defu } from "defu";

export const defineCommitlintConfig = (config?: UserConfig): UserConfig => {
	return defu(config, {
		extends: ["@commitlint/config-conventional"],
	} satisfies UserConfig);
};
