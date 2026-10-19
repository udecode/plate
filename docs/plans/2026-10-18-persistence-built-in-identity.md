---
review_scopes: [persistence]
verdict: pursue
review_basis: [2026-10-04-persistence-audit]
work_kind: implementation
review_commit: c83502bc25dc6df9a89fe753c17563aa71b9b926
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, tooling/entrypoints/entrypoint-dag.mjs, tooling/scripts/check-plite-release-artifacts.mjs, tooling/oxlint/entrypoint-dag-plugin.mjs, packages/platejs/package.json, packages/platejs/src/internal/plugin/firstPartyPlugin.ts, packages/platejs/src/internal/utils/mergePlugins.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts, packages/platejs/src/math/lib/BaseEquationPlugin.ts, packages/platejs/src/migrations/documentMigrationFirstParty.internal.ts, packages/platejs/src/migrations/documentMigrationFirstParty.spec.ts, packages/platejs/src/migrations/documentMigrations.ts, packages/platejs/src/migrations/migrateListIdentity.ts, packages/platejs/src/migrations/migratePlateV54Ast.internal.ts, packages/platejs/src/migrations/migratePlateV54Ast.spec.ts, packages/platejs/src/migrations/migratePlateV54CodeBlocks.internal.ts, packages/platejs/src/migrations/migratePlateV54Inputs.internal.ts, packages/platejs/src/migrations/migratePlateV54Ownership.internal.ts, packages/platejs/src/migrations/migratePlateV54Profile.internal.ts, packages/platejs/src/migrations/migratePlateV54Urls.internal.ts, packages/platejs/src/migrations/migratePlateV54.spec.ts, packages/platejs/src/migrations/v53-manifest.internal.ts, packages/platejs/src/lib/editor/withPlite.ts, packages/platejs/src/compiler/compileEditor.ts, packages/platejs/src/markdown/lib/MarkdownPlugin.ts, packages/cli/src/run-migration.ts, packages/cli/src/migrate.ts, packages/platejs/src/docx/import/lib/importDocx.ts, packages/platejs/src/react/editor/withPlate.ts, packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx, packages/platejs/src/lib/editor/index.ts, 'content/docs/(guides)/editor.mdx', docs/plans/topics/layout.md]
review_upstreams: []
---

# Persistence: find built-in plugins by their descriptors

Status: executed
Playbook: plan

**Pursue.** Replace `registerFirstPartyPlugin` with direct descriptor checks in the v54 step. Today 24 built-in plugin modules end with 34 calls that only the v54 migration reads. That is a migration side channel, which `docs/vision/plate.md:526-527` rules out. The registry behind it collects identity from 24 owners, which the Boundary Law forbids a private bridge to do. A module that forgets the call loses its conversions without an error, so a 171-line spec exists to catch that. The v54 step can import the Base descriptors it converts for and compare their family with the installed plugins. That deletes the registry, the 34 calls and the specs' forged stand-ins, and a typed table keyed by the v53 manifest's owner names makes a missing owner a type error. The cost is that `platejs/migrations` depends on 17 more headless entrypoints, a bare import of it grows from 61 kB to 118 kB gzip, and the migration specs install the shipped plugins instead of fakes.

## Brief

### What will change?

Each built-in plugin file lost a line only the upgrade used. The upgrade now lists the plugins it handles in one file, so leaving one out fails the type check. Every check passes except ones that already fail on next.

### What could go wrong?

An app that loads only the upgrade loads about twice as much code, 118 kB instead of 61 kB gzip. A very busy machine made two slow tests time out, and both pass on a quieter machine.

## Teach

The v54 step upgrades Plate v53 documents. Before it rewrites a saved value, it checks that the built-in plugin that owns the value is installed. That way an app plugin that happens to share a built-in name keeps its own values.

Right now each built-in plugin's file ends with a line that adds the plugin to a shared list. The upgrade looks plugins up in that list by name, and nothing else uses the list.

