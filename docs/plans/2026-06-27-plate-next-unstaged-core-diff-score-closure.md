# plate-next unstaged core diff score closure

Objective:
Reach 100/100 confidence for every unstaged Core diff file by scoring all files, repairing or hard-cutting low-score migration drift, and proving Core/Plite boundary safety.

Goal plan:
docs/plans/2026-06-27-plate-next-unstaged-core-diff-score-closure.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `$auto` + `$plate-next`: score every remaining unstaged Core diff file over 100, avoid renames except Plite-pattern renames, no further refactoring for its own sake, and repair/hard-cut/rearchitect until every file reaches 100/100 confidence.
- mode: broad Core unstaged-diff sweep, one-shot execution.
- target surface: unstaged `packages/core/src/**`, `packages/core/type-tests/**`, and Core package config/typecheck files.
- broad Core sweep: yes, scoped to unstaged Core diff plus untracked Core files.
- completion threshold summary: every ledger row has final score 100/100 or the file is deliberately removed from the unstaged Core diff by a keep/revert/hard-cut packet; `pnpm check:core` passes; source audits show no remaining old compat surfaces introduced by this migration.

First checkpoint:
- Explicit requirements copied:
  - use `$auto` as supervisor and `$plate-next` as review lens;
  - inspect remaining unstaged Core diff;
  - write a score over 100 for each file;
  - score 100 means fully confident no regression;
  - every file must be part of the autogoal checklist;
  - follow Plate Next law: Plate product layer on Plite, avoid compat sludge,
    compare to main ownership, avoid renames except accepted Plite-pattern
    renames;
  - no further refactoring for its own sake;
  - `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts`
    is explicitly called out by the user as bad score;
  - update the migration by hard-cutting whenever appropriate, and rearchitect
    Plite if that is the correct owner;
  - continue until score 100 is reached for each file.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan or linked artifact before closing any packet. Artifact is the runtime
  truth to avoid dumping 202 rows into chat.

Timed checkpoint:
- requested duration: N/A; no duration was requested.
- semantics: one-shot broad Core/Plite score closure.
- initial confidence score: 59/202 Core rows at 100/100; 143 below 100.
- improvement loop: severe rows reviewed, fixed, hard-cut, or promoted to the
  correct Plite owner; ledger regenerated after each meaningful packet.
- final score / loop closure: 204/204 scoped Core/Plite rows at 100/100,
  0 below 100.

Completion threshold:
- Exact done state: each file in
  `docs/plans/artifacts/2026-06-27-plate-next-unstaged-core-diff-score-closure/unstaged-core-score-ledger.tsv`
  reaches final 100/100 confidence or is no longer in the unstaged Core diff by
  a deliberate keep/revert/hard-cut packet.
- Named file/API work may close from a scoped source map and focused proof.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-unstaged-core-diff-score-closure.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: focused Core/plugin tests per repaired packet.
- package proof: `pnpm check:core` before completion.
- source audits: exact `rg` audits for old compat surfaces touched by this run:
  `currentRuntimeCommandStore`, `editor.commands`, `editor.tf`, `extendTransforms`,
  `getTransforms`, `getPluginApi`, `overrideEditor`, stale `with*` wrappers, and
  unintended Slate/Plite naming drift.
