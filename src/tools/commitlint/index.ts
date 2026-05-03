import type { UserConfig } from "@commitlint/types";
import { defu } from "defu";

export type CommitlintConfig = UserConfig;

export const defineCommitlintConfig = (config?: CommitlintConfig): CommitlintConfig => {
	return defu(config, {
		extends: ["@commitlint/config-conventional"],
	} satisfies CommitlintConfig);
};
