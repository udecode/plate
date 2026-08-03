# registry identity drift audit

Objective:
Eliminate registry plugin/schema/property identity drift; done when every
audited runtime/config case is classified, fixed, guarded, and proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-02-registry-identity-drift-audit.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- agent-native
- browser

Plate Next source:
- prompt / link: user requested: "apps/www/src/registry/components/editor/plugins/markdown-kit.tsx, audit all cases to fix"
- mode: broad named-surface audit and implementation
- target surface: `apps/www/src/registry/**/*.{ts,tsx}` identity-sensitive runtime/configuration call sites, plus the smallest Core/tooling/rule owners needed to prevent recurrence
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, full bounded registry identity manifest
- package review mode: no
- package review target: N/A
- package file checklist gate: N/A
- doctrine version: 47 at start; bump only if a reusable rule is missing or contradictory
- package applied version / fingerprint state: N/A
- sync mode / target: no
- sync queue row count: N/A
- completion threshold summary: every identity-sensitive registry call site classified as capability `name`, element `type`, property `key`, explicit persisted fixture/value, or unrelated string; every incorrect runtime/config case fixed; checker regression coverage added; scoped proof and browser proof pass

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.
- If package review mode is in scope, generate the package file manifest and
  materialize one checkbox per reviewed file in this plan before
  implementation. A file checkbox may be checked only when its score is `100`.
- If sync mode is in scope, run `version.mjs validate` and `status` before
  implementation, then materialize one sync row per stale/drifted target.

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: N/A; count-backed manifest is the threshold
- improvement loop: audit -> classify -> fix -> guard -> verify -> autoreview
- final score / loop closure: N/A

Completion threshold:
- Every identity-sensitive source occurrence under `apps/www/src/registry` is
  represented in the audit artifact and classified.
- Capability-keyed configuration uses `PLUGINS.*` or exact descriptors;
  runtime AST queries/mutations use resolved portal `.type`/`.key`; copied
  values, fixtures, serialization boundaries, and stable feature-owned document
  properties use explicit persisted literals.
- No `plugin.name`/`PLUGINS.*` value is used as persisted schema identity, and
  no runtime identity is replaced by an unowned raw literal.
- `markdown-kit.tsx`, `docx-export-kit.tsx`, AI command utilities, and every
  same-class registry match are repaired or explicitly proven correct.
- The adoption checker and focused regression tests cover every corrected
  syntactic class, then www typecheck/lint, focused tests, Browser proof,
  autoreview, and the final plan checker pass.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related scoped sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- Package review mode may close only when every package file row is either
  checked at score `100` or explicitly deferred for user review with reason,
  owner, proof needed, and next action. Do not move to the next package while
  unchecked package rows remain.
- Package review or sync mode may close a package only after its final
  fingerprint, applied doctrine version, verification date, and evidence plan
  are recorded in `.agents/rules/plate-next/versions.json` and
  `version.mjs status <package>` reports `current`.
- All-package sync may close only when `version.mjs check all` exits zero.
- Core-adjacent package review may close only after
  `tooling/scripts/check-core.mjs` is updated to include that package, or the
  plan records why the package is product-only and does not belong in
  `check:core`.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-02-registry-identity-drift-audit.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `node --test tooling/scripts/check-plate-schema-adoption.test.mjs`; exact affected tests selected after manifest; `pnpm turbo typecheck --filter=www`; scoped lint through `pnpm lint:fix`
- package proof: N/A unless the audit proves an owning package/Core type change is required
- shared Core gate: N/A unless Core is changed
- source audits: counted AST/text manifest over `apps/www/src/registry/**/*.{ts,tsx}` for identity-sensitive fields and raw literals
- related scoped sweep query / active scope / match count / patched count / deferred count:
  five guarded syntactic classes across 4,220 source/docs files; 36 identity rows classified, 13 copied type boundaries repaired, 0 deferred
- package file manifest / row count / checked count / deferred count: N/A
- version registry validation / starting status / final status: N/A unless doctrine changes
- package fingerprint command / result: N/A
- Plite/Plate gap ledger: no gap known; update if audit finds one
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-02-registry-identity-drift-audit.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper
  dumps, `any` casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of
  inventing a compatibility workaround.
- After every correction, run a related sweep only inside the active mode
  scope. Package review mode is scoped to the named package plus the smallest
  Plite/Core owner needed to unblock that package. Broader matches become
  deferred rows or next-package candidates, not edits.
