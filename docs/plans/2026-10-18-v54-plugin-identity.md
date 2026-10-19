---
review_scopes: [persistence]
review_basis: []
work_kind: implementation
review_commit: 6046f43070e5e2320607fa0baae53d05e7ec12b1
review_inputs: [VISION.md, docs/vision/plate.md, packages/platejs/src/migrations/migratePlateV54Ast.internal.ts, packages/platejs/src/migrations/migratePlateV54Ast.spec.ts, packages/platejs/src/migrations/migratePlateV54Profile.internal.ts, packages/platejs/src/migrations/migratePlateV54.spec.ts, packages/platejs/src/migrations/migratePlateV54CodeBlocks.internal.ts, packages/platejs/src/migrations/migratePlateV54Urls.internal.ts, packages/platejs/src/migrations/migratePlateV54Inputs.internal.ts, packages/platejs/src/migrations/documentMigrations.ts, packages/platejs/src/lib/editor/withPlite.ts, packages/platejs/src/internal/utils/mergePlugins.ts, tooling/entrypoints/entrypoint-dag.mjs]
---

# v54 migration: find first-party plugins by family, not by name

Status: executed
Playbook: plan

## Brief

### What will change?

The v54 upgrade rewrites a saved value only when the built-in plugin that owns it is installed. An app plugin that reuses a built-in name keeps its own values. List style checks now see each block's root and parents.

### What could go wrong?

A built-in plugin the upgrade fails to recognize would leave old documents unconverted, so a spec checks each one. An app that copied a built-in plugin under its name, instead of extending it, loses the upgrade for those values.

## Teach

The v54 step upgrades Plate v53 documents. It renames old types and rewrites old values, such as a line height saved as the text 150%, which becomes the number 1.5. To know whether a value belongs to a built-in plugin, it looks the plugin up by name in the editor it migrates into.

A name is not an identity. An app can define its own line height plugin that stores text, and the step turns that text into a number the app's schema rejects. The profile pass also asks about a property without saying which root or parent the node sits in, so a property declared in one root looks undeclared.

Every plugin already carries a family, a private object its configured and React copies share. Built-in plugins now register their family, the compiler hands the migration the installed plugin of each built-in family, and both passes pass the node's root and ancestors when they ask about a property.

## Decisions

- **Identity is the descriptor family.** `docs/vision/plate.md:238-241` says equal names never make different descriptor families interchangeable, and `getPluginSchemaFamily` (`packages/platejs/src/internal/utils/mergePlugins.ts:215`) is already the private identity the compiler checks. `platejs/migrations` cannot import the feature descriptors to compare (`tooling/entrypoints/entrypoint-dag.mjs:369-371`), so each built-in plugin registers its own family in a core registry, and the target compilation reads it.
- **Registration is one statement at the end of the plugin's module.** Wrapping `definePlugin(...)` in a call would hide the definition from `tooling/scripts/check-plate-schema-adoption.mjs`, which reads `export const X = definePlugin(...)`. A statement keeps every definition unchanged.
- **Every first-party lookup moves, not only the four layout keys.** The type lookups in the profile, AST, code-block, URL and input passes, the heading lookup in `migrateListIdentity` and the `elementId` authority in `documentMigrations.ts` trust a name the same way. Fixing only `pluginDeclares` would leave the same defect in the other lookups.
- **The profile pass threads a root and ancestor context** the way the AST pass already does (`migratePlateV54Ast.internal.ts:53-56`), and every ownership check in it passes that context.
- **Compared targets.** Plugin-owned migrations, where each built-in plugin declares its own v54 conversion, put each rule beside its owner but move about 40 conversions across 30 packages' files and add a public plugin field; that is a redesign of the migration API, not this fix. A name allowlist adds nothing over today's check. The family registry is the smallest change that makes the name check an identity check.

## Main changes

- A first-party registry maps a descriptor family to its built-in name. Each built-in plugin the v54 step looks up registers itself, and a spec fails when a looked-up name has no registered shipped plugin.
- The editor target compilation exposes its model bindings in place of the name map `pluginNameByPropertyId`. `defineDocumentMigrations` builds the target's table of installed built-in bindings and property owners from them.
- Every migration pass, `migrateListIdentity` included, resolves built-in plugins through that table. The profile pass gives each ownership check the node's root and ancestors, and a table's column widths come from the cell sizes the cell pass removed.

## Steps

