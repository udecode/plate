# code block pure utility ownership

Objective:
Repair Code Block pure utility ownership; done when every extracted candidate
has a caller-backed verdict and package type/tests/lint pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-28-code-block-pure-utility-ownership.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user requested moving pure utilities such as
  `pythonBrowserSafe` out of `BaseCodeBlockPlugin.ts`, possibly to `utils.ts`
- mode: named-file implementation packet with caller-backed topology review
- target surface:
  `packages/code-block/src/lib/BaseCodeBlockPlugin.ts`, its pure helper caller
  graph, the smallest semantic utility owner, focused tests, generated barrel
  output when exports move
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes; classify every top-level pure
  helper in `BaseCodeBlockPlugin.ts` and every caller of moved symbols
- package review mode: no; the user named one file/helper class rather than a
  full package review
- package review target: N/A; named-file packet
- package file checklist gate: N/A; named-file source map is sufficient
- doctrine version: 18
- package applied version / fingerprint state: read-only validation before edit
- sync mode / target: no
- sync queue row count: N/A
- completion threshold summary: every candidate has `inline`, `semantic utility
  owner`, or `keep independent` evidence; accepted moves preserve inference and
  pass focused Code Block proof

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
- requested duration: N/A
- semantics: N/A; no duration requested
- initial confidence score: N/A; binary caller/owner/proof threshold
- improvement loop: inspect definitions and callers, choose the semantic owner,
  implement, sweep, prove, and review
- final score / loop closure: all scoped candidates classified and all named
  proof commands green

Completion threshold:
- Classify every top-level pure helper in `BaseCodeBlockPlugin.ts`.
- Move only helpers with an honest semantic utility owner; do not create a
  generic taxonomy dump.
- Preserve public behavior and inferred plugin typing.
- Run focused Code Block typecheck, tests, build when the export boundary
  changes, scoped lint, stale-name/caller sweep, and autoreview.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-code-block-pure-utility-ownership.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Code Block package typecheck and focused/full
  package tests; build only if package exports change; scoped lint
- package proof: `pnpm turbo typecheck --filter=./packages/code-block` and
  `pnpm --filter @platejs/code-block test`
- shared Core gate: N/A unless the repair exposes a Core type-owner defect
- source audits: exact definitions/callers for all top-level pure helpers in
  `BaseCodeBlockPlugin.ts`, plus stale moved-symbol imports
- related scoped sweep query / active scope / match count / patched count / deferred count:
  query and counts recorded after caller inventory; patch scope is Code Block
- package file manifest / row count / checked count / deferred count: N/A;
  named-file packet
- version registry validation / starting status / final status: validate and
  record read-only status; no full-package v18 attestation