Every plugin already has a hidden family tag, and its configured and React copies share it. So the upgrade can point at the built-in line height plugin directly and ask if the installed one has the same family. Then plugin files hold no upgrade code, and the upgrade's own code lists every plugin it handles.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How the upgrade finds built-in plugins | Point at the real plugins and compare families (look) | Keep the shared list | keep registry | small |
| Size of the upgrade on its own | Accept about 57 kB more gzip for an app that loads it alone (look) | Split the upgrade into its own package | split upgrade | small |
| The AI chat check | Drop it, since AI chat saves no element and lives in the React-only package | Keep a React-only path for it | keep aiChat | detail |
| Old code lines with no code block plugin | Keep converting them, as today | Convert them only when the code block plugin is installed | gate code lines | detail |
| Upgrade tests | Use the real plugins | Keep the fakes through a test-only hook | keep stand-ins | small |
| Copy checks | One case for a configured and a React copy | Port all five copy cases | port copy cases | detail |
| Guard for the math renderer | The platejs build's refusal of KaTeX in the math entrypoints, since `cab4184559` | A test that scans source imports | scan imports | detail |
| Next step | Plan, then build | Stop at the plan | stop at plan | detail |
| Published page | Keep the new page https://claude.ai/artifact/NPMbVFoGPpJhk2nnNbpwz8, since https://claude.ai/artifact/77ZVnESPx3KYW3AnEUSf3V no longer opens | Go back to the old page once it opens again | drop new page | detail |

## Public API

No public call changes. Inside the upgrade, each ownership check reads the property IDs of the installed built-in, which `resolveV54BuiltIns` finds by descriptor family, instead of looking the plugin up by name:

```ts before
// packages/platejs/src/migrations/migratePlateV54Ast.internal.ts
if (
  firstPartyDeclares('lineHeight', element.type, 'lineHeight', context) &&
  Object.hasOwn(element, 'lineHeight')
)
```

```ts after
// packages/platejs/src/migrations/migratePlateV54Ast.internal.ts
if (
  declares(declared.lineHeight, element.type, 'lineHeight', context) &&
  Object.hasOwn(element, 'lineHeight')
)
```

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| changed | `platejs/migrations` | The only format-migration API: the v54 profile, AST, code-block and suggestion transforms, and the separate legacy-comment extractor. Root exports are cut and `V53_*` constants are private. v54 decodes historical review meaning before destructive shaping and reads frozen source policy. The v54 step imports the Base descriptors it converts for and finds each installed one by descriptor family; built-in plugin modules carry no migration code. |

| Delta | Alternative | Why it lost |
| --- | --- | --- |
| added | A registry each built-in plugin fills when its module loads | Only the upgrade read it, a module that forgot its call lost its conversions without an error, and it gathered identity from 24 owners. |

## Main changes

- `migratePlateV54BuiltIns.internal.ts` imports every Base descriptor the v54 step converts for, and `resolveV54BuiltIns(target)` finds each installed one through `getMigrationBinding(target, plugin)`, which matches descriptor families. The profile, AST, URL, input and code-block passes read their element types, media and equation type sets, declared property IDs and the script key from it, and import no descriptor themselves. `migrateListIdentity` reads the heading binding directly.
- The module's owner table declares a mapped type over the v53 manifest's owners. A v53 owner with no row, a `null` row for an owner other than `aiChat`, `codeLine`, `tag` and `toggle`, an extra row or a descriptor with the wrong name fails the typecheck, and `getMigrationBinding` throws for an object that is not a plugin descriptor. `firstPartyPlugin.ts`, its 34 calls and `documentMigrationFirstParty.internal.ts` are deleted.
- `platejs/migrations` depends on 17 headless feature entrypoints. The equation descriptors it imports load no KaTeX, because `cab4184559` moved KaTeX out of `platejs/math`.

## Outcome

The v54 step and `migrateListIdentity` recognize every built-in plugin through its descriptor's family, with no code in any plugin module that only the migration reads. Every conversion behaves as it does at `c83502bc25`, configured and React copies included, and an app plugin that reuses a built-in name keeps its values. `platejs/migrations` loads without KaTeX.

## Scope

