import type { ResolvedConfig } from "c12";
import { loadConfig as c12LoadConfig } from "c12";
import type { CommitlintConfig } from "./tools/commitlint/index.js";
import { defineCommitlintConfig } from "./tools/commitlint/index.js";
import type { StagedConfig } from "./tools/lint-staged/index.js";
import { defineLintStagedConfig } from "./tools/lint-staged/index.js";

export interface ToolsConfig {
	staged: StagedConfig;
	commitlint: CommitlintConfig;
}

export const loadConfig = async (): Promise<ResolvedConfig<ToolsConfig>> => {
	return c12LoadConfig<ToolsConfig>({
		name: "tools",
		defaultConfig: {
			staged: defineLintStagedConfig(),
			commitlint: defineCommitlintConfig(),
		},
	});
};

export const defineConfig = (config: Partial<ToolsConfig>): Partial<ToolsConfig> => {
	return config;
};
