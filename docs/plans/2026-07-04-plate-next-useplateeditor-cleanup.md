# plate-next usePlateEditor cleanup

Objective:
Deep-review and repair `usePlateEditor.ts` drift against main ownership and
Plite-fit Plate editor typing.

Goal plan:
docs/plans/2026-07-04-plate-next-useplateeditor-cleanup.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said "same for
  `packages/core/src/react/editor/usePlateEditor.ts`" after the `Plate.tsx`
  `PlateRootEditor` cleanup
- mode: named-file review packet with related Core sweep
- target surface: `packages/core/src/react/editor/usePlateEditor.ts`, direct
  helper/caller/test refs, and any owner type touched only if the file exposes
  a Plite/Plate boundary gap
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: named file/API packet only
- correction-triggered related Core sweep: required for any corrected helper,
  cast, alias, or stale editor creation pattern found in `usePlateEditor.ts`
- completion threshold summary: compare with `origin/main`, classify each
  drift, patch only real migration sludge, audit same-class refs, run focused
  Core proof, and close this plan

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
- `usePlateEditor.ts` has no unnecessary drift from `origin/main` ownership.
- Any remaining differences are justified by Plite runtime/API shape, not
  compatibility sludge.
- No local `any`/alias/helper exists only to hide weak typing when owner typing
  can be repaired.
- Related Core sweep is recorded with query, matches, patched, deferred, and
  risk.
- Focused tests or source audit, Core typecheck, Core lint, and final
  `check-complete` pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-useplateeditor-cleanup.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: source compare with `origin/main`; focused tests if
  a direct test owner exists
- package proof: `pnpm --filter @platejs/core typecheck`;
  `pnpm --filter @platejs/core lint`
- source audits: exact `rg` for corrected symbols/patterns after patch
- related Core sweep query / match count / patched count / deferred count:
  one targeted audit query; expected matches only; one file patched; one
  adjacent hook deferred
- Plite/Plate gap ledger: no gap found
- broad Core drift ledger gate: N/A: named file/API packet only
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-useplateeditor-cleanup.md`

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
- allowed edit scope: `packages/core/src/react/editor/usePlateEditor.ts`,
  directly related tests/callers/types only if the file exposes a real owner
  typing gap
- package/API surfaces: Plate React editor creation hook and inferred editor
  typing
- docs/browser surfaces: N/A
- non-goals: no broad Core sweep, no rename pass, no package migration, no
  compatibility alias, no docs/API redesign
- out-of-scope package errors: ignore non-Core package failures unless caused
  by this Core API/type change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop if clean `usePlateEditor.ts` requires a public Plate editor API decision
  that cannot be made safely inside this named-file packet.

Current verdict:
- verdict: keep patched cleanup
- confidence: high after main comparison, focused behavior tests, Core
  typecheck, and Core lint
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: the patch restores main's async `onReady` force-render behavior and
  removes local type sludge around `createPlateEditor`

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | exact file and "same" review intent recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully |
| Active goal checked or created | yes | no active goal; new goal created |
| Mode classified as named packet vs broad Core sweep | yes | named file/API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | no compatibility aliases or local type hacks |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core sweep |
| Source of truth and allowed workspace recorded | yes | current checkout vs `origin/main` evidence |
| Output budget strategy recorded | yes | targeted reads, capped searches, no broad output |
| Public API fork routing checked | yes | route to `plate-plan` only if public API fork is exposed |
| Gap policy checked | yes | name Plite/Plate gap instead of local workaround |
| Related Core sweep policy checked | yes | required after any correction |
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
| Named verification threshold | yes | Run the proof commands named in this plan | focused behavior tests, typecheck, lint, and source audit passed |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named-file packet, not broad Core sweep |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | high drift rows fixed or deferred with owner |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | recorded below |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | no gap found |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | audit query recorded below |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm --filter @platejs/core typecheck`; `pnpm --filter @platejs/core lint`; focused Bun tests passed |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no non-Core package failures in this packet |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | no stale `createPlateEditor as any`, `InferPlugins<P[]>`, `TPlateEditor`, or `createSlateEditor` in target |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no rename attempted |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | `git ls-files --others --exclude-standard packages/core/src/react/editor packages/core/type-tests` returned 0 rows |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: one named hook cleanup, covered by focused tests and typecheck |
| Final lint/check | yes | Run scoped lint/check or record N/A | Core lint passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | recorded below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-useplateeditor-cleanup.md` | to run after final plan fill |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/react/editor/usePlateEditor.ts` | 4 before patch; 0 after patch | keep patched cleanup | Plate React editor hook | main had async `onReady` force-render and no `createPlateEditor as any`; current patch restores that shape with Plite imports | done |
| `createPlateEditor as any` | 5 before patch; 0 after patch | hard-cut local type hack | `createPlateEditor` tuple generic | target no longer casts the factory to `any`; `UsePlateEditorResult` uses factory return type | done |
| `P[]` / `InferPlugins<P[]>` hook typing | 4 before patch; 0 after patch | replace with tuple plugin generic | `CreatePlateEditorOptions` / `createPlateEditor` | hook now accepts `const TPlugins extends readonly unknown[]`, matching `withPlate.ts` | done |
| async `onReady` force render | 4 before patch; 0 after patch | restore main behavior | React hook | `Plate.slow.tsx` async value rows pass | done |
| `packages/core/src/react/editor/usePlateViewEditor.ts` | 2 adjacent drift | defer separate named packet | static editor hook | audit shows the same async pattern exists, but it still has a separate `(): any` return issue outside this target | review next if desired |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `usePlateEditor` | expose the same tuple plugin inference as `createPlateEditor`; compute hook return from `ReturnType<typeof createPlateEditor<V, TPlugins>>`; keep the conditional `enabled` boundary cast | `TPlateEditor`; `InferPlugins<P[]>`; `createPlateEditor as any`; old Slate import/docs wording | this keeps hook DX aligned with the factory and avoids local fake typing | low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none found | no workaround needed | N/A | focused tests and Core checks | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| removed weak factory cast and stale hook typing | `rg -n "createPlateEditor as any\|InferPlugins<P\\[\\]\|PlateEditor<V, InferPlugins\|TPlateEditor\|createSlateEditor\|withPlate\|options\\.enabled\|onReady\|forceRender\|isMountedRef\|UsePlateEditorResult" packages/core/src/react/editor/usePlateEditor.ts packages/core/src/react/editor/usePlateViewEditor.ts packages/core/src/react/components/Plate.slow.tsx --glob '!**/dist/**'` | expected refs only: target has `UsePlateEditorResult`, `forceRender`, `isMountedRef`, `onReady`; adjacent static hook has its own async pattern; tests mention async value | 1 file | `usePlateViewEditor.ts` separate static hook type cleanup | low for this target |

