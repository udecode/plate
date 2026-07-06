# pipe on change editor type cleanup

Objective:
Clean `pipeOnChange` editor type; done when `PlateEditor<V, any>` is gone and
Core proof passes.

Goal plan:
docs/plans/2026-07-04-pipe-on-change-editor-type-cleanup.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said they do not like
  `PlateEditor<V, any>` in `packages/core/src/react/utils/pipeOnChange.ts`
- mode: named file/API type cleanup packet
- target surface: `packages/core/src/react/utils/pipeOnChange.ts`, direct spec,
  and same-class `PlateEditor<..., any>` React/Core utility refs
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: exact named type smell, not `all core`
- correction-triggered related Core sweep: required for `PlateEditor<..., any>`
  and local plugin-typing hacks in React utilities
- completion threshold summary: no `PlateEditor<V, any>` in `pipeOnChange.ts`,
  no stale exact matches, focused `pipeOnChange` test passes, Core
  typecheck/lint pass, plan complete

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
- `pipeOnChange` keeps value inference without spelling `PlateEditor<V, any>`.
- The replacement does not weaken handler/plugin context typing more than the
  current public boundary requires.
- Related source audit for exact old type smell passes.
- Focused `pipeOnChange` test, Core typecheck, and Core lint pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-pipe-on-change-editor-type-cleanup.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands:
  `pnpm --filter @platejs/core exec bun test ./src/react/utils/pipeOnChange.spec.ts`
- package proof: `pnpm --filter @platejs/core typecheck`;
  `pnpm --filter @platejs/core lint`
- source audits:
  `rg -n "PlateEditor<[^>]*any|PlateEditor<V, any>|pipeOnChange" packages/core/src/react/utils packages/core/src/react/plugin packages/core/type-tests --glob '!**/dist/**'`
- related Core sweep query / match count / patched count / deferred count:
  run before and after patch
- Plite/Plate gap ledger: no gap expected; type should be owned locally by the
  pipe helper signature
