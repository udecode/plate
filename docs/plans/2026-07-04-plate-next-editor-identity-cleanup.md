# plate-next editor identity cleanup

Objective:
Consolidate Plate/Plite editor identity; done when Plite owns editor.id, Plate owns container id, runtime.uid is gone, and focused Core/Plite proof passes.

Goal plan:
docs/plans/2026-07-04-plate-next-editor-identity-cleanup.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- package-api

Plate Next source:
- prompt / link: User accepted all packets from the Plate/Plite id vs uid review.
- mode: one-shot execution
- target surface: Plite editor identity, Plate controller scope, Plate DOM container id, Core docs/tests that mention runtime.uid/runtime.key
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; named boundary packet with related-surface sweeps
- correction-triggered related Core sweep: yes, for editor.id/runtime.uid/runtime.key/PlateStoreState.id
- completion threshold summary: Plite `editor.id` is owned by `createEditor`, Plate no longer injects editor ids, `runtime.uid` is removed from Core, source audits and focused package checks pass.

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A
- semantics: no timed checkpoint requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Done state: implement the accepted packets:
  1. add `id?: string` to Plite `CreateEditorOptions`;
  2. add generated `id: string` to Plite `BaseEditor` / `createEditor`;
  3. remove Core `editor.id = ...` injection from `withPlite`;
  4. cut ghost `PlateStoreState.id`;
  5. replace `editor.runtime.uid` with Plate-owned container id state/API;
  6. audit docs/tests/source so user-facing docs no longer teach `editor.runtime.uid` or public `editor.runtime.key`.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-editor-identity-cleanup.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/plite test`, `pnpm --filter @platejs/core test -- src/lib/editor/withPlite.spec.ts src/react/components/Plate.slow.tsx src/react/stores/plate/createPlateStore.spec.tsx src/react/hooks/useSlateProps.spec.tsx src/react/components/PlateControllerEffect.spec.tsx`
- package proof: `pnpm check:core`
- source audits: `rg -n "runtime\\.uid|PlateStoreState.*id|id,\\s*$|editor\\.id =|editor\\.runtime\\.key" packages/core/src packages/plite/src packages/plite-react/src content docs --glob '!**/dist/**'`
- related Core sweep query / match count / patched count / deferred count:
  completed; see Related Core sweep ledger
- Plite/Plate gap ledger: one Plite type-view gap found and fixed in
  `packages/plite/src/editor-runtime-view.ts`
- broad Core drift ledger gate: N/A; named boundary packet, not broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-editor-identity-cleanup.md`

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
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.

Boundaries:
- allowed edit scope: `packages/plite/**`, `packages/plite-react/**` only if needed, `packages/core/**`, docs that mention `runtime.uid`/`runtime.key`, this plan.
- package/API surfaces: `@platejs/plite` editor creation/types and `@platejs/core` Plate store/controller/container APIs.
- docs/browser surfaces: docs-only audit/update if they teach removed public ids; no Browser proof unless route-rendering docs change materially.
- non-goals: broad Core cleanup, feature package migration, node id plugin semantics, Plite runtime node `RuntimeId`, app registry cleanup.
- out-of-scope package errors: non-Core package errors are recorded unless caused by this public API boundary change.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if Plite cannot own `editor.id` without a deeper public API plan, or if replacing `runtime.uid` requires unresolved user naming beyond `containerId`.

