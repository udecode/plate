# plate-next core full sweep affinity drift

Objective:
Close the Plate Next Core sweep after fixing Affinity drift; done when every Core row is ledgered, high drift is owned, old compat names are clean, and `check:core` passes.

Goal plan:
docs/plans/2026-06-27-plate-next-core-full-sweep-affinity-drift.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- `plate-next`
- `autogoal`

Plate Next source:
- prompt / link: user called `[$plate-next] full sweep` and named `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` as still drifted.
- mode: broad Core sweep plus named Affinity recovery packet.
- target surface: `packages/core/src/**/*`, `packages/core/type-tests/**/*`, and the Affinity plugin family.
- broad Core sweep: yes.
- completion threshold summary: Affinity restored on current Plite extension APIs, one Core drift row per file, no score >=4, score >=2 rows owned, old compat audit clean, and `pnpm check:core` green.

First checkpoint:
- Fix the drift in `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts`; the first marker-only recovery was wrong.
- Use `plate-next`, not a narrow task patch.
- Run a full Core sweep, not just the named Affinity file.
- Keep the Plite/Plate boundary: no `overrideEditor`, `editor.tf`, `plugin.transforms`, old Slate package imports, or public compat aliases.
- Preserve Affinity behavior through Plite transform middleware and proof, not by reintroducing old Slate/Plate runtime patterns.
- Produce a final handoff with changed list, proof commands, high-drift rows, needs-attention items, and next owner.

Timed checkpoint:
- requested duration: none.
- semantics: close only after proof, not after elapsed time.
- initial confidence score: 70/100 after the user caught Affinity drift.
- improvement loop: fixed Affinity behavior, regenerated Core ledger, reran proof.
- final score / loop closure: 94/100; remaining risk is the known runtime bridge family, not this Affinity packet.

