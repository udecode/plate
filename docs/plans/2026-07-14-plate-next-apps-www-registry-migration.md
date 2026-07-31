# plate-next apps-www registry migration

Objective:
Close apps/www Plate-to-Plite migration; done when stale editor APIs are zero,
www typechecks pass, and registry Browser proof is green.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-14-plate-next-apps-www-registry-migration.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- browser

Plate Next source:
- prompt / link: user accepted the proposed apps/www registry migration and
  said `go`
- mode: docs/API mismatch and app migration execution
- target surface: active `apps/www` source, registry UI/components/tests, and
  the smallest Plite/Core owner only if a real missing API is proven
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, active apps/www source only
- package review mode: no
- package review target: N/A: app lane, not a package packet
- package file checklist gate: N/A: app lane
- completion threshold summary: zero stale APIs; full www typecheck green;
  affected standalone registry demo(s) render and interact without console or
  network errors

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
- requested duration: none
- semantics: N/A: outcome-gated one-shot execution
- initial confidence score: N/A: binary source/typecheck/browser gates
- improvement loop: fix the highest owner-level type error, sweep the same API
  class, rerun focused diagnostics, then the full app gate
- final score / loop closure: all binary gates pass or a named blocker meets
  the blocked condition

Completion threshold:
- Active, non-generated `apps/www` source has zero stale root editor field
  reads/writes and zero old static ref/point/range helpers where current
  `editor.read` / `editor.update` APIs exist.
- `pnpm --filter www typecheck` passes both the app and package-integration
  TypeScript projects.
- Affected registry demo routes render and exercise the migrated behavior in
  Browser with console/network state checked.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-apps-www-registry-migration.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: targeted `tsc` diagnostics, relevant registry or
  package-integration tests, Biome for touched files
- package proof: six touched package typechecks, full Core and Selection tests
- shared Core gate: `pnpm check:core` because the Plate render owner was patched
- source audits: scoped `rg` over active apps/www source excluding generated
  registry/release output and historical migration content
- related scoped sweep query / active scope / match count / patched count / deferred count:
  recorded per correction below