Current verdict:
- verdict: move editor id to Plite, cut runtime uid from editor, keep Plate container id local
- confidence: 0.99 after focused proof; remaining risk is unrelated broad Plate package drift blocking docs app runtime
- next owner: broader Plate package migration drift, not this identity packet
- keep / revert / quarantine call: keep
- reason: current Core injects editor identity in `withPlite` and stores DOM container identity under `runtime.uid`, both wrong owners.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Accepted all packets: Plite owns editor id, Plate owns container id, cut runtime.uid, audit docs/source, run focused proof. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read in this turn. |
| Active goal checked or created | yes | `get_goal` returned no active goal before plan creation; goal handle created after this checkpoint. |
| Mode classified as named packet vs broad Core sweep | yes | Named Plate/Plite identity boundary packet; broad Core sweep N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Review target: best Plate v2 shape on Plite, no compat aliases. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested. |
| Source of truth and allowed workspace recorded | yes | Current checkout `/Users/zbeyens/git/plate-2`; allowed scopes recorded in Boundaries. |
| Output budget strategy recorded | yes | Targeted `rg`/`sed`, capped output, no broad streamed manifests. |
| Public API fork routing checked | yes | User explicitly accepted the boundary decision; implementation may proceed. |
| Gap policy checked | yes | No expected blocker; any Plite gap patches Plite first. |
| Related Core sweep policy checked | yes | Sweep patterns recorded for id/runtime.uid/runtime.key/PlateStoreState.id. |
| Review-mode rename freeze checked | yes | Only `runtime.uid` rename/cut accepted by user; no file/path rename pass. |
| Package/API pack selected | yes | Package/API rows apply because Plite/Core public types change. |
| Public surface or package boundary identified | yes | Plite `CreateEditorOptions`/`BaseEditor`, Core Plate store/container APIs. |
| Release artifact path selected | no | N/A: no changeset requested in this migration lane; beta/private pre-release work. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no `.changeset` required by user for this lane. |
| Barrel/export impact decision recorded | yes | No new exported files expected; type shape changes only. Run `pnpm brl` only if exports/barrels change. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: Start Gates and Completion threshold filled before code edits.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
      Evidence: named Plate/Plite identity boundary packet; broad Core sweep N/A.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
      Evidence: Review matrix / Best Plate v2 recommendation rows initialized.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
      Evidence: no compat alias for `runtime.uid`; docs will be audited.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
      Evidence: direct owner move, no bridge planned.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
      Evidence: no blocker yet; gap ledger marks N/A unless implementation proves otherwise.
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
| Named verification threshold | yes | Run the proof commands named in this plan | Focused Core tests, Plite tests, Plite/Core typecheck, `pnpm check:core`, docs check, and audits passed. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: user accepted all identity packets, not a broad Core sweep. Related identity surfaces are swept below. |
| Score gate | no | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | N/A for broad drift scoring. Named reviewed files score high in Review matrix. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Plite owns `editor.id`; Plate owns `containerId`; `runtime.uid` dies. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | `EditorView` missing `id` was a Plite gap and is fixed. No remaining blocker. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Identity/runtime/doc audits recorded in Related Core sweep ledger. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm check:core` passed; focused Core and Plite tests passed. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | Browser/docs app runtime hit unrelated package migration drift; recorded below. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `runtime.uid`, `editor.runtime.uid`, public `runtime.key`, `editor.id =` audits passed. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no file/path rename packet. |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no extracted Core files created in this packet. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: scoped packet with focused tests and source audits; no commit requested. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-editor-identity-cleanup.md` | Run after this evidence fill. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Public types changed in existing exported files only; no new barrel needed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package type/runtime delta in active migration branch; no changeset by current Plate migration lane instruction. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A here: user previously set Plate migration lane to no changesets so Slate/Plite packages can release separately. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: not registry-only. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: package API/runtime changes exist, but changeset intentionally deferred by lane policy. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-react --filter=./packages/core`, `pnpm --filter @platejs/plite test`, focused Core tests, `pnpm check:core`. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no new exported files or barrel layout changes. |

Phase / pass table:
| Phase / pass | Status | Evidence | Next |
|--------------|--------|----------|------|
| Identity ownership packet | pass | Plite owns `editor.id`; Plate owns `containerId`; `runtime.uid` cut; focused proof and audits passed. | Close goal. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/plite/src/interfaces/editor.ts` / `BaseEditor.id`, `CreateEditorOptions.id` | 100 | move-to-plite | Plite | Logical editor identity belongs at creation time in the substrate. Typecheck and Plite tests pass. | keep |
| `packages/plite/src/create-editor.ts` | 100 | move-to-plite | Plite | Generates stable `plite-editor-N` id unless caller passes `id`. Foundation contract covers provided/generated/unique ids. | keep |
| `packages/plite/src/editor-runtime-view.ts` | 100 | move-to-plite | Plite | Fixed `EditorView extends BaseEditor` gap by forwarding `runtime.editor.id`. Typecheck passes. | keep |
| `packages/core/src/lib/editor/withPlite.ts` | 98 | hard-cut Core id injection | Plate Core | Removed `editor.id = id ?? editor.id ?? nanoid()`. `id` is create-only and forwarded to Plite creation. Focused tests pass. | keep |
| `packages/core/src/react/editor/withPlate.ts` | 100 | create-only id bridge | Plate React | `createPlateEditor` can pass id to Plite creation; `extendPlateEditor` cannot mutate identity. Typecheck passes. | keep |
| `packages/core/src/static/editor/withStatic.tsx` | 100 | create-only id bridge | Plate Static | Existing editor id is preserved even if options pass another id; creation forwards id. Static test updated. | keep |
| `packages/core/src/react/stores/plate/createPlateStore.ts` / `PlateStoreState` | 100 | keep-in-plate container identity | Plate React | Store `id` ghost removed; `containerId` and `useEditorContainerId` own DOM container identity. Store spec passes. | keep |
| `packages/core/src/react/components/Plate.tsx` | 100 | keep-in-plate container identity | Plate React | Computes React-stable container id and no longer mutates `editor.runtime.uid`. Component spec passes. | keep |
| `packages/core/src/react/components/PlateContainer.tsx` | 100 | keep-in-plate container identity | Plate React | Uses store `containerId`; user `id` prop still wins because props spread after default id. Component spec passes. | keep |
| Core/docs references to `runtime.uid` / public `runtime.key` | 100 | hard-cut docs/API docs | Docs | Docs now teach `useEditorContainerId` / current state only; audits pass. | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Editor identity | Plite owns logical `editor.id` at `createEditor({ id? })`; Plate must not mutate identity after creation. | Core `editor.id = nanoid()`, extend-time id overrides, `runtime.uid`, store `id` ghost. | Identity is substrate state. Plate container DOM id is product shell state and should not leak into editor runtime. | Low; API shape matches accepted direction. |
| DOM container identity | Plate owns `containerId` and exposes `useEditorContainerId()`. | `editor.runtime.uid` and public `runtime.key` docs. | Container id is React/shell state, not editor document state. | Low; naming is explicit. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plite type/runtime view | `EditorView` needed the new `id` field because it extends `BaseEditor`. | Casting around the view would hide a real type owner gap. | Plite `editor-runtime-view.ts` | Plite/Core typecheck | Fixed. |
| Plate docs app runtime | `www` docs route cannot render while unrelated migrated packages still import removed legacy APIs/files. | Patching docs app around package compile errors would hide broad Plate migration drift. | Plate package migration lane | Feature package migration proof | Deferred as unrelated blocker; see Out-of-scope package drift. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Cut `runtime.uid` | `rg -n "runtime\\.uid|editor\\.runtime\\.uid|uid\\?:|editor\\.id\\s*=|PlateStoreState.*id" packages/core/src packages/plite/src packages/plite-react/src content/docs --glob '!**/dist/**'` | 1 false positive import line containing `PlateStoreState` text | All real matches removed | 0 | none for identity packet |
| Cut public docs `runtime.key` | `rg -n "editor\\.runtime\\.key|runtime\\.key" content/docs/api/core content/docs/\\(plugins\\) content/docs/migration --glob '*.mdx'` | 0 | N/A | 0 | none |
| Prevent extend-time id override | `rg -n "extend(Base|Plate)Editor\\([^\\n]+, \\{ id|Extend(Base|Plate)EditorOptions<.*id|id\\?: string" packages/core/src/lib/editor packages/core/src/react/editor packages/core/src/static/editor packages/plite/src/interfaces/editor.ts` | Expected create-only option/type declarations only | Stale tests/options repaired | 0 | none |

