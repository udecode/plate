# plate-next floating media colocation

Objective:
Flatten the FloatingMedia React family into one owner file; done when the
nested files/barrel are gone, public symbols remain available, focused Media
proof and topology audits pass; plan
docs/plans/2026-07-23-plate-next-floating-media-colocation.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-23-plate-next-floating-media-colocation.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:

- none

Plate Next source:

- prompt / link: user: "go fix those now", referring to
  `FloatingMedia.tsx`, `useFloatingMedia.ts`, and `FloatingMediaStore.ts`.
- mode: named file/API implementation packet.
- target surface: FloatingMedia component family, its adjacent spec/local
  barrel, parent React media barrel, and exact caller/export graph.
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no.
- correction-triggered related scoped sweep: exact old paths, FloatingMedia
  exports/imports, nested family barrels, and family-only hook/store topology.
- package review mode: no; this is the user-named FloatingMedia family packet,
  not another full Media package review.
- package review target: N/A.
- package file checklist gate: N/A; named packet uses the review matrix below.
- completion threshold summary: one flat `react/media/FloatingMedia.tsx`, one
  adjacent family spec, parent barrel exports the flat owner, zero old nested
  paths, unchanged public symbols, and passing focused proof.

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

Timed checkpoint:

- requested duration: N/A; none requested.
- semantics: N/A; one-shot execution.
- initial confidence score: N/A; binary topology and proof gates apply.
- improvement loop: merge, audit, prove, review.
- final score / loop closure: N/A; exact completion threshold applies.

Completion threshold:

- `packages/media/src/react/media/FloatingMedia.tsx` owns the store, selectors,
  submit behavior, family hooks, and primitives.
- The nested `FloatingMedia/` directory, local barrel, `useFloatingMedia.ts`,
  and `FloatingMediaStore.ts` no longer exist; the family spec is flat beside
  its owner.
- Existing public symbol names and package import surface remain available.
- `pnpm brl`, focused Media tests, Media typecheck, scoped lint/format, exact
  path/symbol audits, final review, and the goal checker pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-plate-next-floating-media-colocation.md`
  passes after final evidence is recorded.

Verification surface:

- focused tests / commands: FloatingMedia family spec and `@platejs/media`
  package tests.
- package proof: Media source-first typecheck and lint/format.
- shared Core gate: run `pnpm check:core` if the focused change reaches that
  configured reviewed-package gate; otherwise record N/A with source evidence.
- source audits: old nested paths, local barrel, public symbols, and exact
  production consumers.
- related scoped sweep query / active scope / match count / patched count / deferred count:
  `rg` over `packages/media/src`, `apps/www/src/registry`, and `content/docs`;
  final counts recorded after patch.
- package file manifest / row count / checked count / deferred count: N/A;
  named family packet.
- Plite/Plate gap ledger: N/A unless implementation exposes a blocker.
- broad Core drift ledger gate: N/A; broad Core sweep not requested.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-plate-next-floating-media-colocation.md`

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
  `.extend*` methods. Do not annotate exports as `BasePlugin<Config>` /
  `PlatePlugin<Config>` or cast chained plugin results unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner.
- Empty config inference law: do not create `type FooConfig =
PluginConfig<'foo'>` only to call `createBasePlugin<FooConfig>({ key:
'foo' })`. Manual plugin config types are only for real options, API, tx,
  selectors, state, or external public contracts.
- Plugin editor extension law: plugin-owned editor extension options should be
  returned directly from `extendExtension`. Do not wrap them in
  `defineEditorExtension({ name: pluginKey, ... })` just to satisfy types.
  `extendExtension` must accept both built extensions and raw options; raw
  options without `name` default to the owning plugin key. Keep explicit names
  only for genuinely separate extension identities.
- Inferred local type law: do not annotate local variables whose initializer
  should infer the type. Smells like `const entries: NodeEntry<T>[] =
editor.read...` or `const value: Value = [...]` hide type regressions at the
  owner API. Remove the annotation and fix the source API if inference is weak.
  Keep annotations only for uninferrable locals such as empty arrays,
  deliberate narrowing/widening, exported/public signatures, or external
  boundary callbacks.
