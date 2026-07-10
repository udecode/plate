# plate-next next three package reviews

Objective:
Review the next three Plate Next package packets: `packages/callout`,
`packages/caption`, and `packages/code-block`.

Goal plan:
docs/plans/2026-07-09-plate-next-next-three-package-reviews.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `$plate-next 3 next pkg`
- mode: package review mode, sequential package packets
- target surface: `packages/callout`, `packages/caption`,
  `packages/code-block`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, scoped to active package plus
  smallest Plite/Core owner only
- package review mode: yes
- package review target: next three changed packages after the completed
  autoformat packet: `callout`, `caption`, `code-block`
- package file checklist gate: one row per package source/spec/config row below;
  `[x]` only at score `100`
- completion threshold summary: complete exactly three package packets, in
  order, without starting package 2 before package 1 closes or package 3 before
  package 2 closes

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
- semantics: N/A: user requested package count, not timed loop
- initial confidence score: N/A: package file score rows are the metric
- improvement loop: close one package at a time, then move to the next
- final score / loop closure: three package packets closed or explicit blocker

Completion threshold:
- Done when `packages/callout`, `packages/caption`, and
  `packages/code-block` each have a closed package file checklist, focused
  package proof, extracted-file inventory, package metadata review,
  related-sweep evidence for corrections, and no unchecked row except explicit
  user-review deferrals.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-09-plate-next-next-three-package-reviews.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: package-local typecheck/test/build/lint as needed;
  focused Plite/Core proof only if this packet touches Plite/Core owner code
- package proof: `pnpm turbo typecheck --filter=./packages/<pkg>`,
  `pnpm --filter @platejs/<pkg> test`, `pnpm --filter @platejs/<pkg> build`
- shared Core gate: update/run `check:core` only if a package is added to that
  lane or Plite/Core owner code changes
- source audits: `git diff --name-only origin/main -- packages/<pkg>`,
  `rg` smell sweeps inside active package, untracked inventory per package
- related scoped sweep query / active scope / match count / patched count / deferred count:
  recorded in the related scoped sweep ledger; `code-block` forbidden-pattern
  sweep returned 0 matches after patch
- package file manifest / row count / checked count / deferred count:
  `callout` 14 rows, `caption` 19 rows, `code-block` 56 rows; 89 checked,
  0 deferred