- In package review mode, do not update docs, examples, package callers outside
  the named package, unrelated packages, generated registries, or broad repo
  surfaces unless the user explicitly broadens scope with `all packages`,
  `current tree`, `full-loop`, `sweep`, or the broader owner name.
- Implementation topology is not frozen. Rename, merge, or delete internal
  helper files, exports, and proof filenames when the active packet restores a
  durable owner. Reject cosmetic synonym churn, but do not preserve one-use
  topology or defer it to `pre-renaming.md` merely to reduce diff noise.
- Extracted-file recovery gate: every untracked/extracted Core/Plate source,
  spec, type-test, and config file in scope must be inventoried and classified
  as `recover-main-owner`, `merge-existing-owner`, `move-to-plite`,
  `justify-new-proof-tooling`, or `delete-duplicate`.
- No file or packet can score `100` while an extracted/untracked file in scope
  lacks a ledger row and one of those buckets.
- Private bridges require owner, deletion gate, and proof.
- Private bridges cannot collect displaced product/plugin behavior. A bridge
  file that centralizes input-rules, node-id, affinity, DOM, command, or change
  listener behavior scores `0` until deleted.
- Any file importing or installing a forbidden bridge is capped at `25`.
- Owner files whose runtime behavior lives in a forbidden bridge are capped:
  `InputRulesPlugin` `<=5`, `NodeIdPlugin` `<=45`, `AffinityPlugin` `<=55`,
  `PliteExtensionPlugin` `<=45`.
- Public type/plugin/editor files touched while a forbidden bridge remains are
  capped at `75`.
- If a helper exists only because migration was hard, cut it.
- Colocation has no line ceiling. A large coherent plugin owner is preferable
  to `transforms/`, `queries/`, `utils/`, `helpers/`, `with*`, `decorate*`, or
  similar one-use files. In package review, inventory every such production
  file and every standalone production function accepting `tx`; inline/delete
  single-owner rows or record concrete multiple-consumer/independent-boundary
  evidence.
- React colocation is family-owned. One component family belongs in one
  `<Family>.tsx` file; one hook family belongs in one `use<Family>.ts` file.
  Related exported primitives/state/behavior hooks may share that file.
  Sibling use inside the family is internal composition, not independent
  reuse. Keep feature-package React roots flat by default and reject
  `components/`, `hooks/`, nested family folders, or nested barrels that only
  classify one owner.
- A separate React file needs reuse across durable families, a standalone
  public owner, or an independent provider/store/lifecycle boundary. A public
  export name, file size, or two sibling consumers inside one family is not
  enough.
- Do not use a narrow representative file to close a broad Core sweep.
- Package review mode is review-first, not migration-first. Freeze scope to the
  named package plus the smallest Plite/Core owner needed to remove a blocker.
- Package hard cuts land package by package. A broad audit can discover
  outside-scope callers, but the plan must record them as deferred rows instead
  of patching them in the current package packet.
- Package file rows can be checked `[x]` only at score `100`: no behavior
  regression versus `origin/main`, no type regression, inline inference
  preserved, no inferred local type annotations, no fake casts/local helper
  types, no compat sludge, correct Plite/Plate ownership, accepted
  owner/name/path drift, and focused proof or justified source audit.
- Green package tests alone do not score a file `100`.
- Do not move to the next package until every package file row is checked at
  `100` or explicitly deferred for user review.
- Core-adjacent package review must update `check:core` coverage before
  closeout, or explicitly classify the package as not belonging in that gate.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.
- Direct one-shot Plite API law: prefer `editor.update.foo.bar(...)` and
  `editor.read.foo(...)` over callback wrappers for one-line reads/writes.
  Callback form is only for grouped transaction/snapshot logic, shared
  intermediate state, branching/looping, or missing direct API that is recorded
  as a Plite gap.
- Live node target law: if a caller already has a live descendant, pass it as
  the `NodeTarget` / `at` value or use `editor.read.nodes.path(node)` only when
  a `Path` is required. Do not rediscover it with a type/ID query. Handle an
  unresolved public path instead of asserting it.
- Property matcher law: exact shallow equality uses property objects such as
  `match: { type }`, `match: { id }`, and array-valued one-of matchers.
  Property matchers intentionally ignore `text` and `children`; content and
  structure checks remain predicates. Predicates also remain for computed
  schema policy, path-dependent logic, truthiness semantics, or consumed type
  narrowing.