- Plugin option law: root plugin option helpers are forbidden public API. Do
  not use or re-add `editor.getOption(...)`, `editor.getOptions(...)`,
  `editor.setOption(...)`, or `editor.setOptions(...)`. Package code should use
  scoped plugin portals by default (`editor.plugin(FooPlugin).getOption(...)`,
  `editor.plugin(FooPlugin).getOptions()`,
  `editor.plugin(FooPlugin).setOption(...)`,
  `editor.plugin(FooPlugin).setOptions(...)`). `usePluginOption(FooPlugin, ...)`
  remains the render-subscription path. Key+generic fallbacks need an owner
  reason: plugin self-definition cycle, React hook/component imported by the
  plugin itself, non-React layer that must not import a React plugin, or
  intentionally decoupled cross-package code. Inline single-owner plugin
  behavior in the builder context. Only a proven shared or independent helper
  should receive a narrow plugin context or required `tx` parameter.

Boundaries:

- allowed edit scope: FloatingMedia family source/spec/local barrel, parent
  media barrel, generated barrels, this goal plan, and correction of the stale
  FloatingMedia rows in the existing Media review plan.
- package/API surfaces: preserve exported symbol names and runtime behavior;
  only source/file ownership changes.
- docs/browser surfaces: no docs/app source edits; use package proof and run a
  browser route only if required and available for the unchanged MediaToolbar
  integration.
- non-goals: no other Media family refactor, no public API cut/rename, no
  plugin/runtime behavior change, no commit or PR.
- out-of-scope package errors: classify and leave untouched unless caused by
  this packet.

Output budget strategy:

- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:

- Stop only if the flat owner cannot preserve the current public types/runtime
  without a real Plate/Core fix, or focused proof repeatedly exposes an
  unrelated external-state blocker.

Current verdict:

- verdict: `merge-existing-owner`.
- confidence: high from the exact caller graph.
- next owner: FloatingMedia component family.
- keep / revert / quarantine call: keep only after focused proof and review.
- reason: all three files implement one family; external store consumption
  proves public access, not independent ownership.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact family merge, flat topology, proof, non-goals, and handoff recorded |
| `plate-next` skill/rule read | yes | Full skill supplied/read in current thread; repaired React-family doctrine is the governing rule |
| Active goal checked or created | yes | `get_goal` returned no active goal; new goal created after this plan shell |
| Mode classified as named packet vs broad Core sweep | yes | Named FloatingMedia family packet; no broad sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | One durable component-family owner; no compatibility files |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; boundaries above |
| Output budget strategy recorded | yes | Targeted reads/searches only |
| Public API fork routing checked | yes | No public symbol/call-shape change; no `best-api` fork |
| Gap policy checked | yes | No known Plite/Plate gap; record if proof exposes one |
| Related scoped sweep policy checked | yes | Exact paths/symbol/caller graph only |
| Review-mode rename freeze checked | yes | Owner-driven flattening is required, not cosmetic rename churn |
| Package review checklist initialized when in scope | no | N/A: named family packet |

Work Checklist:

- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [x] Legacy/backcompat decision recorded: preserve public symbol names from the
      surviving owner; keep no forwarding path/barrel/file aliases.
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated: N/A; no Plite/Plate capability blocks the owner merge.
- [x] After every correction, related scoped sweep row is added with query,
      active scope, match count, patched count, deferred count, and remaining
      risk. In package review mode, broader matches are deferred, not patched.
- [x] N/A: broad Core sweep not requested; no Core drift ledger.
      this plan, has one row per Core source file before closeout.
- [x] N/A: broad Core sweep not requested; no Core file rows.
      `verdict`, `owner`, `evidence`, and `next`.
- [x] N/A: broad Core sweep not requested; no Core manifest.
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] N/A: broad Core sweep not requested; no Core score gate.
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] N/A: package review mode not requested; this is a named family packet.
      implementation, with one checkbox per reviewed file.
- [x] N/A: package review mode not requested; exact family files are in the
      review matrix.
      `utils/`, `helpers/`, `with*`, `decorate*`, similar helper file, and
      standalone `tx`-parameter function has an owner-topology row; every
      survivor has multiple-production-consumer or independent-boundary proof.
- [x] N/A: package review mode not requested.
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
- [x] N/A: no next package is part of this packet.
      package checklist closes or the user explicitly redirects.
- [x] N/A: no Core-adjacent package review or checker-coverage change.
      updated to include the package, or the plan records why the package is
      product-only and outside `check:core`.
