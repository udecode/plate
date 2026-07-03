# core plugin returntype recovery

Objective:
Recover `CorePlugin = ReturnType<typeof getCorePlugins>[number]` without type
regression.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-30-core-plugin-returntype-recovery.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked whether `CorePlugin` can be recovered as
  `ReturnType<typeof getCorePlugins>[number]` in
  `packages/core/src/lib/plugins/getCorePlugins.ts`, using `plate-next`.
- mode: named file/API packet
- target surface: `packages/core/src/lib/plugins/getCorePlugins.ts`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: user asked for one named file/API, not a broad Core sweep.
- correction-triggered related Core sweep: yes, search same-class `CorePlugin`
  and `getCorePlugins` usages after the correction.
- completion threshold summary: `CorePlugin` uses the `ReturnType` shape,
  focused Core type/test proof passes, same-class sweep has no unresolved
  regression.

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A: no duration requested.
- semantics: N/A: no timed checkpoint.
- initial confidence score: N/A: binary type-shape and proof gate.
- improvement loop: N/A: not a timed loop.
- final score / loop closure: N/A: not a timed loop.

Completion threshold:
- `CorePlugin` is exported as `ReturnType<typeof getCorePlugins>[number]`.
- The implementation avoids a self-referential annotation or weaker cast that
  hides plugin inference loss.
- Focused source audit and Core proof pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-core-plugin-returntype-recovery.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: inspect `origin/main`, current source, and run
  focused Core proof after edit.
- package proof: `pnpm check:core` or scoped Core type/test proof if sufficient.
- source audits: `rg -n "CorePlugin\\b|getCorePlugins\\(" packages/core/src packages/core/type-tests --glob '!**/dist/**'`
- related Core sweep query / match count / patched count / deferred count:
  same audit above, filled after correction.
- Plite/Plate gap ledger: N/A unless source audit finds a blocked typing gap.
- broad Core drift ledger gate: N/A: named-file packet.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-core-plugin-returntype-recovery.md`

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
- allowed edit scope: `packages/core/src/lib/plugins/getCorePlugins.ts` plus
  this plan; do not broaden unless proof exposes a direct type owner.
- package/API surfaces: Core plugin typing only.
- docs/browser surfaces: N/A: no docs or browser UI touched.
- non-goals: full Core sweep, package migration, runtime API redesign,
  renames, compatibility cleanup unrelated to `CorePlugin`.
- out-of-scope package errors: ignored unless caused by this Core type change.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop if `ReturnType` recovery forces a materially weaker public Core plugin
  type or a broader API fork; route that to `plate-plan` instead of hiding it.

Current verdict:
- verdict: main-parity-cleanup
- confidence: high for this named type-shape packet
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: `origin/main` used the `ReturnType` shape, and focused Core type/test
  proof passes after recovering it without `as CorePlugin` or map-return `any`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirement copied: recover `CorePlugin = ReturnType<typeof getCorePlugins>[number]`; check regression. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md` fully. |
| Active goal checked or created | yes | `get_goal` returned none; created this goal. |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API packet. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Type-shape recovery only; no compat alias or rename pass. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep is out of scope. |
| Source of truth and allowed workspace recorded | yes | Current checkout plus `origin/main` file evidence; allowed edit scope recorded. |
| Output budget strategy recorded | yes | Targeted `sed`/`rg`, capped outputs. |
| Public API fork routing checked | yes | Not a public API fork unless `ReturnType` weakens exported Core plugin typing. |
| Gap policy checked | yes | No workaround allowed; route to `plate-plan` if blocked. |
| Related Core sweep policy checked | yes | Same-class `CorePlugin`/`getCorePlugins` audit required. |
| Review-mode rename freeze checked | yes | No renames in scope. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm --filter @platejs/core typecheck` pass; `pnpm --filter @platejs/core exec bun test` pass. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named file/API packet, not broad Core sweep. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Target row drift score `0` after main-parity cleanup and proof. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Recover `ReturnType` export; reject hand-written union and self-referential `CorePlugin[]`. |
| Plite/Plate gap ledger | no | Record blockers or N/A when no gap blocks the target | N/A: no Plite or Plate gap blocks this type recovery. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | `rg -n "CorePlugin\\b|getCorePlugins\\(" packages/core/src packages/core/type-tests --glob '!**/dist/**'` reviewed; no same-class unresolved drift. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm --filter @platejs/core typecheck` pass; `pnpm --filter @platejs/core exec bun test` pass. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | `pnpm check:core` fails only in Plite tests; out of scope for this Core type packet. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `rg -n "as CorePlugin|CorePlugin\\[\\]|return corePlugin as any|let corePlugins" packages/core/src/lib/plugins/getCorePlugins.ts` returned no matches. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename proposed. |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | `git ls-files --others --exclude-standard -- packages/core/src/lib/plugins/getCorePlugins.ts` returned no rows. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: micro type-shape cleanup with focused proof; no broad review needed. |
| Final lint/check | yes | Run scoped lint/check or record N/A | Core typecheck and tests pass; full `check:core` caveat recorded. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-core-plugin-returntype-recovery.md` | to run after this update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/getCorePlugins.ts` / `CorePlugin` | 0 | main-parity-cleanup | Core plugin bootstrap | `origin/main` used `ReturnType`; current proof passes. | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `CorePlugin` | `export type CorePlugin = ReturnType<typeof getCorePlugins>[number];` | hand-written plugin union; `let corePlugins: CorePlugin[]`; `as CorePlugin`; map-return `as any` | Mirrors main, avoids self-reference, keeps custom override return inference honest. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no local workaround needed | N/A | focused Core proof | no gap |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| `CorePlugin` recovered to `ReturnType` | `rg -n "CorePlugin\\b|getCorePlugins\\(" packages/core/src packages/core/type-tests --glob '!**/dist/**'` | 14 lines | 1 file | 0 | no same-class unresolved drift |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| named-file type recovery | complete | `CorePlugin` recovered to `ReturnType`; Core proof passed. | close goal |

