# plate-next blocks insert-after sweep

Objective:
Add Plite `tx.blocks.insertAfter` and replace equivalent Plate insertion
boilerplate without changing insertion behavior.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-14-plate-next-blocks-insert-after-sweep.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: user: "ok go and sweep repair"
- mode: named public API packet plus explicit cross-package correction sweep
- target surface: Plite block insertion API and Plate callers that manually
  compute `PathApi.next(...)` solely to insert after a block
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, explicitly requested
- package review mode: no
- package review target: N/A: this is a cross-package API correction sweep
- package file checklist gate: N/A: package review mode is not active
- completion threshold summary: API implemented and tested; every equivalent
  source caller patched or explicitly rejected; touched packages typecheck;
  changeset and plan gates pass

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
- requested duration: N/A: none requested
- semantics: N/A: one-shot execution
- initial confidence score: N/A: binary API, sweep, and proof threshold
- improvement loop: implement, run focused tests/typechecks, sweep again,
  repair accepted findings, then close
- final score / loop closure: all auditable completion rows pass

Completion threshold:
- `EditorTransactionBlocksApi` exposes typed `insertAfter`, runtime semantics
  insert after the resolved live block target, and focused Plite tests pass.
- Every source match equivalent to manual block + `PathApi.next` insertion is
  migrated or recorded as non-equivalent/deferred with evidence.
- Touched package typechecks, lint, changeset validation, and the final plan
  check pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-blocks-insert-after-sweep.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: focused Plite transaction test for insertion after
  live block target; owning package tests where existing insertion specs apply
- package proof: source-first typecheck for Plite and every touched consumer
- shared Core gate: `pnpm check:core` because the Plite public transaction API
  is consumed by reviewed Plate packages
- source audits: exact searches for manual `PathApi.next(block[1])` insertion
  and for `blocks.insertAfter`
- related scoped sweep query / active scope / match count / patched count / deferred count:
  `origin/main` `nextBlock` callers plus current `PathApi.next(block[1])`
  insertion shapes / seven migrated production callers / seven reviewed / six
  converted / zero deferred; placeholder exact-path insertion rejected as
  non-equivalent
- package file manifest / row count / checked count / deferred count: N/A:
  package review mode is not active
- Plite/Plate gap ledger: initial Plite gap is missing block-relative insertion;
  this packet patches the smallest owner