- package file manifest / row count / checked count / deferred count: N/A: app lane
- Plite/Plate gap ledger: no gap known; current point/ref and selection APIs exist
- broad Core drift ledger gate: N/A: no Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-apps-www-registry-migration.md`

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
- Review-mode rename freeze: keep current `HEAD` names/paths while behavior and
  API drift are under review. Put desirable later renames in
  `docs/plans/pre-renaming.md`; do not turn the active diff into Added/Deleted
  rename soup unless the user explicitly asks for a rename pass.
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
  `defineEditorExtension({ name: pluginName, ... })` just to satisfy types.
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
  intentionally decoupled cross-package code. Plugin-owned helper graphs should
  receive plugin context (`api`, `getOption`, `getOptions`, `setOption`, `tx`)
  or be thin wrappers over the typed plugin API/tx group.

Boundaries:
- allowed edit scope: active `apps/www/src`, app config/tests needed for the
  migration, this goal plan, and smallest package owner only if type evidence
  proves the app cannot migrate cleanly
- package/API surfaces: consume current public Plite/Plate APIs; no public API
  redesign is authorized
- docs/browser surfaces: affected standalone `/blocks/[id]-demo` routes and
  only the registry/docs owners needed to make those routes compile
- non-goals: package re-reviews, generated `__registry__` edits, historical
  migration docs, `templates/**`, publishing, staging, committing, pushing, PR
- out-of-scope package errors: record only; patch packages only when the app
  proves a current public API regression or missing substrate capability

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- For app typecheck, capture counts and top owner diagnostics rather than
  streaming the entire compiler output; exclude generated/build trees from
  exploratory searches.

Blocked condition:
- Stop only after the same owner-level compiler/browser blocker survives three
  distinct fixes or a clean migration requires an unaccepted public API fork.
  Ordinary new type errors are iteration signals, not blockers.

Current verdict:
- verdict: main-parity cleanup onto current Plite APIs
- confidence: 1.0 after app, package, Core, and Browser proof
- next owner: none inside this packet
- keep / revert / quarantine call: keep the direct API cuts and the two proven
  owner fixes; no bridge or compatibility helper was introduced
- reason: current Plite owns the read/update primitives, while Plate Core owns
  plugin render context and Selection owns block-selectable injection context

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User-approved sequence is stale API cut, full www typecheck, then Browser registry proof. |
| `plate-next` skill/rule read | yes | Full skill read before implementation. |
| Active goal checked or created | yes | Goal created for this exact app migration and plan. |
| Mode classified as named packet vs broad Core sweep | yes | App migration lane plus two compiler/browser-proven owner fixes; not a broad Core sweep. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Current verdict uses direct Plite APIs and rejects wrappers. |
| Broad Core drift ledger initialized when in scope | no | N/A: no Core sweep. |
| Source of truth and allowed workspace recorded | yes | Plate-2 checkout, current Plite API owners, active apps/www sources. |
| Output budget strategy recorded | yes | Counts/top diagnostics and generated-tree exclusions above. |
| Public API fork routing checked | yes | No fork known; stop and route only if the compiler proves one. |
| Gap policy checked | yes | Existing direct APIs cover the first corrections. |
| Related scoped sweep policy checked | yes | Each correction sweeps active apps/www only. |
| Review-mode rename freeze checked | yes | No renames planned. |
| Package review checklist initialized when in scope | no | N/A: app lane. |
| Browser pack selected | yes | Browser pack materialized in this plan. |
| Browser route / app surface identified | yes | `/blocks/huge-document-demo` and `/blocks/playground`. |
| Browser tool decision recorded | yes | In-app Browser for ordinary local registry QA. |
| Console/network caveat policy recorded | yes | Both checked before closeout; any unrelated failure is named, not hidden. |

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
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [x] After every correction, related scoped sweep row is added with query,
      active scope, match count, patched count, deferred count, and remaining
      risk. In package review mode, broader matches are deferred, not patched.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] For package review mode, the package file checklist is generated before
      implementation, with one checkbox per reviewed file.
- [x] For package review mode, every package file row is either checked at
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
- [x] For package review mode, no next package is started before the current
      package checklist closes or the user explicitly redirects.
- [x] For Core-adjacent package review, `tooling/scripts/check-core.mjs` is
      updated to include the package, or the plan records why the package is
      product-only and outside `check:core`.
- [x] Direct one-shot API audit closed: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [x] Live node target and matcher audit closed: no supplied live node is
      rediscovered by type/ID, no flat `api.findPath` / `api.some` alias remains
      in scope, equality-only callbacks use property matchers, and every
      remaining predicate has computed/path/truthiness/narrowing semantics.
- [x] Optional public-read audit closed: feature-package production code does
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [x] Explicit normalization audit closed: every `tx.normalize(...)` and
      `editor.update.normalize(...)` match in scope has a ledger verdict;
      feature production calls have a named full-root semantic invariant or are
      cut/moved to the Plite owner; explicit normalizer tests remain test-only
      evidence rather than production precedent.
- [x] Plugin export inference audit closed: plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [x] Empty config inference audit closed: `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed options, API, tx, selectors, state, or external public contract.
- [x] Plugin extension options audit closed: plugin-owned extension options are
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | www typecheck, six-package typecheck, Core/Selection tests, and `check:core` pass. |
| Broad Core drift ledger coverage | no | Record N/A because this was not a broad Core sweep | N/A; two exact owner defects were patched and covered by `check:core`. |
| Score gate | yes | Own every reviewed drift row | All score 3-4 rows are cut or fixed; no deferred high-drift row. |
| Best Plate v2 recommendation | yes | Record the direct owner shape | Direct Plite reads/updates plus Plate-owned render context; no wrappers. |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No missing Plite API; two Plate owner defects were fixed at source. |
| Related scoped sweep after correction | yes | Run same-class app audits | Three exact final `rg` audits return zero matches. |
| Package file checklist | no | Record N/A because package review mode does not apply | N/A; this was an app migration packet. |
| Package/API proof | yes | Run focused package proof | Six touched package typechecks pass; Core 733/733 and Selection 111/111 pass. |
| Shared Core gate coverage | yes | Run the established Core gate | `pnpm check:core` passes all 45 covered packages. |
| Non-Core package error triage | yes | Classify unrelated diagnostics | Nine raw Plite donor-example Biome diagnostics are outside this Plate registry packet. |
| Source audit | yes | Audit removed compatibility names | All three exact stale-API queries are empty. |
| Rename ledger | no | Record N/A when no current-packet rename is postponed | N/A; no current-packet rename. |
| Extracted-file inventory | yes | Inventory active untracked source/proof files | Eleven rows inventoried; two historical changelog rows are excluded from active code and nine active rows are classified below. |
| Autoreview / review | yes | Run the owning review gate | Plate Next source review, compiler proof, focused tests, and Browser proof closed the packet. |
| Final lint/check | yes | Run scoped lint/check | Biome passes 239 active Plate migration files; donor examples excluded explicitly. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Ledgers below are complete; no user decision remains. |
| Goal plan complete | yes | Run the autogoal checker | Run after this evidence update. |
| Browser interaction proof | yes | Exercise affected standalone routes | Typed `HUGE_PROOF` and `PLAYGROUND_PROOF` into live Plite editors. |
| Browser console/network check | yes | Inspect both routes | Both routes returned 200 with zero warning/error logs. |
| Browser final proof artifact | yes | Record route/DOM proof | Each route rendered exactly one `div[data-plite-editor="true"]`; DOM text confirmed both inputs. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Source/API migration | complete | Three stale-API audits return zero matches. |
| Owner repairs | complete | Plate render context and Selection injection context are source-owned and regression-tested. |
| Type/test proof | complete | www, package, Core, Selection, and `check:core` gates pass. |
| Browser proof | complete | Huge Document and Playground interactions pass with clean logs. |
| Closeout ledger | complete | Completion, extracted-file, verification, and handoff rows are recorded. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `registry/ui/inline-combobox.tsx` static `before` / `pointRef` | 4 | hard-cut | Plite read/update APIs | Current public API exposes `editor.read.points.before` and `editor.update.refs.point`; origin/main behavior preserved. | full app typecheck + demo |
| active app/test root `editor.selection` access | 4 | main-parity-cleanup | Plite selection read/tx APIs | 30 root accesses across app/test owners migrated to `read.selection`, `state.selection`, or `tx.selection`. | full app and package-integration typechecks |
| registry mark reads via `state.marks.get()` | 3 | main-parity-cleanup | Plite direct marks read | Two callers migrated to `editor.read.marks()`. | full app typecheck |
| registry plugin API casts and nested API aliases | 4 | hard-cut | typed plugin portals | Reversed `toPlatePlugin` generics and render callback types fixed at the owner; final cast/API audits are empty. | www typecheck |
| render wrapper plugin context | 4 | keep-in-plate | Plate Core render pipeline | Playground proved wrappers received the wrong plugin API; each wrapper now receives its own portal context. | Core regression tests + Browser |
| block selection transform context | 4 | keep-in-plate | Selection plugin | Text-node transform injection no longer requires element React context; explicit element/path are passed by the plugin. | Selection regression test + Browser |
| huge-document URL hydration | 3 | keep-in-plate | registry demo | Server and hydration snapshots no longer disagree because query configuration starts after browser readiness. | Huge Document Browser route |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| App editor state/ref access | Consume direct `editor.read.*`, `editor.update.*`, and active `tx.*` APIs | Static Plite helper imports, root editor fields, Plate wrappers, casts | Plite already owns and types the required primitives. | none |
| Plugin render context | Preserve the owning plugin portal for every render wrapper | Calling wrappers with the rendered node plugin or casting the API | Wrapper APIs are plugin-scoped; the render pipeline must preserve that identity. | none |
| Block-selection transform injection | Pass the transform's element/path into the hook | Requiring React element context for text-node transform rows | The injection already owns the node and path; implicit context is the wrong dependency. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing Plite capability | A wrapper would duplicate existing Plite APIs | Existing Plite public API | app typecheck + Browser | direct migration |
| Plate owner defect | Render wrappers lost their plugin portal context | App casts would hide the runtime mismatch | Core render pipeline | regression test + Playground | fixed at Core owner |
| Plate owner defect | Block-selection transform assumed element React context | Conditional hook calls or app guards would be brittle | Selection plugin | regression test + Playground | fixed at Selection owner |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Replace static ref/root selection/old marks reads | active `apps/www/src`, excluding generated output | `editor.selection`, `currentEditor.selection`, `before(editor`, `pointRef(editor`, `state.marks.get` | 34 expressions / 16 files | 34 | 0 | full compiler may reveal adjacent API classes |
| Remove app plugin API casts and stale option helpers | active `apps/www/src`, excluding generated output | `editor.api as`, generic `editor.update<`, `getPluginApi`, `getTransforms`, root option helpers | 0 final | all compiler-discovered rows | 0 | none |
| Remove nested legacy plugin API groups | active `apps/www/src`, excluding generated output | `.api.(aiChat|suggestion|comment|copilot|blockSelection|blockMenu|placeholder|table).` | 0 final | all compiler-discovered rows | 0 | none |
| Remove stale root children/selection/marks fields | active `apps/www/src`, excluding generated output | root `.children`, `selection.get()`, `state.marks.get()` | 0 final | all compiler-discovered rows | 0 | none |

Core drift ledger:
- Applies: no; the packet fixed two exact owner defects and did not claim a broad Core sweep
- Manifest command: N/A for a named owner patch
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: zero for the named reviewed files
- Extra row count: zero for the named reviewed files
- Score gate: exact score-4 render-context row fixed and tested
- Top drift rows: `pluginRenderElement.tsx`, `pipeRenderElement.tsx`, and static equivalents

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| Named Core render pipeline files | 4 | keep-in-plate | Plate Core | Plugin-scoped context regression fixed; Core 733/733 and `check:core` pass. | none |

Package file checklist:
- Applies: no; package review mode was not requested
- Package: N/A app migration lane
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: zero
- Missing row count: zero
- Extra row count: zero
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A — package file checklist does not apply to this app migration packet.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| stale editor state/ref API cut | apps/www registry/tests | migrated code still touched removed root/static APIs | active app source; three exact `rg` audits | keep; final audits empty | none |
| plugin portal typing | registry plugin kits + Core types | reversed generics and partial resolved options forced casts | `PlatePlugin.ts`, `BasePlugin.ts`, registry suggestion/comment kits | keep; inference restored | none |
| render wrapper context | Plate Core | wrappers received the rendered-node plugin rather than their owning plugin | render pipelines + regression specs | keep; runtime owner fixed | none |
| block-selection injection context | Selection | text-node transform rows demanded element React context | hook, plugin transform, regression spec | keep; explicit owned inputs | none |
| huge-document hydration | registry demo | query parameters made server and hydration snapshots differ | `huge-document-demo.tsx` + Browser | keep; browser-ready external store | none |
| changeset release contract | release metadata | touched packages produced a duplicate AI patch bump | pending changesets + focused contract | keep consolidated metadata | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `apps/www/src/registry/components/editor/plate-to-html.tsx` | merge-existing-owner | no same path on `origin/main`; unrelated registry feature owner | preserved outside this runtime packet; review with its registry block owner | registry source check passes |
| `packages/core/src/lib/editor/BaseEditor.ts` | merge-existing-owner | replaces the deleted Slate editor type owner during the broader migration | preserved as the current Plate editor type owner; dedicated extraction review next | Core typecheck + type contracts |
| `packages/core/src/lib/plugin/PluginConfig.ts` | merge-existing-owner | types came from the deleted Slate plugin owner graph | preserved as the shared plugin config owner; dedicated extraction review next | Core typecheck + type contracts |
| `packages/core/src/lib/plugin/getBasePlugin.ts` | merge-existing-owner | replaces deleted `getSlatePlugin` behavior | preserved for dedicated colocation review | Core 733/733 |
| `packages/core/src/react/components/PlateRoot.tsx` | merge-existing-owner | replaces deleted `PlateSlate` root behavior | preserved for dedicated root-owner review | Core root/render tests |
| `packages/core/src/react/hooks/usePlateRootProps.ts` | merge-existing-owner | replaces deleted `useSlateProps` behavior | preserved with its root component for dedicated review | focused hook spec + Core gate |
| `packages/core/src/react/plite-react.ts` | merge-existing-owner | replaces deleted `slate-react` re-export boundary | preserved for a dedicated direct-import review | Core typecheck + Browser |
| `packages/core/src/react/hooks/usePlateRootProps.spec.tsx` | justify-new-proof-tooling | no same path on `origin/main` | keep; proves callback and root prop behavior | Core test suite |
| `packages/core/type-tests/base-plugin-contracts.ts` | justify-new-proof-tooling | no same path on `origin/main` | keep; protects plugin inference and composition contracts | Core type contracts |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| raw Plite donor examples under `apps/www/.../examples/plite/_examples` | nine existing Biome diagnostics | donor/example cleanup is not Plate registry migration | Plite example lane |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| untracked registry changelog pair dated 2026-07-13 | registry changelog | historical unrelated content, excluded from active code sweep | preserve user-owned row |
| raw Plite example lint rows | Plite examples | no relation to migrated Plate registry APIs | Plite example lane |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | direct app reads/updates, typed plugin portals, scoped render context, block-selection transform context, hydration-safe huge document |
| tests/proof | Core render/plugin inference specs, Selection hook regression, app/package/Core/browser gates |
| docs/templates/skills | this autogoal plan and package changesets only; no templates edited |
| reverted/quarantined packets | temporary Browser stack instrumentation removed; no compatibility bridge kept |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | No migration blocker or decision remains | all named gates pass | verification evidence | continue to the extracted Core owner packet |

Findings:
- Caller drift was not a Plite gap: every required selection, point, range,
  mark, ref, node, and transaction primitive already exists on current owners.
- Plugin render wrappers had a real Plate Core defect: the factory received its
  portal context, but the returned component received the rendered-node plugin.
- Block Selection had a real owner defect: transform props can run for text
  nodes, so implicit element React context is not guaranteed.
- Huge Document read URL configuration during the initial client snapshot,
  which disagreed with server output and caused hydration mismatch.
- `origin/main` behavior for inline combobox is preserved with current direct
  read/update owners and no compatibility helper.

Decisions and tradeoffs:
- Use transaction selection inside plugin tx callbacks and snapshot selection
  inside grouped reads; use direct editor reads in event callbacks. This avoids
  stale root fields without introducing subscriptions for callback-only data.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial focused Biome found one formatting row and one unused `editor` destructure | 1 | repair exact files with `apply_patch` | fixed before compiler pass |
| Initial www compiler pass reported 232 migration errors | 1 | repair by owner class and sweep each class | zero compiler errors |
| Playground threw `api.isBlockSuggestion is not a function` | 1 | trace wrapper portal identity to Core | fixed in render pipeline with regression test |
| Playground logged missing element-context warnings while typing | 1 | trace transform props to Selection owner | explicit element/path inputs fixed the owner |
| First `check:core` found duplicate AI patch changesets | 1 | consolidate package release metadata | focused release contract and full Core gate pass |

Verification evidence:
- `pnpm --filter www typecheck`: passes build source, docs parity, registry
  source, app TypeScript, and package-integration TypeScript.
- `pnpm turbo typecheck --filter=./packages/ai --filter=./packages/core
  --filter=./packages/dnd --filter=./packages/media
  --filter=./packages/mention --filter=./packages/selection`: 26/26 tasks pass.
- `pnpm --filter @platejs/core test`: 733 pass, zero fail.
- `pnpm --filter @platejs/selection test`: 111 pass, zero fail.
- `pnpm brl`: 56/56 package barrel tasks pass.
- `pnpm check:core`: 45 package typechecks/lints and complete covered package
  tests pass after changeset consolidation.
- Active Plate migration Biome set: 239 files pass; nine unrelated raw Plite
  donor-example diagnostics are recorded out of scope.
- Three final stale-API `rg` audits: zero matches.
- Browser `/blocks/huge-document-demo?...`: one Plite editor, `HUGE_PROOF`
  persisted, HTTP 200, zero warning/error logs.
- Browser `/blocks/playground`: one Plite editor, `PLAYGROUND_PROOF` persisted,
  HTTP 200, zero warning/error logs.

Final handoff contract:
- target surface and mode: active apps/www Plate registry migration with two
  exact owner fixes; not a broad Core or package sweep
- files/APIs reviewed: direct editor reads/updates, plugin portals, render
  wrappers, block-selection injection, Huge Document hydration
- broad Core drift score coverage: N/A; named Core owner defect tested and
  covered by `check:core`
- package file checklist coverage: N/A app lane
- best Plate v2 recommendation: direct Plite substrate consumption with Plate
  product context preserved at its owner
- verdict matrix summary: all score 3-4 rows cut or fixed; no high drift deferred
- Plite/Plate gaps or blockers: no Plite gap; two Plate owner defects fixed
- related scoped sweep query/active scope/matches/patched/deferred: three active
  app audits, zero final matches, zero deferred
- out-of-scope matches discovered: nine donor-example lint rows and two
  unrelated historical changelog files
- changes made: direct API cuts, typed portal inference, render/selection owner
  fixes, hydration guard, regression tests, changesets
- tests/proof commands: www typecheck, package typechecks, Core/Selection tests,
  barrels, `check:core`, scoped Biome, Browser interactions
- old compatibility names audited: exact stale API searches are empty
- needs attention: none
- next best Plate Next packet: review and fold the pre-existing extracted Core
  owner files listed above before starting another app migration packet

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure complete; mechanical goal check remains. |
| Where am I going? | Extracted Core owner review after this goal closes. |
| What is the goal? | Zero active stale app APIs, green www proof, green Browser proof. |
| What have I learned? | App drift was direct-call cleanup; runtime failures belonged to Plate owners. |
| What have I done? | Migrated app calls, fixed owners, added regressions, and closed all proof gates. |

Timeline:
- 2026-07-14T23:24:57.426Z Goal plan created.
- 2026-07-15 Checkpoint zero closed; VISION and Plate Next owners read.
- 2026-07-15 First stale API class cut: 34 expressions across 16 active files;
  scoped audit is empty.
- 2026-07-15 App compiler closed from 232 errors to zero through owner-class
  repairs and related sweeps.
- 2026-07-15 Browser proof exposed and verified Core render context, Selection
  transform context, and Huge Document hydration fixes.
- 2026-07-15 Final www, package, barrel, Core, lint, audit, and Browser gates
  passed.

Open risks:
- None inside the apps/www migration threshold. Extracted Core owner colocation
  is the next Plate Next packet, not a blocker for the proven app runtime.
