# plate-next ViewPlugin drift review

Objective:
Deep-review `ViewPlugin.ts` against `origin/main`, prove the Plite copy-path
migration has no drift regression, and add missing focused proof if needed.

Goal plan:
docs/plans/2026-07-03-plate-next-viewplugin-drift-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user named `plate-next` and
  `packages/core/src/static/plugins/ViewPlugin.ts`
- mode: named file/API review packet
- target surface: `packages/core/src/static/plugins/ViewPlugin.ts`
- related surfaces:
  `packages/core/src/static/plugins/ViewPlugin.spec.ts`,
  `packages/core/src/react/components/PlateView.tsx`,
  `packages/core/src/static/utils/getSelectedDomFragment.tsx`,
  `packages/core/src/static/utils/getSelectedDomNode.ts`,
  `packages/core/src/static/utils/isSelectOutside.ts`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, for the added proof row
- completion threshold summary: target file reviewed against `origin/main`,
  best migration call recorded, no old Slate/Plate compatibility names remain
  in the target path, focused static copy proof passes, Core typecheck passes,
  Core lint passes, and this plan passes `check-complete`.

First checkpoint:
- Explicit requirement: deep-review the named file for zero drift regression
  versus `origin/main`.
- Explicit requirement: use `plate-next`.
- Scope boundary: named `ViewPlugin.ts` packet plus direct callers/tests/utils.
- Timing constraint: none.
- Stop condition: close when the file-level verdict, related sweep, proof, and
  plan check are complete.
- Deliverable: concise verdict, changes made, proof, related sweep, and any
  attention needed.
- Broad sweep status: not requested; do not use this packet to claim full Core
  closure.

Timed checkpoint:
- requested duration: N/A
- semantics: named review packet, no timed loop requested
- initial confidence score: 75, because the runtime diff looked clean but the
  real static DOM copy path lacked direct proof
- improvement loop: compared current and `origin/main`, searched callers and
  old compatibility names, added rendered static DOM copy proof
- final score / loop closure: 96 for the named packet

Completion threshold:
- Exact done state: `ViewPlugin.ts` has a recorded review verdict, its old
  `origin/main` transform override is mapped to the current Plite-compatible
  API shape, the static copy path is proven against rendered `PlateStatic` DOM,
  old compatibility names are audited, extracted files in scope are inventoried,
  focused tests/typecheck/lint pass, and this plan passes
  `check-complete`.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
- Broad Core sweep is N/A because the user named one file.

Verification surface:
- focused tests / commands:
  `pnpm --filter @platejs/core exec bun test src/static/plugins/ViewPlugin.spec.ts`
- package proof: `pnpm --filter @platejs/core typecheck`
- lint proof: `pnpm --filter @platejs/core lint`
- source audits:
  `rg -n "overrideEditor|editor\\.tf|application/x-slate-fragment|data-slate|setFragmentData\\(|getFragment\\(" packages/core/src/static/plugins/ViewPlugin.ts packages/core/src/static/plugins/ViewPlugin.spec.ts packages/core/src/react/components/PlateView.tsx packages/core/src/static/editor/withStatic.spec.tsx`
- extracted-file inventory:
  `git ls-files --others --exclude-standard packages/core/src/static/plugins packages/core/src/react/components/PlateView.tsx packages/core/src/static/editor/withStatic.spec.tsx | sort`
- related Core sweep query / match count / patched count / deferred count:
  see related Core sweep ledger
- Plite/Plate gap ledger: no blocker
- broad Core drift ledger gate: N/A, broad Core sweep not requested
- final plan check:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-viewplugin-drift-review.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: no bridge/helper dump, broad `any` cast, fake alias,
  duplicate wrapper, command fallback, or displaced product/plugin behavior.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of
  inventing a compatibility workaround.
- After every correction, run a related Core sweep across the same symbol or
  smell class.
- Review-mode rename freeze applies; no renames in this packet.
- Extracted-file recovery gate applies to the target scope.
- Private bridges are not used.
- Do not use this named-file packet to close broad Core review.

