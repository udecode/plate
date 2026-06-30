# plate-next strict bridge rescore

Objective:
Rescore the scoped Plate Next Core/Plite diff under the hard rule that logic
moved into `currentRuntimeBridge` is forbidden and cannot score 100.

Goal plan:
docs/plans/2026-06-28-plate-next-strict-bridge-rescore.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user corrected the previous 100/100 score as invalid:
  `currentRuntimeBridge` is a dirty hack, moving logic there is forbidden, and
  files like `InputRulesPlugin` must score badly when their runtime logic lives
  in the bridge.
- mode: broad Core/Plite strict rescore, no runtime patch in this goal.
- target surface: tracked and untracked diff under `packages/core/src/**`,
  `packages/core/type-tests/**`, Core package config, and `packages/plite/src/**`.
- broad Core sweep: yes, score every scoped file in a linked artifact.
- completion threshold summary: strict score ledger regenerated; every scoped
  file has a row; bridge-displaced logic cannot score 100; top bad scores are
  called out in the plan.

First checkpoint:
- Explicit requirements copied:
  - use `autogoal`;
  - recompute each file score;
  - follow `plate-next` scoring;
  - do not let `check:core` or previous artifacts imply 100;
  - `currentRuntimeBridge` is forbidden migration sludge, not an acceptable
    private bridge for 100/100 scoring;
  - moving plugin/product logic into something like `currentRuntimeBridge` is
    forbidden;
  - `InputRulesPlugin` is explicitly bad when it is almost empty and its runtime
    logic lives in the bridge;
  - produce a durable per-file checklist/ledger.

Timed checkpoint:
- requested duration: N/A.
- semantics: one-shot strict score correction.
- initial confidence score: previous closed ledger was invalid because it
  allowed bridge-displaced logic to score 100.
- improvement loop: recompute all rows with strict bridge caps.
- final score / loop closure: 206 rows scored, 206 below 100, max score 90.

Completion threshold:
- Exact done state: strict artifact ledger exists and supersedes the previous
  false 100/100 ledger for this scope.
- Named file/API work may close from a scoped source map and focused proof.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-strict-bridge-rescore.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: N/A, no runtime code patch in this goal.
- package proof: N/A, this is scoring correction only.
- source audits: exact audits for `currentRuntimeBridge`, bridge consumers, and
  `editor.tf` / legacy transform dependency signals.