- Plite/Plate gap ledger: empty until a package exposes a blocker
- broad Core drift ledger gate: N/A: package review mode, not broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-09-plate-next-next-three-package-reviews.md`

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
  intentionally decoupled cross-package code. Plugin-owned helper graphs should
  receive plugin context (`api`, `getOption`, `getOptions`, `setOption`, `tx`)
  or be thin wrappers over the typed plugin API/tx group.

Boundaries:
- allowed edit scope: active package only, plus smallest Plite/Core owner
  needed to remove a blocker discovered by that package
- package/API surfaces: `@platejs/callout`, `@platejs/caption`,
  `@platejs/code-block`
- docs/browser surfaces: no docs/browser work in this package review unless a
  package change directly requires source/docs parity
- non-goals: no broad package sweep, no apps/www proof, no registry/examples,
  no generated template/registry work, no unrelated package fixes
- out-of-scope package errors: record in out-of-scope drift table unless the
  error proves a regression in the active package or touched Plite/Core owner

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop if a package exposes a Plite/Plate API gap that cannot be fixed in the
  active package or the smallest owner without broad redesign, or if focused
  proof fails from an unrelated package and cannot be isolated.

Current verdict:
- verdict: closed
- confidence: all three package rows closed at score 100 with focused proof
- next owner: plate-next
- keep / revert / quarantine call: keep patched
- reason: three package packets completed with focused proof

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | complete | prompt requirements, package scope, stop condition, and proof gates captured |
| `packages/callout` | complete | 14/14 file rows score 100; package proof passed |
| `packages/caption` | complete | 19/19 file rows score 100; package proof passed |
| `packages/code-block` | complete | 56/56 file rows score 100; package, Core, and Plite proof passed |
| Closeout | complete | changed list, sweeps, extracted-file inventory, and verification evidence recorded |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | `$plate-next 3 next pkg`; exactly three sequential package packets; stop after package 3 or real blocker |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read before implementation |
| Active goal checked or created | yes | `create_goal` active for this plan |
| Mode classified as named packet vs broad Core sweep | yes | package review mode; broad Core sweep N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | constraints above; Plite/Plate ownership wins over old compat |
| Broad Core drift ledger initialized when in scope | no | N/A: user requested next packages, not broad Core sweep |
| Source of truth and allowed workspace recorded | yes | cwd `/Users/zbeyens/git/plate-2`; compare current package owners to `origin/main` |
| Output budget strategy recorded | yes | summarize rows/counts in chat; keep file-level ledger in this plan |
| Public API fork routing checked | yes | route to `plate-plan` only if package exposes public API fork; otherwise implement package packet |
| Gap policy checked | yes | Plite/Plate gap named instead of local workaround |
| Related scoped sweep policy checked | yes | scope is active package plus smallest owner only |
| Review-mode rename freeze checked | yes | no rename pass; preserve current paths unless user accepts rename later |
| Package review checklist initialized when in scope | yes | `callout` 14 rows, `caption` 19 rows, `code-block` 56 rows below |

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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | callout, caption, and code-block package gates passed |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: package review mode only |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 89 package rows checked at score 100; no deferred rows |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | recommendations table includes callout, caption, and code-block |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | no open blocker; small Plite/Core owner gaps closed with focused proof |
| Related scoped sweep after correction | yes | For each correction, run and record same-class search/review results inside the active scope | scoped sweeps recorded for all three packages |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 89 expected / 89 actual / 89 checked / 0 deferred |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | package typecheck/test/lint/build gates passed |
| Shared Core gate coverage | yes | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | product packages remain outside `check:core`; touched Core/Plite owners have focused proof |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no out-of-scope package failure kept |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | scoped stale API sweep returned no matches in `packages/code-block` |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no rename pass performed |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | `git ls-files --others --exclude-standard packages/{callout,caption,code-block}` returned no rows |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: package review packet with focused tests, no commit requested |
| Final lint/check | yes | Run scoped lint/check or record N/A | package/Core/Plite lint gates passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | changed list and needs-attention rows filled |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-09-plate-next-next-three-package-reviews.md` | run after this ledger update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/callout` | 0 after patch | main-parity-cleanup | callout package | legacy `platejs` imports, `createSlatePlugin`, `extendEditorTransforms`, and `editor.tf` replaced with direct owner packages and `editor.update.callout.insert`; proof passed | closed |
| `packages/caption` | 0 after patch | main-parity-cleanup | caption package | legacy `platejs` imports, `createTSlatePlugin`, `OverrideEditor`, `editor.tf`, root `setOption`, and React path lookup replaced with direct owner packages, Plite operation middleware, typed plugin portals, and callback-local reads; proof passed | closed |
| `packages/code-block` | 0 after patch | main-parity-cleanup | code-block package | legacy transform/parser/runtime drift replaced with Plite read/update APIs, active tx helpers, extension transform priority, parser-safe clipboard ordering, and no stale compat names; proof passed | closed |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `@platejs/callout` | Keep callout as Plate product package; base plugin uses `createBasePlugin`; tx API is `editor.update.callout.insert`; helper owns insertion behavior and takes active tx | `editor.tf.insert.callout`, `createSlatePlugin`, `platejs` internal imports, `useNodePath` for callback-only path | Clean Plite tx ownership without moving behavior out of original helper owner | none |
| `@platejs/caption` | Keep caption as Plate product package; base plugin uses `createBasePlugin`; ArrowUp caption focus reacts to Plite `operations.apply` for `set_selection`; ArrowDown focus is a caption shortcut; React components use typed plugin portal and direct Plite DOM/read/update APIs | old `OverrideEditor`, `tf.apply`, `tf.moveLine`, `editor.dom.currentKeyboardEvent`, root `editor.setOption`, `editor.api.findPath`, fake React plugin option typing | Operation-level caption focus matches the old behavior owner without reintroducing old Plate transform wrappers | none |
| `@platejs/code-block` | Keep code-block as Plate product package; base plugin owns code-line/code-block product behavior; helpers take active tx; clipboard guard runs before parser; keyboard transforms use Plite extension priority | `editor.tf`, stale parser fallback, local NodeApi/editor-root misuse, plugin priority abuse, dependency hack, fake `@platejs/link` dependency | Product behavior stays in existing code-block owners while Plite owns transform priority and editor primitives | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none for `packages/callout` | N/A | N/A | focused package proof | closed |
| N/A | none for `packages/caption` | N/A | N/A | focused package proof | closed |
| Plite gap closed | extension transform middleware needed explicit priority separate from plugin install order | abusing plugin priority broke clipboard/parser ordering | `packages/plite/src/core/editor-extension.ts`, `packages/plite/src/interfaces/editor.ts` | `pnpm --filter @platejs/plite exec bun test ./test/extension-methods-contract.ts`; Plite typecheck/build/lint | closed |
| Core gap closed | `createBasePlugin` needed to preserve plugin `decorate` from base config; input-rule factory needed tx-aware typing split | local package casts would hide source API weakness | `packages/core/src/lib/plugin/createBasePlugin.ts`, `packages/core/src/lib/plugins/input-rules/createRuleFactory.ts` | `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts src/lib/plugins/input-rules/createRuleFactory.spec.ts`; Core typecheck/build/lint | closed |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| callout Plite migration | `packages/callout` | `rg` for `from 'platejs`, `editor.tf`, `extendTransforms`, root option helpers, `useNodePath`, explicit plugin annotations, `as any` | 1 expected helper-test `editor.update((tx) => ...)`; no forbidden source matches after patch | 8 files patched | 0 | low |
| caption Plite migration | `packages/caption` | `rg` for `from 'platejs`, `editor.tf`, `extendTransforms`, root option helpers, `findPath`, `moveLine`, `runtimeCaption`, `currentKeyboardEvent`, `as any`, `plugin<CaptionConfig>` | 1 justified self-definition-cycle generic in `BaseCaptionPlugin.ts`; no forbidden consumer/source matches after patch | 12 files patched | 0 | low |
| code-block Plite migration | `packages/code-block` plus smallest Core/Plite owners | `rg -n "\\.tf|getApi|getPluginApi|getTransforms|extendTransforms|createSlate|createTSlate|from 'platejs|from \\\"platejs|editor\\.api\\.redecorate|editor\\.update\\(\\(tx\\) => \\{\\s*tx\\.|editor\\.read\\(\\(state\\)" packages/code-block/src packages/code-block/package.json --glob '!**/dist/**'`; `rg -n "@platejs/link" packages/code-block -S` | 0 forbidden matches after patch | package plus 4 owner files patched | 0 | low |

