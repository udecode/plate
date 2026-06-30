# override plugin element spec cleanup

Objective:
Move Plate plugin node-flag element spec installation under `OverridePlugin` and remove the duplicate special installer from `extendBaseEditor`.

Goal plan:
docs/plans/2026-06-27-override-plugin-element-spec-cleanup.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user approved the Plate Next repair direction after rejecting `installPlateElementSpecsExtension` in the huge editor file.
- mode: named Core cleanup packet / review-mode main-parity cleanup.
- target surface: `packages/core/src/lib/plugins/override/OverridePlugin.ts` and `packages/core/src/lib/editor/extendBaseEditor.ts`.
- broad Core sweep: no.
- completion threshold summary: keep `OverridePlugin` name/key/owner, move element specs under that owner, remove duplicate API wrapping and special installer, run focused Core proof and `pnpm check:core`.

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: none.
- semantics: N/A.
- initial confidence score: N/A.
- improvement loop: N/A.
- final score / loop closure: N/A.

Completion threshold:
- Done when `OverridePlugin` owns Plite element specs derived from Plate plugin `node` flags, `extendBaseEditor` only installs generic plugin extensions, stale `extendOverrideApi` wrapping is gone, focused tests pass, `pnpm check:core` passes, and exact source audits show no old special installer.
- Named file/API work may close from a scoped source map and focused proof.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-override-plugin-element-spec-cleanup.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test ./src/lib/editor/extendBaseEditor.spec.ts`
- package proof: `pnpm check:core`
- source audits: exact `rg` for `installPlateElementSpecsExtension`, `createPlateElementSpec`, and `extendOverrideApi`.
- broad Core drift ledger gate: N/A, named packet only.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-override-plugin-element-spec-cleanup.md`

Constraints:
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- Private bridges require owner, deletion gate, and proof.
- If a helper exists only because migration was hard, cut it.
- Do not use a narrow representative file to close a broad Core sweep.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.

Boundaries:
- allowed edit scope: Core override plugin, base editor installer, focused Core tests, this plan.
- package/API surfaces: Core internal plugin-extension installation only; no public rename.
- docs/browser surfaces: none.
- non-goals: no `OverridePlugin` rename, no broad Core sweep, no Plate v2 public API redesign.
- out-of-scope package errors: ignore non-Core package fallout unless `pnpm check:core` proves a Core API regression.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Block only if the plugin extension hook cannot see the resolved plugin list without creating a worse bridge; otherwise patch directly.