- broad Core drift ledger gate:
  `docs/plans/artifacts/2026-06-28-plate-next-strict-bridge-rescore/strict-core-score-ledger.tsv`
  and
  `docs/plans/artifacts/2026-06-28-plate-next-strict-bridge-rescore/strict-core-score-checklist.md`.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-strict-bridge-rescore.md`

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
- allowed edit scope: docs plan and scoring artifacts only.
- package/API surfaces: Core/Plite scoring only.
- docs/browser surfaces: N/A.
- non-goals: no runtime fix in this goal, no package sweep, no commit.
- out-of-scope package errors: N/A; no proof command that touches non-Core packages.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Block only if scoped files cannot be enumerated or scoring artifacts cannot be
  written. No blocker remains.

Current verdict:
- verdict: previous `100/100` closure was wrong and is superseded.
- confidence: 206/206 files below 100 under the strict rule; max score 90,
  min score 0.
- next owner: plate-next
- keep / revert / quarantine call: keep strict scoring artifact; do not trust
  the prior all-100 artifact.
- reason: `currentRuntimeBridge` centralizes displaced plugin/product logic and
  must cap dependent rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint above |
| `plate-next` skill/rule read | yes | user supplied skill body and local skill was read earlier in this thread |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created strict rescore goal |
| Mode classified as named packet vs broad Core sweep | yes | broad strict score correction |
| Broad Core drift ledger initialized when in scope | yes | strict ledger/checklist artifacts generated |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; scoped Core/Plite diff |
| Output budget strategy recorded | yes | use artifact files, not chat dump |
| Public API fork routing checked | yes | no public API fork implemented; runtime repair deferred to follow-up |

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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | strict ledger/checklist/summary generated |
| Broad Core drift ledger coverage | yes | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | 206 expected, 206 actual, 0 missing, 0 extra |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 206 below 100; bridge-displaced rows are low score with owner/next |
| Package/API proof | no | Run focused typecheck/test/build or record N/A | N/A: no code patch, scoring correction only |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: no package proof command run |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | bridge and legacy transform audit recorded in artifacts |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: no runtime implementation diff added |
| Final lint/check | no | Run scoped lint/check or record N/A | N/A: scoring artifacts only |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-strict-bridge-rescore.md` | pending final mechanical check |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | prompt requirements copied | none |
| Strict scoring rule | complete | bridge-displaced logic cannot score 100; bridge file score 0 | none |
| Manifest enumeration | complete | 162 tracked diff rows + 44 untracked rows, 206 unique files | none |
| Artifact generation | complete | strict ledger/checklist/summary generated | none |
| Plan completion audit | complete | run `check-complete.mjs` after this row is recorded | none |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/internal/currentRuntimeBridge.ts` | 0/100 | forbidden-bridge-hack | core-to-plugin-migration | displaced command/input-rule/node-id/affinity/onChange logic | cut by moving jobs to real owners |
| `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts` | 5/100 | empty-owner-logic-displaced | InputRulesPlugin | owner is empty while runtime is in bridge | move runtime execution into plugin |
| `packages/core/src/lib/editor/extendBaseEditor.ts` | 15/100 | bridge-installer | core | installs bridge by default | remove install calls after owner moves |
| `packages/core/src/react/plugins/PliteReactExtensionPlugin.ts` | 25/100 | bridge-command-consumer | core-react | keydown pulls commands from bridge | move to typed plugin tx/extension handlers |
| all 206 scoped files | 0-90/100 | strict rescore | plate-next | linked strict ledger | use artifact as source of truth |

Core drift ledger:
- Applies: yes
- Manifest command: `git diff --name-status -- packages/core/src packages/core/type-tests packages/core/package.json 'packages/core/tsconfig*.json' packages/plite/src` plus `git ls-files --others --exclude-standard -- packages/core/src packages/core/type-tests packages/core/package.json 'packages/core/tsconfig*.json' packages/plite/src`
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: `docs/plans/artifacts/2026-06-28-plate-next-strict-bridge-rescore/strict-core-score-ledger.tsv`
- Checklist location: `docs/plans/artifacts/2026-06-28-plate-next-strict-bridge-rescore/strict-core-score-checklist.md`
- Summary location: `docs/plans/artifacts/2026-06-28-plate-next-strict-bridge-rescore/strict-core-score-summary.json`
- Expected row count: 206
- Actual row count: 206
- Missing row count: 0
- Extra row count: 0
- Score gate: strict rescore complete; 206 rows below 100, max 90, min 0, 11
  rows below 50, 27 bridge-blocked rows.
- Top drift rows: `currentRuntimeBridge.ts` 0, `InputRulesPlugin.ts` 5,
  `extendBaseEditor.ts` 15, `PliteReactExtensionPlugin.ts` 25,
  `runtimeTxExtensions.ts` 35, `NodeIdPlugin.ts` 45,
  `PliteExtensionPlugin.ts` 45, affinity owner rows 55.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| See strict checklist artifact | 0-90/100 | strict rescore | plate-next | 206 checked rows | next goal should cut bridge dependencies, not rescore |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| P0 | plate-next | prior score ledger falsely treated private bridge as acceptable | strict artifact generation | keep | use strict artifact |
| P1 | plate-next | bridge-displaced logic must cap owner files | `currentRuntimeBridge`, input-rules, node-id, affinity, plite-extension, react keydown rows | keep | next runtime migration should move logic back to owners |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| package proof | not run | this goal only recomputes score artifacts; no code patch | next implementation goal |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/proof | none |
| docs/templates/skills | strict score plan and artifacts only |
| reverted/quarantined packets | previous all-100 scoring is superseded, not reverted |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `currentRuntimeBridge.ts` | forbidden bridge hack, score 0 | `packages/core/src/internal/currentRuntimeBridge.ts` | cut by owner migration |
| 2 | `InputRulesPlugin.ts` | empty owner while runtime lives in bridge, score 5 | `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts` | move input-rule runtime execution here |
| 3 | `extendBaseEditor.ts` | installs bridge in default route, score 15 | `packages/core/src/lib/editor/extendBaseEditor.ts` | remove install calls after owners move |
| 4 | `PliteReactExtensionPlugin.ts` | keydown commands depend on bridge, score 25 | `packages/core/src/react/plugins/PliteReactExtensionPlugin.ts` | replace with typed plugin tx/extension handlers |

Findings:
- Previous 204-row `100/100` artifact was invalid. It confused "green enough
  for current check:core" with "architecturally safe".
- Strict scoring found 206 scoped files, 206 below 100, 0 at 100.
- `currentRuntimeBridge.ts` is 0/100 because it centralizes displaced product
  logic.
- `InputRulesPlugin.ts` is 5/100 because it is the owner but does not own its
  runtime execution.

Decisions and tradeoffs:
- Do not use private bridge existence as proof.
- Do not score any bridge-dependent file 100.
- Do not patch runtime in this goal; this goal corrects the ledger so the next
  implementation goal starts honest.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Prior score closure marked bridge-dependent files 100 | 1 | strict bridge-capped score model | superseded by this ledger |

Verification evidence:
- Generated strict ledger:
  `docs/plans/artifacts/2026-06-28-plate-next-strict-bridge-rescore/strict-core-score-ledger.tsv`.
- Generated strict checklist:
  `docs/plans/artifacts/2026-06-28-plate-next-strict-bridge-rescore/strict-core-score-checklist.md`.
- Generated strict summary:
  `docs/plans/artifacts/2026-06-28-plate-next-strict-bridge-rescore/strict-core-score-summary.json`.
- Manifest counts: 162 tracked diff rows, 44 untracked rows, 206 unique files.
- Source audit:
  `rg -n "currentRuntimeBridge|getCurrentRuntimeCommands|getCurrentRuntimeTransforms|installCurrentRuntimeCommands|installCurrentRuntimeInputRulesExtension|editor\\.tf|\\.tf\\." packages/core/src packages/core/type-tests packages/plite/src --glob '!**/dist/**'`.

Final handoff contract:
- target surface and mode: broad Core/Plite strict rescore.
- files/APIs reviewed: 206 scoped diff files.
- broad Core drift score coverage: 206 expected, 206 actual, 0 missing, 0 extra.
- verdict matrix summary: 206 below 100, top row 0, max 90.
- changes made: scoring artifacts and plan only.
- tests/proof commands: source audits and manifest artifact generation only.
- old compatibility names audited: bridge and legacy transform references.
- needs attention: top bridge-displaced owner rows.
- next best Plate Next packet: move bridge jobs back to owners and delete
  `currentRuntimeBridge`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Strict rescore closure |
| Where am I going? | Mechanical plan check, then close goal |
| What is the goal? | Supersede false 100/100 scoring with bridge-capped per-file scoring |
| What have I learned? | Bridge-displaced logic poisons multiple owner files; `InputRulesPlugin` is a clear low-score owner |
| What have I done? | Generated strict 206-row score ledger/checklist/summary |

Timeline:
- 2026-06-28T05:59:22.834Z Goal plan created.
- 2026-06-28T06:00Z Generated initial strict ledger, caught bridge-blocked metric overcount.
- 2026-06-28T06:01Z Regenerated corrected strict ledger and summary.

Open risks:
- This goal does not fix the bridge. It only makes the score honest.
- Next implementation goal should not close until `currentRuntimeBridge`
  dependencies are moved to plugin/Plite owners or explicitly hard-cut.