In scope: `packages/platejs/src/migrations/**`, the 24 plugin modules that register, `internal/plugin/firstPartyPlugin.ts`, `math/lib/BaseEquationPlugin.ts`, the `migrations` row of `tooling/entrypoints/entrypoint-dag.mjs` and the files it generates, the CLI's `packages/cli/test/run-migration.test.ts` fixture and the migrations rows of the raw schema query allowlist in `tooling/scripts/check-plate-schema-adoption.mjs`, which the earlier identity commit left stale, and the current-state docs that describe the registry (`docs/plans/topics/layout.md`, `docs/plans/topics/persistence.md`).

Out of scope: the public `DocumentMigrationTarget.bindings` field, which loses its last reader inside Plate; the `codeLine` rename, which still adopts any installed plugin named `codeLine`; the `footnoteReference` manifest label; and the base failure in `migratePlateV54Suggestions.spec.ts`. Open work lists each.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Built-in identity | 34 `registerFirstPartyPlugin` calls fill a core `WeakMap` from family to name | The v54 step imports each descriptor and compares families | `platejs/migrations` | `plate.md:526-527`, `common.md:128-130` | no caller outside `packages/platejs/src` | migration specs on shipped plugins | a missed lookup site skips conversions | cut |
| Per-target lookup | name-keyed table of bindings and property owners | `getMigrationBinding(target, plugin)` over a family map built from `modelBindings` | `migrations/documentMigrationTarget.internal.ts` | one compiler fact, no index join between two arrays | private | copied-target refusal spec, family copy case | none known | rearchitect |
| Owner completeness | `documentMigrationFirstParty.spec.ts` lists names by hand | owner table whose declared type is a mapped type over the manifest's owners | `migrations/migratePlateV54BuiltIns.internal.ts` | a missing owner fails the typecheck | private | mutation that drops a row fails `tsc` | a loose type hides a missing row | rearchitect |
| Element ID authority | `getFirstPartyBinding(target, 'elementId')` | `getMigrationBinding(target, ElementIdPlugin)` | `documentMigrations.ts` | same check, no name | private | duplicate-ID spec with the real plugin | fixture still fakes the ID plugin | move |
| Migration import closure | four dependencies, no KaTeX | 21 dependencies, no KaTeX | `tooling/entrypoints/entrypoint-dag.mjs` | descriptors are headless; KaTeX is an optional peer | none; bare-import size grows | DAG lint, packed optional-peer proof | an app without KaTeX fails to load the upgrade | gate |
| Spec fixtures | text-block stand-ins and local fakes registered as built-ins | shipped descriptors | migration specs | the fakes never tested the shipped schemas | tests only | `bun test ./packages/platejs/src/migrations` | shipped schemas reject old fixture documents | rearchitect |

## Decisions

- **Base design: a private family lookup and a typed owner table.** An architect arena ran three runners, Opus, Astra and Sol, at xhigh, and an Opus cross-judge scored Sol's design 22 of 24 against 20 for each other. It keeps the public target unchanged and gives the strongest completeness check, because plugin names are literal types (`base-name-probe`).
- **Graft from Opus: keep today's `codeLine`, `toggle`, `tag` and `aiChat` behavior.** The table maps those four owners to no descriptor, and `code_line` keeps converting to `codeLine` whether or not a code block plugin is installed. Gating it changes behavior, so it goes to Open work.
- **Graft from Astra: capture the baseline first.** `base-migrations-tests` recorded 164 passes and the one Suggestions failure before any edit.
- **Rejected: Astra's public `target.binding(plugin)`.** It adds public API, which the verdict ruled out, and would trigger `api-plan` and `best-api repair`.
- **Rejected: Opus's descriptors inside the v53 manifest.** `owner: AnyBasePlugin | null` lets a new entry pick `null` silently and does not tie a descriptor to its name.
- **Rejected: a test that scans source imports for optional peers.** The release check already proves each packed export's optional peers on the built files, and since `cab4184559` the platejs build refuses KaTeX in the math entrypoints the step imports.
- **Dropped cases from the losing candidates.** Astra's heading-remap case and the four extra copy cases test the same family match as the one lineHeight copy case. The AI chat compile case tests a lookup that no longer runs, since its table row is empty. Opus's single media list is a cleanup this plan does not need.
- **Code review: one module owns the descriptors.** The thermos code-quality reviewer found the descriptor imports, three resolver closures and three media sets repeated across five passes, a table type that let any row be `null`, a 999-line profile pass, two loops over the same entries and a KaTeX deep import with no stated reason. `migratePlateV54BuiltIns.internal.ts` now resolves them once per pass, `null` is allowed only for the four owners with no descriptor, the v53 element types sit in the manifest, the profile pass runs one loop at 891 lines, `declares` checks a precomputed ID set, and `getMigrationType` is gone. Comment-sicko cut the comment on the deep import and named the cause, a math barrel that exported the renderer with the plugin, so `getEquationHtml` moved beside that barrel, until the rebase onto `cab4184559` dropped the move.
- **Code review: declined and deferred.** Merging the target and authored side tables couples two lookups with different errors. The spec's `createEditor` stand-in predates this change and goes to suggested task `t_78eb5eb2`. The thermos bug reviewer found nothing high or medium. Its low finding, that a plain object in the table typechecks and skips conversions, now throws through `getMigrationBinding`. It asked for a unit test of the KaTeX rule; the release check's existing `@chenglou/pretext` rule has none either, and the packed red and green runs proved the new row, which the rebase onto `cab4184559` dropped.
- **What other editors do: not compared.** No other editor ships a versioned upgrade of its own plugin data, so the subject's line stands.