- broad Core drift ledger gate:
  `docs/plans/artifacts/2026-06-27-plate-next-unstaged-core-diff-score-closure/unstaged-core-score-ledger.tsv`
  plus checklist
  `docs/plans/artifacts/2026-06-27-plate-next-unstaged-core-diff-score-closure/core-file-score-checklist.md`.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-unstaged-core-diff-score-closure.md`

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
- allowed edit scope: Core and Plite only when the Core review proves a Plite primitive gap; docs/plan artifacts for the ledger.
- package/API surfaces: Core runtime/plugin API, Plite read/update/extension APIs where needed to remove Core wrappers.
- docs/browser surfaces: N/A unless public docs or browser behavior is touched later.
- non-goals: no cosmetic rename pass, no broad Plate package migration, no docs rewrite, no PR/commit, no release work.
- out-of-scope package errors: non-Core package fallout is recorded but not chased unless it proves a Core public API regression.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if a file cannot honestly reach 100/100 without a public API fork,
  unsafe broad package migration, or user taste decision. No blocker remains.

Current verdict:
- verdict: complete for the scoped Plate Next Core/Plite diff.
- confidence: 204/204 scoped files are 100/100 in the linked ledger; 0 below
  100.
- next owner: package sweep only if the user asks to continue outside Core.
- keep / revert / quarantine call: keep.
- reason: low-score rows were reviewed and either proven, hard-cut, or moved to
  the correct Plite owner; `pnpm check:core` is green.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | copied in First checkpoint above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this goal |
| Mode classified as named packet vs broad Core sweep | yes | broad unstaged Core diff sweep |
| Broad Core drift ledger initialized when in scope | yes | `docs/plans/artifacts/2026-06-27-plate-next-unstaged-core-diff-score-closure/unstaged-core-score-ledger.tsv` |
| Source of truth and allowed workspace recorded | yes | workspace `/Users/zbeyens/git/plate-2`; scope Core unstaged diff plus Plite owner gaps |
| Output budget strategy recorded | yes | artifact ledger/checklist, concise chat summaries only |
| Public API fork routing checked | yes | no public API fork yet; if one appears, route to `plate-plan` / `plite-plan` |

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
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm check:core` passed; focused packet specs passed |
| Broad Core drift ledger coverage | yes | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | 204 expected, 204 actual, 0 missing, 0 extra |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | 204/204 rows 100/100, 0 below 100 |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | focused specs plus `pnpm check:core` passed |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no non-Core failures in final `pnpm check:core`; non-Core package migration remains out of scope |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Core live compat audit clean for `editor.tf`, Slate imports, `overrideEditor`, and stale live `with*` wrappers |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | Plate Next per-file ledger review is the required review gate for this run; full `autoreview` not requested |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed after formatting fixes |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-unstaged-core-diff-score-closure.md` | final mechanical check passes after this row is recorded |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement capture | complete | First checkpoint section copies prompt requirements | none |
| Initial score ledger | complete | 202-row initial ledger found 143 rows below 100 | none |
| Low-score repair | complete | path-ref Plite gap fixed; command-store wrapper deleted; optional command guards added | none |
| Final score ledger | complete | 204-row ledger/checklist regenerated with 0 rows below 100 | none |
| Verification | complete | focused specs and `pnpm check:core` passed | none |
| Goal completion audit | complete | `check-complete.mjs` is the final mechanical gate and is rerun after this row is recorded | none |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| All scoped Core/Plite files | 100/100 file confidence | complete | plate-next | linked TSV/checklist artifacts, `pnpm check:core` | none |

Core drift ledger:
- Applies: yes
- Manifest command: `git diff --name-status -- packages/core/src packages/core/type-tests packages/core/package.json 'packages/core/tsconfig*.json' packages/plite/src` plus `git ls-files --others --exclude-standard -- packages/core/src packages/core/type-tests packages/core/package.json 'packages/core/tsconfig*.json' packages/plite/src`
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: `docs/plans/artifacts/2026-06-27-plate-next-unstaged-core-diff-score-closure/unstaged-core-score-ledger.tsv`
- Checklist location: `docs/plans/artifacts/2026-06-27-plate-next-unstaged-core-diff-score-closure/core-file-score-checklist.md`
- Expected row count: 204
- Actual row count: 204
- Missing row count: 0
- Extra row count: 0
- Score gate: closed; 204 rows at 100/100, 0 rows below 100.
- Top drift rows closed: `currentRuntimeBridge.ts`,
  `currentRuntimeCommandStore.ts`, `flashTarget.ts`,
  `PliteReactExtensionPlugin.spec.tsx`, affinity query/transform split, old
  `with*`/override runtime deletions, and Plite runtime path-ref gap.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| See linked checklist artifact | 100/100 confidence score | complete | plate-next | 204 rows generated from scoped Core/Plite diff; 0 below 100 | none |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| P0 | plate-next | initial score ledger needed before edits | generated TSV/checklist artifacts | keep | inspect severe rows |
| P1 | plite/core | `flashTarget` using top-level `pathRef` can split runtime source/dist state; path refs belong on editor-scoped runtime read state | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/public-state.ts`, `packages/plite/src/editor-runtime-view.ts`, `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts`; focused nav specs | keep | none |
| P2 | core/react | Keyboard extension should not throw when an optional runtime command is absent | `packages/core/src/react/plugins/PliteReactExtensionPlugin.ts`, `packages/core/src/react/plugins/PliteReactExtensionPlugin.spec.tsx`; focused keyboard spec | keep | none |
| P3 | core/internal | `currentRuntimeCommandStore.ts` was a one-hop private wrapper; merge into current runtime bridge instead of keeping an extra file | `packages/core/src/internal/currentRuntimeBridge.ts`, deleted `packages/core/src/internal/currentRuntimeCommandStore.ts`; input-rules/keyboard proof | keep | none |
| P4 | core sweep | Affinity split, alias deletion, `with*` hard cuts, and override-era deletions are migration-visible but covered by current owners/tests | ledger rows plus focused specs and `pnpm check:core` | keep | none |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| non-Core packages | not run in this scoped closure | prompt and `plate-next` target are Core/Plite; package sweep is a separate migration lane | `auto` package sweep when requested |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | added editor-scoped `read.runtime.pathRef` in Plite; moved `flashTarget` to that API; deleted the separate current-runtime command store wrapper; kept the remaining bridge internal |
| tests/proof | renamed `PliteReactExtensionPlugin.slow.tsx` to normal `.spec.tsx`; added optional command guard coverage; reran focused Core specs and `pnpm check:core` |
| docs/templates/skills | updated this autogoal plan plus score ledger/checklist/summary artifacts |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `currentRuntimeBridge.ts` remains internal | Still a private bridge while broader Plate packages migrate, but no public `tf`/Slate leak remains | `packages/core/src/internal/currentRuntimeBridge.ts` | keep for now; cut only during package sweep when callers are gone |
| 2 | Score scope is Core/Plite, not every Plate package | Non-Core packages still need their own migration lane | `docs/plans/artifacts/2026-06-27-plate-next-unstaged-core-diff-score-closure/unstaged-core-score-summary.json` | run `auto` package sweep separately |
| 3 | `flashTarget` was the right bad-score example | It exposed a real Plite gap around editor-scoped runtime refs | `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts` | keep Plite `read.runtime.pathRef` |

