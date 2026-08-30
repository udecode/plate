# plate-next plugin key to name

Objective:
Hard-cut Plate plugin identity `key` to `name` repo-wide; done when stale
Plate-key APIs are zero and focused checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-29-plate-next-plugin-key-to-name.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- docs
- package-api

Plate Next source:
- prompt / link: user request on 2026-07-30: “can we first do key -> name (and
  related like targetPluginNames), dont forget all function parameters using
  (key), docs etc. do not anything else”
- mode: named public API hard-cut with repo-wide caller/docs adoption
- target surface: Plate plugin descriptor identity and every directly related
  Plate API, parameter, type, source caller, test, registry/example, doc, and
  release artifact
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; this is an exhaustive named-API caller graph, not a
  file-by-file Core architecture review
- correction-triggered related scoped sweep: yes; sweep every Plate-identity
  `key`, `pluginName`, `targetPluginNames`, and key-named lookup parameter while
  preserving unrelated node/map/React/Plite keys
- package review mode: no
- package review target: N/A
- package file checklist gate: N/A
- doctrine version: started at 23; finished at 24 because the reusable identity
  rule needed to state that Plate plugins have one `name` channel and no
  compatibility `key`
- package applied version / fingerprint state: N/A
- sync mode / target: no
- sync queue row count: N/A
- completion threshold summary: zero stale Plate plugin-identity key surface,
  all affected callers/docs migrated, no compatibility alias, focused package
  and docs checks green

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
- initial confidence score: N/A; binary hard-cut threshold
- improvement loop: inventory -> owner rename -> callers/tests/docs/release ->
  stale-symbol audit -> focused proof -> review
- final score / loop closure: N/A; close only on zero stale semantic matches

Completion threshold:
- Plate plugin descriptors and public plugin APIs use `name`, not identity
  `key`; related public names use `pluginName` / `targetPluginNames`.
- Every directly affected source caller, callback parameter, test, type-test,
  registry/example, doc, and changeset is migrated.
- No compatibility aliases or dual `key`/`name` identity channel remains.
- Unrelated `key` concepts (React keys, keyboard keys, map/object keys, node
  properties, Plite APIs whose contract is independently named `key`) remain
  untouched.
- No config/initialState/extension-field or other Plate-on-Plite redesign lands
  in this packet.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-29-plate-next-plugin-key-to-name.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: affected Core/plugin tests and type-tests selected
  from the caller inventory
- package proof: source-first typecheck for every modified package; owning
  focused tests where available
- shared Core gate: `pnpm check:core`
- source audits: exact semantic audits for `targetPluginNames`, Plate descriptor
  `{ key:`, `.key` on plugin descriptors, and key-named public lookup
  parameters, with every remaining match classified
- related scoped sweep query / active scope / match count / patched count / deferred count:
  semantic AST plus symbol/prose scans over current Core, packages, apps,
  tooling, benchmarks, docs, rules, generated skills, and release notes; zero
  final identity matches, all confirmed matches patched, zero deferred
- package file manifest / row count / checked count / deferred count: N/A; this
  is an API adoption sweep, not package review mode. All 37 affected package
  source typechecks passed.
- version registry validation / starting status / final status: v23 valid to
  v24 valid; 43 active packages and 1 retired package