Core drift ledger:
- Applies: no
- Manifest command: N/A: package review mode only
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | package review mode, not broad Core sweep | closed |

Package file checklist:
- Applies: yes
- Package: `packages/callout`, then `packages/caption`, then
  `packages/code-block`
- Manifest command:
  `git ls-files packages/<pkg>/src packages/<pkg>/package.json packages/<pkg>/tsconfig.build.json | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 89 total; `callout` 14, `caption` 19, `code-block` 56
- Actual row count: 89 total; `callout` 14, `caption` 19, `code-block` 56
- Checked score-100 count: 89 after `packages/code-block`
- Unchecked/deferred count: 0 after `packages/code-block`
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: current package rows all score `100` or explicit
  user-review deferral with owner/proof.

Package file rows:
### Package 1: `packages/callout`

- [x] `packages/callout/package.json` — score: 100 — verdict: main-parity-cleanup — owner: callout package metadata — evidence: direct imports audited; `platejs` internal dependency cut; focused proof passed — next: closed
- [x] `packages/callout/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: callout barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/callout/src/lib/BaseCalloutPlugin.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: callout plugin proof — evidence: migrated to `createBaseEditor` and `editor.update.callout.insert`; package tests/typecheck passed — next: closed
- [x] `packages/callout/src/lib/BaseCalloutPlugin.ts` — score: 100 — verdict: main-parity-cleanup — owner: callout base plugin — evidence: migrated from `createSlatePlugin`/`extendEditorTransforms` to `createBasePlugin`/own-key `extendTx`; no compat aliases; proof passed — next: closed
- [x] `packages/callout/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: callout barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/callout/src/lib/transforms/index.ts` — score: 100 — verdict: keep-in-plate — owner: callout transform barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/callout/src/lib/transforms/insertCallout.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: callout transform proof — evidence: tests now exercise real editor tx and configured node type; package tests/typecheck passed — next: closed
- [x] `packages/callout/src/lib/transforms/insertCallout.ts` — score: 100 — verdict: main-parity-cleanup — owner: callout insertion helper — evidence: helper keeps original behavior but takes active tx; no `editor.tf`/`any`; package proof passed — next: closed
- [x] `packages/callout/src/react/CalloutPlugin.tsx` — score: 100 — verdict: main-parity-cleanup — owner: callout React plugin wrapper — evidence: direct `@platejs/core/react` import; source audit/proof passed — next: closed
- [x] `packages/callout/src/react/hooks/index.ts` — score: 100 — verdict: keep-in-plate — owner: callout hook barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/callout/src/react/hooks/useCalloutEmojiPicker.slow.tsx` — score: 100 — verdict: main-parity-cleanup — owner: callout hook proof — evidence: no `useNodePath`; direct owner imports; explicit slow test passed with Bun setup — next: closed
- [x] `packages/callout/src/react/hooks/useCalloutEmojiPicker.ts` — score: 100 — verdict: main-parity-cleanup — owner: callout hook — evidence: cut `editor.tf.setNodes`; callback resolves path at action time and uses `editor.update.nodes.set`; no callback-only path subscription; proof passed — next: closed
- [x] `packages/callout/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: callout React barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/callout/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: package build config — evidence: existing beta build `rootDir` diff preserved; build passed — next: closed