- package fingerprint command / result: N/A; not a full package review
- Plite/Plate gap ledger: record N/A unless inference blocks the move
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-code-block-pure-utility-ownership.md`

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
- Base/static renderer boundary law: `*-base-kit`, `*-static`, server/static
  renderers, and other Base/static modules must not import `platejs/react`,
  `@platejs/core/react`, or any `@platejs/*/react` entrypoint. Bind static
  components through `BasePlugin.configure({ component })`; keep
  `toPlatePlugin(BasePlugin)` in live React adapters only. If the Base path
  lacks a required capability, fix its Core owner instead of crossing layers.
  Bind Base/static descriptors to static renderer modules, never live/client
  node components; registry Base kits use the owning `*-static` component.
- Empty config inference law: do not create `type FooConfig =
  PluginConfig<'foo'>` only to call `createBasePlugin<FooConfig>({ key:
  'foo' })`. Manual plugin config types are only for real initial state, API,
  read, update, selectors, dependencies, extension capabilities, or external
  public contracts.
- Plugin capability boundary law: classify every contribution against the
  canonical `plate-plugin-creator` protocol. `initialState` declares defaults;
  `store` owns live editor-local state; `selectors` are pure store projections;
  `api` owns non-snapshot plugin services; `read` owns pure supplied-state
  queries; `update` owns active-transaction document mutation; `extension`
  owns genuine editor-wide Plite substrate; `codecs` own format declarations.
  Reject document reads in `api`, document mutations outside `update`, impure
  selectors/reads, plugin-scoped behavior hidden in `extension`, and
  unclassifiable contributions.
- Plugin authoring stage law: keep every independent contribution in
  `createBasePlugin()` / `createPlatePlugin()`. Keep `.extend()` only for
  imported/prebuilt adaptation, a shared factory unavailable to the
  constructor, or a real earlier-capability type dependency. Keep
  `.configure()` terminal and non-widening. Inline extension options need no
  wrapper; extracted reusable Plate extension factories use the callback
  context's `defineEditorExtension`.
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
  `usePluginOption`, or a parallel immutable `config` channel. Key+generic
  portals need an owner reason: plugin self-definition cycle, React
  hook/component imported by the plugin itself, non-React layer that must not
  import a React plugin, or intentionally decoupled cross-package code. Inline
  single-owner plugin behavior in the builder context. Only a proven shared or
  independent helper should receive a narrow plugin context or required `tx`
  parameter.

Boundaries:
- allowed edit scope: `packages/code-block/**`, generated barrels caused by the
  move, and this plan
- package/API surfaces: internal utility ownership only; no plugin call-shape,
  key, schema, capability, or behavior redesign
- docs/browser surfaces: N/A; internal package refactor with no docs/UI change,
  and Plate Next named-package proof stays package-local
- non-goals: no broad Code Block cleanup, Core generic repair, public API
  redesign, unrelated package edits, skill/doctrine update, or package
  attestation
- out-of-scope package errors: classify and report; do not fix

Output budget strategy:
- Use exact `rg` caller counts and bounded source slices. Exclude
  `node_modules`, `dist`, generated output, apps, and unrelated packages.

Blocked condition:
- Stop only if a move requires an unresolved public API/Core typing decision or
  package proof fails three times without a new in-scope fix.

Current verdict:
- verdict: keep in Plate under one private Python grammar adapter
- confidence: high after caller sweep, runtime grammar proof, package proof, and
  clean autoreview
- next owner: plate-next
- keep / revert / quarantine call: keep `pythonGrammar.internal.ts`; reject a
  generic `utils.ts`, a public utility export, and an inline vendored grammar
- reason: the grammar, aliases, lowlight patch guard, and regex helpers form one
  independent external-library adapter boundary

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Move pure helpers such as `pythonBrowserSafe`; consider but do not assume `utils.ts` |
| `plate-next` skill/rule read | yes | Full v18 skill, creator skill, and required creator references read |
| Active goal checked or created | yes | Goal created with this exact plan path |
| Mode classified as named packet vs broad Core sweep | yes | Named-file packet; no broad Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Internal owner truth, no compatibility wrapper |
| Broad Core drift ledger initialized when in scope | no | N/A: Core is outside scope |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`, scoped paths above |
| Output budget strategy recorded | yes | Exact caller queries and bounded source reads |
| Public API fork routing checked | no | N/A unless caller mapping proves the utility is public |
| Gap policy checked | yes | Stop at exact Core/Plite owner if inference fails |
| Related scoped sweep policy checked | yes | Same helper class within Code Block only |
| Review-mode rename freeze checked | yes | Owner-driven file naming is allowed; cosmetic churn is not |
| Package review checklist initialized when in scope | no | N/A: named-file packet |
| Doctrine registry validated for package review/sync | yes | v18 registry valid; Code Block is v17/stale with unchanged fingerprint |
| Sync queue materialized when sync mode is in scope | no | N/A: no sync |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Source and caller inventory | complete | Full Python grammar family and sole plugin caller mapped |
| Semantic extraction | complete | Private pythonGrammar.internal.ts owns construction and registration |
| Focused proof | complete | Barrel, lint, 54 tests, runtime grammar, build, and typecheck green |
| Final review | complete | Structured autoreview clean |

Work Checklist:
- [x] Prompt, named-file scope, no-duration condition, proof, and handoff captured.
- [x] Best Plate v2 verdict recorded for every reviewed helper.
- [x] Generic utils.ts, public helper export, compatibility alias, and broad casts rejected.
- [x] Every top-level helper in the reviewed source map has a caller-backed owner.
- [x] Related Code Block source sweep recorded after extraction.
- [x] Broad Core, package-review, package-sync, and public-API gates classified N/A.
- [x] No Plite/Core capability gap found or worked around.
- [x] Extracted/untracked files inventoried and origin/main/index owners checked.
- [x] Private semantic owner kept out of generated public barrels.
- [x] No changeset: internal-only topology and typing repair, no user-visible API delta.
- [x] Focused runtime, tests, build, typecheck, barrel, and lint proof passed.
- [x] Final structured autoreview returned clean.
- [x] Changed list, errors, decisions, and attention rows completed.
- [x] Output stayed scoped to Code Block and this plan.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all named focused proof | All commands green; 54/54 focused tests |
| Broad Core drift ledger | no | N/A | No Core file reviewed or changed |
| Best Plate v2 recommendation | yes | Record one final owner shape | Private pythonGrammar.internal.ts adapter |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A; Lowlight types were sufficient |
| Related scoped sweep | yes | Recount definitions and callers | One private adapter import/call; no stale public helper |
| Package file checklist | no | N/A | Named-file packet, not full package review |
| Doctrine attestation | no | Read-only status only | v18 registry valid; Code Block remains intentionally stale |
| All-package sync | no | N/A | No sync requested |
| Helper topology | yes | Classify the Python grammar family | Whole grammar subsystem moved together |
| Package/API proof | yes | Typecheck, test, runtime, build | Green |
| Shared Core gate | no | N/A | Product package only; no Core change |
| Non-Core error triage | yes | Classify proof failures | One in-scope type error fixed; no out-of-scope failures |
| Source audit | yes | Check old/new owner names and exports | No public grammar export; one internal caller |
| Rename ledger | no | N/A | Owner rename landed; nothing postponed |
| Extracted-file inventory | yes | Classify all untracked scoped files | Two rows recorded |
| Autoreview | yes | Structured local review | Clean, overall 0.82 |
| Final lint/check | yes | Scoped lint and typecheck | Green |
| Goal plan complete | yes | Run autogoal checker | Final checker command recorded below |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| packages/code-block/src/lib/BaseCodeBlockPlugin.ts Python grammar block | 5 | extract | Python grammar adapter | One CodeHighlight call; 360-line vendored external grammar obscured plugin owner | Keep only import/call |
| source, lookahead, concat | 0 | keep private | pythonGrammar.internal.ts | Used only to build the vendored grammar | No public export |
| pythonBrowserSafe | 0 | keep private | pythonGrammar.internal.ts | Independent Highlight.js grammar algorithm | No public export |
| aliases, patchedLowlights, ensureStablePythonGrammar | 0 | keep private | pythonGrammar.internal.ts | One registration lifecycle with grammar | One internal export to plugin |
| normal Code Block regex constants | 0 | keep inline | BaseCodeBlockPlugin.ts | Used by Code Block parsing/commands, unrelated to Python adapter | None |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|-----------------------|--------|------------------|
| Python highlighting compatibility | One private flat pythonGrammar.internal.ts containing grammar construction and registration lifecycle | Generic utils.ts, public barrel export, split helper files, inline 360-line adapter | Honest external-library boundary and shortest owner path | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | No workaround required | Code Block | Focused type/runtime proof | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Extract Python grammar family | packages/code-block/src | rg for pythonBrowserSafe, ensureStablePythonGrammar, aliases, patch guard, source/lookahead/concat | 14 source lines: 12 private adapter references plus Base import and call | whole family | 0 | none |
| Remove broad typing | reviewed production files | rg for any, unknown casts, and grammar casts | only Python keyword string any; zero type-any/casts | 2 former any annotations | 0 | none |
| Keep private export boundary | package barrels and package.json | rg for grammar owner names | zero barrel/package exports | 0 | 0 | none |

Core drift ledger:
- Applies: no.
- Manifest command: N/A.
- Expected rows: 0.
- Actual rows: 0.
- Missing/extra rows: 0/0.
- Score gate: N/A.
- Top drift rows: none.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | not reviewed | Core | Outside named packet | none |

Package file checklist:
- Applies: no; named-file packet.
- Package: Code Block.
- Manifest command: N/A.
- Expected/actual package-review rows: 0/0.
- Checked/deferred/missing/extra: 0/0/0/0.
- Next package blocked until: N/A.

Package file rows:
- [x] N/A — no full-package review was claimed.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-----------------|-------------|-------|-------------------|-----------------|
| code-block | 17 | 18 | changed after scoped source repair | N/A outside sync mode | no | focused packet proof | not attested | stale, intentionally unchanged |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Python grammar adapter | Code Block | Pure external grammar subsystem was in the plugin owner and typed with any | BaseCodeBlockPlugin.ts, pythonGrammar.internal.ts, focused proof | Extract whole family privately | closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| packages/code-block/src/lib/pythonGrammar.internal.ts | merge-existing-owner | origin/main has no separate grammar file; staged shared WIP had public ensureStablePythonGrammar.ts while live WIP had it inline | Reconcile both into one private semantic owner | barrel, build, runtime, test, typecheck |
| packages/code-block/src/lib/BaseCodeBlockPlugin.spec.tsx | recover-main-owner | untracked pre-existing shared test-family WIP | Preserve untouched; use its Python regression test | 54/54 focused tests |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking | Owner / next |
|-------------------|---------------|------------------|--------------|
| none | none | All proof failures were in-scope and repaired | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched | Next package / owner |
|---------------|----------------------|-----------------|----------------------|
| none | none | Scoped symbol family is Code Block-only | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | BaseCodeBlockPlugin imports the private adapter; new pythonGrammar.internal.ts owns the full grammar family and exact Lowlight-derived types |
| tests/proof | No test source edited; existing 54-test family plus real Lowlight runtime command used |
| docs/templates/skills | This goal plan only; no skill/doctrine change |
| reverted/quarantined packets | Generic utils.ts and public grammar export rejected |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | none | Packet is closed | N/A | none |

Findings:
- Purity was not enough to justify a generic utility file; the independent
  Highlight.js grammar adapter was.
- The honest move was the entire grammar family, not pythonBrowserSafe alone.
- The previous broad any annotations were unnecessary; Lowlight exposes the
  LanguageFn and instance types needed for exact typing.
- The package barrel generator keeps the .internal.ts owner private.

Decisions and tradeoffs:
- Keep normal Code Block regex constants inline because they belong to plugin
  parsing and commands.
- Keep source, lookahead, and concat beside the vendored grammar because they
  are grammar construction primitives, not package utilities.
- Use a string keyword pattern accepted by Highlight.js types and runtime,
  proven with a real grammar/alias execution.
- No changeset or browser proof: this is an internal package refactor with no
  public API or UI behavior change.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generated apply_patch context escaped regexes or duplicated a blank context line | 2 | Generate exact context from the live file and still apply through apply_patch | block removal succeeded without overwriting shared WIP |
| Initial exact typing exposed Highlight.js keyword-pattern declaration mismatch | 1 | Use the supported source-string pattern and Mode satisfies checks | typecheck and real runtime grammar proof passed |

Verification evidence:
- pnpm --filter @platejs/code-block brl — passed; no public grammar export.
- pnpm --filter @platejs/code-block lint:fix — passed, 12 files, no fixes.
- bun test packages/code-block/src/lib/BaseCodeBlockPlugin.spec.tsx — 54 passed, 0 failed, 116 expectations.
- Real Lowlight command registered Python and py/gyp/ipython aliases — passed.
- pnpm --filter @platejs/code-block build — passed.
- pnpm turbo typecheck --filter=./packages/code-block — 12/12 tasks passed.
- version.mjs validate — v18 registry valid.
- version.mjs status code-block — stale v17 with changed fingerprint; expected because this was not a full-package sync.
- autoreview local with explicit two-file scope and web disabled — clean, no accepted/actionable findings, overall 0.82.
- Browser — N/A by Plate Next named-package internal-refactor policy.

Final handoff contract:
- target surface and mode: Code Block named-file owner repair.
- files/APIs reviewed: BaseCodeBlockPlugin Python grammar call path and the full grammar helper family.
- broad Core drift score coverage: N/A, 0 rows.
- package file checklist coverage: N/A, no full-package claim.
- doctrine state: v18 registry valid; Code Block intentionally remains v17/stale and unattested.
- best Plate v2 recommendation: one private pythonGrammar.internal.ts adapter.
- verdict matrix summary: extract one subsystem; keep its private primitives together; keep unrelated Code Block regexes inline.
- Plite/Plate gaps or blockers: none.
- related scoped sweep: 14 symbol-family source lines, whole family owned, 0 deferred.
- out-of-scope matches: none.
- changes made: private semantic adapter, plugin import, exact external types, no public export.
- tests/proof: barrel, lint, 54 tests, runtime grammar aliases, build, source-first typecheck, registry validation, clean autoreview.
- old compatibility names audited: ensureStablePythonGrammar remains internal only; no public utility export.
- needs attention: none.
- next best Plate Next packet: resume the separate repo-wide plugin review when requested.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | User handoff |
| What is the goal? | Give Code Block pure grammar utilities one honest private owner |
| What have I learned? | The grammar family is an external adapter, not generic utilities |
| What have I done? | Extracted, typed, swept, proved, and reviewed it |

Timeline:
- 2026-07-28T22:03:19.151Z Goal plan created.
- 2026-07-29: source/caller inventory and staged/shared-WIP reconciliation completed.
- 2026-07-29: semantic extraction, typing repair, focused proof, and clean autoreview completed.

Open risks:
- None in the named packet.