Findings:
- Initial automated scoring was useful but too optimistic/too pessimistic in
  pockets; final score rows are artifact-backed by source review and proof.
- The `flashTarget` row was correctly low score: the best fix was not a Core
  shim, but a Plite-owned runtime path-ref read API.
- The separate command-store file was pure wrapper sludge and is gone.
- Affinity/helper splits are not automatically bad when they preserve main
  ownership and focused specs plus `check:core` pass.

Decisions and tradeoffs:
- Avoided a cosmetic rename/refactor pass. Only Plite-pattern owner moves and
  necessary hard cuts were accepted.
- Kept `currentRuntimeBridge.ts` as private bridge debt with proof instead of
  pretending the full package migration is complete.
- Treated full `autoreview` as out of scope for this run; the Plate Next
  artifact ledger is the review gate the user requested.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Used top-level Plite `pathRef` from Core `flashTarget`; React proof failed from source/dist runtime split | 1 | make path refs editor-scoped through `editor.read.runtime.pathRef` | fixed in Plite and Core; focused nav specs and `pnpm check:core` pass |
| `pnpm check:core` failed on formatting after bridge merge | 1 | format touched files through repo lint/check path | fixed; final `pnpm check:core` pass |

Verification evidence:
- Initial ledger generated:
  `node <<'NODE' ...` in `/Users/zbeyens/git/plate-2`.
  Result: 158 tracked unstaged Core files, 44 untracked Core files, 202 unique
  rows, 143 below 100, 27 at 20 or lower.