### Package 2: `packages/caption`

- [x] `packages/caption/package.json` — score: 100 — verdict: main-parity-cleanup — owner: caption package metadata — evidence: direct imports audited; `platejs` internal dependency cut; `@platejs/plite-react` and `@udecode/react-utils` added for real source imports; focused proof passed — next: closed
- [x] `packages/caption/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: caption barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/caption/src/lib/BaseCaptionPlugin.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: caption plugin proof — evidence: migrated to `createBaseEditor` and scoped plugin portal; package tests/typecheck passed — next: closed
- [x] `packages/caption/src/lib/BaseCaptionPlugin.ts` — score: 100 — verdict: main-parity-cleanup — owner: caption base plugin — evidence: migrated from `createTSlatePlugin`/`OverrideEditor` to `createBasePlugin`, shortcuts, and Plite operation middleware; one `editor.plugin<CaptionConfig>(KEYS.caption)` remains only inside self-definition cycle; proof passed — next: closed
- [x] `packages/caption/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: caption barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/caption/src/lib/withCaption.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: caption behavior proof — evidence: tests cover ArrowUp delayed focus, empty-caption skip, ArrowDown focus, and disallowed block fallthrough through real editor shortcuts/operations; package proof passed — next: closed
- [x] `packages/caption/src/lib/withCaption.ts` — score: 100 — verdict: main-parity-cleanup — owner: caption focus helper — evidence: preserved owner while replacing old `apply`/`moveLine` wrapper with Plite `set_selection` operation handling and block lookup; no `any`/root option helper; proof passed — next: closed
- [x] `packages/caption/src/react/CaptionPlugin.tsx` — score: 100 — verdict: main-parity-cleanup — owner: caption React plugin wrapper — evidence: direct `@platejs/core/react` import; package proof passed — next: closed
- [x] `packages/caption/src/react/components/Caption.tsx` — score: 100 — verdict: main-parity-cleanup — owner: caption component — evidence: uses base plugin option contract and Plite React selected/read-only hooks; no React-plugin type loss; package proof passed — next: closed
- [x] `packages/caption/src/react/components/CaptionButton.tsx` — score: 100 — verdict: main-parity-cleanup — owner: caption button hook — evidence: callback-local node lookup and typed plugin portal; no root `setOption`; package proof passed — next: closed
- [x] `packages/caption/src/react/components/CaptionTextarea.tsx` — score: 100 — verdict: main-parity-cleanup — owner: caption textarea — evidence: callback-local path lookup, direct `editor.update.selection.set`, `editor.api.dom.focus`, typed plugin portal; no `findPath`/`tf`/root option helper; package proof passed — next: closed
- [x] `packages/caption/src/react/components/TextareaAutosize.tsx` — score: 100 — verdict: main-parity-cleanup — owner: caption autosize component — evidence: direct `@udecode/react-utils` import; package proof passed — next: closed
- [x] `packages/caption/src/react/components/index.ts` — score: 100 — verdict: keep-in-plate — owner: caption component barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/caption/src/react/hooks/index.ts` — score: 100 — verdict: keep-in-plate — owner: caption hook barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/caption/src/react/hooks/useCaptionString.ts` — score: 100 — verdict: main-parity-cleanup — owner: caption hook — evidence: direct owner imports and no structural cast for caption text; package proof passed — next: closed
- [x] `packages/caption/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: caption React barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/caption/src/react/utils/index.ts` — score: 100 — verdict: keep-in-plate — owner: caption util barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/caption/src/react/utils/showCaption.ts` — score: 100 — verdict: main-parity-cleanup — owner: caption public helper — evidence: callback-local node lookup and typed plugin portal; no root `setOption`; package proof passed — next: closed
- [x] `packages/caption/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: package build config — evidence: existing beta build `rootDir` diff preserved; build passed — next: closed

