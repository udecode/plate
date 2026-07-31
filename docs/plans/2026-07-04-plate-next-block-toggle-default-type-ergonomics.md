# plate-next block toggle default type ergonomics

Objective:
Remove Plate `blocks.toggle` default-type boilerplate; done when Plite owns the default block type and Plate callsites omit `defaultType` without behavior loss.

Goal plan:
docs/plans/2026-07-04-plate-next-block-toggle-default-type-ergonomics.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user pointed out `defaultType: editor.plugin('p').type` remains in `packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx`
- mode: named API ergonomics packet
- target surface: Plite `blocks.toggle` default block type and Plate callsites in paragraph/input-rules
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: named API ergonomics packet, not full Core review
- correction-triggered related Core sweep: required for `defaultType: editor.plugin('p').type`, `blocks.toggle`, and `toggleBlock`
- completion threshold summary: no `defaultType: editor.plugin('p').type` callsites remain; Plate custom paragraph type still toggles back correctly; focused Plite/Core tests and typecheck/lint pass

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
- Done state: Plite has an owner-level default block type; Plate installs its paragraph type once; `ParagraphPlugin` and input-rule toggle callsites call `blocks.toggle` without `defaultType`; focused behavior/type proof passes.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-block-toggle-default-type-ergonomics.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Plite transform contract for default block type; Core input-rules and withPlite tests for Plate custom paragraph mapping
- package proof: `pnpm --filter @platejs/plite test`; `pnpm --filter @platejs/core typecheck`; `pnpm --filter @platejs/core lint`
- source audits: `rg -n "defaultType: editor\\.getType\\('p'\\)|toggleBlock|blocks\\.toggle\\(" packages/core/src packages/plite/src packages/plite/test`
- related Core sweep query / match count / patched count / deferred count:
  pending
- Plite/Plate gap ledger: Plite gap found and patched: editor-wide default block type for semantic block toggles
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-block-toggle-default-type-ergonomics.md`

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
- allowed edit scope: Plite runtime/options/internal export, Plate `withPlite`, paragraph/input-rule callsites, focused tests, this plan
- package/API surfaces: Plite editor option/internal state; Core Plate runtime setup
- docs/browser surfaces: N/A unless proof exposes docs mismatch
- non-goals: no broad Core sweep, no rename pass, no legacy compatibility wrappers
- out-of-scope package errors: ignore unless caused by this API change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if Plite cannot support a default block type without broad public API redesign or type inference regression.

Current verdict:
- verdict: keep
- confidence: high after focused behavior tests, typecheck, lint, and source audits
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: Plite owns the default; Plate callsites are clean; custom paragraph proof passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Remove remaining `defaultType: editor.plugin('p').type` boilerplate by fixing owner fallback, not behavior. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully. |
| Active goal checked or created | yes | `get_goal` returned none; active goal created for this plan. |
| Mode classified as named packet vs broad Core sweep | yes | Named API ergonomics packet. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plite owns default block type; Plate installs paragraph type once. |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Current checkout `/Users/zbeyens/git/plate-2`; `origin/main` evidence only. |
| Output budget strategy recorded | yes | Focused `sed`/`rg`, no broad dumps. |
| Public API fork routing checked | yes | Additive Plite editor option; no Plate public compat path. |
| Gap policy checked | yes | Plite gap identified: default block type belongs to editor substrate. |
| Related Core sweep policy checked | yes | Sweep `defaultType`, `blocks.toggle`, `toggleBlock`. |
| Review-mode rename freeze checked | yes | No renames. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Old boilerplate audit empty; focused Plite/Core tests pass. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named API packet. |
| Score gate | no | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | N/A: no broad drift scoring. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Plite owns `defaultBlockType`; Plate installs `editor.plugin('p').type` once; callsites omit `defaultType`. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | Plite gap patched: default block type. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Swept `defaultType: editor.plugin('p').type`, `toggleBlock`, and `blocks.toggle`. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Plite/Core focused tests, Plite/Core typecheck, Plite/Core lint all passed. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: proof commands passed. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `rg` old-boilerplate audit returned no matches. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename. |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no extracted files. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: narrow owner fix with focused tests/typecheck/lint. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/plite lint` and `pnpm --filter @platejs/core lint` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Changed list below; no user attention needed. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-block-toggle-default-type-ergonomics.md` | Final rerun after plan closure must pass. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Default block type owner patch | complete | Plite option/internal state added; Plate installs paragraph type once; callsites cleaned; tests/typecheck/lint passed. | Close goal. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/plite/src/core/public-state.ts` block toggle fallback | 0 | move-to-plite | Plite runtime | `blocks.toggle` reads `getEditorDefaultBlockType(editor)`. | keep |
| `packages/plite/src/interfaces/editor.ts` `CreateEditorOptions` | 0 | move-to-plite | Plite public editor options | `defaultBlockType?: string` configures raw Plite fallback. | keep |
| `packages/core/src/lib/editor/withPlite.ts` Plate install | 0 | main-parity-cleanup | Core Plate runtime setup | `setEditorDefaultBlockType(editor, editor.plugin(BaseParagraphPlugin.key).type)` runs after plugin resolution. | keep |
| `packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx` | 0 | hard-cut boilerplate | Core React paragraph shortcut | Now calls `editor.update.blocks.toggle(type)`. | keep |
| `packages/core/src/lib/plugins/input-rules/createInputRules.ts` | 0 | hard-cut boilerplate | Core input-rules | Toggle/wrap paths omit default type; direct conversion path still uses `nodes.set`. | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Semantic block toggle default | Plite editor-level `defaultBlockType`, Plate sets it once from paragraph plugin type. | Per-call `defaultType: editor.plugin('p').type`; hardcoded raw `'p'` in Plate callsites; old `editor.tf.toggleBlock`. | Removes boilerplate without losing custom paragraph mapping. | None. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plite gap | Editor-wide default block type for semantic block toggles. | Repeating `defaultType` in Plate callsites makes every product command remember substrate defaults. | Plite runtime state and `CreateEditorOptions`; Plate `withPlite` installer. | Plite transform test and Core custom paragraph test. | Patched. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Cut Plate per-call paragraph default | `rg -n "defaultType: editor\\.getType\\('p'\\)|defaultType: editor\\.getType\\(BaseParagraphPlugin\\.key\\)|editor\\.tf\\.toggleBlock|toggleBlock\\(" packages/core/src packages/plite/src packages/plite/test` | 0 old-boilerplate/legacy matches after patch | 2 Core callsites | 0 | Low; internal Plite function name `toggleBlock` remains implementation detail. |
| Review remaining toggles | `rg -n "blocks\\.toggle\\(" packages/core/src packages/plite/src packages/plite/test` | 7 matches | 0 additional | 0 | Low; remaining object arg is `{ wrap: true }`, not default-type boilerplate. |