- [x] Direct one-shot API audit closed: no editor read/update callback wrapper
      was added or changed in this React family packet.
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [x] Live node target and matcher audit closed: the existing live
      `TMediaElement` target remains passed directly to `nodes.set`; no query
      rewrite exists in scope.
      rediscovered by type/ID, no flat `api.findPath` / `api.some` alias remains
      in scope, equality-only callbacks use property matchers, and every
      remaining predicate has computed/path/truthiness/narrowing semantics.
- [x] Optional public-read audit closed: no `{ required: true }` or non-null
      assertion exists in the family owner.
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [x] Explicit normalization audit closed: no normalization call exists in the
      family owner or spec.
      `editor.update.normalize(...)` match in scope has a ledger verdict;
      feature production calls have a named full-root semantic invariant or are
      cut/moved to the Plite owner; explicit normalizer tests remain test-only
      evidence rather than production precedent.
- [x] Plugin export inference audit closed: N/A; no plugin export is in scope.
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [x] Empty config inference audit closed: N/A; no plugin config declaration was
      added or changed.
      `createBasePlugin<Config>` generics are removed when the config has no
      typed options, API, tx, selectors, state, or external public contract.
- [x] Plugin extension options audit closed: N/A; no extension options are in
      scope.
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
- [x] Bridge scoring law applied: no bridge or compatibility file survives.
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] N/A: no public API fork; all public symbols and call shapes are preserved.
- [x] Review-mode rename freeze applied: the flat owner/spec moves are
      ownership corrections explicitly accepted by the user; no rename is
      postponed.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packet kept after focused proof and clean autoreview.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` passed after the barrel/path change.
- [x] Old nested paths/imports were source-audited; zero remain.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed; reads and searches stayed scoped to
      the family, exact consumers, proof output, and plans.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Focused 4/4, unaffected Media 59/59, typecheck/build/lint/barrels/declaration audit pass |
| Broad Core drift ledger coverage | no | Record manifest counts only when broad Core sweep applies | N/A: named family packet |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | All six scoped topology rows close at current drift 0 |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | One flat owner/spec; no compatibility path |
| Plite/Plate gap ledger | no | Record blockers or N/A | N/A: no capability gap |
| Related scoped sweep after correction | yes | Record same-class search results | Six topology rows patched; 58 public-symbol matches across seven files reviewed; zero stale split-path matches |
| Package file checklist | no | Record manifest and score rows when package review applies | N/A: named family packet |
| Helper topology / lexical tx ownership | yes | Audit helper/source topology | Store, selectors, submit, hooks, and primitives share one owner; no tx helper exists |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Media typecheck/build/lint pass; emitted declaration surface is flat and complete |
| Shared Core gate coverage | no | Add reviewed package or record why N/A | N/A for named packet; attempted gate stops earlier on unrelated Plite-DOM raw-query allowance drift |
| Non-Core package error triage | yes | Classify proof failures | Media contract diagnostic, Plite-DOM audit, and Caption/Plite browser compile failures recorded out of scope |
| Source audit | yes | Run exact audit for removed compatibility names | Zero `FloatingMedia/index`, `./FloatingMediaStore`, or `./useFloatingMedia` matches |
| Rename ledger | no | Update postponed rename ledger when needed | N/A: owner-driven moves landed; no postponed rename |
| Extracted-file inventory | yes | Record untracked/extracted files | Two flat files inventoried and classified `merge-existing-owner` |
| Autoreview / review | yes | Run review gate | Autoreview clean, correctness 0.88, zero findings |
| Final lint/check | yes | Run scoped lint/check | Media lint checked 41 files; Biome exact files and diff-check pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Complete below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-plate-next-floating-media-colocation.md` | PASS |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `FloatingMedia/FloatingMedia.tsx` | 0 | `merge-existing-owner` | flat `FloatingMedia.tsx` | deleted after behavior moved intact | closed |
| `FloatingMedia/useFloatingMedia.ts` | 0 | `merge-existing-owner` | flat `FloatingMedia.tsx` | deleted after hooks/submit moved intact | closed |
| `FloatingMedia/FloatingMediaStore.ts` | 0 | `merge-existing-owner` | flat `FloatingMedia.tsx` | deleted after store/selectors moved intact | closed |
| `FloatingMedia/useFloatingMedia.spec.ts` | 0 | `merge-existing-owner` | flat family spec | moved with imports updated; 4/4 pass | closed |
| `FloatingMedia/index.ts` | 0 | `hard-cut` | parent `media/index.ts` | deleted; zero stale imports | closed |
| `media/index.ts` | 0 | `main-parity-cleanup` | React media root | exports `./FloatingMedia`; generated barrel verified | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| FloatingMedia React family | One flat `FloatingMedia.tsx` owning store, selectors, submit, hooks, and primitives; one adjacent family spec | keep store because app imports it; keep hook file because hooks are exported; keep nested barrel for compatibility | all symbols implement one component family; public access is not independent ownership | none; user explicitly accepted and said go |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no workaround needed | FloatingMedia family | focused package proof | implement merge |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Collapse family files | `packages/media/src/react/media/FloatingMedia*` plus parent barrel | exact five old family files plus parent export | 6 | 6 | 0 | none |
| Preserve public surface/callers | Media source, registry, current docs | ten public FloatingMedia symbols | 58 lines / 7 files | 0 caller changes required | 0 | none |
| Remove stale split topology | Media source, registry, current docs | `FloatingMedia/index`, `./FloatingMediaStore`, `./useFloatingMedia` | 0 | 0 | 0 | none |