### Package 3: `packages/code-block`

- [x] `packages/code-block/package.json` — score: 100 — verdict: main-parity-cleanup — owner: code-block package metadata — evidence: stale `@platejs/link` dev dependency removed; package typecheck/test/lint/build passed — next: closed
- [x] `packages/code-block/src/index.ts` — score: 100 — verdict: keep-in-plate — owner: code-block barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.inputRules.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: code-block input-rule proof — evidence: migrated to current input-rule tx context and package proof passed — next: closed
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: base plugin proof — evidence: covers html guard, tx group, decoration config; package proof passed — next: closed
- [x] `packages/code-block/src/lib/BaseCodeBlockPlugin.ts` — score: 100 — verdict: main-parity-cleanup — owner: base plugin — evidence: keeps product owner; uses `createBasePlugin`, raw extension options, tx group, parser guard, and decorate support without compat APIs; package proof passed — next: closed
- [x] `packages/code-block/src/lib/CodeBlockRules.ts` — score: 100 — verdict: main-parity-cleanup — owner: code-block rules — evidence: Plite read APIs and package proof passed — next: closed
- [x] `packages/code-block/src/lib/CodeBlockRuntimePlugin.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: runtime behavior proof — evidence: covers delete, insert break, paste, normalize, reset, tab, decoration; 97 package tests passed — next: closed
- [x] `packages/code-block/src/lib/deserializer/htmlDeserializerCodeBlock.spec.ts` — score: 100 — verdict: keep-in-plate — owner: html deserializer proof — evidence: source audit/package proof passed — next: closed
- [x] `packages/code-block/src/lib/deserializer/htmlDeserializerCodeBlock.ts` — score: 100 — verdict: keep-in-plate — owner: html deserializer — evidence: no stale compat pattern; package proof passed — next: closed
- [x] `packages/code-block/src/lib/deserializer/index.ts` — score: 100 — verdict: keep-in-plate — owner: deserializer barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/code-block/src/lib/ensureStablePythonGrammar.ts` — score: 100 — verdict: keep-in-plate — owner: highlighter grammar helper — evidence: unchanged behavior covered by decoration tests — next: closed
- [x] `packages/code-block/src/lib/formatter/formatter.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: formatter proof — evidence: formatted and passed package proof — next: closed
- [x] `packages/code-block/src/lib/formatter/formatter.ts` — score: 100 — verdict: keep-in-plate — owner: formatter — evidence: source audit/package proof passed — next: closed
- [x] `packages/code-block/src/lib/formatter/index.ts` — score: 100 — verdict: keep-in-plate — owner: formatter barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/code-block/src/lib/formatter/jsonFormatter.spec.tsx` — score: 100 — verdict: keep-in-plate — owner: json formatter proof — evidence: package proof passed — next: closed
- [x] `packages/code-block/src/lib/formatter/jsonFormatter.ts` — score: 100 — verdict: keep-in-plate — owner: json formatter — evidence: source audit/package proof passed — next: closed
- [x] `packages/code-block/src/lib/index.ts` — score: 100 — verdict: keep-in-plate — owner: lib barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/code-block/src/lib/queries/getCodeLineEntry.ts` — score: 100 — verdict: main-parity-cleanup — owner: code-line query — evidence: moved from stale root-node assumptions to Plite `editor.read.nodes.above/parent`; package proof passed — next: closed
- [x] `packages/code-block/src/lib/queries/getIndentDepth.ts` — score: 100 — verdict: keep-in-plate — owner: indent query — evidence: source audit/package proof passed — next: closed
- [x] `packages/code-block/src/lib/queries/index.ts` — score: 100 — verdict: keep-in-plate — owner: query barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/code-block/src/lib/queries/isCodeBlockEmpty.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: empty-code-block proof — evidence: current Plite editor fixtures passed — next: closed
- [x] `packages/code-block/src/lib/queries/isCodeBlockEmpty.ts` — score: 100 — verdict: main-parity-cleanup — owner: empty-code-block query — evidence: avoids `NodeApi.children(editor, path)` misuse; package proof passed — next: closed
- [x] `packages/code-block/src/lib/queries/isSelectionAtCodeBlockStart.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: selection query proof — evidence: package proof passed — next: closed
- [x] `packages/code-block/src/lib/queries/isSelectionAtCodeBlockStart.ts` — score: 100 — verdict: keep-in-plate — owner: selection query — evidence: source audit/package proof passed — next: closed
- [x] `packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts` — score: 100 — verdict: main-parity-cleanup — owner: decoration cache proof — evidence: formatting/lint clean; package proof passed — next: closed
- [x] `packages/code-block/src/lib/setCodeBlockToDecorations.ts` — score: 100 — verdict: main-parity-cleanup — owner: decoration cache/highlight helper — evidence: typed plugin portal and refresh path preserved; package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/deleteStartSpace.ts` — score: 100 — verdict: main-parity-cleanup — owner: delete-space transform — evidence: Plite read/update migration and package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/indentCodeLine.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: indent proof — evidence: package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/indentCodeLine.ts` — score: 100 — verdict: main-parity-cleanup — owner: indent helper — evidence: active tx helper, no nested update, package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/index.ts` — score: 100 — verdict: keep-in-plate — owner: transform barrel — evidence: `pnpm brl` not needed; exports unchanged after review; package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeBlock.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: insert code block proof — evidence: package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeBlock.ts` — score: 100 — verdict: main-parity-cleanup — owner: insert code block helper — evidence: active tx and Plite reads, package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeLine.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: insert code line proof — evidence: package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/insertCodeLine.ts` — score: 100 — verdict: main-parity-cleanup — owner: insert code line helper — evidence: active tx, package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/insertEmptyCodeBlock.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: insert empty code block proof — evidence: expanded selection behavior covered; package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/insertEmptyCodeBlock.ts` — score: 100 — verdict: main-parity-cleanup — owner: insert empty code block helper — evidence: uses Plite `RangeApi.end` for expanded selection and active tx; package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/outdentCodeLine.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: outdent proof — evidence: package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/outdentCodeLine.ts` — score: 100 — verdict: main-parity-cleanup — owner: outdent helper — evidence: active tx, package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/setCodeBlockContent.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: set content proof — evidence: package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/setCodeBlockContent.ts` — score: 100 — verdict: main-parity-cleanup — owner: set content helper — evidence: active tx, package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/toggleCodeBlock.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: toggle proof — evidence: package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/toggleCodeBlock.ts` — score: 100 — verdict: main-parity-cleanup — owner: toggle/reset/select/tab tx helpers — evidence: active tx, no compat aliases, package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/unwrapCodeBlock.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: unwrap proof — evidence: multi-block and outside-code behavior covered; package proof passed — next: closed
- [x] `packages/code-block/src/lib/transforms/unwrapCodeBlock.ts` — score: 100 — verdict: main-parity-cleanup — owner: unwrap helper — evidence: explicit paragraph replacement preserves selection with active tx; package proof passed — next: closed
- [x] `packages/code-block/src/lib/withCodeBlock.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: keyboard/runtime proof — evidence: delete, insertBreak, reset, selectAll, tab, and decoration refresh covered; package proof passed — next: closed
- [x] `packages/code-block/src/lib/withCodeBlock.ts` — score: 100 — verdict: main-parity-cleanup — owner: code-block editor extension — evidence: transform priority handles delete before generic override; active tx used; no redecorate compat; package proof passed — next: closed
- [x] `packages/code-block/src/lib/withInsertDataCodeBlock.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: paste proof — evidence: VSCode paste, plain multiline paste, and parser-comment regression covered; package proof passed — next: closed
- [x] `packages/code-block/src/lib/withInsertDataCodeBlock.ts` — score: 100 — verdict: main-parity-cleanup — owner: paste extension — evidence: keeps code paste before parser without dependency hack; package proof passed — next: closed
- [x] `packages/code-block/src/lib/withInsertFragmentCodeBlock.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: fragment paste proof — evidence: TestEditor fixtures exercise inside/outside code block; package proof passed — next: closed
- [x] `packages/code-block/src/lib/withInsertFragmentCodeBlock.ts` — score: 100 — verdict: main-parity-cleanup — owner: fragment paste extension — evidence: active tx insert logic, no nested update, package proof passed — next: closed
- [x] `packages/code-block/src/lib/withNormalizeCodeBlock.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: normalize proof — evidence: direct `editor.update.normalize` and package proof passed — next: closed
- [x] `packages/code-block/src/lib/withNormalizeCodeBlock.tsx` — score: 100 — verdict: main-parity-cleanup — owner: normalize extension — evidence: active tx and node child normalization covered; package proof passed — next: closed
- [x] `packages/code-block/src/react/CodeBlockPlugin.spec.tsx` — score: 100 — verdict: main-parity-cleanup — owner: React wrapper proof — evidence: deserialization and delete-normalization tests pass with Plite APIs — next: closed
- [x] `packages/code-block/src/react/CodeBlockPlugin.tsx` — score: 100 — verdict: main-parity-cleanup — owner: React plugin wrapper — evidence: direct `toPlatePlugin` wrapper proof passed — next: closed
- [x] `packages/code-block/src/react/index.ts` — score: 100 — verdict: keep-in-plate — owner: React barrel — evidence: source audit unchanged; package proof passed — next: closed
- [x] `packages/code-block/tsconfig.build.json` — score: 100 — verdict: keep-in-plate — owner: package build config — evidence: build passed — next: closed

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| `packages/callout` | Plate product package | package still used old Slate/Plate compat surfaces | patched 8 files; `pnpm install`; `pnpm turbo typecheck --filter=./packages/callout`; `pnpm --filter @platejs/callout test`; `pnpm --filter @platejs/callout exec bun test --preload ../../tooling/config/bunTestSetup.ts ./src/react/hooks/useCalloutEmojiPicker.slow.tsx`; `pnpm --filter @platejs/callout lint`; `pnpm --filter @platejs/callout build` | keep patched | move to `packages/caption` |
| `packages/caption` | Plate product package | package still used old Slate/Plate compat surfaces and had a migrated ArrowUp focus regression | patched 12 files; `pnpm install`; `pnpm turbo typecheck --filter=./packages/caption`; `pnpm --filter @platejs/caption test`; `pnpm --filter @platejs/caption lint`; `pnpm --filter @platejs/caption build`; scoped smell sweep | keep patched | move to `packages/code-block` |
| `packages/code-block` | Plate product package with tiny Core/Plite owner fixes | package still had stale parser/runtime/key behavior and Plite priority gap | patched package plus `createBasePlugin`, input-rule typing, Plite extension priority; `pnpm --filter @platejs/code-block typecheck/test/lint/build`; Plite focused test/typecheck/build/lint; Core focused tests/typecheck/build/lint; scoped smell sweep | keep patched | package 3 closed |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/callout` | N/A | `git ls-files --others --exclude-standard packages/callout` returned no rows | no extracted file debt | source audit |
| `packages/caption` | N/A | `git ls-files --others --exclude-standard packages/caption` returned no rows | no extracted file debt | source audit |
| `packages/code-block` | N/A | `git ls-files --others --exclude-standard packages/code-block` returned no rows | no extracted file debt | source audit |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no out-of-scope package failure kept | all failures were in named package or touched owner proof | closed |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| N/A | no outside-scope matches patched or deferred | package-mode sweeps stayed scoped | closed |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `callout`, `caption`, and `code-block` migrated off stale Plate/Slate compat surfaces; Plite extension transform priority added; Core plugin decorate/input-rule typing owner gaps closed |
| tests/proof | package specs updated and strengthened for callout insertion, caption focus, code-block delete/paste/normalize/decoration behavior, Plite transform priority, and Core builder/input-rule owners |
| docs/templates/skills | this autogoal plan updated only |
| reverted/quarantined packets | dependency hack for `code_block` -> `parser` extension order rejected; parallel install race recorded; no dirty packet quarantined |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None | all three package packets are green and no user-review deferral remains | package rows above | continue to next package packet when ready |

