# plate-next basic-nodes package review

Objective:
Review `packages/basic-nodes`; done when all 39 package files score 100, `check:core` includes the package, and focused package proof passes.

Goal plan:
docs/plans/2026-07-06-plate-next-basic-nodes-package-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: `[$plate-next] next package`
- mode: package review mode, one-shot execution
- target surface: `packages/basic-nodes`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, only after corrections that touch Core-owned patterns
- package review mode: yes
- package review target: `packages/basic-nodes`
- package file checklist gate: 39 package source/spec rows; `[x]` only at score `100`
- completion threshold summary: all rows score `100` or explicit defer, `tooling/scripts/check-core.mjs` includes Basic Nodes or this plan records a reason not to, package proof passes, and final plan check passes

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
- semantics: N/A: user asked for next package, not timed work
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- All 39 `packages/basic-nodes/src/**/*.{ts,tsx,mts,cts}` rows are checked at score `100` or explicitly deferred with reason, owner, proof needed, and next action.
- `tooling/scripts/check-core.mjs` includes Basic Nodes before closeout, unless this plan records a concrete reason the package should not be in `check:core`.
- Focused package proof passes: `pnpm --filter @platejs/basic-nodes test`, `pnpm turbo typecheck --filter=./packages/basic-nodes`, `pnpm --filter @platejs/basic-nodes lint`, and build if exports/artifacts are touched.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plate-next-basic-nodes-package-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/basic-nodes test`
- package proof: `pnpm turbo typecheck --filter=./packages/basic-nodes`; `pnpm --filter @platejs/basic-nodes lint`; build if package exports/artifacts change
- shared Core gate: update `tooling/scripts/check-core.mjs` to include `packages/basic-nodes`, then run the relevant/final gate
- source audits: old Slate/Plate compatibility symbols, one-shot callback wrappers, plugin export inference, empty config aliases, `defineEditorExtension` wrapping, callback-only subscriptions
- related Core sweep query / match count / patched count / deferred count:
  recorded in Related Core sweep ledger
- package file manifest / row count / checked count / deferred count: 39
  expected, 39 actual, 39 checked, 0 deferred
- Plite/Plate gap ledger: none after Plite `replaceChildren` selection repair
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plate-next-basic-nodes-package-review.md`

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
- After every correction, run a related Core sweep across `packages/core/src`
  and relevant `packages/core/type-tests` for the same symbol/pattern/smell.
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
- Package file rows can be checked `[x]` only at score `100`: no behavior
  regression versus `origin/main`, no type regression, inline inference
  preserved, no fake casts/local helper types, no compat sludge, correct
  Plite/Plate ownership, accepted owner/name/path drift, and focused proof or
  justified source audit.
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

Boundaries:
- allowed edit scope: `packages/basic-nodes`, `tooling/scripts/check-core.mjs`, and the smallest Core/Plite owner if Basic Nodes exposes a real owner gap
- package/API surfaces: Basic Nodes base/react plugins, input rules, package exports, package tests
- docs/browser surfaces: N/A unless package review exposes a current docs/API mismatch
- non-goals: do not migrate the next package, do not broad-sweep all Core, do not rename established files/symbols, do not add compatibility shims
- out-of-scope package errors: classify and record unless caused by Basic Nodes or touched Core/Plite owner changes

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- For this package review, use file manifest counts and focused reads. Do not dump full package diffs unless a file row needs source evidence.

Blocked condition:
- Stop if a clean Basic Nodes migration requires a public Plate/Plite API fork that needs user taste review, or if a missing Plite primitive would force a local compatibility workaround.

Current verdict:
- verdict: package migrated and proved
- confidence: 99
- next owner: plate-next, then next package after user review
- keep / revert / quarantine call: keep current package/Core/check-core packet
- reason: Basic Nodes is off the old `platejs` facade, package proof is green,
  `check:core` includes the package, and the prior blockquote selection gap is
  fixed in Plite instead of locally mapped in Basic Nodes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Prompt is `[$plate-next] next package`; next package selected as `packages/basic-nodes`; package review mode and non-goals recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read this run |