Current verdict:
- verdict: main-parity-cleanup
- confidence: 0.97 after focused proof and `check:core`
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: duplicate owner removed; `OverridePlugin` now owns the Plite-native schema extension.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | scoped target, non-goals, proof, and handoff requirements copied before implementation |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read before implementation |
| Active goal checked or created | yes | active goal created for this packet |
| Mode classified as named packet vs broad Core sweep | yes | named Core packet; broad sweep is out of scope |
| Broad Core drift ledger initialized when in scope | N/A | no broad Core sweep requested |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; Core override/editor files only |
| Output budget strategy recorded | yes | targeted reads, focused proof, concise handoff |
| Public API fork routing checked | yes | no public API fork; keep `OverridePlugin` owner/name |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
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
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | complete | prompt requirements copied before implementation |
| Implementation packet | complete | element specs moved under `OverridePlugin`; editor special installer removed |
| Focused proof | complete | focused Core test passed |
| Core gate | complete | `pnpm check:core` passed |
| Plan closeout | complete | evidence, changed list, and handoff filled |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | focused test and `check:core` passed |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | not broad Core sweep |
| Score gate | N/A | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | named packet only |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm check:core` passed |
| Non-Core package error triage | N/A | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no non-Core package failure |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | exact audits passed |
| Autoreview / review | N/A | Run review gate for non-trivial implementation diffs or record N/A | small scoped packet; `check:core` is the owning gate |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-override-plugin-element-spec-cleanup.md` | pending final run |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/override/OverridePlugin.ts` | 3 | main-parity-cleanup | OverridePlugin | `origin/main` owner remains correct; migrated code used stale read API wrapping instead of Plite schema specs | keep owner, install element specs through plugin `extensions` |
| `packages/core/src/lib/editor/extendBaseEditor.ts` special element-spec installer | 4 | hard-cut | generic editor installer | special `installPlateElementSpecsExtension` duplicated plugin-extension installation and hid behavior in huge file | removed; generic plugin-extension loop installs `OverridePlugin` extension |
| `packages/core/src/lib/editor/extendBaseEditor.spec.ts` node flag proof | 2 | keep-in-plate | Core tests | existing inline insertion proof lacked explicit read-side schema flags | added `editor.read.schema` assertions for inline/void/selectable/markableVoid |

Core drift ledger:
- Applies: no
- Manifest command: pending
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
| N/A | N/A | N/A | N/A | named packet, not broad Core sweep | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Override element specs | OverridePlugin | Plate plugin `node` flags should be Plite schema specs owned by `OverridePlugin`, not an editor-factory special case plus stale API wrapper | `OverridePlugin.ts`, `extendBaseEditor.ts`, `extendBaseEditor.spec.ts`; focused test, audits, `pnpm check:core` | keep | next broad Plate Next packet can continue other Core drift |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no out-of-scope package failure | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | moved Plite element spec installation into `OverridePlugin`; removed `extendBaseEditor` special installer and stale `extendOverrideApi` read wrapper |
| tests/proof | added read-side schema assertions for inline/void/selectable/markableVoid plugin node flags |
| docs/templates/skills | updated this autogoal plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | none for this packet | scoped cleanup is green | `OverridePlugin` / `extendBaseEditor` | keep |

Findings:
- `OverridePlugin` was the right owner; the drift was the migrated implementation, not the concept/name.
- `extendBaseEditor` had a one-off `installPlateElementSpecsExtension` that duplicated the generic plugin-extension pipeline.
- `extendOverrideApi` was stale after Plite schema support because it wrapped read APIs instead of registering schema behavior.

Decisions and tradeoffs:
- Keep `OverridePlugin` name/key for main parity.
- Keep the internal extension name `plate:element-specs:plite` to avoid needless identity churn.
- Do not run `pnpm brl`; no exports/barrels changed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test ./src/lib/editor/extendBaseEditor.spec.ts` passed: 25 tests, 0 failures.
- First `pnpm check:core` attempt failed only on formatter output for the new import.
- `pnpm check:core` passed after formatting: Core/Plite typecheck, Core type specs/contracts, Core/Plite lint, Core test batches, and Plite tests.
- `rg -n "installPlateElementSpecsExtension|extendOverrideApi" packages/core/src/lib/editor/extendBaseEditor.ts packages/core/src/lib/plugins/override/OverridePlugin.ts` returned no matches.
- `rg -n "extendOverrideApi|installPlateElementSpecsExtension" packages/core/src packages/core/type-tests` returned no matches.
- `rg -n "createPlateElementSpec|createPlateElementSpecsExtension|plate:element-specs:plite" packages/core/src/lib/editor/extendBaseEditor.ts packages/core/src/lib/plugins/override/OverridePlugin.ts` returned matches only in `OverridePlugin.ts`.

Final handoff contract:
- target surface and mode: named Core cleanup packet / review-mode main-parity cleanup.
- files/APIs reviewed: `OverridePlugin.ts`, `extendBaseEditor.ts`, `extendBaseEditor.spec.ts`.
- broad Core drift score coverage: N/A.
- verdict matrix summary: one main-parity cleanup, one hard-cut, one proof upgrade.
- changes made: `OverridePlugin` owns element specs; `extendBaseEditor` no longer owns special installer; tests assert schema flags.
- tests/proof commands: focused test and `pnpm check:core`.
- old compatibility names audited: `installPlateElementSpecsExtension` and `extendOverrideApi` removed from Core source/type-tests.
- needs attention: none for this packet.
- next best Plate Next packet: continue Core drift cleanup only if user asks; this packet is closed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final proof recorded |
| Where am I going? | Close named Plate Next packet |
| What is the goal? | Move Plate node flag schema ownership under `OverridePlugin` |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-06-27T20:09:53.932Z Goal plan created.
- 2026-06-27T20:10:00Z Checkpoint zero filled; named packet, no broad Core sweep.
- 2026-06-27T20:12:00Z Moved element specs to `OverridePlugin` and removed editor special installer.
- 2026-06-27T20:14:00Z Focused test passed.
- 2026-06-27T20:16:00Z `pnpm check:core` passed after formatting fix.

Open risks:
- None for this scoped packet.