## Execution

Authority: the owner's `verdict` on 2026-10-18 reached Pursue, and the Verdict playbook continues a Pursue into this plan and its build in the same run. The packet is steps 1 to 10, run by the lead in worktree branch `claude/gracious-murdock-c5a9ed` from base `c83502bc25`, and it lands as one commit through `land.mjs`.

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| `pstack:blast-radius` before code moves | no | skip: no public API changes; `DocumentMigrationTarget` keeps its shape and no export changes |
| `pstack:thermos` on the diff, which touches 24 plugin modules | yes | done: the code-quality review's findings 1 to 4 and 6 to 8 are fixed, 5 is declined, 9 is suggested task `t_78eb5eb2` and 10 is named in the commit; the bug review found nothing high or medium, and its first low is fixed |
| Hard-cut sweep of the registry's callers, exports, tests and docs | yes | done: `git grep` for the deleted names in `packages`, `tooling`, `apps`, `content`, `.agents`, `AGENTS.md` and the subject files prints nothing; only dated plans name them |
| `best-api repair` | no | skip: no reusable public API changes |
| `plate-docs` on affected docs pages | yes | skip: no docs page names the registry, and after the rebase this change moves no math file |
| Size rerun on the final bytes through `benchmark` | yes | done: `platejs/migrations` alone bundles to 118,205 bytes gzip in 116 modules, against 61,256 at `3bb4ac2fa2` |
| Hand drive | no | skip: nothing a browser shows changes |
| Playtest scope | yes | done: no scenario catalog covers the final file set |
| `pnpm check` steps the edits reach | yes | done: entrypoint-graph, barrels and cli-test pass on the rebased bytes; lint and core-audits fail the same way at `3bb4ac2fa2`, outside migrations |
| Changeset for `platejs` | yes | skip: no export, option or stored shape changes for a user of the published beta; only the bare-import size of `platejs/migrations` grows |
| Writing passes: `deslop` and `no-comments` on code, `unslop` on docs and this plan | yes | done: `deslop` and `no-comments` on the build and on the review round, `unslop` and `pstack:bro` on this plan and the subject files |
| Panel on the diff | no | skip: no reviews row names this work, since it changes no public API and deletes no behavior |
| `review-ledger.mjs check` at the close | yes | done: it names neither plan of this run; the 23 other plans it flags fail the same way at `3bb4ac2fa2`, which suggested task `t_3ea68f2e` owns |
| `pnpm lint:task` on the task's files | yes | done: `lint:task` and type-aware `oxlint` pass on every changed file |

## Steps

