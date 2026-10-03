---
"@pajecawav/tools": minor
---

- add `pt lint`: oxlint + format check + typecheck + publint in parallel with labeled output
- add `pt init ci`: generate a GitHub Actions workflow for pnpm or bun
- `pt staged --changeset` (or `changesets: true` in `tools.config.ts`): require a changeset before committing
- `defineOxlintConfig`/`defineOxfmtConfig` auto-detect `ignorePatterns` from the consuming project's deps