Core drift ledger:

- Applies: no; named package-family packet.
- Manifest command: N/A.
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A.
- Actual row count: N/A.
- Missing row count: N/A.
- Extra row count: N/A.
- Score gate: N/A.
- Top drift rows: N/A.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | named family packet | N/A | no broad Core sweep | N/A |

Package file checklist:

- Applies: no; named family packet.
- Package: N/A.
- Manifest command: N/A.
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A.
- Actual row count: N/A.
- Checked score-100 count: N/A.
- Unchecked/deferred count: N/A.
- Missing row count: N/A.
- Extra row count: N/A.
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A.

Package file rows:

- [x] N/A: named FloatingMedia family packet; exact rows are in Review matrix.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| FloatingMedia family | flat `FloatingMedia.tsx` | implementation-kind files and nested barrel split one owner | source, spec, parent barrel, callers, package proof | keep: flat owner passes proof/review | close |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `src/react/media/FloatingMedia.tsx` | `merge-existing-owner` | origin/main nested component/store/submit owners all serve this family | keep flat owner | typecheck/build/lint/declarations/autoreview |
| `src/react/media/FloatingMedia.spec.ts` | `merge-existing-owner` | origin/main submit spec owns the same family behavior | keep flat family proof | 4/4 focused |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| Media full test | `BaseMediaPluginContracts.spec.ts` expects `plate.media.width`; current Core emits generic property-validation text; 65 pass / 1 fail | untouched contract/schema owner; focused family and other eight Media files pass | current schema/Core integration owner |
| `pnpm check:core` | Plite-DOM raw-query allowlist expects 2 calls, finds 0 | gate stops before Media and references untouched `packages/plite-dom/test/host-codec.test.ts` | Plite-DOM/schema integration owner |
| `/blocks/media-demo` | Caption imports missing Plite export `definePropertyPolicy`; route returns build-error overlay | compile failure is outside Media family and occurs before route runtime | Caption/Plite schema integration owner |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| FloatingMedia public symbols | registry MediaToolbar and current EN/CN docs/migration docs | imports and names remain valid; no adoption change needed | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | one flat `FloatingMedia.tsx`; parent barrel exports it; five nested paths deleted/moved; public API unchanged |
| tests/proof | flat `FloatingMedia.spec.ts`; focused/unaffected tests, typecheck, build, lint, barrels, declarations, audits, autoreview |
| docs/templates/skills | current goal plan plus supersession note in the prior Media review plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none in scoped packet | external schema WIP blocks broad/browser gates but not the proven family merge | out-of-scope drift table | leave to owning schema tasks |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and owner review | complete | exact family/caller graph, origin/main topology, and review matrix | implementation |
| Family merge | complete | one flat owner/spec; nested files and barrel removed | proof |
| Focused proof | complete | tests, typecheck, build, lint, barrels, declarations, and audits | review |
| Structured review | complete | autoreview clean with zero findings | closeout |
| Closeout | complete | ledgers, external failures, and handoff recorded | final response |

Findings:

- Current family is 315 lines across component, hooks/submit, store, spec, and
  two barrels.
- `media-toolbar.tsx` imports the store/selectors only to compose the
  FloatingMedia primitives; that is public access within the family contract,
  not an independent store job.
- Hooks have no production caller outside `FloatingMedia.tsx`; docs and tests
  do not establish another owner.
