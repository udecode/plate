# plite marks toggle clear

Objective:
Add `marks.toggle(..., { clear })` to Plite and migrate the Utils mark toolbar
hook to that primitive with focused package proof.

Goal plan:
docs/plans/2026-07-06-plite-marks-toggle-clear.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: user accepted the Plite primitive shape after asking whether
  `toggleMark` belongs in Plite, then said `go`.
- mode: named API/package packet, one-shot execution
- target surface: Plite `editor.update.marks.toggle` /
  `tx.marks.toggle` and `packages/utils` mark toolbar hook
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A, user did not ask for broad Core sweep
- correction-triggered related Core sweep: N/A unless Core is touched
- package review mode: N/A, this is a named API primitive packet
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: Plite primitive exists, Utils hook consumes it
  directly, old edge behavior is covered by tests, package proof passes, and
  plan check completes

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
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `editor.update.marks.toggle(key, value?, { clear })` and
  `tx.marks.toggle(key, value?, { clear })` are typed and implemented in
  Plite.
- `clear` removes mutually exclusive marks only when enabling the target mark;
  disabling an active target removes the target only.
- `packages/utils/src/react/hooks/useMarkToolbarButton.ts` uses the Plite
  primitive directly, with no local active/clear workaround and no `toggleMark`
  alias.
- Focused Plite and Utils tests pass, plus touched package typecheck/lint.
- Public docs/changeset impact is handled or explicitly classified.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plite-marks-toggle-clear.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands:
  `pnpm --filter @platejs/plite exec bun test <focused test>`,
  `pnpm --filter @platejs/utils exec bun test --preload ../../config/plite-source-test-setup.ts ./src/react/hooks/useMarkToolbarButton.spec.tsx`
- package proof: `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/utils`,
  package lint for touched packages, and broader gate if the public API change
  makes focused proof too narrow
- shared Core gate: N/A unless Core is touched
- source audits: exact `rg` for local `toggleMark` workarounds and direct
  one-shot/callback drift after patch
- related Core sweep query / match count / patched count / deferred count:
  N/A unless Core is touched
- package file manifest / row count / checked count / deferred count: N/A
- Plite/Plate gap ledger: N/A unless implementation exposes a gap
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plite-marks-toggle-clear.md`

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
- allowed edit scope: `packages/plite`, `packages/utils`, relevant Plite docs,
  existing package changeset files, and this plan
- package/API surfaces: published Plite mark-update API and Utils toolbar hook
- docs/browser surfaces: docs only if API reference/examples mention mark
  updates; browser proof N/A because this is package API behavior, not a route
  or UI layout change
- non-goals: no `toggleMark` compat alias, no Plate/Core migration sweep, no
  broad package migration, no renames
- out-of-scope package errors: ignored unless caused by this API change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if the clean primitive requires a larger Plite API redesign that
  cannot be safely completed in this packet.

Current verdict:
- verdict: move-to-plite
- confidence: final 100 for this named packet
- next owner: plate-next with Plite implementation
- keep / revert / quarantine call: keep
- reason: Mark toggling with mutually exclusive clears is generic editor
  mutation substrate. Keeping it in Utils re-creates local command wrappers.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target API, no alias, direct Utils consumer, proof, and non-goals copied above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named API/package packet; broad Core sweep N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Verdict is move-to-plite, no `toggleMark` alias |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`, allowed scope listed above |