- Flat node-query aliases are forbidden: no `editor.api.findPath`,
  `editor.api.some`, `read.nodes.pathOf`, Plate wrappers, or implicit type/ID
  scans. Use `editor.read.nodes.path`, `editor.read.nodes.some`, and direct
  node targets.
- Boolean node-query law: when an entry-producing collection query is used only
  for truthiness and `nodes.some` has the same target/match/traversal semantics,
  use `editor.read.nodes.some`. Keep `above`, `block`, `parent`, `previous`, and
  `next` when their ancestor/current-block/relative traversal is the actual
  question, and keep any entry-producing query when the node/path is consumed.
- Optional public-read law: Plate feature-package source handles unresolved
  Plite reads with an early return/no-op. `{ required: true }` is reserved for
  Plite internals with a proven runtime invariant; fixture assertions are the
  test-only exception.
- Explicit normalization law: bare `tx.normalize()` /
  `editor.update.normalize()` is an explicit full-root pass in Plite. Feature
  code may keep it only for a named full-root semantic invariant. Do not use it
  to coalesce equivalent text leaves or preserve old fixture shape. Prefer
  transaction dirty-path normalization, repair a universal invariant in Plite,
  and classify every match in the active scope as `cut`,
  `semantic-dirty-path`, `semantic-full-root`, `explicit-normalizer-test`,
  `lifecycle-option`, or `Plite-owner-gap`.
- Active transaction law: no `editor.update.*` call may appear inside an
  `editor.update(...)`, `editor.update.withoutNormalizing(...)`, transform
  middleware, or other active transaction callback. The callback must receive
  and use the active `tx`; `withoutNormalizing` callbacks should be
  `({ tx }) => { ... }`.
- Lexical transaction ownership law: do not extract single-owner plugin logic
  into `foo(editor, tx, ...)`, `fooWithTx(...)`, or paired one-shot/tx
  wrappers. Inline it in the plugin tx group, command, correction, or
  middleware callback so `tx` and plugin context infer lexically. A separate
  transaction-accepting function needs multiple production consumers or a real
  independent algorithm boundary, recorded in the package rows.
- Plugin export inference law: plugin constants should infer from
  `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`, and chained
  `.extend()` calls. Do not annotate exports as `BasePlugin<Config>` /
  `PlatePlugin<Config>` or cast chained plugin results unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner.
- Base/static renderer boundary law: Base constructors stay renderer-neutral.
  Base `.extend()` also rejects component authoring. Static/base kits bind the
  owning server-safe `*-static` renderer through terminal
  `BasePlugin.configure({ component })` without importing a Plate React
  entrypoint. Live React adapters use
  `toPlatePlugin(BasePlugin).configure({ component })`.
- Definition inference law: do not create `PluginConfig`, pass a whole-plugin
  factory generic, or call an extracted descriptor definition `FooConfig`.
  Let `createBasePlugin({ name: 'foo' })` infer the descriptor and use
  `DefinitionOf<typeof FooPlugin>` only when a real exported definition
  contract is needed, named `FooDefinition`.
- Plugin capability boundary law: classify every contribution against the
  canonical `plate-plugin-creator` protocol. `initialState` declares defaults;
  `store` owns live editor-local state; `selectors` are pure store projections;
  `api` owns non-snapshot plugin services; `read` owns pure supplied-state
  queries; `update` owns active-transaction document mutation; flat native
  Plite fields own genuine editor-wide substrate; `codecs` own format
  declarations.
  Reject document reads in `api`, document mutations outside `update`, impure
  selectors/reads, plugin-scoped behavior hidden in native fields, and
  unclassifiable contributions.
- Plugin authoring stage law: keep every independent contribution in
  `createBasePlugin()` / `createPlatePlugin()`. Keep `.extend()` only for
  imported/prebuilt adaptation, a shared factory unavailable to the
  constructor, or a real earlier-capability type dependency. Keep
  `.configure()` terminal and non-widening. Native Plite fields stay flat on
  the plugin; independently reusable standalone Plite descriptors use
  `defineEditorExtension`.
- Dependency type boundary law: root
  `EditorExtensionDependencyReference` is shallow and non-generic. Keep finite
  name-keyed capability/provider carriers and their value-sensitive HKT under
  `@platejs/plite/internal`, never recursively encode exact dependency
  ancestry, and require static name+capability equivalence plus runtime exact
  descriptor identity.
- Core lowering law: author-source-to-canonical-lowered aliases are internal.
  Do not export or teach an intermediate plugin type between the one author
  object and its exact descriptor.