- [x] Write the failing tests. An app plugin named `lineHeight` that declares a text `lineHeight` keeps `"150%"` (`migratePlateV54Ast.spec.ts`). An app plugin that declares `listStyleType` only in one root keeps that root's value while the built-in list is installed (`migratePlateV54.spec.ts`). Proof: both fail at base with their own assertion.
- [x] Add the registry and register each built-in plugin the v54 step looks up. Proof: a probe that compiles each shipped plugin and checks its registered name, logged.
- [x] Publish the built-in bindings and property owners from the target compilation and resolve every v54 lookup through them. Mark the specs' stand-in plugins as built-in so they keep modelling the shipped ones. Proof: both new tests pass, and the migration specs pass except the base failure in `migratePlateV54Suggestions.spec.ts`.
- [x] Thread the root and ancestor context through the profile pass. Proof: the `listStyleType` test passes.
- [x] Typecheck, lint and review the diff with `pstack:thermos`. Proof: the package typecheck, `pnpm lint:task` on the changed files and the review's findings, each logged.
- [x] Land through `node .agents/pstack/land.mjs`. Proof: the pushed commit on `origin/next`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How far the fix reaches | Every built-in lookup in the upgrade | Only line height, alignment, indent and list | narrow | small |
| How built-in plugins are recognized | Each built-in plugin registers itself | Each built-in plugin carries its own upgrade rules | plugin-owned | small |
| Design review | My own comparison of three options (look) | A three-model design bakeoff | architect | detail |
| Test stand-ins | Mark the tests' small stand-in plugins as built-in | Swap them for the shipped plugins | real plugins | detail |

## Open work

- `migratePlateV54Suggestions.spec.ts` fails one case at base, the v53 format suggestion migration. Owner: the v53 format suggestion session from the layout review. Stop: its plan.

## Close

**What landed.** One commit on `next`:

- Built-in plugins register their descriptor family, and the v54 step and `migrateListIdentity` find a built-in plugin by that family. An app plugin named `lineHeight` keeps `"150%"`, and an app plugin named `elementId` no longer turns on the element id checks.
- The profile pass checks property ownership in the node's root and among its ancestors. A `listStyleType` an app declares outside the primary root stays as stored there and converts in the primary root.
- A table's column widths come from the cell sizes the cell pass removed, so the width pass and the cell pass read one answer.
- `documentMigrationFirstParty.spec.ts` checks that every built-in name the v54 step resolves has a shipped plugin that registers it, React and configured copies included.

**Read before the change.** `VISION.md`, `docs/vision/plate.md`, `tooling/entrypoints/entrypoint-dag.mjs`, `packages/platejs/src/lib/editor/withPlite.ts`, `packages/platejs/src/internal/utils/mergePlugins.ts`, `packages/platejs/src/migrations/documentMigrations.ts`, `packages/platejs/src/migrations/migratePlateV54Ast.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Ast.spec.ts`, `packages/platejs/src/migrations/migratePlateV54Profile.internal.ts`, `packages/platejs/src/migrations/migratePlateV54.spec.ts`, `packages/platejs/src/migrations/migratePlateV54CodeBlocks.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Urls.internal.ts` and `packages/platejs/src/migrations/migratePlateV54Inputs.internal.ts`.

**Proof.** Each row names its scope in the decision log.

- Both new tests failed at base with their own assertion (`red-tests-a2.log`), and a name fallback, a dropped root and a dropped registration each turn their test red (`mutant-a-name-fallback-a1.log`, `mutant-b-no-root-a1.log`, `mutant-c-no-registration-a1.log`).
- The migration specs pass except the base Suggestions case, and the full platejs suite fails only cases that fail the same way at `6046f43070` (`platejs-test-a2.log` and the `base-wt2-test-*` logs).
- The typecheck fails only on the base TS2345 in `migratePlateV54Suggestions.internal.ts`, and lint is clean on the 38 changed files (`lint-task-a3.log`).

**Deviations.** The lead compared the three designs itself instead of running `architect`, as the Defaults row says. The probe ran from the scratchpad, and the mutants were planted in place with backups, not in a proof worktree. The code review ran `pstack:thermos`, and both reviewers read the first snapshot. Its quality findings changed the build. The table moved out of the shared compiler, the cell size check runs once, and the lead added the coverage spec.

**Decided.** `tag` and `toggle` stopped counting as built-in, because no shipped descriptor defines them. Only an app's own plugin of that name matched before, which is the defect this plan fixes.