Findings:
- `code-block` needed two separate ordering concepts: plugin install order for clipboard/parser behavior and extension transform priority for keyboard transforms. Using one priority for both was the wrong model.

Decisions and tradeoffs:
- Keep product behavior in the package owners. Only the missing generic ordering primitive moved to Plite.
- Do not add `@platejs/link` to `code-block`; parser-comment proof uses an in-package fake parser.
- Product packages stay outside `check:core`; touched Core/Plite owners got focused proof instead.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `withInsertDataCodeBlock` dependency on `parser` caused missing dependency when code-block installed before parser | 1 | split plugin install order from transform command priority | reverted dependency; added Plite extension `priority` for transform middleware |
| `pnpm install` run in parallel with package gates raced `skiller` prepare | 1 | run install sequentially | reran `pnpm install` alone; passed |

Verification evidence:
- `packages/callout`: `pnpm install` passed.
- `packages/callout`: `pnpm turbo typecheck --filter=./packages/callout`
  passed.
- `packages/callout`: `pnpm --filter @platejs/callout test` passed, 3 tests.
- `packages/callout`: `pnpm --filter @platejs/callout exec bun test
  --preload ../../tooling/config/bunTestSetup.ts
  ./src/react/hooks/useCalloutEmojiPicker.slow.tsx` passed, 1 test.