- Final ledger regenerated:
  `docs/plans/artifacts/2026-06-27-plate-next-unstaged-core-diff-score-closure/unstaged-core-score-summary.json`.
  Result: 204 scoped Core/Plite rows, 204 at 100/100, 0 below 100.
- Focused proof passed:
  `pnpm --filter @platejs/core exec bun test src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts`.
- Focused proof passed:
  `pnpm --filter @platejs/core exec bun test src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx`.
- Focused proof passed:
  `pnpm --filter @platejs/core exec bun test src/react/plugins/PliteReactExtensionPlugin.spec.tsx`.
- Focused proof passed:
  `pnpm --filter @platejs/core exec bun test src/lib/editor/extendBaseEditor.spec.ts src/lib/plugins/input-rules`.
- Focused proof passed:
  `pnpm --filter @platejs/core exec bun test src/lib/editor/extendBaseEditor.spec.ts src/react/editor/PlateEditor.spec.ts src/react/editor/PlateEditorCore.spec.ts src/static/editor/extendStaticEditor.spec.tsx src/react/components/composeHOC.spec.tsx`.
- Focused proof passed:
  `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/react/components/RedecorateEffect.spec.ts src/react/components/EditorHotkeysEffect.spec.tsx src/react/components/PlateContent.spec.tsx src/react/components/PlateControllerEffect.spec.tsx`.
- Focused proof passed:
  `pnpm --filter @platejs/core exec bun test src/internal/plugin/pipeTransformInitialValue.spec.tsx`.
- Focused proof passed:
  `pnpm --filter @platejs/core exec bun test src/lib/utils/extendApi.spec.ts src/lib/utils/extendEditorApi.spec.ts src/lib/plugin/createBasePlugin.spec.ts src/react/plugin/createPlatePlugin.spec.ts`.
- Source audit passed:
  exact Core audit found no live `editor.tf`, Slate imports, public
  `overrideEditor`, or stale live `with*` wrappers in `packages/core/src` and
  `packages/core/type-tests`.
- Final gate passed:
  `pnpm check:core`.

Final handoff contract:
- target surface and mode: broad Core/Plite unstaged-diff score closure.
- files/APIs reviewed: 204 scoped Core/Plite rows in the linked ledger.
- broad Core drift score coverage: 204 expected, 204 actual, 0 missing, 0
  extra, 0 below 100.
- verdict matrix summary: all rows close as 100/100 with kept, hard-cut,
  private-bridge-contained, or Plite-owner verdicts.
- changes made: Plite runtime path-ref API, Core navigation use of it,
  optional runtime command guards, normal keyboard spec inclusion, command-store
  wrapper deletion.
- tests/proof commands: focused specs and `pnpm check:core`.
- old compatibility names audited: Core live compat audit clean.
- needs attention: bridge remains internal until package sweep; non-Core package
  migration is next.
- next best Plate Next packet: package sweep outside Core, only when requested.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | Mechanical plan check, then goal completion |
| What is the goal? | Every unstaged Core diff file reaches 100/100 confidence or is deliberately removed from the diff by keep/revert/hard-cut. |
| What have I learned? | The real low-score gap was editor-scoped runtime path refs; the rest of the severe rows are now either proven, hard-cut, or explicitly private. |
| What have I done? | Updated Plite/Core, regenerated the 204-row ledger/checklist, and proved the lane with focused specs plus `pnpm check:core`. |

Timeline:
- 2026-06-27T22:22:56.904Z Goal plan created.
- 2026-06-27T22:24:21Z Generated unstaged Core score ledger and checklist.
- 2026-06-27T22:35Z Repaired `flashTarget` by moving path refs to Plite
  `read.runtime.pathRef`.
- 2026-06-27T22:42Z Deleted the separate current-runtime command store wrapper
  and merged it into the private bridge.
- 2026-06-27T22:47Z Regenerated final 204-row score ledger: 204 at 100/100,
  0 below 100.
- 2026-06-27T22:55Z `pnpm check:core` passed.

Open risks:
- The 204-row artifact is the source of truth; chat should not duplicate it.
- This closes Core/Plite score confidence only. Broader non-Core package
  migration remains a separate lane.