- [x] 1. Add `migrations/documentMigrationTarget.internal.ts` with `registerMigrationBindings(target, modelBindings)` and `getMigrationBinding(target, plugin)`, keyed by descriptor family and throwing the existing error for a copied target. `defineDocumentMigrations` registers it and sets `ownsElementIds` from `ElementIdPlugin`. `createPropertyOwnership` returns `declares(plugin, type, key, context)`. Proof: step 6's tests and typecheck.
- [x] 2. Point every lookup at a descriptor: `migratePlateV54Ast.internal.ts`, `migratePlateV54Profile.internal.ts`, `migratePlateV54Urls.internal.ts`, `migratePlateV54Inputs.internal.ts`, `migratePlateV54CodeBlocks.internal.ts` and `migrateListIdentity.ts`. Add the typed owner table to the profile pass and delete `V53_ELEMENT_TYPE_OWNERS`. Proof: a logged mutation that drops the `image` row fails `tsc`; step 6.
- [x] 3. Add the 17 entrypoints to the `migrations` row of `entrypoint-dag.mjs` and regenerate its derived files. Proof: `pnpm check` steps for the entrypoint graph and lint pass.
- [x] 4. Delete `internal/plugin/firstPartyPlugin.ts`, the 34 calls in 24 modules, `documentMigrationFirstParty.internal.ts` and `documentMigrationFirstParty.spec.ts`. Proof: `git grep -n -e registerFirstPartyPlugin -e getFirstParty -- packages` prints nothing.
- [x] 5. Move the specs to shipped plugins. `migratePlateV54.spec.ts` uses a kit of shipped descriptors instead of the stand-ins. `migratePlateV54Ast.spec.ts` uses the shipped descriptors instead of its local fakes, and its fake ID plugin becomes an app plugin that owns a Details `id`. Add one case where a configured and a React line height plugin convert `"150%"` to `1.5`. Proof: a logged mutation that matches by object identity instead of family fails that case.
- [x] 6. Run the migration suite and the spec typecheck. Proof: `bun test ./packages/platejs/src/migrations` passes every case except the base Suggestions failure, and `tsc -p packages/platejs/tsconfig.test.json` adds no error in a migrations file beyond the 14 at base.
- [x] 7. Add `platejs/migrations` and `katex` to the release check's refused optional-peer reaches, beside the `platejs/react` and `@chenglou/pretext` rule. Proof: `pnpm plite:release:packages` with `--package-boundaries-only` fails on the KaTeX reach before step 8. The rebase onto `cab4184559` dropped this row.
- [x] 8. Move `getEquationHtml` and the KaTeX import to `math/lib/getEquationHtml.ts` and export it from the math barrel. Proof: the step 7 check passes, and the math specs pass. The rebase onto `cab4184559`, which removed `getEquationHtml` from platejs, dropped this move.
- [x] 9. Update `docs/plans/topics/layout.md` and fold this plan into `docs/plans/topics/persistence.md`. Proof: `git grep -n registerFirstPartyPlugin -- docs/plans/topics AGENTS.md .agents` prints nothing.
- [x] 10. Measure `platejs/migrations` alone after the change with the base probe's bundler settings. Proof: a size log next to `size-base-migrations`.
- [x] 11. Install `BaseParagraphPlugin` in the CLI's `run-migration.test.ts` fixture in place of its own plugin named `paragraph`. Proof: the file's nine cases pass, against six failures at `c83502bc25` and none at `f62a644b31`'s parent.
- [x] 12. Point the raw schema query allowlist of `check-plate-schema-adoption.mjs` at `migratePlateV54Ownership.internal.ts`, where `f62a644b31` moved the query. Proof: the schema adoption audit names no migrations file.

## Proof

Base controls ran at `c83502bc25` in a detached worktree: 164 of 165 migration cases pass and the Suggestions case fails; the 17 added dependencies pass `assertEntrypointDags`, all headless; all 33 converted descriptors have literal name types; and the spec typecheck reports 249 errors, 14 of them in migrations files. Each step's proof above runs on the final bytes, and the packed check runs once red and once green.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- The v54 step converts a stored value only when the built-in plugin that owns it is installed, and an app plugin with a built-in name keeps its values. Equal names never make different descriptor families interchangeable (`docs/vision/plate.md:238-241`), and React and configured copies share their source's family (`packages/platejs/src/internal/utils/mergePlugins.ts:215`).
- Applications import the migration builder, runner and Plate release steps from `platejs/migrations`, which runs detached at the app or CLI storage boundary (`docs/vision/plate.md:509-524`).
- Plate exposes no generic plugin document-preparation hook and no hidden migration side channel, and normalizers never recognize historical ASTs (`docs/vision/plate.md:526-531`).
- A private bridge never collects product or plugin behavior from several owners (`docs/vision/common.md:128-130`).
- `platejs/migrations` is a headless entrypoint (`tooling/entrypoints/entrypoint-dag.mjs:369-370`).