- `packages/callout`: `pnpm --filter @platejs/callout lint` passed.
- `packages/callout`: `pnpm --filter @platejs/callout build` passed.
- `packages/caption`: `pnpm install` passed.
- `packages/caption`: `pnpm turbo typecheck --filter=./packages/caption`
  passed.
- `packages/caption`: `pnpm --filter @platejs/caption test` passed, 6 tests.
- `packages/caption`: `pnpm --filter @platejs/caption lint` passed.
- `packages/caption`: `pnpm --filter @platejs/caption build` passed.
- `packages/caption`: scoped smell sweep found only the justified
  self-definition-cycle `editor.plugin<CaptionConfig>(KEYS.caption)` in
  `BaseCaptionPlugin.ts`.
- `packages/code-block`: `pnpm install` passed after dependency cleanup.
- `packages/code-block`: `pnpm --filter @platejs/code-block typecheck` passed.
- `packages/code-block`: `pnpm --filter @platejs/code-block test` passed, 97
  tests.
- `packages/code-block`: `pnpm --filter @platejs/code-block lint` passed.
- `packages/code-block`: `pnpm --filter @platejs/code-block build` passed.
- `packages/plite`: `pnpm --filter @platejs/plite exec bun test
  ./test/extension-methods-contract.ts` passed, 22 tests.
