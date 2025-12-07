# Repository Guidelines

## Project Structure & Module Organization
- `src/parser/`: Custom tokenizer and parser combinators for `__builtins__.py`; `ast.ts` declares the grammar, and `index.ts` exposes `parseBuiltins` which returns the generated TypeScript file contents.
- `src/printer/`: String builders for TypeScript (`TS` namespace in `typescript.ts`) plus helpers in `util.ts` (`python`/`typescript` template tags, `wrap`, `indent`).
- `src/types/`: Generated TypeScript definitions for Farmer APIs (`items.ts`, `methods.ts`, `python.ts`) exported via `src/types/index.ts`. `python.ts` defines the `call` helper and `PythonType` wrapper.
- `scripts/`: Utility scripts; `parse-types.ts` runs `parseBuiltins` on `save/__builtins__.py` and overwrites `src/types/*`, and `sync.ts` mirrors builtin files using the Steam path in `scripts/paths.ts`.
- `save/`: Working copies of in-game save artifacts such as `__builtins__.py`.
- Root configs: `tsconfig.json` for ESM/TypeScript settings, `package.json` with npm scripts, and `README.md` describing purpose.

## Build, Test, and Development Commands
- `npm install`: Install TypeScript and `tsx` runner dependencies.
- `npm run build`: Compile the TypeScript sources with `tsc` (no emit).
- `npm run parse-types`: Parse `save/__builtins__.py` via `scripts/parse-types.ts` and regenerate `src/types`.
- `npm run sync`: Copy `save/__builtins__.py` into the Steam save location and mirror other save files back; ensure the game is closed to avoid conflicts.
- `npm run test`: Run the Vitest suite once.
- `npm run test:watch`: Run Vitest in watch mode.
- `npx tsc --noEmit`: Type-check the codebase using `tsconfig.json` without writing output.
- Ad hoc scripts: Run any TypeScript file with `npx tsx path/to/file.ts`.

## Coding Style & Naming Conventions
- Language: TypeScript with native ESM (`type: module`); prefer `const` and explicit exported types.
- Indentation: 2 spaces; keep lines short and imports sorted by path depth.
- Naming: PascalCase for exported types/constants (`Item`, `Primitive`), camelCase for functions (`useItem`, `parseBuiltins`), and descriptive parameter names.
- Docs: Add concise JSDoc-style comments for game behavior, especially when mirroring in-game timing or side effects.
- Parsing/printing: Extend the parser with the combinators in `src/parser/base.ts`/`parser.ts`, and emit strings via the `TS` helpers instead of hand-written template literals; the `python`/`typescript` template tags in `src/printer/util.ts` keep test snapshots readable.

## Testing Guidelines
- Vitest tests cover the parser and printer; use `npm run test` for a single pass or `npm run test:watch` while iterating.
- If you touch the parser or `save/__builtins__.py`, rerun `npm run parse-types` so `src/types` stays in sync.
- Document any new commands in this guide and `package.json`.
- Always run `npx tsc --noEmit` before committing to catch type regressions.

## Commit Guidelines
- Follow the existing Conventional Commit style (`feat: ...`, `chore: ...`, `fix: ...`) seen in `git log`.
- Keep commits focused; include brief context when touching game-file paths or parser behavior.

## Configuration Tips
- `scripts/paths.ts` targets the default Steam Proton save path; adjust locally if your setup differs but avoid committing machine-specific changes.