| Output budget strategy recorded | yes | Narrow source reads and exact `rg`, no broad repo streaming |
| Public API fork routing checked | yes | No separate `plate-plan`: shape was accepted in chat and is a small Plite primitive |
| Gap policy checked | yes | Stop if implementation reveals a larger Plite API gap |
| Related Core sweep policy checked | yes | N/A unless Core is touched |
| Review-mode rename freeze checked | yes | No renames in this packet |
| Package review checklist initialized when in scope | no | N/A: not package review mode |
| Package/API pack selected | yes | Applied package-api pack |
| Public surface or package boundary identified | yes | Plite published update API and Utils package hook |
| Release artifact path selected | yes | Updated existing `.changeset/prepare-v54-beta-plite.md` and `.changeset/auto-main-to-next-sync-platejs-utils.md` |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read before changeset edits |
| Barrel/export impact decision recorded | no | N/A: no exports or barrel layout changed |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: top sections filled before code edits.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`. Evidence: verdict is
      `move-to-plite`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate. Evidence: no
      `toggleMark` wrapper added to Utils; existing direct Plite APIs extended.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
      Evidence: Utils hook calls `editor.update.marks.toggle` directly.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
      Evidence: N/A, no gap remains.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
      Evidence: no Core file touched; exact Utils/Core audit recorded below.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
      Evidence: N/A, broad Core sweep not requested.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
      Evidence: N/A, broad Core sweep not requested.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
      Evidence: N/A, broad Core sweep not requested.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
      Evidence: N/A, broad Core sweep not requested.
- [x] For package review mode, the package file checklist is generated before
      implementation, with one checkbox per reviewed file.
      Evidence: N/A, not package review mode.
- [x] For package review mode, every package file row is either checked at
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
      Evidence: N/A, not package review mode.
- [x] For package review mode, no next package is started before the current
      package checklist closes or the user explicitly redirects.
      Evidence: N/A, not package review mode.
- [x] For Core-adjacent package review, `tooling/scripts/check-core.mjs` is
      updated to include the package, or the plan records why the package is
      product-only and outside `check:core`.
      Evidence: `check:core` already covers Plite, Core, and Utils.
- [x] Direct one-shot API audit closed: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic. Evidence: docs one-line mark toggle callbacks
      removed; remaining callback matches are tests for callback API.
- [x] Plugin export inference audit closed: plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
      Evidence: N/A, no plugin exports touched.
- [x] Empty config inference audit closed: `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed options, API, tx, selectors, state, or external public contract.
      Evidence: N/A, no plugin configs touched.
- [x] Plugin extension options audit closed: plugin-owned extension options are
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
      Evidence: N/A, no plugin extensions touched.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
      Evidence: N/A, no bridge touched.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
      Evidence: N/A, accepted small Plite primitive, not a fork requiring a
      separate plan.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
      Evidence: no renames.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
      Evidence: N/A, no new files in this packet.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
      Evidence: keep; focused and shared gates pass.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
      Evidence: N/A, no barrels or exported file layout changed.
- [x] Old compatibility names are source-audited when cut.
      Evidence: no compat alias cut; audited old local workaround shape.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
      Evidence: N/A, not registry-only work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
      Evidence: N/A, there is a package-visible delta and changesets were updated.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
      Evidence: add Plite option; no compat alias.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
      Evidence: N/A, no generated barrels required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Focused Plite/Utils tests pass; package tests pass; `pnpm check:core` passes |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: broad Core sweep not requested |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Named packet scores 100; no high drift rows |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Recommend Plite `marks.toggle(..., { clear })`; reject Utils local wrapper and `toggleMark` alias |
| Plite/Plate gap ledger | no | Record blockers or N/A when no gap blocks the target | N/A: Plite primitive implemented |
| Related Core sweep after correction | no | For each correction, run and record same-class Core search/review results | N/A: no Core correction; exact audit recorded |
| Package file checklist | no | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | N/A: not package review mode |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Plite and Utils typecheck/lint/tests/build proof recorded |
| Shared Core gate coverage | yes | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | Existing `pnpm check:core` covers Core, Plite, and Utils; pass |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: no failures |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Audited local workaround and one-line docs callback patterns |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no renames |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no new files in this packet |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | Self-review plus shared `check:core`; no separate autoreview requested for this micro packet |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Ledgers filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plite-marks-toggle-clear.md` | Run after final evidence |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Public typecheck, package tests, and changesets updated; no barrel impact |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package API/behavior delta for Plite and Utils |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing Plite major and Utils patch changesets updated; no forbidden minor |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: not registry work |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: changesets updated |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Plite/Utils typecheck, lint, test; Utils build; Plite build inside gates |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exports or barrels changed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/plite/src/editor/toggle-mark.ts` | 0 | move-to-plite | Plite | Adds `clear` behavior inside core transform | keep |
| `packages/plite/src/interfaces/editor.ts` | 0 | move-to-plite | Plite | Types expose options on tx/direct/static transform surfaces | keep |
| `packages/utils/src/react/hooks/useMarkToolbarButton.ts` | 0 | main-parity-cleanup | Utils | Consumes Plite primitive directly | keep |
| Plite docs mark toggle examples | 0 | keep-in-plate | Docs | Current API docs updated, no changelog voice | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Mark toolbar mark toggle | `editor.update.marks.toggle(key, value, { clear })` / `tx.marks.toggle(key, value, { clear })` | `toggleMark` alias; Utils-local clear/remove/add transaction | Generic editor mutation belongs in Plite and keeps callers inferred | None |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | none | none | none | no gap |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Utils local clear workaround | `rg -n "clearMarks|state\\.clear|tx\\.marks\\.remove\\(|tx\\.marks\\.add\\(" packages/utils/src packages/core/src --glob '!**/dist/**'` | 6 | 1 | 5 unrelated legitimate Core/Utils mark operations | none |
| Docs one-line mark callback drift | `rg -n "editor\\.update\\(\\(tx\\) => \\{\\n\\s*tx\\.marks\\.toggle" content/docs/plite packages/plite packages/utils -U` | 3 test matches after patch | 5 docs matches already patched | 3 test matches intentionally prove callback API | none |

