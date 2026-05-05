import { defineOxlintConfig } from "./src/tools/oxlint/index.ts";

export default defineOxlintConfig({
	ignorePatterns: ["**/dist"],
});
