# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the TypeScript source. `paths.ts` defines filesystem locations for Steam saves and the repo mirror; `types.ts` contains exported game API typings derived from `__builtins__.py`.
- `scripts/` contains automation. `sync.ts` keeps `save/` in sync with the Steam directory; `parse-types.ts` will parse `__builtins__.py` into TypeScript types (stub today).
- `save/` is the local mirror of game saves; `__builtins__.py` lives here as the source of truth.
- Config: `tsconfig.json` enforces strict TS settings; `package.json` scripts live at the root.

## Build, Test, and Development Commands
- Install deps: `npm install`.
- Sync saves and pull the latest builtins: `npm run sync`.
- Type-check only (no emit): `npx tsc`.
- Run node scripts directly with `node scripts/<name>.ts` (ESM).

## Coding Style & Naming Conventions
- Language: TypeScript (ESNext modules). Stick to named exports when reasonable.
- Indentation: 2 spaces; keep trailing commas in multi-line literals.
- Favor explicit types and narrow literal unions; align with `tsconfig` strictness (no implicit anys, exact optional properties, no unchecked indexed access).
- File naming: kebab-case for scripts (`parse-types.ts`), lowerCamelCase for variables/functions, UpperCamelCase for types.

## Testing Guidelines
- Primary check is static typing via `npx tsc`; ensure it passes before sending changes.
- No automated test suite yet; when adding tests, install and use Vitest, then colocate them near sources.

## Commit & Pull Request Guidelines
- Commits: concise, present tense subjects (e.g., `Add parse step for builtins`). Group related changes; avoid WIP commits in PRs.
- PRs: include a short summary of behavior change, notable risks, and how to verify (commands run). Link related issues when available; add screenshots only if UI-relevant.

## Save & Path Handling
- Avoid committing personal save data; treat `save/` as syncable state. Use `npm run sync` to pull `__builtins__.py` from Steam and push other saves back. Confirm `src/paths.ts` aligns with your platform if you change OS locations.