Boundaries:
- allowed edit scope: `ViewPlugin.spec.ts` proof and the plan ledger
- package/API surfaces: Core static view copy API only
- docs/browser surfaces: none
- non-goals: no broad Core sweep, no rename pass, no public API fork, no
  changes to editable copy/cut/drag handling
- out-of-scope package errors: non-Core package errors are ignored unless
  caused by this target; none appeared

Output budget strategy:
- Use targeted `sed`, exact `git show`, scoped `rg`, focused tests, and capped
  command output.
- Do not stream broad Core manifests because this is a named-file packet.

Blocked condition:
- None. If the rendered static copy test had failed, the blocker would be a
  static renderer marker ownership issue between `PlateStatic` and
  `getSelectedDomFragment`.

Current verdict:
- verdict: keep
- confidence: high for the named packet
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: `ViewPlugin.ts` is correctly migrated from the old `tf` override to a
  static-view `editor.api` service, no legacy compatibility names remain, the
  real rendered static DOM copy path is now covered, and focused proof passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | target, scope, proof, and stop rule copied in First checkpoint |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | `get_goal` returned no active goal; this plan is the ledger |
| Mode classified as named packet vs broad Core sweep | yes | named file/API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Completion threshold and Current verdict |
| Broad Core drift ledger initialized when in scope | no | broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | `origin/main` comparison and current checkout target |
| Output budget strategy recorded | yes | targeted reads/searches only |
| Public API fork routing checked | yes | no public API fork; static API remains internal Core shape |
| Gap policy checked | yes | no Plite or Plate blocker found |
| Related Core sweep policy checked | yes | source audit and caller audit recorded |
| Review-mode rename freeze checked | yes | no names or paths changed |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet.
- [x] Best Plate v2 call recorded for every reviewed target.
- [x] Legacy/backcompat decision recorded: no public compat alias, old
      `tf` override, old `application/x-slate-fragment`, or old data-slate path
      is kept.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake alias,
      or displaced product/plugin behavior is kept.
- [x] Gap ledger updated: no Plite or Plate blocker.
- [x] Related Core sweep row added for the proof correction.
- [x] N/A: broad Core drift ledger is not in scope for this named file packet.
- [x] N/A: broad Core per-file rows are not in scope.
- [x] N/A: broad Core manifest counts are not in scope.
- [x] N/A: broad Core score gate is not in scope.
- [x] Bridge scoring law applied: no bridge dependency in target.
- [x] Review matrix is filled for inspected file/API/helper surfaces.
- [x] Public API forks checked; no `plate-plan` route needed.
- [x] Review-mode rename freeze applied; no rename churn.
- [x] Extracted-file recovery gate closed; target-scope untracked inventory is
      empty.