### Lanes

1. **Keep the registry. Loses.** Each of 24 modules calls `registerFirstPartyPlugin` at module end, only for the v54 step (`packages/platejs/src/internal/plugin/firstPartyPlugin.ts`). That is the hidden migration side channel `plate.md:526-527` rules out, and a core registry that gathers identity from 24 owners, which `common.md:128-130` forbids a private bridge to do. Forgetting a call skips that plugin's conversions without an error, so `documentMigrationFirstParty.spec.ts` exists to catch it. The package declares its JavaScript modules side-effect free (`packages/platejs/package.json:31-33`), and the registry runs only as a module side effect. The specs forge built-in status for text-block stand-ins (`migratePlateV54.spec.ts:42-54`) and local fakes (`migratePlateV54Ast.spec.ts:15-284`), so they never test the shipped plugins' schemas.
2. **Strongest deletion: drop the ownership checks and match by name. Loses.** That is the state before the 2026-10-18 fix, where an app plugin named `lineHeight` that stores text had its value turned into a number. It breaks `plate.md:238-241`.
3. **Plugin-owned conversions, where each built-in plugin carries its v54 rules. Loses.** A per-plugin conversion field is the plugin document-preparation hook `plate.md:526-527` rules out, and it ships v53 parsing in every live plugin. Several passes span plugins, such as table widths from cell sizes, list runs, the details summary and roots, so the rules do not split per plugin.
4. **Brand at definition, where an internal `defineBuiltInPlugin` marks the family. Loses.** It drops the global map, but every built-in module still carries a mark only the upgrade reads, the lookups stay string-keyed, and completeness still needs the spec.
5. **Direct descriptor identity. Wins.** The migration modules import the Base descriptors they convert for and compare families with the installed bindings, so the upgrade names each owner in its own code. It deletes `firstPartyPlugin.ts`, the 34 calls and the forged stand-ins. A table keyed by the v53 manifest's owner names, with a declared mapped type, makes a missing owner a type error and replaces the coverage spec. `platejs/migrations` gains dependencies on six `standard/*` feature entrypoints, nine public feature entrypoints, `excalidraw` and `math`, all headless. `markdown` and `ai` already depend on standard features (`entrypoint-dag.mjs:234-237`, `356-357`). The `aiChat`, `codeLine`, `tag` and `toggle` owners map to no descriptor, because no headless descriptor defines them. AI chat's plugin declares no element (`packages/platejs/src/ai/react/AIChatPlugin.ts:211-214`), so its lookup never returned a type.
6. **The rule is wrong. Loses.** `plate.md:238-241` keeps built-in policy off a same-name app plugin. The v54 step is the place that applies built-in policy to stored values, so the job still holds.

Predicted benefits, which the plan's Close marks held or falsified: the registry and its 34 calls go, a missing owner fails the typecheck, and the migration specs run against the shipped plugins' schemas.

**Import cost, measured at base.** With rolldown 1.2.0, ESM, minified and every bare import external, `migrations/index.ts` alone bundles to 61,223 bytes gzip, the 33 converted descriptors to 68,651 bytes, and both together to 118,326 bytes. A bare `platejs/migrations` import roughly doubles. An app that already installs every converted plugin pays nothing extra, and the documented use runs at the storage boundary, which already loads the app's plugin kit. `BaseEquationPlugin.ts:1` imports KaTeX, an optional peer (`packages/platejs/package.json:716-718`), so the split in step 8 is required: the CLI bundles the app's migration module with esbuild (`packages/cli/src/run-migration.ts:101-126`).

**Proof limits.** That AI chat's lookup never returns a type is read from its definition, not run.