- React bridge law: low-level composition is exactly `react({ dom })` with one
  required object and the exact DOM descriptor. Permit one explicit erased
  implementation boundary only for the TypeScript 7 invariant-union reduction
  limit.
- Inferred local type law: do not annotate local variables whose initializer
  should infer the type. Smells like `const entries: NodeEntry<T>[] =
  editor.read...` or `const value: Value = [...]` hide type regressions at the
  owner API. Remove the annotation and fix the source API if inference is weak.
  Keep annotations only for uninferrable locals such as empty arrays,
  deliberate narrowing/widening, exported/public signatures, or external
  boundary callbacks.
- Plugin state law: plugin defaults use `initialState`; descriptor overrides
  use `.configure({ initialState })`; builder callbacks use inferred `store`;
  consumers use `editor.plugin(FooPlugin).store.get/set/subscribe`; React
  subscriptions use `usePluginStore` or `useEditorPluginStore`. Do not use or
  re-add root or scoped `getOption`, `getOptions`, `setOption`, `setOptions`,
  `usePluginOption`, or a parallel immutable `config` channel. Name-only
  portals need an owner reason: plugin self-definition cycle, React
  hook/component imported by the plugin itself, non-React layer that must not
  import a React plugin, or intentionally decoupled cross-package code. Inline
  single-owner plugin behavior in the builder context. Only a proven shared or
  independent helper should receive a narrow plugin context or required `tx`
  parameter.

Boundaries:
- allowed edit scope: `apps/www/src/registry`, identity adoption checker/tests, and source-of-truth Plate Next/Best API/Plate UI doctrine only when the audit proves a reusable rule gap
- package/API surfaces: no package runtime/API changes unless a registry correction is impossible without the smallest owning Core/type fix
- docs/browser surfaces: no content docs changes; Browser proof on the smallest standalone registry demo(s) exercising changed kits
- non-goals: no unrelated registry cleanup, no classic-surface investment, no fixture/value literal replacement, no package colocation work, no API redesign beyond the accepted name/type/key law
- out-of-scope package errors: record and do not patch unless caused by this packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Write the complete registry identity inventory to
  `docs/plans/artifacts/registry-identity-drift-audit/` and inspect counted
  slices instead of streaming all matches.

Blocked condition:
- Stop only if the same identity case cannot be classified without a missing
  Core contract or a user decision that changes the accepted name/type/key
  ontology; record the exact owner and proof needed.

Current verdict:
- verdict: complete; all 36 identity rows and the 13-file copied-registry type-boundary follow-up are fixed, classified, and guarded
- confidence: high
- next owner: none for this packet
- keep / revert / quarantine call: keep the source repairs and checker; reject local generated-registry output
- reason: runtime identity resolves through descriptor portals, capability maps use plugin names, and copied values retain explicit persisted literals

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt and scope captured | yes | Objective, registry-wide scope, boundaries, stop condition, proof, and handoff are recorded above. |
| Plate Next doctrine read | yes | v47 identity, registry, inference, and copied-item laws were applied. |
| Active goal | yes | Counted registry identity closure goal is active. |
| Mode classification | yes | Broad named registry surface; not a Core or package review. |
| Source and generated boundary | yes | Source registry and checker are owned here; CI-controlled public registry JSON and templates are excluded. |
| Related scoped sweep | yes | The 36-row identity manifest and 13-file copied-type follow-up cover every corrected class. |
| Agent-native review | yes | Agent-native and autoreview instructions were loaded; the prevention checker was reviewed. |
| Browser route | yes | Fresh proof used /blocks/playground-demo and the Table menu interaction. |