- broad Core drift ledger gate: N/A: not a broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-blocks-insert-after-sweep.md`

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
- allowed edit scope: `packages/plite` API/runtime/tests, source callers with
  equivalent insertion-after boilerplate, their focused tests, one changeset,
  and this goal plan
- package/API surfaces: `EditorTransactionBlocksApi`, transaction runtime, and
  Plate insertion transforms that reproduce main's `nextBlock: true` behavior
- docs/browser surfaces: N/A: no UI or route behavior is changed; package proof
  is the owning surface
- non-goals: no generic path cleanup, no unrelated `PathApi.next` replacement,
  no compatibility alias, no file moves or renames
- out-of-scope package errors: report but do not repair unless caused by this API

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Restrict source discovery to `packages/plite/src`, focused Plite tests, and
  `packages/*/src`; exclude `dist`, generated templates, docs corpora,
  `node_modules`, build artifacts, and lockfiles.
- Count/file-list broad matches first, then inspect only matching files; cap
  ordinary reads around 4,000-12,000 output tokens.

Blocked condition:
- Stop only if insertion-after semantics cannot be represented without a wider
  public design fork, or the same owner failure persists through three distinct
  focused repair attempts with no safe autonomous next move.

Current verdict:
- verdict: `move-to-plite` for the generic primitive; `main-parity-cleanup` for
  equivalent Plate callers
- confidence: high; current code proves the missing primitive and main proves
  the intended after-current-block behavior
- next owner: plate-next
- keep / revert / quarantine call: keep the Plite primitive and six equivalent
  caller conversions; keep placeholder exact-path insertion; defer legacy table
  migration to its owning package
- reason: generic editor substrate belongs in Plite, not duplicated in Plate

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact API and explicit sweep recorded above; no duration or browser request |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully |
| Active goal checked or created | yes | Goal created with this plan path |
| Mode classified as named packet vs broad Core sweep | yes | Named public API packet plus correction sweep; not broad Core |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Generic insertion primitive belongs in Plite |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; current source plus `origin/main` behavior evidence |
| Output budget strategy recorded | yes | Targeted capped reads and count-first sweep below |
| Public API fork routing checked | yes | User explicitly accepted `blocks.insertAfter` in the immediately preceding API review |
| Gap policy checked | yes | Missing Plite primitive is patched at `EditorTransactionBlocksApi` owner |
| Related scoped sweep policy checked | yes | Explicit cross-package equivalent-caller sweep requested |
| Review-mode rename freeze checked | yes | No moves or renames allowed |
| Package review checklist initialized when in scope | no | N/A: not package review mode |
| Package/API pack selected | yes | `package-api` materialized in this plan |
| Public surface or package boundary identified | yes | `@platejs/plite` transaction blocks API |
| Release artifact path selected | yes | `.changeset` for published Plite API plus changed consumer packages |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read before changeset work |
| Barrel/export impact decision recorded | yes | Existing exported editor type changes only; no file/export-barrel change expected |

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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named focused and shared proof | Plite 43, code-block 89, code-drawing 13, Excalidraw 5, media 93, and AI 71 tests pass |
| Broad Core drift ledger coverage | no | Record N/A | Named API packet, not a broad Core sweep |
| Score gate | yes | Own every in-scope drift row | All in-scope rows are fixed or explicitly kept for exact-path semantics |
| Best Plate v2 recommendation | yes | Record preferred current shape | Generic primitive lives in Plite; Plate callers use it directly |
| Plite/Plate gap ledger | yes | Close the missing primitive | `blocks.insertAfter` implemented at the Plite transaction owner |
| Related scoped sweep after correction | yes | Audit every equivalent caller | Seven migrated callers reviewed, six patched, one rejected as non-equivalent, zero deferred |
| Package file checklist | no | Record N/A | Package-review mode was not active |
| Package/API proof | yes | Run focused package proof | All six affected package suites pass; touched packages typecheck |
| Shared Core gate coverage | yes | Run shared gate | `pnpm check:core` exits 0 |
| Non-Core package error triage | yes | Classify unrelated graph failure | Turbo AI/media graph reaches unmigrated table; direct AI/media typechecks pass |
| Source audit | yes | Audit manual next-path insertion and new API callers | Six production consumers use `blocks.insertAfter`; remaining matches are exact-path or legacy table |
| Rename ledger | no | Record N/A | No rename or move |
| Extracted-file inventory | yes | Classify every untracked in-scope file | One file: this goal plan, justified proof tooling |
| Autoreview / review | yes | Run until clean | Two valid findings fixed; final autoreview reports clean |
| Final lint/check | yes | Run scoped lint and shared check | Package lint passes and `check:core` exits 0 |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Completed below |
| Goal plan complete | yes | Run mechanical plan gate | `check-complete.mjs` exits 0 |
| Public API / package boundary proof | yes | Audit owner, type, runtime, and root wrapper | Interface, public-state runtime, root delegation, contract test, and type smoke covered |
| Release artifact classification | yes | Classify published deltas | Published Plite API plus code-drawing, Excalidraw, and media command semantics |
| Published package changeset | yes | Use one package per changeset with legal major bumps | Existing Plite major changeset covers the API; three consumer major changesets updated |
| Registry changelog | no | Record N/A | No registry-only files |
| No release artifact | no | Record N/A | Published package users see API/option semantics |
| Package typecheck/build/test | yes | Run owning checks | Source-first typechecks and focused/full package suites pass |
| Barrel/export generation | no | Record N/A | Existing exported type changed; no exported file or barrel layout changed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Plite transaction blocks API | 0 | move-to-plite | `@platejs/plite` | Interface, runtime, root wrapper, type smoke, and 43-test contract pass | keep |
| AI stream insertion | 0 | main-parity-cleanup | `@platejs/ai` | Uses active `tx.blocks.insertAfter`; 71 tests and typecheck pass | keep |
| Code-block empty insertion | 0 | main-parity-cleanup | `@platejs/code-block` | Explicit target regression covered; 89 tests pass | keep |
| Code drawing insertion | 0 | main-parity-cleanup | `@platejs/code-drawing` | Plugin command passes options to block target; 13 tests pass | keep |
| Excalidraw insertion | 0 | main-parity-cleanup | `@platejs/excalidraw` | Existing block target semantics covered; 5 tests pass | keep |
| Image and media embed insertion | 0 | main-parity-cleanup | `@platejs/media` | Direct one-shot API and explicit target coverage; 93 tests pass | keep |
| Placeholder upload insertion | 0 | keep-in-plate | `@platejs/media` | `at` can be a vacant exact path after deleting an empty block; regression test passes | keep exact path |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Insert after containing block | `tx.blocks.insertAfter` plus `editor.update.blocks.insertAfter` | Per-caller selection reads, block lookup, `PathApi.next`, and Plate wrapper | It is generic transaction substrate and preserves live-node targets | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plite gap, resolved | Block-relative insertion from location or live node | Every Plate caller duplicated target resolution and next-path math | `EditorTransactionBlocksApi` and Plite runtime | Contract behavior, type smoke, consumer proof | implemented |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Add `blocks.insertAfter` | Migrated production sources represented by `origin/main` `nextBlock` behavior | Compare main caller inventory; audit current `PathApi.next(block[1])` and `blocks.insertAfter` | 7 | 6 | 0 | Placeholder is intentionally non-equivalent because its target may be vacant |
| Placeholder review fix | Media placeholder paste flow | Search callers passing a deleted block path as `at` | 1 | 1 | 0 | Regression test locks replacement semantics |
| Code-block review fix | Code-block explicit-target flow | Review reuse of `at` after block-relative insertion | 1 | 1 | 0 | Regression test locks conversion of the inserted paragraph |

Core drift ledger:
- Applies: no; named API packet, not broad Core.
- Manifest command: N/A.
- Manifest owner: N/A.
- Optional type-test owner: N/A.
- Ledger location: N/A.
- Expected row count: 0.
- Actual row count: 0.
- Missing row count: 0.
- Extra row count: 0.
- Score gate: N/A.
- Top drift rows: none.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | not in scope | N/A | Named API packet | none |

Package file checklist:
- Applies: no; this was an explicit cross-package correction sweep.
- Package: N/A.
- Manifest command: N/A.
- Expected row count: 0.
- Actual row count: 0.
- Checked score-100 count: 0.
- Unchecked/deferred count: 0.
- Missing row count: 0.
- Extra row count: 0.
- Score gate: N/A.
- Next package blocked until: N/A.

Package file rows:
- [x] N/A — package-review mode was not active.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Plite primitive | `@platejs/plite` | Missing generic block-relative insertion caused consumer boilerplate | editor interface, public-state runtime, root view, contract and type tests | implement | keep |
| Equivalent consumers | AI, code-block, code-drawing, Excalidraw, media | Migrated main `nextBlock` semantics were expanded manually | six production callers and focused specs | convert | keep |
| Exact-path exception | media placeholder | Superficially similar next-path math has different semantics | placeholder transform and paste spec | retain `nodes.insert` | document in changeset |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `docs/plans/2026-07-14-plate-next-blocks-insert-after-sweep.md` | justify-new-proof-tooling | No existing goal plan owns this packet | keep | Required autogoal execution ledger |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `@platejs/table` reached by Turbo AI/media graph | Legacy imports and API names fail its dependency build | Direct AI and media package typechecks pass; table was not touched and failure predates this API | next `plate-next` table packet |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| `nextBlock` option | `packages/table/src/lib/transforms/insertTable.ts` | Table remains on the legacy editor API and needs a package migration, not a local option rewrite | `@platejs/table` |
| `PathApi.next(lastBlock[1])` | AI `insertBelowAIChat` | It computes an exact path for a grouped insertion/select helper, not a block-target API call | AI owner; no action |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added Plite block-relative insertion and converted six equivalent production callers |
| tests/proof | Added Plite contract/type coverage plus code-block and placeholder regressions; updated target-semantic specs |
| docs/templates/skills | Updated Plite and three consumer changesets; added this plan |
| reverted/quarantined packets | Reverted placeholder conversion after review proved its exact-path contract |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Table package migration | It is the only remaining legacy `nextBlock` option match in the audited package set | `packages/table/src/lib/transforms/insertTable.ts` | Take table as the next package packet |

Findings:
- The generic operation belongs in Plite and eliminates six copies of migrated
  Plate boilerplate.
- Placeholder upload `at` is an exact insertion path because paste can delete
  the empty block first. It must remain on `nodes.insert`.
- AI `insertBelowAIChat` computes an exact path for a grouped helper and is not
  the same operation.
- Table is the only legacy `nextBlock` option match in the audited packages.

Review fixes:
- Placeholder exact deleted-path replacement regressed under block-relative
  `insertAfter` -> restored exact-path semantics and added a system-file paste
  regression test.
- Code-block reused `at` as both an after-target and an exact conversion
  target -> stripped `at` after insertion, forced selection onto the inserted
  paragraph, and added explicit-target coverage.
- Final scoped autoreview is clean.

Decisions and tradeoffs:
- `insertAfter` resolves the block containing the target, including an exact
  block path and the end block of an expanded range.
- Missing target/selection delegates to ordinary block insertion so existing
  append fallback remains intact.
- No Plate wrapper, compatibility alias, new transform file, or barrel change.
- Browser proof is N/A: this is a headless package transaction API with direct
  package contract tests and no route-facing behavior.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bun filter ignored non-standard contract filename | 1 | Run explicit relative test path | Contract executes and 43 tests pass |
| Detached input node reused as a live target across updates | 1 | Target editor-owned node | Test now proves the real live-node contract |
| Root-scoped transaction wrapper omitted | 1 | Add delegation in `editor-runtime-view.ts` | Touched-package typecheck passes |
| Excalidraw test supplied an insertion path instead of a block target | 1 | Target existing block `[0]` | Five tests pass |
| Turbo AI/media typecheck reached unmigrated table build | 1 | Run direct owning package typechecks | AI and media pass; table deferred |
| First `check:core` output exceeded app context | 1 | Rerun with capped tail and pipefail | Exit 0 captured |

Verification evidence:
- `bun test --preload ../../config/plite-source-test-setup.ts ./test/transforms-contract.ts`: 43 pass, 0 fail.
- Code-block suite: 89 pass, 0 fail; code-drawing: 13 pass, 0 fail;
  Excalidraw: 5 pass, 0 fail; media: 93 pass, 0 fail; AI: 71 pass,
  0 fail.
- Source-first Turbo typecheck passes for Plite, media, code-block,
  code-drawing, and Excalidraw. Direct AI and media typechecks pass after final
  fixes.
- Scoped package lint fixes pass for all six affected packages.
- `pnpm check:core`: exit 0.
- Source audit: six production `blocks.insertAfter` callers; one intentional
  placeholder exact-path match; two intentional AI exact-path helper matches;
  one deferred legacy table `nextBlock` match.
- Extracted inventory: one untracked plan, zero untracked source/spec/config
  files.
- Changesets: existing Plite major entry covers the public API; code-drawing,
  Excalidraw, and media major entries describe block-target semantics.
- Scoped autoreview: two accepted findings repaired; final result clean.

Final handoff contract:
- target surface and mode: named Plite public API packet plus explicit
  cross-package equivalent-caller sweep.
- files/APIs reviewed: Plite block transaction interface/runtime/root view and
  migrated AI, code-block, code-drawing, Excalidraw, image, media-embed, and
  placeholder insertion paths.
- broad Core drift score coverage: N/A; not a broad Core sweep.
- package file checklist coverage: N/A; not package-review mode.
- best Plate v2 recommendation: generic `blocks.insertAfter` in Plite, direct
  Plate consumers, exact-path insertion retained only where semantically
  required.
- verdict matrix summary: seven in-scope migrated callers reviewed; six
  converted, one retained, no unresolved in-scope drift.
- Plite/Plate gaps or blockers: missing Plite primitive resolved; no blocker.
- related scoped sweep: seven matches, six patched, zero deferred, one
  non-equivalent exact-path exception.
- out-of-scope matches discovered: legacy table `nextBlock` and AI grouped
  exact-path helper.
- changes made: API/runtime/types/tests, six caller conversions, regression
  coverage, and changeset prose.
- tests/proof commands: all focused suites, touched typechecks/lint,
  `check:core`, source audit, and autoreview pass.
- old compatibility names audited: `nextBlock` remains only in legacy table
  within the audited package set.
- needs attention: table is the next package owner.
- next best Plate Next packet: migrate `@platejs/table` and replace its legacy
  insertion option at the package owner.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| API design and runtime | complete | Public type, runtime, root wrapper, and type smoke |
| Consumer correction sweep | complete | Six conversions plus one justified exception |
| Focused package proof | complete | All affected suites and typechecks pass |
| Review and repair | complete | Two accepted findings fixed; final review clean |
| Shared closure | complete | `check:core` and `check-complete.mjs` exit 0 |

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | Goal completion |
| What is the goal? | Add Plite block-relative insertion and remove equivalent Plate boilerplate |
| What have I learned? | Exact vacant paths must not be conflated with block targets |
| What have I done? | Implemented, swept, tested, reviewed, and documented the packet |

Timeline:
- 2026-07-14: Goal plan created and requirements frozen.
- 2026-07-14: Plite API/runtime/tests implemented.
- 2026-07-14: Six migrated callers converted; placeholder exception retained.
- 2026-07-14: Package suites, typechecks, lint, autoreview, and `check:core`
  completed.
- 2026-07-14: Mechanical goal-plan gate completed.

Open risks:
- None for this packet. Table still carries a legacy insertion option, but it is
  isolated to the unmigrated table package and explicitly queued as the next
  owner.