### Dependents

- `basic` and `markdown`: unaffected. `packages/platejs/src/markdown/lib/MarkdownPlugin.ts` imports `withPlite`, which keeps its shape.
- `compiler`: unaffected. `packages/platejs/src/compiler/compileEditor.ts` imports `withPlite` types only.
- `distribution`: affected in size, and in its test fixture. `packages/cli/src/run-migration.ts` imports `migrateDocument` from `platejs/migrations`, which pulls the added descriptors. `packages/cli/src/migrate.ts` emits a type import of `DocumentMigration`, which does not change. The fixture in `packages/cli/test/run-migration.test.ts` installed its own plugin named `paragraph`, which stopped receiving the `p` rename at `f62a644b31`, so six of its nine cases fail at `c83502bc25`.
- `documents`: unaffected. `packages/platejs/src/docx/import/lib/importDocx.ts` imports `withPlateFormatCompilation`.
- `html`: unaffected. `packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx` imports `withPlite`'s format functions, which do not change.
- `plate-api`: unaffected. `packages/platejs/src/lib/editor/index.ts` re-exports `withPlite`, which keeps its shape.
- `react`: unaffected. `packages/platejs/src/react/editor/withPlate.ts` imports `withPlite`, which keeps its shape.

### History

- This review reopens the `2026-10-04-persistence-audit` record of the [2026-10-04 ledger triage audit](2026-10-04-ledger-triage-audit.md) on one question, how the v54 step recognizes built-in plugins, which that Stop never judged. Its conclusions on the detached runner, the envelope and the CLI stand.
- It retains the [v54 plugin identity plan](2026-10-18-v54-plugin-identity.md) for family identity and the root and ancestor context, and reopens only how built-in families reach the step. That plan's Decisions said `platejs/migrations` cannot import the feature descriptors (`entrypoint-dag.mjs:369-371`). The DAG lists the entrypoint's dependencies; it forbids nothing, and adding headless features follows the `markdown` and `ai` entries.

## Open work

- `DocumentMigrationTarget.bindings` is a public, name-keyed field that no Plate code reads after this change, and code that read it would match plugins by name, which `plate.md:238-241` forbids. owner: the next persistence verdict. stop: that verdict.
- The `code_line` rename produces the type `codeLine` even when no code block plugin is installed, so an app plugin named `codeLine` adopts those lines by name. owner: the next persistence verdict. stop: that verdict.
- The manifest labels `footnoteReference` as unchanged, yet the step renames it to `footnote`. owner: the next persistence verdict. stop: that verdict.
- `migratePlateV54.spec.ts` builds its migration plan through a `createEditor` stand-in that drops every option but `plugins`. owner: suggested task `t_78eb5eb2`. stop: its fix.

## Close

The change lands as one `refactor(platejs)` commit on `next` through `land.mjs`, and the decision log's `ship` row links it.

Deviations and reversals:

- The code review moved every descriptor import and the owner table into `migratePlateV54BuiltIns.internal.ts`, where step 2 had put the table in the profile pass, and deleted `getMigrationType`, which step 1 had added. Each pass now resolves its built-ins once.
- `cab4184559` moved KaTeX out of `platejs/math` while this run was open. On the rebase onto `next`, this change dropped step 8's `getEquationHtml` move and step 7's release check row, because the math descriptors import no KaTeX and the platejs build already refuses it in the math entrypoints. Before that, the comment pass had moved `getEquationHtml` out of the `math/lib` barrel.
- The plan's Public API keeps only the ownership check pair. Its second pair showed a plugin file's deleted registration lines, and the fold copies each after block into the subject, which has no place for plugin file code.
- Step 5's AST spec configures `targetPlugins` for Details, Details summary and Excalidraw, and its mutant matches by object identity. The shipped plugins target only the paragraph by default, and the planned mutant that gave each copy its own family failed the compiler's `targetPlugins` check before the migration ran.
- Steps 11 and 12 repair `f62a644b31`, which broke the CLI fixture and left the schema query allowlist naming old files.