Work Checklist:
- [x] Captured every explicit prompt requirement and bounded the audit.
- [x] Classified all 36 identity-sensitive registry rows.
- [x] Applied capability-name, element-type, property-key, and copied-literal ownership consistently.
- [x] Repaired Markdown custom mark-key resolution and added a custom-key regression.
- [x] Repaired same-class runtime queries, component overrides, action maps, and render-owner type access.
- [x] Removed host MyEditor coupling from all 13 standalone copied registry surfaces.
- [x] Kept feature-owned properties and copied persisted values out of a global identity catalogue.
- [x] Added checker guards and focused fixtures for every corrected syntactic class.
- [x] Ran the full 4,220-file source/docs adoption audit.
- [x] Ran focused tests, final www source-first typecheck, scoped Biome, and diff check.
- [x] Exercised the repaired route and Table menu, then inspected console output.
- [x] Closed accepted autoreview findings and rejected the generated-output finding as CI-owned.
- [x] Recorded the changed list, decisions, attempts, evidence, and handoff.
- [x] Preserved package/Core APIs, exports, barrels, source doctrine, and generated outputs.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | 36/36 manifest rows and 13/13 copied-type boundaries close with zero deferred source rows. |
| Broad Core drift ledger | no | No Core source or public API changed. |
| Best Plate v2 recommendation | yes | Exact portals own runtime schema identity; names own capability routing; literals own copied persistence. |
| Plite/Plate gap ledger | no | Existing portals and local editor tuples express the final shape without a framework change. |
| Related scoped sweep | yes | Five guarded classes were audited across 4,220 source/docs files. |
| Package/API proof | yes | www typecheck passed 57/57 tasks; focused tests passed 11/11. |
| Source audit | yes | Checker passed 4,220 files and its focused suite passed 58/58. |
| Extracted-file inventory | yes | One untracked link-preview route is unrelated and untouched. |
| Autoreview | yes | Final review returned no findings with 0.9 confidence. |
| Final lint/check | yes | Targeted Biome and scoped diff check passed. |
| Agent source / generated sync | no | No source doctrine changed, so no generated skill sync is required. |
| Browser interaction proof | yes | Full editor rendered and Table menu opened; the earlier blockPlaceholder exception is absent. |
| Browser console check | yes | Only existing table-cell hydration drift and browser-extension DOM/style noise remain. |
| Goal plan complete | yes | Final plan checker command is recorded below and run after this evidence update. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Classify | complete | 36 expected, 36 actual, 0 missing, 0 extra. |
| Repair | complete | Runtime/config identity and 13 copied type boundaries fixed. |
| Guard | complete | 58 checker tests plus 4,220-file audit pass. |
| Prove | complete | Tests, typecheck, Biome, diff check, Browser, and autoreview pass. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Runtime/config identity | 100 | fixed | registry feature owners | 36/36 classified in linked ledger | none |
| Markdown plain marks | 100 | fixed | Markdown kit plus Suggestion/Comment portals | custom same-name keys are preserved by test | none |
| Copied registry editor typing | 100 | fixed | each copied item | 13 local minimal plugin tuples; zero host imports | none |
| Adoption checker | 100 | fixed | schema-adoption checker | 58/58 tests and 4,220-file run | none |
| Generated registry JSON | N/A | CI-owned | registry generation workflow | local generation is forbidden | CI regeneration |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|-----------------------|--------|------------------|
| Registry identity | Capability names for routing; portal type/key for live schema identity; explicit literals for copied persistence | universal KEYS/NODES bags, name-as-type, raw runtime literals, host-editor coupling | each concept has one honest owner and copied items stay standalone | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Decision |
|----------|--------------------|----------|
| N/A | none | Existing descriptor portals and generic PlateEditor tuples are sufficient. |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|--------------|---------|---------|----------|----------------|
| Raw runtime type literals | registry production source | AST checker for match/comparison classes | all source matches | all invalid | 0 | none |
| Bare capability override keys | registry kits | AST checker for override records | all source matches | all invalid | 0 | none |
| Raw plain-mark keys | registry kits | AST checker for plainMarks | all source matches | all invalid | 0 | none |
| Render contribution plugin type | registry UI | AST checker plus text sweep | all source matches | all invalid | 0 | none |
| Host MyEditor in copied items | registry UI and use-chat | import checker plus text sweep | 13 invalid | 13 | 0 | none |

Core drift ledger:
- Applies: no; no Core source changed.

Package file checklist:
- Applies: no; the target is the copied registry source.

Package doctrine / sync ledger:
- Applies: no; doctrine v47 already contained the required law and no rule source changed.

Packet ledger:
| Packet | Owner | Decision | Evidence | Next |
|--------|-------|----------|----------|------|
| Identity adoption | registry feature owners | keep | 36/36 ledger and checker | none |
| Copied type boundaries | copied registry items | keep | 13/13 local tuples | none |
| Generated registry output | CI | reject local edit | AGENTS forbids build:registry | CI regeneration |

Extracted file ledger:
| Path | Bucket | Decision | Proof |
|------|--------|----------|-------|
| apps/www/src/registry/app/api/link-preview/route.ts | outside active packet | untouched | unrelated untracked source found by scoped inventory |

Out-of-scope package drift:
- None reported by the final proof commands.

