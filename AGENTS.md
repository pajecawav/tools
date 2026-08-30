# AGENTS.md

`@pajecawav/tools` — personal npm package of shared TS tooling (config factories for oxlint/oxfmt/prettier/lint-staged/commitlint) plus the `pt` CLI (`src/cli/`) used to bootstrap and run those tools in other projects. Single package; `src/index.ts` re-exports the `define*Config` factories from `src/tools/<tool>/`.

## Commands

- `pnpm dev:cli` — run the CLI from source via tsx (no build). `.husky/pre-commit` uses this (`pnpm dev:cli staged`), so hooks work without building.
- `pnpm build` — tsdown, unbundled (dist mirrors src file-for-file).
- `pnpm lint` — oxlint + `tsc -b --noEmit` + `oxfmt --check` + publint, in parallel. publint validates `dist/`, so run `pnpm build` first for a meaningful lint:package result. CI order: install → build → lint.
- `pnpm format` — oxfmt with write.

There are no tests and no test framework. Verification = build + lint.

## Toolchain quirks

- TypeScript 7 with `isolatedDeclarations` (tsconfig.lib.json): every export needs explicit type annotations. `erasableSyntaxOnly` forbids enums/parameter properties/namespaces.
- Root tsconfig is solution-style with two projects: `tsconfig.lib.json` (nodenext, `src/` only) and `tsconfig.node.json` (bundler resolution; covers root config files like `tsdown.config.ts`, `oxlint.config.ts`).
- Source imports use the `#/*` alias (maps to repo root, e.g. `#/src/utils.js`) and `.js` extensions pointing at `.ts` files (nodenext). tsdown rewrites `#/*` imports to relative paths at build time — don't expect Node to resolve them at runtime.
- `pt format` picks oxfmt vs prettier based on which is in the _consuming_ project's package.json; oxfmt/oxlint/prettier are optional peerDeps.
- `src/config.ts` loads `tools.config.ts` (staged/commitlint overrides) via c12.

## Conventions

- Default branch is `master`. CI (`.github/workflows/ci.yml`) runs on pushes/PRs to master.
- This repo dogfoods the package: root `oxlint.config.ts` imports from local `./src/tools/oxlint/index.ts`; `oxfmt.config.ts` imports `@pajecawav/tools`, which Node self-reference-resolves to this package's own `dist/index.mjs` — a stale/missing build breaks it.
- Deps updated by Renovate with shared config `github>pajecawav/renovate-config`; `pnpm-workspace.yaml` has `allowBuilds`/`minimumReleaseAge` exceptions for esbuild.
- Pinned: Node 26 (`.node-version`), pnpm via `packageManager`. pnpm is the only supported package manager.