**Read before the change.** `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `tooling/entrypoints/entrypoint-dag.mjs`, `tooling/scripts/check-plite-release-artifacts.mjs`, `tooling/oxlint/entrypoint-dag-plugin.mjs`, `packages/platejs/package.json`, `packages/platejs/src/internal/plugin/firstPartyPlugin.ts`, `packages/platejs/src/internal/utils/mergePlugins.ts`, `packages/platejs/src/ai/react/AIChatPlugin.ts`, `packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts`, `packages/platejs/src/math/lib/BaseEquationPlugin.ts`, `packages/platejs/src/migrations/documentMigrationFirstParty.internal.ts`, `packages/platejs/src/migrations/documentMigrationFirstParty.spec.ts`, `packages/platejs/src/migrations/documentMigrations.ts`, `packages/platejs/src/migrations/migrateListIdentity.ts`, `packages/platejs/src/migrations/migratePlateV54Ast.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Ast.spec.ts`, `packages/platejs/src/migrations/migratePlateV54CodeBlocks.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Inputs.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Ownership.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Profile.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Urls.internal.ts`, `packages/platejs/src/migrations/migratePlateV54.spec.ts`, `packages/platejs/src/migrations/v53-manifest.internal.ts`, `packages/platejs/src/lib/editor/withPlite.ts`, `packages/platejs/src/compiler/compileEditor.ts`, `packages/platejs/src/markdown/lib/MarkdownPlugin.ts`, `packages/cli/src/run-migration.ts`, `packages/cli/src/migrate.ts`, `packages/platejs/src/docx/import/lib/importDocx.ts`, `packages/platejs/src/react/editor/withPlate.ts`, `packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx`, `packages/platejs/src/lib/editor/index.ts`, `content/docs/(guides)/editor.mdx` and `docs/plans/topics/layout.md`.

Proof, from the log's rows. The last runs used the bytes rebased onto `3bb4ac2fa2` and a base worktree at that commit.

- The migrations suite passes 129 of 129, against 165 of 165 at base, where the deleted registry spec held 40 cases. Before the rebase, the 500-document list identity case timed out at 5s under host load; alone it took 10.7 and 11.7s at the old base and 8.8 and 9.6s at head.
- The spec typecheck reports 247 errors against 248 at base, 12 of them in migrations files against 13, and the type contracts pass.
- Dropping the owner table's image row (TS2741) and nulling it (TS2322) each fail `tsc`. Matching by object identity and the two element ID mutants fail their cases. Swapping the callout descriptor for a plain `{ name: 'callout' }` object throws `callout is not a plugin descriptor` in 30 of the profile spec's 31 cases.
- The packed boundary check passes with 33 exact optional-peer closures. Before the rebase it failed with `platejs/migrations reaches katex` ahead of the `getEquationHtml` move and passed after it.
- In the package test, the AI React, basic nodes and code block partitions fail the same way at base. Layout timed out once at 5.5s on a stacked width suggestions case under load, then passed 64 of 64 twice at base and twice at head.
- Of the `pnpm check` steps, entrypoint-graph, barrels, cli-test at 90 of 90, React compiler, doc code contracts, declaration leaks, package lint, `lint:task` and type-aware `oxlint` pass. `lint` and core-audits fail the same way at base, except that core-audits at base also flags the three migrations allowlist findings step 12 fixes. Before the rebase, the CLI suite once failed 62 of 90 cases in a timeout cascade under load.
- `platejs/migrations` alone bundles to 118,205 bytes gzip in 116 modules, against 61,256 in 68 at base.

Limits. This run read AI chat's lookup from its definition and never ran it. The full `pnpm plite:release:packages` fails at base on its entrypoint size receipt, and this change moves those sizes again; suggested task `t_aefd3145` owns that receipt, and this run added the note to it. Host load ran between 10 and 260 during the reruns.

All three predicted benefits held. The registry and its 34 calls are gone, a missing or wrongly empty owner row fails the typecheck, and the migration specs run on the shipped plugins.

Both asks are done. "verdict" reached Pursue and continued into this build, and "continue" resumed it. Both questions got answers: the GitHub link of each landed commit, and whether `registerFirstPartyPlugin` was a smell, which this change removes.

Each Open work item above names its owner and stop, and the subject file now lists them too.
