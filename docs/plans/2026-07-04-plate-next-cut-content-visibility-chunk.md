# plate-next cut content visibility chunk

Objective:
Cut dead Core content-visibility wrapper and similar uncommitted Core API; done
when source audits and Core proof pass.

Goal plan:
docs/plans/2026-07-04-plate-next-cut-content-visibility-chunk.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user accepted the recommendation to cut
  `packages/core/src/react/components/ContentVisibilityChunk.tsx`, then asked
  to "sweep any similar api to cut in uncommited core"
- mode: named deletion packet plus focused uncommitted-Core same-class sweep
- target surface:
  `packages/core/src/react/components/ContentVisibilityChunk.tsx`,
  `packages/core/src/react/components/index.ts`, and uncommitted Core files
  with the same smell: exported dead wrappers/API that no runtime or test
  consumes
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: this is not "all core"; sweep is same-class dead API
  in uncommitted Core files
- correction-triggered related Core sweep: required for `ContentVisibilityChunk`,
  content-visibility/chunk wrappers, and exported no-ref components/helpers
- completion threshold summary: delete the dead component and export, audit
  changed/untracked Core for same-class dead API, cut only proven safe matches,
  then run Core proof

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `ContentVisibilityChunk.tsx` is deleted and no public barrel exports it.
- Source audit shows no `ContentVisibilityChunk` references under Core.
- Same-class uncommitted Core sweep is recorded with candidates, cuts, and
  defers.
- Focused Core typecheck/lint passes, or any failure is explicitly unrelated
  and out of scope.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-cut-content-visibility-chunk.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: source audits plus Core package typecheck/lint
- package proof: `pnpm --filter @platejs/core typecheck`;
  `pnpm --filter @platejs/core lint`
- source audits:
  `rg -n "ContentVisibilityChunk|contentVisibility|chunking|withChunking" packages/core/src packages/core/type-tests`
  and changed/untracked Core export/caller audits
- related Core sweep query / match count / patched count / deferred count:
  direct removed-symbol audit: 0 refs remaining; local-helper audit: 7 local
  refs remaining; symbol-level low-ref sweep cut 5 same-class export groups and
  deferred public plugin/type surface
- Plite/Plate gap ledger: N/A unless sweep finds an API that should move to
  Plite instead of being cut
