import defaultConfig from "@commitlint/config-conventional";
import type { UserConfig } from "@commitlint/types";
import { defu } from "defu";

export type CommitlintConfig = UserConfig;

export const defineCommitlintConfig = (config?: CommitlintConfig): CommitlintConfig => {
	return defu<CommitlintConfig, [CommitlintConfig]>(config, defaultConfig);
};