Core drift ledger:
- Applies: N/A
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | N/A | N/A | broad Core sweep not requested | none |

Package file checklist:
- Applies: N/A
- Package: N/A
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A: not package review mode.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| mark toggle clear | Plite + Utils | Mutually exclusive mark toggle belongs in Plite, not toolbar-local code | Plite transform/API, Utils hook/tests, docs, changesets | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | no new files | source audit |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no proof failures | N/A | none |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Plite primitive | complete | `marks.toggle(..., { clear })` implemented and tested | none |
| Utils consumer | complete | toolbar hook calls direct Plite primitive and regression tests pass | none |
| Docs/release artifact | complete | docs examples and existing changesets updated | none |
| Verification | complete | focused package gates and `pnpm check:core` pass | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Plite `marks.toggle` accepts `clear`; Utils toolbar uses direct Plite primitive |
| tests/proof | Added Plite direct/callback clear contract and Utils edge regression tests |
| docs/templates/skills | Updated Plite mark-toggle docs/examples and existing package changesets |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None for this packet | API shape already accepted and proof is green | `marks.toggle(..., { clear })` | keep |

Findings:
- Utils had a real edge regression when mark clear was local: active target
  toggles could clear unrelated marks or re-add the target when `clear`
  included it.
- Plite can own the behavior without a `toggleMark` alias.

Decisions and tradeoffs:
- `clear` runs only when enabling the target mark.
- Disabling an active mark removes the target mark only.
- Existing static transform path also accepts the options so middleware/static
  and direct update paths stay aligned.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Local docs route smoke on `http://localhost:3002/docs/plite/api/transforms` returned 500 | 1 | Treat as unrelated app/dev-server blocker; rely on `check:docs` for MDX/source proof in this packet | Blocked by unrelated `apps/www` import errors from unmigrated packages such as `footnote`, `link`, `table`, `toggle`, `toc`, and `combobox` |

Verification evidence:
- `pnpm --filter @platejs/plite exec bun test ./test/read-update-contract.ts`
  -> 7 pass.
- `pnpm --filter @platejs/utils exec bun test --preload ../../config/plite-source-test-setup.ts ./src/react/hooks/useMarkToolbarButton.spec.tsx`
  -> 5 pass.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/utils`
  -> pass.
- `pnpm --filter @platejs/plite lint && pnpm --filter @platejs/utils lint`
  -> pass.
- `pnpm --filter @platejs/plite test` -> 1023 pass / 85 skip.
- `pnpm --filter @platejs/utils test` -> 61 pass.
- `pnpm --filter www check:docs` -> pass.
- Local docs route smoke on port 3002 -> blocked by unrelated `apps/www`
  import errors from package migration drift; not caused by this mark-toggle
  packet.
- `pnpm --filter @platejs/utils build` -> pass.
- `pnpm check:core` -> pass, including Core 707 pass, Plite 1904 pass / 85
  skip, Utils 61 pass.

Final handoff contract:
- target surface and mode: named Plite mark-toggle API packet
- files/APIs reviewed: Plite mark transform/API, Utils toolbar hook, Plite docs
- broad Core drift score coverage: N/A
- package file checklist coverage: N/A
- best Plate v2 recommendation: keep Plite `marks.toggle(..., { clear })`
- verdict matrix summary: move-to-plite and main-parity-cleanup
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: recorded above
- changes made: recorded above
- tests/proof commands: recorded above
- old compatibility names audited: no alias added; local workaround removed
- needs attention: none
- next best Plate Next packet: continue package-by-package review when user
  names the next package/file

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Goal closure |
| Where am I going? | Final plan check, then handoff |
| What is the goal? | Add Plite `marks.toggle(..., { clear })` and migrate Utils |
| What have I learned? | Clear-on-disable was the bug; Plite primitive is the right owner |
| What have I done? | Implemented, documented, changeset-updated, verified |

Timeline:
- 2026-07-06T09:55:52.178Z Goal plan created.

Open risks:
- None for this packet.