- broad Core drift ledger gate: N/A: focused same-class sweep only
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-cut-content-visibility-chunk.md`

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
- allowed edit scope: `packages/core/src/**`, focused plan file, no app/docs
  unless Core proof exposes a direct import
- package/API surfaces: Core React component exports and same-class dead Core
  API in uncommitted files
- docs/browser surfaces: N/A
- non-goals: no broad Plate migration, no rename pass, no feature-package
  cleanup, no moving dead API into Plite just to preserve it
- out-of-scope package errors: ignore non-Core failures unless caused by this
  deletion

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if a supposedly dead API is consumed by a public package/app path
  and requires a Plate API decision before deletion.

Current verdict:
- verdict: complete
- confidence: high
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: source refs show the deleted/de-exported APIs were dead exports or
  same-file-only implementation details; Core proof is green

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | exact delete and sweep request copied above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully |
| Active goal checked or created | yes | no active goal found; new goal created |
| Mode classified as named packet vs broad Core sweep | yes | named deletion plus same-class uncommitted-Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | no compat preservation; no move-to-Plite for dead wrapper |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core sweep |
| Source of truth and allowed workspace recorded | yes | workspace `/Users/zbeyens/git/plate-2`; compare refs via current tree and `origin/main` when needed |
| Output budget strategy recorded | yes | targeted audits, name lists, capped reads |
| Public API fork routing checked | yes | stop only if a consumer needs API decision |
| Gap policy checked | yes | move-to-Plite only if generic substrate is alive and consumed |
| Related Core sweep policy checked | yes | same-class sweep required after deletion |
| Review-mode rename freeze checked | yes | no rename pass |

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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | passed: audits, focused tests, Core typecheck, Core lint |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: same-class sweep only, not broad Core |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | closed: score 4 deleted, score 2 de-exported/cut, score 1 localized, public type surface kept |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | delete dead wrapper; keep implementation-only helpers local; keep public plugin type surface |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: no live substrate behavior to move to Plite |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | direct audit and low-ref export sweep recorded below |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | passed: focused tests, `pnpm --filter @platejs/core typecheck`, `pnpm --filter @platejs/core lint` |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: no non-Core failures |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | passed: removed names have no public refs; local helpers have same-file refs only |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename pass |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no extracted-file packet |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: tiny dead-export cleanup with focused proof |
| Final lint/check | yes | Run scoped lint/check or record N/A | passed: Core lint |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-cut-content-visibility-chunk.md` | to run after this update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | prompt requirements, scope, non-goals, proof, and stop condition copied into this plan | none |
| Dead wrapper cut | complete | `ContentVisibilityChunk.tsx` deleted and barrel export removed | keep |
| Same-class API sweep | complete | low-ref export sweep cut/localized only implementation-only symbols | no broad type-surface cut |
| Proof | complete | source audits, `pnpm brl`, focused tests, Core typecheck, Core lint passed | close goal |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/react/components/ContentVisibilityChunk.tsx` / `ContentVisibilityChunkProps` | 4 | hard-cut | Core React components | only declaration plus barrel export; no runtime/test refs; content/chunk audit has 0 refs | keep deleted |
| `packages/core/src/react/components/index.ts` | 2 | hard-cut export | Core barrel | `pnpm brl` removed the stale export | keep generated barrel change |
| `GLOBAL_PLATE_SCOPE` in `createPlateStore.ts` | 2 | hard-cut export | Plate store | symbol-level sweep found declaration-only export; final audit has no refs | keep deleted |
| `FirstBlockEffect` in `useElementStore.tsx` | 1 | de-export, keep local | Element store implementation | final audit shows only same-file JSX use and local function declaration | keep local |
| `convertDomEventToSyntheticEvent` in `pipeHandler.ts` | 1 | de-export, keep local | Handler pipeline implementation | final audit shows same-file declaration and same-file call only | keep local |
| `isEventHandled` in `pipeHandler.ts` | 1 | de-export, keep local | Handler pipeline implementation | final audit shows same-file declaration and same-file call only | keep local |
| public plugin/types from changed Core files | 0 | keep | Core public type surface | low-ref sweep found exported types but they are public surface, not same-class dead wrappers | defer to explicit API review only |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Content visibility/chunk wrapper | delete it entirely | moving it to Plite, keeping empty wrapper, or preserving export for compatibility | no live behavior, no Plite gap, and no consumer refs | none |
| same-file-only helper exports | make them local | public export just because a helper exists | exports widen API without value and make future agents think the helper is owned externally | none |
| public Core type surface | keep for now | cutting all low-ref exported types from a symbol-count script | these are actual plugin/editor type contracts and need explicit API review before removal | review in a separate API packet if desired |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none found | deleted APIs had no live substrate behavior | N/A | N/A | no Plite move needed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| delete `ContentVisibilityChunk` | `rg -n "ContentVisibilityChunk\\|contentVisibility\\|chunking\\|withChunking" packages/core/src packages/core/type-tests` | 0 after patch | 2 files: component deleted, barrel export removed | 0 | none |
| cut `GLOBAL_PLATE_SCOPE` | low-ref exported-symbol sweep over changed/untracked Core files plus `rg GLOBAL_PLATE_SCOPE` | declaration-only before patch, 0 after patch | 1 symbol | 0 | none |
| localize same-file helpers | `rg -n "convertDomEventToSyntheticEvent\\|isEventHandled\\|FirstBlockEffect\\|GLOBAL_PLATE_SCOPE" packages/core/src packages/core/type-tests` | 7 local refs after patch | 3 symbols localized/deleted | 0 | none |
| low-ref public type sweep | symbol-level sweep over uncommitted Core files | multiple public type contracts | 0 | public plugin/editor/store types | public API review owns those, not this same-class cut |

Core drift ledger:
- Applies: no, because this was not a broad Core drift sweep
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
| N/A | N/A | N/A | N/A | broad file-by-file Core drift sweep was explicitly out of scope | use `plate-next` broad sweep when requested |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| dead content-visibility wrapper | Core React components | stale chunk wrapper survived after chunking direction changed | `ContentVisibilityChunk.tsx`, `components/index.ts`, removed-name audit | keep deleted | none |
| same-class dead exports | Core React internals | exported helpers/types from uncommitted Core drift that are not external API | low-ref sweep; `GLOBAL_PLATE_SCOPE`, `FirstBlockEffect`, `pipeHandler` helpers | cut/delete/localize proven implementation-only symbols | explicit public API review for remaining exported types |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | no extracted-file packet | no untracked/extracted file was kept or deleted in this packet |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | no proof failures | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | deleted `ContentVisibilityChunk.tsx`; removed its barrel export; removed `GLOBAL_PLATE_SCOPE`; localized `FirstBlockEffect`, `convertDomEventToSyntheticEvent`, and `isEventHandled` |
| tests/proof | no test files changed |
| docs/templates/skills | updated this autogoal plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | public plugin/editor type exports not cut by symbol count | they may be low-ref in source but still public API | changed Core plugin/type files | review only in an explicit API surface packet, not as cleanup fallout |

Findings:
- `ContentVisibilityChunk` was dead. Keeping it would preserve a stale chunking
  surface without behavior.
- The same-class sweep found one unused exported symbol and two exported
  same-file helpers; all are better as deleted/local implementation details.
- No Plite capability was missing for this cleanup.

Decisions and tradeoffs:
- Hard-cut dead API instead of preserving compatibility exports.
- Keep public plugin/editor type contracts despite low source refs; source-count
  alone is not authority to remove public type surface.
- Do not broaden into a full Core drift sweep in this packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `rg -n "ContentVisibilityChunk|GLOBAL_PLATE_SCOPE|export const convertDomEventToSyntheticEvent|export const isEventHandled|export function FirstBlockEffect|contentVisibility|chunking|withChunking" packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> no matches.
- `rg -n "convertDomEventToSyntheticEvent|isEventHandled|FirstBlockEffect|GLOBAL_PLATE_SCOPE" packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> only local helper refs in `pipeHandler.ts` and `useElementStore.tsx`; no `GLOBAL_PLATE_SCOPE`.
- `pnpm brl` -> passed, 57 successful tasks.
- `pnpm --filter @platejs/core exec bun test src/react/components/PlateContent.spec.tsx src/react/components/PlateTest.spec.tsx src/react/stores/element/useElementStore.spec.tsx src/react/utils/inputRules.spec.tsx` -> 30 pass, 0 fail.
- `pnpm --filter @platejs/core typecheck` -> passed.
- `pnpm --filter @platejs/core lint` -> passed.

Final handoff contract:
- target surface and mode: named deletion packet plus same-class uncommitted-Core export sweep
- files/APIs reviewed: `ContentVisibilityChunk`, component barrel, `GLOBAL_PLATE_SCOPE`, `FirstBlockEffect`, `convertDomEventToSyntheticEvent`, `isEventHandled`, and low-ref public type candidates
- broad Core drift score coverage: N/A, not requested for this packet
- best Plate v2 recommendation: dead wrappers should die; same-file helpers stay local; public type surface needs explicit API review
- verdict matrix summary: 1 deleted file, 1 deleted barrel export, 1 deleted unused export, 3 localized/deleted implementation-only helper exports
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: removed-symbol audit 0 refs; helper audit 7 local refs; public type low-ref candidates deferred
- changes made: see Changed list
- tests/proof commands: see Verification evidence
- old compatibility names audited: yes
- needs attention: public type surface only if you want an API packet
- next best Plate Next packet: explicit public React/Core type surface review, not another blind low-ref cut

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Cleanup proof complete |
| Where am I going? | Close the autogoal after check-complete |
| What is the goal? | Cut dead Core content-visibility wrapper and similar same-class uncommitted Core API |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-04T09:34:06.844Z Goal plan created.
- 2026-07-04T09:37Z Deleted `ContentVisibilityChunk` and removed its barrel export.
- 2026-07-04T09:38Z Cut/localized same-class dead exported Core helpers.
- 2026-07-04T09:41Z Ran source audits, `pnpm brl`, focused tests, Core typecheck, and Core lint.

Open risks:
- Public users importing the deleted deep component export will break. That is
  intentional: the component had no supported behavior and no Core refs.