- `packages/plite`: `pnpm --filter @platejs/plite typecheck` passed.
- `packages/plite`: `pnpm --filter @platejs/plite build` passed.
- `packages/plite`: `pnpm --filter @platejs/plite lint` passed.
- `packages/core`: `pnpm --filter @platejs/core typecheck` passed.
- `packages/core`: `pnpm --filter @platejs/core build` passed.
- `packages/core`: `pnpm --filter @platejs/core exec bun test
  src/lib/plugin/createBasePlugin.spec.ts
  src/lib/plugins/input-rules/createRuleFactory.spec.ts` passed, 26 tests.
- `packages/core`: `pnpm --filter @platejs/core lint` passed.
- `packages/code-block`: scoped stale API sweep returned no matches for
  `editor.tf`, `getApi`, `getPluginApi`, `getTransforms`, `extendTransforms`,
  `createSlate`, `createTSlate`, `platejs` imports,
  `editor.api.redecorate`, one-line callback read/write smells.
- `packages/code-block`: `rg -n "@platejs/link" packages/code-block -S`
  returned no matches.

Final handoff contract:
- target surface and mode: package review mode for `packages/callout`,
  `packages/caption`, and `packages/code-block`
- files/APIs reviewed: 89 package files/config rows plus smallest Core/Plite
  owner files for package blockers
- broad Core drift score coverage: N/A, no broad Core sweep requested
- package file checklist coverage: 89/89 score-100 rows, 0 deferred
- best Plate v2 recommendation: keep all three as Plate product packages;
  generic editor ordering primitive belongs in Plite
- verdict matrix summary: all three packages closed as `main-parity-cleanup`
  with no kept compat bridge
- Plite/Plate gaps or blockers: no open blocker; Plite transform priority and
  Core builder/input-rule gaps closed
- related scoped sweep query/active scope/matches/patched/deferred: recorded in
  related scoped sweep ledger
- out-of-scope matches discovered: none
- changes made: callout/caption/code-block package migration plus small
  Core/Plite owner fixes
- tests/proof commands: see verification evidence above
- old compatibility names audited: scoped `rg` sweeps found no remaining
  forbidden matches in `packages/code-block`
- needs attention: none
- next best Plate Next packet: continue package-by-package with the next
  package only after user asks

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after package 3 |
| Where am I going? | Ready for next package-by-package Plate Next review |
| What is the goal? | Close three package packets with score-100 file rows and focused proof |
| What have I learned? | Package priority and transform priority must stay separate |
| What have I done? | Closed callout, caption, and code-block; patched small Core/Plite blockers; ran focused proof |

Timeline:
- 2026-07-09T14:37:44.218Z Goal plan created.
- 2026-07-09 Package 1 `packages/callout` closed.
- 2026-07-09 Package 2 `packages/caption` closed.
- 2026-07-09 Package 3 `packages/code-block` closed with Core/Plite owner
  proof.

Open risks:
- None for the three reviewed packages. Broad repo/package migration remains
  intentionally out of scope.