Core drift ledger:
- Applies: no, this is a named-file packet
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A for broad coverage; named target scored in review matrix
- Top drift rows: `usePlateEditor.ts` factory cast, lost async force-render,
  stale plugin-array typing

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/react/editor/usePlateEditor.ts` | 0 after patch | clean | Plate React editor hook | focused tests, typecheck, lint, audit passed | done |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| hook typing and async readiness cleanup | plate-next | `usePlateEditor` drifted away from main behavior and hid typing with `any` | target file plus `Plate.slow.tsx`, Core typecheck, Core lint | keep | next optional packet is `usePlateViewEditor.ts` |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no untracked/extracted file in scope | `git ls-files --others --exclude-standard packages/core/src/react/editor packages/core/type-tests` returned 0 rows | closed | no rows |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no non-Core failures | focused Core proof passed | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | target, scope, non-goals, proof, and stop condition captured; `origin/main` comparison performed | done |
| Implementation | complete | `usePlateEditor.ts` patched for async readiness and tuple plugin inference | done |
| Verification | complete | focused/full owner tests, Core typecheck, Core lint, source audit, and untracked inventory passed | done |
| Closeout | complete | review matrix, gap ledger, related sweep, changed list, and needs-attention row filled | run final `check-complete` |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/core/src/react/editor/usePlateEditor.ts` |
| tests/proof | no test files changed; ran direct existing behavior tests |
| docs/templates/skills | this autogoal plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `usePlateViewEditor.ts` adjacent static hook typing | it still has a separate `(): any` shape observed during the related sweep | `packages/core/src/react/editor/usePlateViewEditor.ts` | review as its own named packet if you want the same cleanup there |

Findings:
- `usePlateEditor.ts` had a real regression versus main: async `onReady`
  values no longer forced a render after readiness.
- The hook type shape was weaker than `createPlateEditor`: plugin configs were
  flattened through `P[]` and the factory call was cast through `any`.

Decisions and tradeoffs:
- Restored the main async readiness behavior.
- Replaced local hook typing with tuple plugin inference from
  `createPlateEditor`.
- Kept the final conditional return cast because TypeScript cannot infer the
  runtime `enabled === false` branch through the generic conditional return.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Ran Bun against `src/react/components/Plate.slow.tsx` without `./` path marker | 1 | rerun as `bun test ./src/react/components/Plate.slow.tsx` | resolved; focused and full file tests passed |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test ./src/react/components/Plate.slow.tsx --grep "async value|dependency"`: 3 pass, 0 fail.
- `pnpm --filter @platejs/core exec bun test ./src/react/components/Plate.slow.tsx`: 24 pass, 0 fail.
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/core lint`: pass.
- Source audit query for stale factory/type patterns returned no stale matches
  in `usePlateEditor.ts`.
- Untracked inventory for `packages/core/src/react/editor` and
  `packages/core/type-tests`: 0 rows.

Final handoff contract:
- target surface and mode: named-file `plate-next` cleanup for
  `usePlateEditor.ts`
- files/APIs reviewed: `usePlateEditor.ts`, `createPlateEditor` hook typing,
  async `onReady`, direct `Plate.slow.tsx` behavior tests, adjacent
  `usePlateViewEditor.ts` audit
- broad Core drift score coverage: N/A, not requested
- best Plate v2 recommendation: tuple plugin inference from
  `createPlateEditor`; no local factory `any`; restore async readiness
- verdict matrix summary: one target patched clean, one adjacent static hook
  deferred
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: one audit query, expected
  matches, one file patched, one adjacent static hook deferred
- changes made: `usePlateEditor.ts` plus this plan
- tests/proof commands: focused/full `Plate.slow.tsx`, Core typecheck, Core
  lint, source audit, untracked inventory
- old compatibility names audited: `TPlateEditor`, `createSlateEditor`,
  `createPlateEditor as any`, `InferPlugins<P[]>`
- needs attention: optional `usePlateViewEditor.ts` cleanup
- next best Plate Next packet: static view hook typing if you want to continue

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Named-file cleanup complete, plan checker next |
| Where am I going? | Close after `check-complete` passes |
| What is the goal? | Deep-review and repair `usePlateEditor.ts` drift |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-04T09:47:02.030Z Goal plan created.
- Compared `usePlateEditor.ts` with `origin/main` and found lost async
  readiness behavior plus weaker local typing.
- Patched `usePlateEditor.ts`.
- Ran focused behavior tests, full owner test file, Core typecheck, Core lint,
  source audit, and untracked inventory.

Open risks:
- `usePlateViewEditor.ts` still has adjacent static-hook type looseness, but it
  is outside this named target and did not block `usePlateEditor.ts`.