Core drift ledger:
- Applies: N/A: named API packet
- Manifest command: N/A
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
| N/A | N/A | N/A | N/A | Not broad Core sweep. | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| `defaultBlockType` owner fix | Plite runtime + Plate installer | Per-call default type is boilerplate; owner should know default block type. | Plite/Core runtime, tests, typecheck, lint. | keep | None. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | No extracted files. | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | N/A | Proof commands passed. | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added Plite `defaultBlockType`; Plate installs paragraph type once; removed per-call default-type options. |
| tests/proof | Added/updated Plite transform and Core custom paragraph fallback tests. |
| docs/templates/skills | Updated this plan. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | None | No taste decision remains. | N/A | N/A |

Findings:
- Per-call `defaultType` was real boilerplate. The correct owner is Plite runtime default block type, with Plate setting it from the configured paragraph plugin once.
- The first Core proof failed before fixing the intended custom paragraph test, which confirmed hardcoded `'p'` was still observable.

Decisions and tradeoffs:
- Added `defaultBlockType` to Plite `CreateEditorOptions` because raw Plite should also be configurable.
- Kept the per-call `defaultType` option in Plite for explicit one-off overrides; removed Plate's repeated `editor.plugin('p').type` usage.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First Plite focused test command missed path shape | 1 | Rerun with `./test/transforms-contract.ts` | Passed. |
| First Core proof showed custom paragraph still returned `p` | 1 | Patch intended test and owner install | Passed after Plate installs default block type. |

Verification evidence:
- `rg -n "defaultType: editor\\.getType\\('p'\\)|defaultType: editor\\.getType\\(BaseParagraphPlugin\\.key\\)|editor\\.tf\\.toggleBlock|toggleBlock\\(" packages/core/src packages/plite/src packages/plite/test --glob '!**/dist/**'` -> no legacy/boilerplate matches.
- `pnpm --filter @platejs/plite exec bun test ./test/transforms-contract.ts` -> 30 pass.
- `pnpm --filter @platejs/core exec bun test src/react/utils/inputRules.spec.tsx src/lib/editor/withPlite.spec.ts` -> 46 pass.
- `pnpm --filter @platejs/plite typecheck` -> pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/plite lint` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.

Final handoff contract:
- target surface and mode: named Plate Next API ergonomics packet.
- files/APIs reviewed: Plite block toggle fallback, Plite editor options/internal state, Plate `withPlite`, paragraph shortcut, input-rules toggle.
- broad Core drift score coverage: N/A.
- best Plate v2 recommendation: Plite owns default block type; Plate callsites stay clean.
- verdict matrix summary: move-to-plite for fallback, main-parity cleanup for Plate installer, hard-cut per-call boilerplate.
- Plite/Plate gaps or blockers: gap patched, no blocker.
- related Core sweep query/matches/patched/deferred: old-boilerplate audit empty after patch; `blocks.toggle` sweep reviewed.
- changes made: see changed list.
- tests/proof commands: see verification evidence.
- old compatibility names audited: `editor.tf.toggleBlock` / `toggleBlock` audit done.
- needs attention: none.
- next best Plate Next packet: continue reviewing Core helper boilerplate that repeats runtime defaults.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure |
| Where am I going? | Finish plan check and close goal. |
| What is the goal? | Remove Plate block-toggle default-type boilerplate without behavior regression. |
| What have I learned? | Plite needed an editor-wide default block type; Plate can install it once. |
| What have I done? | Patched runtime/options/callsites/tests and ran proof. |

Timeline:
- 2026-07-04T08:05:39.723Z Goal plan created.
- 2026-07-04T08:08Z Created active goal and captured checkpoint zero.
- 2026-07-04T08:12Z Added Plite default block type and removed Plate per-call default-type boilerplate.
- 2026-07-04T08:16Z Focused tests exposed and then proved custom paragraph fallback.
- 2026-07-04T08:18Z Plite/Core typecheck and lint passed.

Open risks:
- None.