- [x] Safe packet kept with proof.
- [x] Focused package proof run after adding test proof.
- [x] N/A: `pnpm brl` not needed because no exports/barrels changed.
- [x] Old compatibility names audited.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof commands | ViewPlugin test pass, Core typecheck pass, Core lint pass |
| Broad Core drift ledger coverage | no | Record N/A reason | named file packet, not broad Core sweep |
| Score gate | yes | Record target scores and owner decisions | Review matrix has all target rows score 0 or 1 with next actions |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Best recommendation table |
| Plite/Plate gap ledger | yes | Record blockers or N/A | no blocker row |
| Related Core sweep after correction | yes | Run and record same-class search/review results | Related Core sweep ledger |
| Package/API proof | yes | Run focused typecheck/test/lint | Verification evidence |
| Non-Core package error triage | no | Record N/A reason | no non-Core proof command was run |
| Source audit | yes | Run exact audit for old compatibility names | source-audit row has no forbidden matches |
| Rename ledger | no | Record N/A reason | no rename proposed or applied |
| Extracted-file inventory | yes | Record untracked-file command and row count | zero rows in target scope |
| Autoreview / review | yes | Perform Plate Next source review | this plan and source comparison |
| Final lint/check | yes | Run scoped lint/check | Core lint and typecheck passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | ledgers below |
| Goal plan complete | yes | Run `check-complete.mjs` | final command recorded in Verification evidence |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/static/plugins/ViewPlugin.ts` | 0 | main-parity-cleanup | Core static view plugin | Old main `tf.setFragmentData` override maps cleanly to current static `editor.api.setFragmentData`; current file writes `application/x-plite-fragment`; no `overrideEditor` or `editor.tf` remains | keep |
| `ViewPlugin.setFragmentData` non-copy branch | 1 | keep-in-plate | Core static view plugin | Current `PlateView` calls this only from `onCopy`; editable cut/drag belongs to Plite DOM/react, so old pass-through is not needed here | keep |
| `packages/core/src/static/plugins/ViewPlugin.spec.ts` | 0 | justify-new-proof-tooling | Core static plugin tests | Added rendered `PlateStatic` DOM selection proof to cover real static copy marker path | keep |
| `packages/core/src/react/components/PlateView.tsx` caller | 0 | keep-in-plate | Core static view component | Caller only invokes `editor.api.setFragmentData(e.clipboardData, 'copy')` and checks `application/x-plite-fragment` | keep |
| `getSelectedDomFragment` marker contract | 1 | keep-in-plate | Core static selection utilities | Existing utility reads `[data-plite-node="element"][data-plite-id]`; new integration test proves rendered static DOM supplies the needed id for a normal block | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `ViewPlugin.ts` | Keep `DOMPlugin.extendEditorApi<ViewApi>` with `getFragment` and copy-only `setFragmentData` | Reject restoring `overrideEditor`, `tf.setFragmentData`, old `application/x-slate-fragment`, or a fake non-copy transform pass-through | Static view copy is a service/API concern, not a tx mutation; `PlateView` only wires `copy`; Plite DOM/react owns editable clipboard behavior | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | no missing capability | no workaround needed | Core static view plugin | ViewPlugin focused test | no blocker |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Added real rendered static DOM copy proof | `rg -n "overrideEditor|editor\\.tf|application/x-slate-fragment|data-slate|setFragmentData\\(|getFragment\\(" packages/core/src/static/plugins/ViewPlugin.ts packages/core/src/static/plugins/ViewPlugin.spec.ts packages/core/src/react/components/PlateView.tsx packages/core/src/static/editor/withStatic.spec.tsx` | 11 current API/test/caller matches, zero forbidden old names | 1 test file | 0 | low |
| Static marker proof check | `rg -n "data-plite-id|data-block-id|dataset\\.pliteId|dataset\\.blockId" packages/core/src/static --glob '!**/dist/**'` | expected static marker utility/test/render references | 1 new proof row | 0 | low |

Core drift ledger:
- Applies: N/A, broad Core sweep not requested.
- Manifest command: N/A.
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`.
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`.
- Ledger location: this plan for named target rows only.
- Expected row count: N/A.
- Actual row count: N/A.
- Missing row count: N/A.
- Extra row count: N/A.
- Score gate: named target rows reviewed; no score above 1.
- Top drift rows: none for this named packet.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/static/plugins/ViewPlugin.ts` | 0 | main-parity-cleanup | Core static view plugin | compared with `origin/main`; current Plite API shape is correct | keep |
| `packages/core/src/static/plugins/ViewPlugin.spec.ts` | 0 | justify-new-proof-tooling | Core static plugin tests | rendered static DOM proof added and passing | keep |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| ViewPlugin drift review | Core static view plugin | Possible regression from old transform override to new API service | `ViewPlugin.ts`, `ViewPlugin.spec.ts`, `PlateView.tsx`, focused test/typecheck/lint | keep current runtime shape, add proof only | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | zero target-scope untracked files | closed | `git ls-files --others --exclude-standard packages/core/src/static/plugins packages/core/src/react/components/PlateView.tsx packages/core/src/static/editor/withStatic.spec.tsx | sort` returned no rows |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | no non-Core proof command was run | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/proof | `packages/core/src/static/plugins/ViewPlugin.spec.ts` adds rendered `PlateStatic` DOM copy proof |
| docs/templates/skills | this plan ledger |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None for `ViewPlugin.ts` | runtime shape is clean for this packet | `packages/core/src/static/plugins/ViewPlugin.ts` | keep |