Completion threshold:
- Affinity plugin uses `createBasePlugin().extendExtension({ transforms })` and current Plite `editor.read` / transaction APIs.
- `setAffinitySelection` uses the active transform transaction instead of nesting `editor.update`.
- Core drift ledger covers every Core source/type-test file.
- Ledger row counts are stable: 392 expected, 392 actual, 0 missing, 0 extra.
- Score gate is closed: 0 score-4/5 rows; 5 score-3 bridge rows are owned and routed.
- Exact old compatibility audit has no matches.
- `pnpm check:core` passes after the Affinity fix.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-core-full-sweep-affinity-drift.md` passes after this plan is filled.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity`
- package proof: `pnpm check:core`
- source audits: exact `rg` audit for old Slate/Plate compatibility names in `packages/core/src` and `packages/core/type-tests`.
- broad Core drift ledger gate: `docs/plans/artifacts/2026-06-27-plate-next-core-full-sweep-affinity-drift/core-drift-ledger.tsv`
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-core-full-sweep-affinity-drift.md`

Constraints:
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under stale Plate names.
- No public compat aliases or old Slate shims.
- Private bridges require owner, deletion gate, and proof.
- If a helper exists only because migration was hard, cut it or route it to the bridge deletion lane.
- Do not use a narrow representative file to close a broad Core sweep.
- For Core-only targets, ignore non-Core package errors unless the package is named, touched, or proves a Core public API regression.

Boundaries:
- allowed edit scope: Core Affinity plugin family, Core plugin barrel/core plugin wiring, plan artifacts, and proof ledger.
- package/API surfaces: `@platejs/core` and `@platejs/plite` because `check:core` covers both.
- docs/browser surfaces: not touched; this is runtime/core proof.
- non-goals: broad package migration, docs rewrite, browser proof, public API plan.
- out-of-scope package errors: none observed in `check:core`.

Output budget strategy:
- Use ledger artifacts for all 392 rows instead of dumping every row into chat.
- Keep final handoff to changed files, proof, high-drift rows, and next owner.

Blocked condition:
- None. The sweep and proof completed.

Current verdict:
- verdict: keep Affinity recovery; defer runtime bridge family to the next Plate Next cleanup packet.
- confidence: 94/100.
- next owner: `plate-next`.
- keep / revert / quarantine call: keep Affinity packet; defer bridge deletion.
- reason: Affinity behavior is restored on current APIs and `check:core` is green; remaining score-3 rows are broader bridge debt.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | complete | Prompt requirements copied into this plan. |
| Affinity drift fix | complete | `AffinityPlugin.ts` ported from old `overrideEditor` shape to Plite transform middleware. |
| Core drift ledger | complete | 392 rows, 0 missing, 0 extra, 0 score-4/5. |
| Compatibility audit | complete | Exact old-name `rg` audit returned no matches. |
| Core proof | complete | `pnpm check:core` passed. |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint lists the named file, full sweep scope, proof, and handoff requirements. |
| `plate-next` skill/rule read | yes | `plate-next` and `autogoal` instructions were read before closure. |
| Active goal checked or created | yes | Active autogoal created for this packet. |
| Mode classified as named packet vs broad Core sweep | yes | Classified as both named Affinity recovery and broad Core sweep. |
| Broad Core drift ledger initialized when in scope | yes | Ledger artifact generated under `docs/plans/artifacts/2026-06-27-plate-next-core-full-sweep-affinity-drift/`. |
| Source of truth and allowed workspace recorded | yes | Boundaries section records Core/Plite scope. |
| Output budget strategy recorded | yes | Ledger artifacts summarize the 392-file sweep. |
| Public API fork routing checked | yes | No public API fork in this packet; bridge deletion remains routed to `plate-next`. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, stop condition, deliverable, verification surface, and success criterion is copied into this plan.
- [x] Mode classified: named Affinity packet plus broad Core sweep.
- [x] For broad Core sweep, linked Core drift ledger has one row per Core source/type-test file.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`, `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, this plan records manifest command, expected row count, actual row count, missing row count, and extra row count.
- [x] For broad Core sweep, score >=2 rows have owner/evidence/next, and no score >=4 row is closed as keep.
- [x] Review matrix is filled for inspected files/APIs/helpers.
- [x] Public API forks were checked; none were introduced.
- [x] Safe cleanup packets are kept, reverted, or deferred with proof.
- [x] Focused package proof was run after code changes.
- [x] `pnpm brl` was run because the Core plugin barrel changed.
- [x] Old compatibility names were source-audited.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused Affinity proof | `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity` passed. |
| Broad Core drift ledger coverage | yes | Record row counts | 392 expected, 392 actual, 0 missing, 0 extra. |
| Score gate | yes | Prove high drift is fixed or owned | 0 score-4/5; 5 score-3 bridge rows routed below. |
| Package/API proof | yes | Run Core/Plite package proof | `pnpm check:core` passed. |
| Non-Core package error triage | no | Classify if seen | No non-Core failures reported by `check:core`. |
| Source audit | yes | Run exact audit for removed compatibility names | Old-name `rg` audit returned no matches. |
| Autoreview / review | no | Record reason | This is a focused internal cleanup packet; no `autoreview` requested. |
| Final lint/check | yes | Run scoped lint/check | `pnpm check:core` includes Core/Plite typecheck, lint, and tests. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | See changed list and needs-attention sections. |
| Goal plan complete | yes | Run `check-complete.mjs` | Recorded in verification evidence after final plan check. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` | 1 | fixed-current-extension | plate-core | Recovered old transform semantics through `extendExtension({ transforms })`, using Plite reads and active tx. | keep |
| `packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.ts` | 1 | fixed-current-tx | plate-core | Accepts active tx for marks/selection writes; avoids nested `editor.update`. | keep |
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.ts` | 1 | proof-added | plate-core | Covers core installation and outward affinity insertion behavior. | keep |
| `packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.spec.ts` | 1 | proof-updated | plate-core | Verifies tx-based selection/mark writes. | keep |
| `packages/core/src/lib/plugins/getCorePlugins.ts` | 2 | reviewed-api-boundary | plate-core | Affinity re-added to default Core plugin set behind `affinity !== false`. | keep |
| `packages/core/src/lib/plugins/index.ts` | 1 | generated-barrel | plate-core | Barrel exports Affinity after `pnpm brl`. | keep |
| `packages/core/src/internal/currentRuntimeBridge.ts` | 3 | private-bridge | plate-next | Runtime bridge/command fallback family remains broader migration debt. | delete or gate in next bridge-deletion packet |
| `packages/core/src/internal/currentRuntimeCommandStore.ts` | 3 | private-bridge | plate-next | Command store exists only to bridge current runtime command flow. | delete or gate in next bridge-deletion packet |
| `packages/core/src/internal/editor/runtimeTxExtensions.ts` | 3 | private-bridge | plate-next | Runtime tx extension bridge still centralizes migration glue. | delete or gate in next bridge-deletion packet |
| `packages/core/src/lib/editor/extendBaseEditor.ts` | 3 | private-bridge | plate-next | Base editor extension path still installs bridge/runtime affordances. | delete or gate in next bridge-deletion packet |
| `packages/core/src/react/plugins/PliteReactExtensionPlugin.ts` | 3 | private-bridge | plate-next | React plugin keeps keyboard/command bridge behavior. | convert or delete in next bridge-deletion packet |

Core drift ledger:
- Applies: yes.
- Manifest command: `rg --files packages/core/src packages/core/type-tests -g '*.ts' -g '*.tsx' -g '*.mts' -g '*.cts' | sort`
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}` plus `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: `docs/plans/artifacts/2026-06-27-plate-next-core-full-sweep-affinity-drift/core-drift-ledger.tsv`
- Top rows location: `docs/plans/artifacts/2026-06-27-plate-next-core-full-sweep-affinity-drift/core-drift-top.md`
- Summary location: `docs/plans/artifacts/2026-06-27-plate-next-core-full-sweep-affinity-drift/core-drift-summary.json`
- Expected row count: 392
- Actual row count: 392
- Missing row count: 0
- Extra row count: 0
- Score gate: `score0=242`, `score1=48`, `score2=97`, `score3=5`, `score4=0`, `score5=0`
- Top drift rows: the five score-3 bridge rows listed in the review matrix.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Affinity behavior recovery | plate-core | Prior recovery deleted behavior and left drift. | Affinity plugin family; Affinity tests. | keep | No extra action. |
| Full Core drift ledger | plate-next | Broad sweep needed a file-by-file score gate. | Ledger artifacts with 392 rows. | keep | Use as next packet baseline. |
| Runtime bridge family | plate-next | Five score-3 rows are real bridge debt. | Top drift artifact. | defer-with-owner | Next Plate Next bridge deletion lane. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | none | `check:core` stayed inside Core/Plite and passed. | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Restored Affinity behavior on Plite transform middleware; re-added Affinity to Core plugin exports/defaults; made `setAffinitySelection` tx-based. |
| tests/proof | Added/updated Affinity plugin and transform tests; generated Core drift ledger artifacts. |
| docs/templates/skills | Filled this autogoal plan with real evidence. |
| reverted/quarantined packets | No quarantine; prior marker-only Affinity recovery was replaced by current behavior port. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Runtime bridge family | It is the only score-3 cluster left and it keeps migration glue alive. | `currentRuntimeBridge.ts`, `currentRuntimeCommandStore.ts`, `runtimeTxExtensions.ts`, `extendBaseEditor.ts`, `PliteReactExtensionPlugin.ts` | Run the next `plate-next` packet to delete or deletion-gate the bridge family. |
| 2 | Score-2 API boundary rows | 97 rows still deserve deeper boundary review, but they are not the Affinity regression. | `core-drift-top.md` | Continue package-by-package cleanup after bridge deletion. |

Findings:
- The user was right: the first Affinity recovery left semantic drift.
- Affinity cannot be recovered as a marker plugin; it owns mark-boundary selection behavior.
- Current shape should be Plite transform middleware with tx writes, not old `overrideEditor`.
- The broad Core sweep no longer has score-4/5 rows; the remaining high-risk work is bridge debt.

Decisions and tradeoffs:
- Keep Affinity in Core because it is Plate product/plugin behavior over Plite substrate.
- Do not reintroduce `overrideEditor`, `editor.tf`, `plugin.transforms`, or old Slate package imports.
- Use active transform tx in `setAffinitySelection` so Affinity stays inside the current update.
- Do not hide the five bridge files; they are routed as the next owner instead of being called clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Marker-only Affinity recovery | 1 | Port old behavior into current Plite transform middleware. | Fixed in this packet. |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity` passed: 19 pass, 0 fail.
- `pnpm brl` passed after adding the Affinity barrel export.
- Exact compat audit passed by returning no matches:
  `rg -n "@platejs/slate|createT?Slate|SlateEditor|SlatePlugin|TSlate|editor\\.tf\\b|editor\\.transforms\\b|plugin\\.transforms\\b|getPluginApi|getTransforms|createSlateEditor" packages/core/src packages/core/type-tests -g '*.ts' -g '*.tsx'`