Out-of-scope matches discovered:
- None in the audited syntactic classes.

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Registry kits, runtime identity queries, mark access, render-owner checks, and 13 standalone copied editor type boundaries |
| tests/proof | Markdown and discussion regressions; schema-adoption checker and 58 fixtures |
| plans/artifacts | This plan and the 36-row identity ledger |
| skills/docs/generated | none |

Needs your attention:
- None.

Findings:
- The root drift was semantic flattening: a prior mechanical migration treated capability name, persisted type/key, copied values, and host editor typing as interchangeable.
- The first Browser run exposed a real render-owner bug: props.plugin.type was reading from the behavior contribution plugin. The element is now compared against Table/TableRow portal types.
- Copied registry UI cannot import the host editor kit merely for types; local plugin tuples preserve standalone copying and inference.

Decisions and tradeoffs:
- Exact feature portals are used when exact descriptor ownership matters; name-latest portals are used when installed same-name replacement semantics matter.
- Stable document properties such as listStyleType remain feature-owned. A global property-key map would recreate the ambiguity this packet removes.
- Generated apps/www/public/r/*.json output is left to CI by explicit repository policy.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
|------------------------|-------|----------------|------------|
| Initial www typecheck exposed comment/media editor typing gaps | 1 | own the smallest local plugin tuple | fixed and final typecheck passed |
| Media portal attempt expected an unavailable editor field | 1 | type the copied item from its actual plugin tuple | fixed |
| Initial plugin.type checker overmatched valid portals | 1 | narrow to render-contribution access | fixed with focused fixtures |
| First Browser pass threw blockPlaceholder element-type error | 1 | compare element.type to Table/TableRow portals | fixed; fresh Browser proof is clean |
| First review found two host MyEditor imports | 1 | sweep the full copied-item class | fixed all 13 |
| Second review found the checker missed use-chat.ts | 1 | cover both .ts and .tsx | fixed and guarded |
| Review requested generated registry JSON | 1 | apply repository generation boundary | rejected; CI owns output |

Verification evidence:
- bun test apps/www/src/registry/components/editor/plugins/markdown-kit.spec.ts apps/www/src/registry/lib/block-discussion-index.spec.tsx: 11 passed, 0 failed, 33 expectations.
- node --test tooling/scripts/check-plate-schema-adoption.test.mjs: 58 passed.
- node tooling/scripts/check-plate-schema-adoption.mjs: passed 4,220 source/docs files.
- pnpm turbo typecheck --filter=www: 57/57 tasks passed in 49.444s.
- Targeted Biome over 33 changed source/test files: passed without changes.
- Checker-only Biome over two tooling files: passed.
- Scoped git diff --check for registry, checker, plan, and artifact: passed.
- Final autoreview: no findings; patch correct; 0.9 confidence.
- Browser: /blocks/playground-demo rendered the editor and opened the Table menu. Console contains no blockPlaceholder ownership exception; only existing table-cell ID hydration and extension-injected DOM/style noise.
- pnpm brl: N/A because no export/barrel changed.
- pnpm install skill sync: N/A because no source doctrine changed.

Final handoff contract:
- target surface and mode: full copied-registry identity/config/runtime audit
- files/APIs reviewed: 36 identity rows plus 13 copied type boundaries
- broad Core drift score coverage: N/A
- package file checklist coverage: N/A
- doctrine start/final version: v47 unchanged
- best Plate v2 recommendation: names route capabilities; portals resolve live type/key; literals encode copied persistence
- Plite/Plate gaps: none
- related sweep: five guarded classes, all invalid matches fixed, zero deferred
- changes made: runtime/config fixes, local editor tuples, focused tests, and checker guards
- old compatibility names audited: KEYS/NODES/STYLE_KEYS zero in registry
- needs attention: none
- next best packet: none from this audit

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final registry identity closure. |
| Where am I going? | Goal completion after the plan checker. |
| What is the goal? | Every audited runtime/config identity case classified, fixed, guarded, and proved. |
| What have I learned? | Identity ownership and copied-item type ownership must be enforced separately. |
| What have I done? | Closed 36 identity rows, 13 copied type boundaries, Browser proof, and review. |

Timeline:
- 2026-08-02T19:26:16.246Z Goal plan created.
- 2026-08-02T20:33:00Z Fresh Browser proof completed and dev server stopped.
- 2026-08-02T20:40:00Z Final evidence and handoff recorded.

Open risks:
- None in the source packet. CI owns generated registry JSON refresh; local generation is forbidden.