Core drift ledger:
- Applies: no; named identity packet, not broad Core sweep
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

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Broad Core sweep explicitly out of scope for this named identity packet. | Use `plate-next` broad sweep separately if requested. |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Plite editor identity | Plite | Core was the wrong owner for editor identity. | `interfaces/editor.ts`, `create-editor.ts`, `editor-runtime-view.ts`, Plite tests/typecheck | keep | none |
| Plate container identity | Plate React | DOM container id should live in Plate shell state, not runtime editor state. | `PlateStore`, `createPlateStore`, `Plate`, `PlateContainer`, Core focused tests | keep | none |
| Docs/API cleanup | Docs | Docs taught old `runtime.uid`/public `runtime.key` concepts. | Core API docs, block selection docs, migration doc, docs check | keep | broader docs runtime blocked by unrelated package drift |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | No extracted files created by this packet. | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm --filter www dev --port 3002` + Browser route load | Docs app compile hit unrelated package migration errors: missing `withLink`, `withTable`, `withToggle`; removed legacy imports `createSlatePlugin`, `createTSlatePlugin`, `createTPlatePlugin`, `toTPlatePlugin`; removed hooks `useEditorVersion`, `useFocused`, `useReadOnly`. | The identity packet touches Plite/Core/store/docs identity surfaces only. `pnpm check:core` and docs source check pass. | Broader Plate package migration lane. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Plite `BaseEditor.id` and `CreateEditorOptions.id`; generated editor id in `createEditor`; `EditorView.id`; Core create-only id forwarding; removed Core id mutation; removed `runtime.uid`; Plate `containerId` store/hook/container wiring. |
| tests/proof | Added Plite identity foundation contract; updated Core editor/static/store/component tests for create-only id and container id. |
| docs/templates/skills | Updated block-selection docs, Core API docs, Plate store docs, and migration doc to avoid `runtime.uid`/public `runtime.key`. Updated this autogoal plan. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `www` docs app cannot render with current broader migration drift | Browser proof for docs route is blocked by unrelated package compile errors outside this packet. | `packages/link`, `packages/table`, `packages/toggle`, `packages/ai` compile errors listed above | Route next to Plate package migration; do not weaken identity packet. |
| 2 | `runtime.key` still exists internally | It is not public docs/API now, but it remains internal remount/runtime plumbing. | Core runtime internals | Review in a later Plate runtime cleanup packet if it starts leaking. |

Findings:
- `id` and `uid` were two different concerns: Plite logical editor identity vs Plate DOM container identity.
- `runtime.uid` was the wrong shape because it made DOM shell identity look like editor runtime state.
- `EditorView` needed a real Plite fix after `BaseEditor.id`, which prevented a type cast workaround.

Decisions and tradeoffs:
- `editor.id` is create-only. Existing editors keep their id when extended.
- Plate exposes `containerId` through the Plate store for DOM/container work.
- No public alias or compatibility shim for `runtime.uid`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `bun test test/editor-foundation-contract.ts` path was interpreted as a filter | 1 | Use `./test/editor-foundation-contract.ts` | Passed |
| Focused Core test expected stale id override / missing container wrapper | 1 | Update test expectations to create-only id and render `PlateContainer` | Passed |
| Typecheck found `EditorView` missing `id` | 1 | Add `id` to Plite runtime view | Passed |
| Typecheck found Core create options lost `id` | 1 | Re-add create-only `id?: string` to Core create options | Passed |

Verification evidence:
- `pnpm --filter @platejs/plite exec bun test ./test/editor-foundation-contract.ts` passed.
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts src/react/components/PlateContent.spec.tsx src/react/stores/plate/createPlateStore.spec.tsx src/react/components/PlateControllerEffect.spec.tsx src/react/hooks/useSlateProps.spec.tsx src/static/editor/withStatic.spec.tsx` passed: 66 tests.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-react --filter=./packages/core` passed.
- `pnpm --filter @platejs/plite test` passed: 1023 pass, 85 skip.
- `pnpm check:core` passed.
- `pnpm --filter www check:docs` passed.
- Source audits for `runtime.uid`, `editor.runtime.uid`, `editor.id =`, `PlateStoreState.*id`, and public docs `runtime.key` passed.

Final handoff contract:
- target surface and mode: named Plate/Plite identity boundary packet
- files/APIs reviewed: Plite editor creation/types/runtime view; Core withPlite/withPlate/static editor creation; Plate store/container docs/tests
- broad Core drift score coverage: N/A, not requested
- best Plate v2 recommendation: Plite owns `editor.id`; Plate owns `containerId`; `runtime.uid` dies
- verdict matrix summary: keep all packet changes
- Plite/Plate gaps or blockers: Plite `EditorView.id` gap fixed; docs app runtime blocked by unrelated package migration drift
- related Core sweep query/matches/patched/deferred: recorded in Related Core sweep ledger; no deferred identity matches
- changes made: recorded in Changed list
- tests/proof commands: recorded in Verification evidence
- old compatibility names audited: `runtime.uid`, public `runtime.key`, extend-time id override, `editor.id =`
- needs attention: broader Plate package migration drift blocks `www` runtime route proof
- next best Plate Next packet: continue feature package migration drift that blocks docs app/runtime

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Packet closeout |
| Where am I going? | Goal completion check |
| What is the goal? | Consolidate editor identity so Plite owns `editor.id` and Plate owns DOM `containerId`. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-04T13:24:03.054Z Goal plan created.
- 2026-07-04T13:35Z Plite editor id and Core create-only id forwarding implemented.
- 2026-07-04T13:47Z Plate container id and docs/tests updated.
- 2026-07-04T14:07Z Focused Core/Plite proof and source audits passed; Browser route proof blocked by unrelated package drift.

Open risks:
- Broader Plate package migration drift still blocks `apps/www` runtime/docs Browser proof.