- `pnpm check:core` passed: Core/Plite typecheck, Core spec typecheck, Core type contracts, Core lint, Plite lint, 116 Core spec files in 12 batches, and Plite tests.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-core-full-sweep-affinity-drift.md` must pass after this final plan write.

Final handoff contract:
- target surface and mode: Core full sweep plus Affinity drift recovery.
- files/APIs reviewed: all 392 Core source/type-test rows through linked ledger, with named review matrix for Affinity and score-3 bridge rows.
- broad Core drift score coverage: 242 score-0, 48 score-1, 97 score-2, 5 score-3, 0 score-4, 0 score-5.
- verdict matrix summary: Affinity fixed and kept; runtime bridge cluster deferred to `plate-next`.
- changes made: Affinity behavior restored, tests updated, Core plugin defaults/barrels restored, plan/artifacts updated.
- tests/proof commands: focused Affinity tests, `pnpm brl`, compat audit, `pnpm check:core`, final autogoal check.
- old compatibility names audited: yes, no matches.
- needs attention: runtime bridge deletion lane.
- next best Plate Next packet: delete or deletion-gate the five score-3 bridge files.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure after Affinity fix and Core ledger sweep. |
| Where am I going? | Final autogoal mechanical check, then handoff. |
| What is the goal? | Close the Plate Next Core sweep after fixing Affinity drift. |
| What have I learned? | Affinity was real behavior drift; remaining high drift is bridge debt. |
| What have I done? | Ported Affinity, updated proof, generated ledger, ran `check:core`. |

Timeline:
- 2026-06-27: Goal plan created from `plate-next` template.
- 2026-06-27: Affinity drift fixed through current Plite transform middleware.
- 2026-06-27: Core ledger regenerated with 392 rows and no score-4/5 rows.
- 2026-06-27: `pnpm check:core` passed.

Open risks:
- The runtime bridge family remains score-3 debt and should be the next focused `plate-next` lane.