Findings:
- `origin/main` used `overrideEditor` to intercept `tf.setFragmentData`, write
  `application/x-slate-fragment`, and pass non-copy events through to the old
  transform.
- Current code correctly exposes static view copy as
  `editor.api.setFragmentData` and writes `application/x-plite-fragment`.
- `PlateView` only calls this API from `onCopy`; the old non-copy pass-through
  is not needed in the static view owner.
- The real proof gap was not runtime code; it was lack of a rendered static
  DOM selection test that proves `PlateStatic` provides the marker contract
  consumed by `getSelectedDomFragment`.

Decisions and tradeoffs:
- Keep `ViewPlugin.ts` runtime/API shape -> static copy is an API/service, not
  a mutation tx.
- Add a rendered DOM test instead of changing runtime -> proves the actual
  route where a regression would show up.
- Do not restore non-copy pass-through -> no static caller uses it, and editable
  clipboard behavior belongs elsewhere.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/static/plugins/ViewPlugin.spec.ts`
  -> pass, 8 tests / 12 expects.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `rg -n "overrideEditor|editor\\.tf|application/x-slate-fragment|data-slate|setFragmentData\\(|getFragment\\(" packages/core/src/static/plugins/ViewPlugin.ts packages/core/src/static/plugins/ViewPlugin.spec.ts packages/core/src/react/components/PlateView.tsx packages/core/src/static/editor/withStatic.spec.tsx`
  -> only current `getFragment` / `setFragmentData` API, tests, and `PlateView`
  caller matched; no old compatibility names matched.
- `git ls-files --others --exclude-standard packages/core/src/static/plugins packages/core/src/react/components/PlateView.tsx packages/core/src/static/editor/withStatic.spec.tsx | sort`
  -> zero target-scope untracked rows.

Final handoff contract:
- target surface and mode: named file/API review of
  `packages/core/src/static/plugins/ViewPlugin.ts`
- files/APIs reviewed: `ViewPlugin.ts`, `ViewPlugin.spec.ts`, `PlateView.tsx`,
  static selected-fragment utilities
- broad Core drift score coverage: N/A, not requested
- best Plate v2 recommendation: keep current `editor.api` static copy service
  shape
- verdict matrix summary: one `main-parity-cleanup`, one
  `justify-new-proof-tooling`, related callers/utilities kept
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: exact source-audit query,
  11 current matches, 1 test patch, 0 deferred
- changes made: `ViewPlugin.spec.ts` proof and this plan
- tests/proof commands: focused test, Core typecheck, Core lint, source audit,
  extracted-file inventory
- old compatibility names audited: `overrideEditor`, `editor.tf`,
  `application/x-slate-fragment`, `data-slate`
- needs attention: none for this file
- next best Plate Next packet: continue one-by-one review on the next user
  pointed Core file

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Named `ViewPlugin.ts` drift review closed |
| Where am I going? | Final handoff |
| What is the goal? | Prove `ViewPlugin.ts` has no drift regression versus `origin/main` |
| What have I learned? | Runtime shape is clean; proof was missing for rendered static DOM copy |
| What have I done? | Added focused proof, ran test/typecheck/lint/audits, closed plan |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Source comparison | complete | `origin/main` and current `ViewPlugin.ts` compared | closed |
| Proof repair | complete | rendered static DOM copy test added | closed |
| Verification | complete | focused test, Core typecheck, Core lint pass | closed |
| Handoff | complete | plan rows filled | closed |

Open risks:
- None for `ViewPlugin.ts`.