- broad Core drift ledger gate: N/A: named packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-pipe-on-change-editor-type-cleanup.md`

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
- allowed edit scope: `pipeOnChange.ts`, its spec only if needed, and direct
  owner type imports if the clean type requires them
- package/API surfaces: React utility helper signature only
- docs/browser surfaces: N/A
- non-goals: no broad Core sweep, no runtime behavior change, no rename pass,
  no docs/API redesign
- out-of-scope package errors: ignore non-Core package failures unless caused
  by this Core type change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop if removing `PlateEditor<V, any>` requires changing the public
  `PlateEditor` generic contract again instead of a local helper signature.

Current verdict:
- verdict: keep patched cleanup
- confidence: high after focused test, Core typecheck, Core lint, and exact
  source audit
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: exact local `any` exists in `pipeOnChange.ts`; likely a leftover type
  shortcut, not a real API requirement

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | target, non-goals, stop condition, proof, and related sweep recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | no active goal; new goal created |
| Mode classified as named packet vs broad Core sweep | yes | named one-file type cleanup |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | remove local `any`, no compat alias |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core sweep |
| Source of truth and allowed workspace recorded | yes | current checkout and `origin/main` comparison for `pipeOnChange.ts` |
| Output budget strategy recorded | yes | targeted reads and capped `rg` only |
| Public API fork routing checked | yes | no public API fork expected |
| Gap policy checked | yes | stop if PlateEditor generic contract needs redesign |
| Related Core sweep policy checked | yes | audit same-class `PlateEditor<..., any>` patterns |
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
| Named verification threshold | yes | Run the proof commands named in this plan | focused spec, Core typecheck, Core lint, and source audit passed |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named file packet |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | target score fixed to 0 |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | recorded below |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | no gap |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | audit recorded below |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm --filter @platejs/core typecheck` passed |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no non-Core failures |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | no exact `PlateEditor<V, any>` / `PlateEditor<..., any>` matches in audited scope |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no rename attempted |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | `git ls-files --others --exclude-standard packages/core/src/react/utils packages/core/type-tests` returned 0 rows |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: single helper signature cleanup with focused proof |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/core lint` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | recorded below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-pipe-on-change-editor-type-cleanup.md` | to run after final plan fill |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/react/utils/pipeOnChange.ts` | 4 before patch, 0 after patch | main-parity-cleanup | React change-handler pipe helper | signature now uses `E extends PlateEditor` and `ValueOf<E>`; focused spec and Core proof passed | done |
| `PlateEditor<V, any>` helper signature | 4 before patch, 0 after patch | hard-cut local type hack | helper signature | exact audit has 0 matches in React utils/plugin/store/type-tests scope | done |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `pipeOnChange` | `pipeOnChange<E extends PlateEditor>(editor: E, value: ValueOf<E>)` | `PlateEditor<V, any>`; standalone `<V extends Value>` plus erased plugin generic | value is editor-derived state, so the editor should be the generic owner; this matches `PlateStore` value callback typing | low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | `ValueOf<E>` already exists and is used by Plate store callbacks | N/A | focused spec/typecheck | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| removed `PlateEditor<V, any>` from `pipeOnChange` | `rg -n "PlateEditor<V, any>\|PlateEditor<[^>]*any" packages/core/src/react/utils packages/core/src/react/plugin packages/core/src/react/stores packages/core/type-tests --glob '!**/dist/**'` | 0 after patch | 1 file | none | low |
| confirmed matching editor-derived value pattern | inspected `PlateStore.ts` `onChange` / `onValueChange` callbacks using `ValueOf<E>` | expected owner pattern | 1 file | none | low |

Core drift ledger:
- Applies: no, named file/API packet
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A for broad Core; named target scored above
- Top drift rows: `pipeOnChange.ts` local erased plugin generic

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/react/utils/pipeOnChange.ts` | 0 | clean | React utility | focused spec/typecheck/lint/source audit passed | done |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| pipeOnChange editor-derived value type | plate-next | local `PlateEditor<V, any>` was migration typing sludge | `pipeOnChange.ts`; focused spec; Core typecheck/lint/audit | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no untracked/extracted file in scope | untracked inventory returned 0 rows | closed | no rows |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no non-Core failures | focused Core commands passed | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | target, `origin/main` comparison, handler types, and `ValueOf<E>` owner read | done |
| Implementation | complete | `pipeOnChange` signature changed to `E extends PlateEditor` + `ValueOf<E>` | done |
| Verification | complete | focused spec, Core typecheck, Core lint, source audit, and untracked inventory passed | done |
| Closeout | complete | review matrix, related sweep, changed list, and risk rows filled | run final `check-complete` |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/core/src/react/utils/pipeOnChange.ts` |
| tests/proof | no tests changed; existing focused spec used |
| docs/templates/skills | this plan only |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `getEditorPlugin` still has internal `any` defaults/casts | out of this target but visible during the source read | `packages/core/src/react/plugin/getEditorPlugin.ts` | separate packet if you want to tighten plugin context internals |

Findings:
- `pipeOnChange` only needed the editor value type. The plugin generic was
  erased solely to satisfy the helper signature.
- `ValueOf<E>` already exists in Plite and is used by `PlateStore` callbacks,
  so it is the correct owner pattern here.

Decisions and tradeoffs:
- Use the editor as the generic owner: `E extends PlateEditor`.
- Derive `value` from that editor: `ValueOf<E>`.
- Do not touch `getEditorPlugin` in this packet; it has separate internal type
  debt, but this target no longer leaks `any`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test ./src/react/utils/pipeOnChange.spec.ts`: 2 pass, 0 fail.
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/core lint`: pass.
- `rg -n "PlateEditor<V, any>|PlateEditor<[^>]*any" packages/core/src/react/utils packages/core/src/react/plugin packages/core/src/react/stores packages/core/type-tests --glob '!**/dist/**'`: 0 matches.
- `git ls-files --others --exclude-standard packages/core/src/react/utils packages/core/type-tests`: 0 rows.

Final handoff contract:
- target surface and mode: named type cleanup for `pipeOnChange`
- files/APIs reviewed: `pipeOnChange.ts`, direct spec, `PlatePlugin` onChange
  type, `ValueOf<E>` source, `PlateStore` value callback pattern
- broad Core drift score coverage: N/A
- best Plate v2 recommendation: editor-derived value typing via `ValueOf<E>`
- verdict matrix summary: one file cleaned; no gap
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: exact old type audit, 0
  stale matches, 1 file patched, 0 deferred
- changes made: `pipeOnChange.ts` and this plan
- tests/proof commands: focused spec, Core typecheck, Core lint, source audit,
  untracked inventory
- old compatibility names audited: `PlateEditor<V, any>` and
  `PlateEditor<..., any>`
- needs attention: optional separate `getEditorPlugin` internal typing cleanup
- next best Plate Next packet: `getEditorPlugin` if you want to remove internal
  casts next

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Implementation and proof complete |
| Where am I going? | Final plan check and goal close |
| What is the goal? | Clean `pipeOnChange` editor type |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-04T10:07:54.387Z Goal plan created.
- Read `pipeOnChange.ts`, `origin/main` version, handler types, `ValueOf<E>`,
  and Plate store callback usage.
- Patched `pipeOnChange` to use `E extends PlateEditor` and `ValueOf<E>`.
- Ran focused spec, Core typecheck, Core lint, source audit, and untracked
  inventory.

Open risks:
- Low: `getEditorPlugin` still contains internal `any` defaults/casts, but this
  packet removed the public helper leak and did not need that broader cleanup.