Core drift ledger:
- Applies: N/A: named file/API packet only.
- Manifest command: N/A: broad Core sweep out of scope.
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
| N/A: broad Core sweep out of scope | 0 | N/A | N/A | User asked one file/API. | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| recover CorePlugin ReturnType | plate-next | hand-written union and array annotation drifted from main and hid type shape | `getCorePlugins.ts`; Core typecheck/tests | keep | no next action |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/lib/plugins/getCorePlugins.ts` | N/A: tracked file | exists on `origin/main` | keep current owner | untracked-file inventory empty for target file |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm check:core` | Plite tests fail on extra `set_selection` operations in commit-operation contracts | This packet edits only Core plugin typing; `@platejs/core` typecheck and 692 Core tests pass. | Plite runtime transaction lane |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Recovered `CorePlugin = ReturnType<typeof getCorePlugins>[number]`; changed `corePlugins` to `const`; returned mapped `resolvedCorePlugins`; removed `as CorePlugin` and map-return `as any`. |
| tests/proof | Core typecheck pass; 692 Core tests pass; source audits pass. |
| docs/templates/skills | Updated this autogoal plan only. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `pnpm check:core` Plite failures | Broader gate still fails outside this packet on transaction operation expectations. | Plite tests named in verification evidence. | Do not block this Core type recovery; route separately to Plite runtime transaction lane. |

Findings:
- `origin/main` used `export type CorePlugin = ReturnType<typeof getCorePlugins>[number];`.
- Current hand-written union was unnecessary once the local array stopped being
  annotated as `CorePlugin[]`.
- Reassigning `corePlugins = corePlugins.map(...)` forced the old `as any`;
  returning a separate `resolvedCorePlugins` lets TypeScript infer the override
  branch cleanly.

Decisions and tradeoffs:
- Keep main-parity `ReturnType` export.
- Reject explicit `CorePlugin` union and `as CorePlugin` because they can drift
  when core plugins change.
- Keep custom plugin override behavior as inferred return shape, matching main.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `git show origin/main:packages/core/src/lib/plugins/getCorePlugins.ts` -> main
  evidence uses `ReturnType`.
- `rg -n "CorePlugin\\b|getCorePlugins\\(" packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> 14 related lines reviewed.
- `rg -n "as CorePlugin|CorePlugin\\[\\]|return corePlugin as any|let corePlugins" packages/core/src/lib/plugins/getCorePlugins.ts` -> no matches.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core exec bun test` -> 692 pass, 0 fail.
- `pnpm check:core` -> Core typecheck/lint/tests pass, then Plite tests fail
  with 9 current transaction/commit-operation assertion failures; classified
  out of scope for this Core type packet.

Final handoff contract:
- target surface and mode: named file/API packet for `getCorePlugins.ts`.
- files/APIs reviewed: `CorePlugin`, `getCorePlugins`, same-class call sites.
- broad Core drift score coverage: N/A: not requested.
- best Plate v2 recommendation: keep `ReturnType` export and inferred resolved
  plugin list.
- verdict matrix summary: `getCorePlugins.ts` is `main-parity-cleanup`.
- Plite/Plate gaps or blockers: none for this packet.
- related Core sweep query/matches/patched/deferred: `CorePlugin`/`getCorePlugins`
  query, 14 lines, 1 file patched, 0 deferred.
- changes made: `CorePlugin` export and local mapped return cleanup.
- tests/proof commands: Core typecheck and Core tests pass; full `check:core`
  caveat recorded.
- old compatibility names audited: N/A; no compatibility name was cut.
- needs attention: broader Plite transaction failures if you want `check:core`
  fully green.
- next best Plate Next packet: none from this type recovery.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final proof complete |
| Where am I going? | Close this named-file goal |
| What is the goal? | Recover `CorePlugin` ReturnType without regression |
| What have I learned? | Main-parity shape works once the array is not self-annotated |
| What have I done? | Patched file, ran source audits, Core typecheck, Core tests |

Timeline:
- 2026-06-30T19:25:30.468Z Goal plan created.
- 2026-06-30T19:28Z Read `plate-next` and `autogoal`.
- 2026-06-30T19:31Z Compared current file with `origin/main`.
- 2026-06-30T19:34Z Recovered `CorePlugin` ReturnType and removed self-reference.
- 2026-06-30T19:38Z Removed map-return `as any` by returning `resolvedCorePlugins`.
- 2026-06-30T19:41Z Core typecheck and Core tests passed; `check:core` Plite caveat recorded.

Open risks:
- `pnpm check:core` is not fully green because unrelated Plite transaction
  tests fail on extra `set_selection` operations.
