import type { ResolvedConfig } from "c12";
import { loadConfig as c12LoadConfig } from "c12";
import type { CommitlintConfig } from "./tools/commitlint/index.js";
import { defineCommitlintConfig } from "./tools/commitlint/index.js";
import type { StagedConfig } from "./tools/lint-staged/index.js";
import { defineLintStagedConfig } from "./tools/lint-staged/index.js";

export interface LintConfig {
	/**
	 * Typecheck command. `false` disables the step.
	 * Defaults to `tsc -b --noEmit` when tsconfig.json has references,
	 * otherwise `tsc --noEmit`.
	 */
	typecheck?: string | false;
	/** Run publint. Defaults to `true` for publishable (non-private) packages. */
	publint?: boolean;
}

export interface ToolsConfig {
	staged: StagedConfig;
	commitlint: CommitlintConfig;
	lint: LintConfig;
	/** Require a changeset on every commit (see `pt staged`). */
	changesets: boolean;
}

export const loadConfig = async (): Promise<ResolvedConfig<ToolsConfig>> => {
	return c12LoadConfig<ToolsConfig>({
		name: "tools",
		defaultConfig: {
			staged: defineLintStagedConfig(),
			commitlint: defineCommitlintConfig(),
			lint: {},
			changesets: false,
		},
	});
};

export const defineConfig = (config: Partial<ToolsConfig>): Partial<ToolsConfig> => {
	return config;
};
