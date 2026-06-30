# plate-next state dom mirror ownership

Objective:
Close Plate state/dom mirror ownership; done when Core reuses Plite-owned substrate state types and check:core passes.

Goal plan:
docs/plans/2026-06-29-plate-next-state-dom-mirror-ownership.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user challenged `PlateStateMirrors` / `PlateDomState` in
  `packages/core/src/lib/editor/SlateEditor.ts`
- mode: named API/type ownership packet
- target surface: Core `BaseEditor` state mirrors, Plite editor substrate
  types, and DOM runtime state ownership
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; this is a named ownership correction
- correction-triggered related Core sweep: yes; search same mirror/dom-state
  names and direct local duplicates after patch
- completion threshold summary: Core no longer declares local
  `PlateStateMirrors` / `PlateDomState` for generic editor state, Plite owns
  the reusable state/dom mirror types, focused proof passes, and `pnpm
  check:core` passes

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A: named API ownership packet
- improvement loop: N/A: no timed checkpoint requested
- final score / loop closure: N/A: no timed checkpoint requested

Completion threshold:
- `PlateStateMirrors` and `PlateDomState` are removed from Core.
- Plite exports the reusable generic editor state/dom mirror type surface.
- Core keeps only real Plate-owned identity/plugin state in its local editor
  type composition.
- Source audits find no leftover local mirror type names.
- Focused tests covering Core editor creation / DOM plugin pass.
- `pnpm check:core` passes.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-plate-next-state-dom-mirror-ownership.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Core editor and DOM plugin tests after patch
- package proof: `pnpm check:core`
- source audits: `rg -n "PlateStateMirrors|PlateDomState" packages/core/src packages/plite/src --glob '!**/dist/**'`
- related Core sweep query / match count / patched count / deferred count:
  search local mirror/dom-state type definitions and `editor.dom` ownership
  uses after patch
- Plite/Plate gap ledger: no blocker expected; if moving runtime installer is
  too broad, record as next owner instead of hiding it
- broad Core drift ledger gate: N/A: named packet, not broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-plate-next-state-dom-mirror-ownership.md`

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
- allowed edit scope: `packages/plite/src/interfaces/editor.ts`,
  `packages/plite/src/index.ts`, `packages/core/src/lib/editor/SlateEditor.ts`,
  and focused tests only if typing requires it
- package/API surfaces: Plite exported type surface and Core `BaseEditor` type
  composition
- docs/browser surfaces: N/A: no docs/browser behavior change
- non-goals: do not rename public APIs, do not start broad Core sweep, do not
  move unrelated plugin runtime behavior
- out-of-scope package errors: ignore non-Core package failures unless caused by
  this Core/Plite type change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop if clean ownership requires a larger runtime API design fork instead of
  a type ownership cleanup; route that to `plite-plan` / `plate-plan`.

Current verdict:
- verdict: move-to-plite for generic mirror type surface; keep-in-plate for
  `id` and plugin runtime/meta
- confidence: initial 80; expected to reach 100 after source audit and
  `check:core`
- next owner: plate-next
- keep / revert / quarantine call: pending
- reason: pending

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User wants Plite to own generic state/dom when worth it; Core should not locally duplicate substrate state; no broad sweep requested |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md` |
| Active goal checked or created | yes | Created active goal for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named API/type ownership packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Target is Plite-owned substrate types, Core keeps only product state |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | Current checkout `/Users/zbeyens/git/plate-2`; allowed files listed in Boundaries |
| Output budget strategy recorded | yes | Targeted reads/searches only |
| Public API fork routing checked | yes | Type export only; no public API naming fork beyond Plite-owned type names |
| Gap policy checked | yes | If runtime installer move is too broad, record next owner instead of bridge |
| Related Core sweep policy checked | yes | Sweep mirror/dom-state names after patch |
| Review-mode rename freeze checked | yes | No rename pass; only new Plite type names if needed |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: Start Gates and Boundaries above.
- [ ] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [ ] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [ ] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [ ] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [ ] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [ ] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
- [ ] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [ ] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [ ] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [ ] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [ ] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [ ] Review matrix is filled for every inspected file/API/helper.
- [ ] Public API forks are routed to `plate-plan` before implementation.
- [ ] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [ ] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [ ] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [ ] Focused package proof is run after meaningful code changes.
- [ ] `pnpm brl` is run when exports/barrels change.
- [ ] Old compatibility names are source-audited when cut.
- [ ] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [ ] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the proof commands named in this plan | pending |
| Broad Core drift ledger coverage | pending | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | pending |
| Score gate | pending | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | pending |
| Best Plate v2 recommendation | pending | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | pending |
| Plite/Plate gap ledger | pending | Record blockers or N/A when no gap blocks the target | pending |
| Related Core sweep after correction | pending | For each correction, run and record same-class Core search/review results | pending |
| Package/API proof | pending | Run focused typecheck/test/build or record N/A | pending |
| Non-Core package error triage | pending | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | pending |
| Source audit | pending | Run exact audit for removed compatibility names or record N/A | pending |
| Rename ledger | pending | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | pending |
| Extracted-file inventory | pending | Record untracked/extracted file command, row count, and bucket for every file in scope | pending |
| Autoreview / review | pending | Run review gate for non-trivial implementation diffs or record N/A | pending |
| Final lint/check | pending | Run scoped lint/check or record N/A | pending |
| Changed list / top drift / needs attention | pending | Fill handoff ledgers | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-plate-next-state-dom-mirror-ownership.md` | pending |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| pending | pending | pending | pending | pending | pending |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| pending | pending | pending | pending | pending |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| pending | pending | pending | pending | pending | pending |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| pending | pending | pending | pending | pending | pending |

Core drift ledger:
- Applies: pending
- Manifest command: pending
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: pending
- Actual row count: pending
- Missing row count: pending
- Extra row count: pending
- Score gate: pending
- Top drift rows: pending

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| pending | pending | pending | pending | pending | pending |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| pending | pending | pending | pending | pending | pending |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| pending | pending | pending | pending | pending |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| pending | pending | pending | pending |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | pending |
| tests/proof | pending |
| docs/templates/skills | pending |
| reverted/quarantined packets | pending |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| pending | pending | pending | pending | pending |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- target surface and mode: pending
- files/APIs reviewed: pending
- broad Core drift score coverage: pending
- best Plate v2 recommendation: pending
- verdict matrix summary: pending
- Plite/Plate gaps or blockers: pending
- related Core sweep query/matches/patched/deferred: pending
- changes made: pending
- tests/proof commands: pending
- old compatibility names audited: pending
- needs attention: pending
- next best Plate Next packet: pending

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Drift-scored Plate Next closure |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-06-29T14:30:09.207Z Goal plan created.

Open risks:
- Pending.