- `origin/main` was even more split; it is behavior evidence, not the target
  topology.
- Final family topology is one 163-line owner and one 130-line adjacent spec;
  the React media root contains no nested directory.

Decisions and tradeoffs:

- Preserve all public symbol names and behavior while changing their source
  owner and file paths.
- Flatten the directory and family spec; do not keep forwarding barrels or
  compatibility files.
- No changeset: relative to `origin/main`, the user-facing package exports and
  behavior are unchanged; this is internal source ownership only.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Package-local Bun omitted root preload (`mock` undefined) | 1 | run through root Bun owner | focused 4/4 passed |
| First topology audit found the now-empty directory | 1 | verify emptiness and remove exact directory | rerun passed |
| Full Media suite exposed unrelated diagnostic-contract drift | 1 | isolate touched and untouched tests | focused 4/4 plus other eight files 59/59 passed |
| `check:core` stopped on unrelated Plite-DOM allowance | 1 | preserve failure as external evidence | named packet uses focused owner proof |
| First dev command passed an extra `--` | 1 | pass `--port` directly | server started |
| Media demo build stopped on Caption/Plite export drift | 1 | capture overlay/import trace and stop server | browser proof recorded as externally blocked |
| First final checker run found the required phase table absent | 1 | add the completed named-packet phase rows | rerun passed |

Verification evidence:

- `pnpm brl` -> 56/56 barrel tasks passed; Media root exports the flat owner.
- `bun test packages/media/src/react/media/FloatingMedia.spec.ts` -> 4/4.
- Root Bun over the other eight Media spec files -> 59/59.
- `pnpm turbo typecheck --filter=./packages/media` -> 13/13 tasks.
- `pnpm --filter @platejs/media build` -> passed; emitted declarations contain
  every retained public symbol and no nested FloatingMedia artifact.
- `pnpm --filter @platejs/media lint` -> 41 files clean.
- Exact topology assertion -> one flat owner/spec, zero old paths/imports.
- Autoreview -> clean, zero findings, correctness confidence 0.88.
- Broad proof caveats -> Media full suite 65/66 due untouched diagnostic text;
  Core gate and browser route stop on unrelated shared schema WIP.
- Final goal checker -> passed after completed phase rows were added.

Final handoff contract:

- target surface and mode: FloatingMedia React family, named implementation
  packet.
- files/APIs reviewed: component, store/selectors, submit, three hooks, two
  primitives, namespace, family spec, barrel, exact app/docs callers.
- broad Core drift score coverage: N/A; no broad Core sweep.
- package file checklist coverage: N/A; six named topology rows all close at 0.
- best Plate v2 recommendation: one flat component-family owner/spec.
- verdict matrix summary: five merge/hard-cut paths and one parent-barrel
  cleanup, all closed.
- Plite/Plate gaps or blockers: none in scope.
- related scoped sweep query/active scope/matches/patched/deferred: six topology
  matches/six patched/zero deferred; 58 public matches reviewed; zero stale
  split paths.
- out-of-scope matches discovered: unchanged registry/docs consumers only.
- changes made: flat owner/spec, nested folder/barrel removed, parent barrel
  regenerated, prior plan supersession note.
- tests/proof commands: recorded above.
- old compatibility names audited: zero stale nested paths/imports.
- needs attention: none in scope; three shared schema failures remain external.
- next best Plate Next packet: resume the next user-selected Media/Plate family;
  do not reopen FloatingMedia.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final handoff |
| What is the goal? | One flat FloatingMedia family owner |
| What have I learned? | External store import is family composition, not independent ownership |
| What have I done? | Merged the family, regenerated barrels, passed focused proof and review, classified external gate failures |

Timeline:

- 2026-07-23T15:22:13.312Z Goal plan created.
- 2026-07-23 Checkpoint zero, caller graph, origin/main topology, and review
  matrix completed before implementation.
- 2026-07-23 Flat owner/spec landed; nested folder/barrel removed.
- 2026-07-23 Focused tests, typecheck, build, lint, barrels, declarations, and
  topology audits passed.
- 2026-07-23 Autoreview returned zero findings; external schema failures
  classified.
- 2026-07-23 Final goal checker passed.

Open risks:

- Browser interaction could not run because an unrelated Caption import targets
  a missing Plite schema export. Package build and emitted declarations prove
  the scoped public surface.
