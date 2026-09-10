# Plate template

- `.agents/AGENTS.md` and `.agents/rules/*.mdc` own project instructions. Run `bun install` after changing them to regenerate agent files. Do not edit generated `SKILL.md` files.
- Read the affected source before editing. Use the installed skills whose methods apply to the task, and reuse already-read instructions while their inputs remain unchanged.
- Keep one plan under `docs/plans/` when the work needs a durable plan. Continue authorized local implementation without adding a routine approval step.
- Do not commit, push, publish, or create a PR without the user's authorization. Continue around unrelated local changes.
- Keep reusable editor behavior in Plate and product composition in the copied editor components. Use the installed Plate version's public API and the registry's component conventions.
- Remove retired code at its callers and keep tests focused on surviving behavior. Preserve persisted data and native editor behavior.

## Verification

Use the scripts in `package.json` and the narrowest proof that covers the change:

- `bun run typecheck` for TypeScript changes.
- `bun run lint` for changed source; use `bun run lint:fix` to repair formatting.
- `bun run build` for build configuration, production rendering, or a release check.
- Test affected browser interactions using the available browser controls. Editor selection changes require model and DOM selection evidence. Report any missing browser capability explicitly.

Install dependencies when required by changed dependencies or the lockfile. Typechecking does not require a preceding production build unless the actual module graph does.

Report what changed, which checks passed, and any remaining proof gaps. Distinguish local changes from publication.