| Active goal checked or created | yes | `get_goal` returned none; active goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Package review mode, not broad Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Constraints and target surface recorded above |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | `origin/main` evidence plus current `packages/basic-nodes`; cwd `/Users/zbeyens/git/plate-2` |
| Output budget strategy recorded | yes | Narrow source reads and manifest counts recorded |
| Public API fork routing checked | yes | Public API forks route to `plate-plan`; no fork accepted yet |
| Gap policy checked | yes | Plite/Plate gap law recorded; blockers stop or patch owner first |
| Related Core sweep policy checked | yes | Required only after Core-related correction |
| Review-mode rename freeze checked | yes | No rename pass; keep current names |
| Package review checklist initialized when in scope | yes | 39 source/spec rows below |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: target `packages/basic-nodes`,
      package review mode, no timed checkpoint, non-goals and proof recorded.
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
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
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
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm --filter @platejs/basic-nodes test`; `pnpm turbo typecheck --filter=./packages/basic-nodes`; `pnpm --filter @platejs/basic-nodes lint`; `pnpm check:core` |
| Broad Core drift ledger coverage | no | Broad Core sweep not requested | N/A |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 39 rows score 100; 0 deferred rows |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Basic Nodes should be pure `createBasePlugin`/`createPlatePlugin` on Plite reads/updates/tx groups |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | Reverse-tab blockquote behavior recorded as Plate/Plite keyboard command gap |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | `createBasePlugin` parser/rules contextual typing patched; related sweep recorded |
| Package file checklist | yes | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | 39 expected, 39 actual, 39 score-100, 0 deferred |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | package typecheck/test/lint green; no barrel/export build required |
| Shared Core gate coverage | yes | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | Basic Nodes added to `check:core`; `pnpm check:core` passed |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | No out-of-scope failures |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Old `platejs`/`editor.tf`/`extendTransforms`/`createSlate*` audit returned no Basic Nodes matches |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | No rename pass |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | No untracked package source files |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | Package proof and `check:core`; no separate autoreview requested |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plate-next-basic-nodes-package-review.md` | to run after this update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/basic-nodes` facade imports | 4 | cut | Basic Nodes | `platejs`, `createSlate*`, `editor.tf`, `extendTransforms` removed | keep |
| Basic block/mark tx groups | 3 | migrate-to-plite | Basic Nodes | `extendTx` groups call `tx.blocks.*`, `tx.marks.*` with inferred callback types | keep |
| Basic input rules | 3 | migrate-to-plite | Basic Nodes/Core input-rules | tests cover heading, blockquote, hr, mark combos | keep |
| HTML parser queries | 2 | keep-in-plate | Basic Nodes | deserializer tests call queries through `getEditorPlugin` context | keep |
| `createBasePlugin` nested config typing | 2 | patch-owner | Core plugin builder | `parsers`, `rules`, and `shortcuts` now contextually type from `BasePlugin<C>` | keep |
| Blockquote reverse-tab behavior | 0 | keep | Basic Nodes + Plite | Plite `replaceChildren` now owns default selection remap; Basic Nodes owns blockquote shortcut semantics without local path mapping | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Basic Nodes | Base package uses `createBasePlugin`, React package uses `createPlatePlugin`, writes use direct `editor.update.*` or typed `extendTx`, reads use `editor.read.*`, package depends on explicit `@platejs/*` packages | `platejs` facade import, `createSlatePlugin`, `createSlateEditor`, `editor.tf`, `extendTransforms`, `getTransforms`, local casts | Matches Plite/Plate boundary and keeps plugin API inference | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | no remaining Basic Nodes gap | N/A | N/A | `BaseBlockquotePlugin.spec.ts` and package test proof | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| `createBasePlugin` did not contextually type `rules.match` in Basic Nodes | `rg -n "rules:\s*\{|match:\s*\(\{[^)]*\}\)\s*=>|parsers:\s*\{" packages/core/src packages/utils/src packages/basic-nodes/src --glob '*.{ts,tsx}'` plus `pnpm check:core` | parser/rules sites in Core/Utils/Basic Nodes | `packages/core/src/lib/plugin/createBasePlugin.ts` patched to type `parsers`, `rules`, `shortcuts` from `BasePlugin<C>` | none | Existing internal `any` in builder implementation remains out of scope; public inference proof is green |
| Basic Nodes old facade cut | `rg -n "editor\.update\(\s*\(?tx|editor\.read\(\s*\(?state|createTSlate|createSlate|createSlatePlugin|extendTransforms|editor\.tf|getTransforms|overrideEditor|from 'platejs|from \"platejs" packages/basic-nodes/src --glob '*.{ts,tsx}'` | 0 | all stale Basic Nodes matches removed | none | none |

Core drift ledger:
- Applies: no
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Basic Nodes package review | complete | 39 package files scored 100, package proof and `check:core` passed | next package |

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | broad Core sweep not requested | N/A | only smallest Core owner patch was `createBasePlugin` typing | N/A |

Package file checklist:
- Applies: yes
- Package: `packages/basic-nodes`
- Manifest command: `find packages/basic-nodes/src -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.mts' -o -name '*.cts' \) | sort`
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 39
- Actual row count: 39
- Checked score-100 count: 39
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: every row below is score `100` or explicitly deferred for user review

Package file rows:
- [x] `packages/basic-nodes/src/index.ts` — score: 100 — verdict: keep — owner: Basic Nodes — evidence: barrel remains current; package proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseBasicBlocksPlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: `createBasePlugin`, no facade import — next: none
- [x] `packages/basic-nodes/src/lib/BaseBasicMarksPlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: `createBasePlugin`, no facade import — next: none
- [x] `packages/basic-nodes/src/lib/BaseBlockquoteInputRules.spec.tsx` — score: 100 — verdict: keep — owner: Basic Nodes tests — evidence: real `createBaseEditor`, nested blockquote proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseBlockquotePlugin.spec.ts` — score: 100 — verdict: keep — owner: Basic Nodes tests — evidence: toggle and normalization behavior proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts` — score: 100 — verdict: keep — owner: Basic Nodes + Plite — evidence: reverse-tab behavior and child normalization proof green; Plite owns `replaceChildren` selection remap, Basic Nodes no longer owns a local path mapper — next: none
- [x] `packages/basic-nodes/src/lib/BaseBoldPlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: inferred tx group and parser proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseCodePlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: parser query and tx toggle proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseHeadingInputRules.spec.tsx` — score: 100 — verdict: keep — owner: Basic Nodes tests — evidence: runtime input-rule registry and behavior proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseHeadingPlugin.spec.ts` — score: 100 — verdict: keep — owner: Basic Nodes tests — evidence: typed `editor.update.h1..h6.toggle` proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseHeadingPlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: real `HeadingConfig`, inferred plugin tx groups, no empty config aliases — next: none
- [x] `packages/basic-nodes/src/lib/BaseHighlightPlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: inferred tx group and input-rule proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseHorizontalRulePlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: `createBasePlugin`, hr input-rule proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseItalicPlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: inferred tx group and mark proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseKbdPlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: `createBasePlugin`, no stale facade or casts — next: none
- [x] `packages/basic-nodes/src/lib/BaseMarkInputRules.spec.tsx` — score: 100 — verdict: keep — owner: Basic Nodes tests — evidence: 12 mark/input-rule rows green, including combo delimiter correction — next: none
- [x] `packages/basic-nodes/src/lib/BaseMarkPlugins.spec.ts` — score: 100 — verdict: keep — owner: Basic Nodes tests — evidence: deserializer query uses real plugin context; typed tx proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseStrikethroughPlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: inferred tx group and mark proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseSubscriptPlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: current `KEYS.sub` mark proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseSuperscriptPlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: current `KEYS.sup` mark proof green — next: none
- [x] `packages/basic-nodes/src/lib/BaseUnderlinePlugin.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes — evidence: inferred tx group and mark proof green — next: none
- [x] `packages/basic-nodes/src/lib/BasicBlockRules.ts` — score: 100 — verdict: migrate-to-plite — owner: Basic Nodes input rules — evidence: direct update APIs; blockquote nested wrap and hr proof green — next: none
- [x] `packages/basic-nodes/src/lib/BasicMarkRules.ts` — score: 100 — verdict: keep — owner: Basic Nodes input rules — evidence: delimiter semantics corrected; mark combo proof green — next: none
- [x] `packages/basic-nodes/src/lib/index.ts` — score: 100 — verdict: keep — owner: Basic Nodes — evidence: exports unchanged; package proof green — next: none
- [x] `packages/basic-nodes/src/react/BasicBlocksPlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: `@platejs/core/react`, no facade import — next: none
- [x] `packages/basic-nodes/src/react/BasicMarksPlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: `@platejs/core/react`, no facade import — next: none
- [x] `packages/basic-nodes/src/react/BlockquotePlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: React wrapper only, no behavior drift — next: none
- [x] `packages/basic-nodes/src/react/BoldPlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: hotkey import explicit; package proof green — next: none
- [x] `packages/basic-nodes/src/react/CodePlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: React wrapper only, no stale facade — next: none
- [x] `packages/basic-nodes/src/react/HeadingPlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: React wrapper only, no stale facade — next: none
- [x] `packages/basic-nodes/src/react/HighlightPlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: React wrapper only, no stale facade — next: none
- [x] `packages/basic-nodes/src/react/HorizontalRulePlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: React wrapper only, no stale facade — next: none
- [x] `packages/basic-nodes/src/react/ItalicPlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: hotkey import explicit; package proof green — next: none
- [x] `packages/basic-nodes/src/react/KbdPlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: React wrapper only, no stale facade — next: none
- [x] `packages/basic-nodes/src/react/StrikethroughPlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: React wrapper only, no stale facade — next: none
- [x] `packages/basic-nodes/src/react/SubscriptPlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: React wrapper only, no stale facade — next: none
- [x] `packages/basic-nodes/src/react/SuperscriptPlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: React wrapper only, no stale facade — next: none
- [x] `packages/basic-nodes/src/react/UnderlinePlugin.tsx` — score: 100 — verdict: migrate-to-plate — owner: Basic Nodes React — evidence: hotkey import explicit; package proof green — next: none
- [x] `packages/basic-nodes/src/react/index.ts` — score: 100 — verdict: keep — owner: Basic Nodes React — evidence: exports unchanged; package proof green — next: none

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Basic Nodes facade cut | Basic Nodes | package still imported old `platejs` facade | `packages/basic-nodes/src/**`, package proof | keep | none |
| Core builder typing | Core plugin builder | `createBasePlugin` did not infer nested `rules`/`parsers` callbacks | `packages/core/src/lib/plugin/createBasePlugin.ts`, `check:core` | keep | none |
| Blockquote reverse-tab | Basic Nodes + Plite | Plite selection remap was missing for child replacement | `BaseBlockquotePlugin.ts`, Plite `replaceChildren`, focused package tests | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no untracked package source files | `git ls-files --others --exclude-standard packages/basic-nodes/src` empty | N/A | manifest count 39/39 |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no out-of-scope failures | all proof commands passed | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/basic-nodes` migrated to `@platejs/core`, `@platejs/plite`, `@platejs/utils`; `createBasePlugin` contextual typing tightened; `check:core` includes Basic Nodes |
| tests/proof | Basic Nodes tests migrated from `createSlateEditor`/`editor.tf` to `createBaseEditor`/direct Plite APIs; mark combo and blockquote behavior specs green |
| docs/templates/skills | this autogoal plan updated |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | None | Basic Nodes package rows are all score 100 after the Plite selection remap repair | N/A | Move to next package |

Findings:
- Basic Nodes had no migrated source diff at start and still used `platejs`,
  `createSlatePlugin`, `createSlateEditor`, `editor.tf`, `extendTransforms`,
  and `getTransforms`.
- `createBasePlugin` needed a Core-owned typing patch so nested plugin config
  callbacks infer instead of forcing local parameter annotations.
- Mark input-rule `end` delimiters are resolved before the trigger text is
  inserted; bold+underline combo configs were off by one delimiter.
- Blockquote markdown wrapping must target the current block path to preserve
  nested quote behavior.

Decisions and tradeoffs:
- Keep the Basic Nodes migration packet.
- Do not clone old blockquote `overrideEditor(...tab)` behavior locally.
- Keep reverse-tab blockquote lifting in Basic Nodes shortcut semantics while
  Plite owns generic child replacement selection remap.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial package tests failed on blockquote wrapping and mark combo delimiters | 1 | Inspect runtime rule timing and Plite wrap semantics | Fixed by targeted block wrapping and delimiter correction |
| Initial lint failed on formatting only | 1 | Run package lint fixer | `pnpm --filter @platejs/basic-nodes lint:fix` |

Verification evidence:
- `rg -n "from 'platejs|from \"platejs|createSlate|createTSlate|createSlatePlugin|editor\.tf|extendTransforms|overrideEditor|getTransforms|editor\.children|editor\.selection| as any|: any|\bany\b" packages/basic-nodes/src --glob '*.{ts,tsx}'` — no matches.
- `pnpm turbo typecheck --filter=./packages/basic-nodes` — pass.
- `pnpm --filter @platejs/basic-nodes test` — 38 pass, 0 fail after the Plite `replaceChildren` selection repair.
- `pnpm --filter @platejs/basic-nodes lint` — pass.
- `pnpm check:core` — pass, including Core, Plite, Utils, and Basic Nodes.

Final handoff contract:
- target surface and mode: `packages/basic-nodes`, package review mode.
- files/APIs reviewed: 39 package source/spec files plus
  `packages/basic-nodes/package.json`,
  `packages/core/src/lib/plugin/createBasePlugin.ts`, and
  `tooling/scripts/check-core.mjs`.
- broad Core drift score coverage: N/A; only smallest Core owner patch.
- package file checklist coverage: 39 score-100 rows, 0 deferred rows.
- best Plate v2 recommendation: keep Basic Nodes as thin Plate/Plite plugins,
  with tx groups on `extendTx` and no old facade or transform compatibility.
- verdict matrix summary: keep package migration; keep Core typing patch; no
  deferred Basic Nodes rows.
- Plite/Plate gaps or blockers: none for Basic Nodes.
- related Core sweep query/matches/patched/deferred: recorded above.
- changes made: Basic Nodes migration, package deps, Core builder typing,
  check-core inclusion, plan update.
- tests/proof commands: recorded above.
- old compatibility names audited: no Basic Nodes matches.
- needs attention: none for Basic Nodes.
- next best Plate Next packet: `packages/basic-styles`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Basic Nodes package review closed |
| Where am I going? | `packages/basic-styles` package review |
| What is the goal? | Review `packages/basic-nodes` with per-file scoring and proof |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-06T21:56:59.390Z Goal plan created.
- 2026-07-06 Basic Nodes selected as next package and 39-file manifest recorded.
- 2026-07-06 Basic Nodes migrated from `platejs` facade to Plate/Plite package APIs.
- 2026-07-06 Core `createBasePlugin` contextual typing patched for nested config callbacks.
- 2026-07-06 Package proof and `check:core` passed.

Open risks:
- None for Basic Nodes.