- package fingerprint command / result: N/A
- Plite/Plate gap ledger: none known; record any real blocker before workaround
- broad Core drift ledger gate: N/A; named API sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-29-plate-next-plugin-key-to-name.md`

Constraints:
- Do exactly this rename and its required adoption. Do not change any other
  public shape, plugin capability, runtime behavior, file topology, or
  Plate/Plite architecture.
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
  PluginConfig<'foo'>` only to call `createBasePlugin<FooConfig>({ name:
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
  `usePluginOption`, or a parallel immutable `config` channel. Name+generic
  portals need an owner reason: plugin self-definition cycle, React
  hook/component imported by the plugin itself, non-React layer that must not
  import a React plugin, or intentionally decoupled cross-package code. Inline
  single-owner plugin behavior in the builder context. Only a proven shared or
  independent helper should receive a narrow plugin context or required `tx`
  parameter.

Boundaries:
- allowed edit scope: `/Users/zbeyens/git/plate-2`; only files with a direct
  semantic dependency on Plate plugin identity naming, plus the goal plan and
  required release artifacts
- package/API surfaces: `packages/core` owner first, then affected Plate
  packages and aggregate exports/types only where the rename requires adoption
- docs/browser surfaces: all source-backed docs/examples/registry callers that
  teach or compile the renamed Plate API; browser proof only if a touched
  runnable registry surface needs runtime verification
- non-goals: Plite extension redesign; `config`/`initialState`; nested
  `extension`; capability staging; colocation; helper refactors; unrelated
  naming; behavior changes
- out-of-scope package errors: classify and leave untouched unless caused by
  this rename

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Count and save broad match inventories to plan artifacts; inspect
  owner-grouped slices and exclude generated output, dependencies, caches, and
  build artifacts.

Blocked condition:
- Stop only if one spelling is semantically ambiguous and source cannot
  distinguish plugin identity from an unrelated `key`, or if an owning public
  generic cannot express the rename without a separate API decision.

Current verdict:
- verdict: hard-cut
- confidence: high; implementation, adoption, proof, and final review complete
- next owner: plate-next
- keep / revert / quarantine call: keep only the complete rename packet; revert
  any unrelated edits
- reason: the user explicitly selected `name` and forbade all other work

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact user wording copied under Plate Next source; scope and non-goals are explicit |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read completely |
| Active goal checked or created | yes | Goal created with this plan path |
| Mode classified as named packet vs broad Core sweep | yes | Named public API hard-cut; not broad Core file review |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Hard-cut `key`; one `name` identity channel |
| Broad Core drift ledger initialized when in scope | no | N/A: named API sweep |
| Source of truth and allowed workspace recorded | yes | Plate source/tests/docs in `/Users/zbeyens/git/plate-2` |
| Output budget strategy recorded | yes | Owner-grouped counted searches; generated/dependency paths excluded |
| Public API fork routing checked | yes | N/A: user already accepted `key -> name`; no unresolved fork |
| Gap policy checked | yes | Stop and record an owner gap; no local alias/cast workaround |
| Related scoped sweep policy checked | yes | Exhaustive repo-wide semantic caller sweep is part of this named API packet |
| Review-mode rename freeze checked | yes | N/A: user explicitly requested this public naming cleanup |
| Package review checklist initialized when in scope | no | N/A: not package review mode |
| Doctrine registry validated for package review/sync | yes | Reusable identity doctrine changed; Plate Next v24 validates with 43 active and 1 retired package |
| Sync queue materialized when sync mode is in scope | no | N/A: not sync mode |
| Docs pack selected | yes | Supporting docs surface under Plate Next plan |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read completely |
| Docs lane selected | yes | API reference plus existing plugin/feature examples only |
| Target docs and nearest sibling docs read | yes | Current Core API, Plate Plugin API, plugin guide, related EN/CN feature pages, and release notes were read against source |
| Docs style doctrine read | yes | Current-state reference voice; source-backed API spelling |
| Documented source owner identified | yes | `@platejs/core` plugin descriptor/types; exact docs after inventory |
| Package/API pack selected | yes | Public package API hard cut |
| Public surface or package boundary identified | yes | `@platejs/core` owner plus affected package-exposed descriptor types |
| Release artifact path selected | yes | `.changeset` per published package delta relative to `main`; exact package set from inventory |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read completely |
| Barrel/export impact decision recorded | yes | No file/export move expected; rerun `pnpm brl` only if inventory proves exported layout changes |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded: hard-cut one descriptor identity field,
      `name`; keep serialized document `type` separate; keep `KEYS` as the
      value registry; use `targetPluginNames` for identity collections.
- [x] Compatibility and hack check closed: no `key` alias, dual channel,
      bridge, cast, fallback, or deprecated overload was added.
- [x] Core owner, 37 affected package consumers, app/registry callers,
      benchmarks, tooling, tests, docs, release notes, rules, and generated
      skills were migrated.
- [x] Every review correction received a same-class sweep; final semantic AST,
      symbol, lookup, and prose audits report zero current identity residuals
      and zero deferred matches.
- [x] `excludeBelowPlugins` resolves plugin names to node types before matching
      `node.type`; the fixture proves `name !== type`.
- [x] Docs are source-backed, current-state EN/CN reference prose; MDX parity,
      code contracts, and live `/docs/plugin` proof passed.
- [x] Existing published-package release notes carry the hard cut; this is not
      registry-only work, so no registry changelog was added.
- [x] Reusable doctrine was repaired, Plate Next advanced from v23 to v24,
      skills were regenerated/synced, and version validation passed.
- [x] Focused package, Core, app, docs, tooling, benchmark, release-artifact,
      browser, formatting, and final autoreview proof completed.
- [x] Broad Core drift scoring, package-review file scoring, sync-all, extracted
      file recovery, topology/capability audits, and `pnpm brl` are N/A: this is
      a named API adoption sweep with no file/export-layout changes.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Inventory and semantic classification | complete | Repo-wide AST/symbol/prose inventory distinguished Plate identity from Plite, React, keyboard, schema, state, and object keys |
| Core owner and declarations | complete | `name`-only public/runtime surface; Core typecheck and declaration contracts pass |
| Package/app/tooling/docs adoption | complete | 37/37 affected package typechecks, www typecheck, current docs and tooling audits pass |
| Doctrine and release adoption | complete | Plate Next v24 validates; existing changesets and current docs use the final names |
| Runtime and review closure | complete | Live docs/table routes pass with no console errors; final autoreview is clean |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove zero current semantic identity-key residuals | Final AST/symbol/lookup/prose audits report zero |
| Broad Core drift ledger coverage | no | Record N/A for a named API sweep | No broad file-by-file Core architecture review was authorized |
| Score gate | no | Record N/A outside drift-review mode | Named hard-cut closed by binary zero-residual threshold |
| Best Plate v2 recommendation | yes | Record final shape and rejected aliases | One `name` identity channel; `type` remains serialized node/property identity |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No owner gap blocked the rename |
| Related scoped sweep after correction | yes | Re-audit each corrected class | Four correction rows below; final residual count zero |
| Package file checklist | no | Record N/A outside package review mode | Adoption sweep proved 37 affected package builds directly |
| Package doctrine attestation | yes | Validate changed reusable doctrine | v23 to v24; hash `sha256:87623d783ca6afd0874dc088f928e41df806cbcea0207a34a7dd1dcd5cbe69b8`; 43 active, 1 retired |
| All-package sync closure | no | Record N/A outside sync-all mode | No package sync requested |
| Helper topology / lexical tx ownership | no | Record N/A outside topology review | User explicitly prohibited adjacent refactors |
| Package/API proof | yes | Run owner and consumer checks | Core, 37 packages, Table graph, www, tooling, docs, benchmarks, and release audit passed |
| Shared Core gate coverage | yes | Run `pnpm check:core` and classify unrelated failures | Core runner/contracts passed; source-adoption policy still reports pre-existing package colocation/codec-stage drift with no identity failures |
| Non-Core package error triage | yes | Classify reported package policy drift | Out-of-scope architecture debt listed below; untouched |
| Source audit | yes | Audit removed names and identity lookups | Zero current semantic matches; intentional historical and unrelated keys classified |
| Rename ledger | no | Record N/A when no file rename is postponed | No files moved or renamed |
| Extracted-file inventory | no | Record N/A when no extracted production file exists | No new production path or extraction |
| Autoreview / review | yes | Run scoped final structured review | Final Codex autoreview: clean, no actionable findings |
| Final lint/check | yes | Run scoped formatting and diff hygiene | Package and late-file Biome checks pass; final diff check recorded below |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run the autogoal checker | Final checker command is the last closure step |
| Docs source-backed claim audit | yes | Verify current docs against source | Plate docs contract audit passed for 363 current docs files |
| Docs links / routes / previews | yes | Verify touched runnable routes | `/docs/plugin` and `/blocks/table-demo` return 200 and render with zero console errors |
| Docs MDX/content parser | yes | Run docs source build/parity | `pnpm --filter www check:docs` passed |
| Plugin page specifics | yes | Apply current plugin guide/API doctrine | `name`, `targetPluginNames`, and name-deduplication examples render live |
| Public API / package boundary proof | yes | Audit types, declarations, barrels, and consumers | Name-based declarations expose no compatibility alias; no file/export-layout change |
| Release artifact classification | yes | Classify the published delta | Breaking Core/public package API hard cut |
| Published package changeset | yes | Update existing release notes | Seven existing affected changesets use `name`/`targetPluginNames`; existing Core major note owns the break |
| Registry changelog | no | Record N/A when not registry-only | Package API change, not a registry-only component change |
| No release artifact | no | Record N/A because release artifacts apply | Existing package changesets were updated |
| Package typecheck/build/test | yes | Run source-first affected checks | 37/37 affected package typechecks plus Core/Table/www proof pass |
| Barrel/export generation | no | Record N/A without export-layout changes | Existing barrels export renamed symbols automatically; `pnpm brl` not required |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Core plugin descriptor/config/reference/inference surface | 0 final | hard-cut | `packages/core` | `name`, `InferName`, `WithAnyName`, `WithRequiredName`, `NameofPlugins`, and `NameofNodePlugins`; declarations pass | keep |
| Core runtime caches, lookups, targeting, injection, and React context option | 0 final | hard-cut | `packages/core` | names index descriptors; type resolution remains explicit; focused Core proof passes | keep |
| Plate feature packages | 0 final | adopt | 37 affected packages | 37/37 direct source typechecks; package AST audit zero | keep |
| Apps, registry source, tooling, benchmarks | 0 final | adopt | owning callers | www typecheck, tooling 53/53, benchmark 6/6 | keep |
| Current docs, release notes, rules, generated skills | 0 final | adopt | docs/release/doctrine owners | docs checks, skill audit, and v24 validation pass | keep |
| `apps/www/public/r/**` registry payload | generated | CI-owned | registry build workflow | corrected source is `content/docs/api/core/plate-plugin.mdx`; local registry generation is forbidden | regenerate in CI |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Plate plugin identity | `name` is the sole descriptor identity; `type` is separate serialized schema identity; related collections and parameters say `name` | `key`, `key` alias, dual `key`/`name`, silent fallback, inferred identity from `type` | Clear AX, honest semantics when `name !== type`, one inference path | none; user explicitly chose this hard cut |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no workaround required | Core owns Plate identity | completed proof below | no gap |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Mechanical descriptor rename | Core, packages, apps, tooling, benchmarks | Babel AST for plugin creators plus old-symbol and `.key` lookup scans | 0 final | all confirmed identity matches | 0 | none |
| `useElementSelector` option | Core, Table, registry caller | option/call-site typecheck plus `useElementSelector` key scan | 0 final | owner, tests, and direct callers | 0 | none |
| Current API prose | 363 current docs files plus EN/CN siblings | docs code-contract audit and required-key phrase scan | 0 final | EN and CN `useEditorPlugin` prose | 0 | none |
| Name-to-type injection boundary | Core `excludeBelowPlugins` | inspect every name list consumed by a node-type matcher | 1 | 1 | 0 | regression fixture proves `quote` name maps to `blockquote-test` type |
| Final global closure | all current source/docs/rules/skills/release surfaces | fresh independent semantic residual audit and autoreview | 0 | 0 | 0 | historical/generated/unrelated matches classified |

Core drift ledger:
- Applies: no; named API sweep
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | named API mode | N/A | Review matrix above covers the named owner graph | N/A |

Package file checklist:
- Applies: no; API adoption sweep
- Package: 37 affected package consumers
- Manifest command: semantic caller inventory rather than score-100 package review
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: 0 identity callers
- Missing row count: 0 identity callers
- Extra row count: 0 identity callers
- Score gate: N/A
- Next package blocked until: N/A

Package file rows:
- [x] N/A — package-review scoring was not the active mode; direct adoption
      proof is 37/37 affected package source typechecks.

Package doctrine / sync ledger:
| Package | Start version | Latest | Fingerprint state | Required version checks | Full review | Proof | Final fingerprint | Registry status |
|---------|---------------|--------|-------------------|-------------------------|-------------|-------|-------------------|-----------------|
| Plate Next doctrine | 23 | 24 | source rule changed | v24 single-name identity check | no; doctrine repair only | `version.mjs validate` | `sha256:87623d783ca6afd0874dc088f928e41df806cbcea0207a34a7dd1dcd5cbe69b8` | valid: 43 active, 1 retired |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Core identity owner | Core | `key` duplicates the chosen public identity term | plugin types, builders, runtime model, portals, caches | hard-cut to `name` | keep |
| Consumer adoption | package/app owners | mechanically stale field/member/parameter names | 37 packages, www, tooling, benchmarks | migrate all confirmed identity uses | keep |
| Docs and release | docs/release owners | current guidance can teach removed API | current EN/CN docs and seven existing changesets | current-state `name` guidance | keep |
| Doctrine | Plate Next/API/UI rules | future agents could recreate `key` | source rules, Vision, generated skills, v24 ledger | prohibit identity aliases | keep |
| Review correction | Core injection | name collection was consumed as node types | `getInjectMatch` and focused spec | resolve names to types | keep |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no extracted production files | no path move | no action | exported layout unchanged |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm check:core` source-adoption policy | Existing/concurrent extend-stage and codec-colocation findings in basic-nodes, basic-styles, code-block, footnote, layout, link, list, legacy-list-model, media, mention, suggestion, and table | The gate reports no identity failure; changing those architectures violates “do not anything else” | future Plate Next architecture packet |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Plite `targetKey`, HostCodec/effect/state/schema/property/store keys | Plite and generic data owners | independent contracts, not Plate plugin identity | none |
| React keys, keyboard keys, object/map keys, node property keys | owning generic/runtime code | correct existing semantics | none |
| Historical migrations, changelogs, version ledgers, intentional `// Before` snippets | historical documentation | changing history would make it false | preserve |
| `apps/www/public/r/api-core-plate-plugin-docs.json` | CI registry build output | repo rules forbid local registry generation or manual output edits; source is fixed | CI regeneration |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Core descriptor/types/runtime/lookups/caches/injection plus direct package/app/tooling/benchmark identity consumers |
| tests/proof | Core contracts/specs, affected package tests/typechecks, tooling checker fixtures, benchmarks |
| docs/templates/skills | Current EN/CN docs, existing changesets, Vision/rule sources, generated skills, Plate Next v24 registry |
| reverted/quarantined packets | Historical package changelogs restored; no unrelated architecture refactor accepted |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | CI registry payload | Local `apps/www/public/r/**` remains generated from an older build | corrected source: `content/docs/api/core/plate-plugin.mdx` | let CI regenerate; do not commit local registry build output |
| 2 | Unrelated `check:core` policy drift | Full gate still reports package colocation/codec-stage findings | out-of-scope drift row above | handle in a separate Plate Next architecture packet |

Findings:
- Plate descriptor identity is cleanest as `name`; serialized schema identity
  remains `type`.
- Collections and lookup parameters must say `name` when they carry descriptor
  identity.
- Name-based exclusion must resolve to node types before matching `node.type`;
  the final review caught and the focused regression now proves that boundary.

Decisions and tradeoffs:
- No compatibility alias. A dual channel would preserve ambiguity and weaken
  inference.
- Preserve `KEYS`: it is a stable constant registry whose values are plugin
  names, not a descriptor field.
- Preserve historical and unrelated key vocabulary.
- Do not edit CI-generated registry payloads locally; repair their source.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First autoreview found stale current prose and CI output | 1 | Fix source prose; classify generated output by repo policy | EN/CN prose fixed; generated payload rejected as non-source |
| Second autoreview found `excludeBelowPlugins` name/type confusion | 1 | Fix type resolution at Core owner and strengthen fixture | focused 3/3 plus Core typecheck/contracts pass |
| Core typecheck exposed one stale selector option in its spec | 1 | Re-run semantic caller scan and patch the exact test | combined focused suite 6/6 and Core typecheck pass |
| Full `check:core` source-adoption scan reported unrelated architecture rows | 1 | Classify rather than broaden scope | recorded as out-of-scope; identity checks remain clean |

Verification evidence:
- `pnpm --filter @platejs/core typecheck` passed, including declaration
  contracts.
- `bun test packages/core/src/internal/plugin` passed 144/144.
- `bun test packages/core/src/lib/utils/getInjectMatch.spec.ts packages/core/src/react/stores/element/useElementSelector.spec.tsx`
  passed 6/6.
- All 37 affected package direct source typechecks passed; the Table turbo graph
  passed 16/16.
- `pnpm turbo typecheck --filter=./apps/www` passed.
- `pnpm --filter www check:docs` and
  `node tooling/scripts/check-plate-doc-code-contracts.mjs` passed; 363 current
  docs files audited.
- Tooling checker tests passed 53/53.
- `node tooling/scripts/check-plite-release-artifacts.mjs` passed for 10 packed
  packages and 34 public subpaths.
- `bun test benchmarks/editor/benchmarks/plite-schema-architecture-benchmark.test.ts`
  passed 6/6.
- Browser proof: `/docs/plugin` and `/blocks/table-demo` returned 200, rendered
  the renamed surfaces, and produced zero console errors.
- `node .agents/rules/plate-next/scripts/version.mjs validate` passed at v24
  with 43 active and 1 retired package.
- Final semantic AST/symbol/lookup/prose audit found zero current Plate
  identity-key residuals.
- Scoped Biome checks and `git diff --check` passed.
- Final command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --stream-engine-output --prompt "<scoped key-to-name review>"`
  exited 0 with no actionable findings.

Final handoff contract:
- target surface and mode: repo-wide named public API hard cut; no adjacent
  architecture work.
- files/APIs reviewed: Core identity owner, 37 affected package consumers,
  apps/registry source, tooling, benchmarks, current docs, release notes,
  doctrine, and generated skills.
- broad Core drift score coverage: N/A; named API sweep with zero-residual
  threshold.
- package file checklist coverage: N/A; 37/37 direct consumer typechecks
  replace package-review scoring.
- doctrine start/final version and source-fingerprint state: v23 to v24;
  fingerprint `sha256:87623d783ca6afd0874dc088f928e41df806cbcea0207a34a7dd1dcd5cbe69b8`.
- version registry evidence and remaining stale/drifted count: valid, 43 active,
  1 retired; zero identity residuals.
- best Plate v2 recommendation: one `name` identity channel, separate `type`,
  no alias.
- verdict matrix summary: all named owner/consumer rows are final drift 0.
- Plite/Plate gaps or blockers: none.
- related scoped sweep query/active scope/matches/patched/deferred: semantic
  AST, old-symbol, member-lookup, parameter, and current-prose audits over all
  active surfaces; zero final, all confirmed patched, zero deferred.
- out-of-scope matches discovered: unrelated Plite/data/React/keyboard keys,
  accurate historical examples, CI registry output, and separate package
  architecture policy drift.
- changes made: complete identity rename, consumer/doc/release/doctrine
  adoption, and one name-to-type injection correction.
- tests/proof commands: recorded in Verification evidence.
- old compatibility names audited: yes; zero current semantic surface and no
  alias.
- needs attention: CI regenerates the public registry payload; unrelated
  `check:core` architecture findings remain separate.
- next best Plate Next packet: none selected here; user asked for this rename
  only.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | Autogoal validation and handoff |
| What is the goal? | Hard-cut Plate plugin identity `key` to `name` only |
| What have I learned? | Name/type conversion boundaries need behavioral proof |
| What have I done? | Completed owner, adoption, docs, doctrine, proof, browser, and review passes |

Timeline:
- 2026-07-29T23:12:10.256Z Goal plan created.
- 2026-07-30: Core owner and repo-wide consumers migrated.
- 2026-07-30: Current docs, release notes, rules, skills, and v24 registry
  adopted.
- 2026-07-30: Browser proof and three scoped review passes closed two accepted
  findings; final autoreview clean.

Open risks:
- No known Plate identity correctness risk.
- CI must regenerate `apps/www/public/r/**` from the corrected source.
- Full `check:core` still reports unrelated package architecture policy drift;
  it contains no identity finding and remains outside this packet.
