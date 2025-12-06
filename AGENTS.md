# Repository Guidelines

## Project Structure & Module Organization
- `src/types/`: Type definitions for Farmer APIs (`items.ts`, `methods.ts`, `python.ts`) exported via `src/types/index.ts`.
- `src/parser/`: Parser/translator entry point (`index.ts`) for converting Python builtins to TypeScript; currently stubbed.
- `scripts/`: Utility scripts; `sync.ts` mirrors game builtin files between the repository `save/` directory and the Steam save folder defined in `scripts/paths.ts`.
- `save/`: Working copies of in-game save artifacts such as `__builtins__.py`.
- Root configs: `tsconfig.json` for ESM/TypeScript settings, `package.json` with minimal scripts, and `README.md` describing purpose.

## Build, Test, and Development Commands
- `npm install`: Install TypeScript and `tsx` runner dependencies.
- `npm run sync`: Copy `save/__builtins__.py` into the Steam save location and mirror other save files back; ensure the game is closed to avoid conflicts.
- `npx tsc --noEmit`: Type-check the codebase using `tsconfig.json` without writing output.
- Ad hoc scripts: Run any TypeScript file with `npx tsx path/to/file.ts`.

## Coding Style & Naming Conventions
- Language: TypeScript with native ESM (`type: module`); prefer `const` and explicit exported types.
- Indentation: 2 spaces; keep lines short and imports sorted by path depth.
- Naming: PascalCase for exported types/constants (`Item`, `Primitive`), camelCase for functions (`useItem`, `parseBuiltins`), and descriptive parameter names.
- Docs: Add concise JSDoc-style comments for game behavior, especially when mirroring in-game timing or side effects.

## Testing Guidelines
- No automated test suite exists yet; when adding, install Vitest and keep tests close to subjects (e.g., `src/parser/__tests__/parser.test.ts`).
- Document any new commands in this guide and `package.json`.
- Always run `npx tsc --noEmit` before committing to catch type regressions.

## Commit Guidelines
- Follow the existing Conventional Commit style (`feat: ...`, `chore: ...`, `fix: ...`) seen in `git log`.
- Keep commits focused; include brief context when touching game-file paths or parser behavior.

## Configuration Tips
- `scripts/paths.ts` targets the default Steam Proton save path; adjust locally if your setup differs but avoid committing machine-specific changes.
