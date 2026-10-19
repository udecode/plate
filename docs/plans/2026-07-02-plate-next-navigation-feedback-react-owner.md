# plate-next navigation feedback react owner

Objective:
Move NavigationFeedbackPlugin to the React owner, cut the public refresh API, and prove Core no longer exports a headless navigation-feedback plugin.

Goal plan:
docs/plans/2026-07-02-plate-next-navigation-feedback-react-owner.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user accepted the recommendation to move NavigationFeedbackPlugin to React and cut the headless Core plugin.
- mode: named packet
- target surface: `packages/core/src/lib/plugins/navigation-feedback/**`, `packages/core/src/react/plugins/navigation-feedback/**`, Core/React plugin registries, docs/API references
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: named packet only, not `sweep`, `all core`, or `full-loop`.
- correction-triggered related Core sweep: required for `NavigationFeedbackPlugin`, `api.navigation.refresh`, `navigationFeedback`, and same-class refresh/no-op patterns.
- completion threshold summary: Core lib no longer owns/exports navigation feedback; React owns the plugin; `api.navigation.refresh` is gone; focused tests/typecheck/lint/source audits pass or produce owned follow-up.

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `NavigationFeedbackPlugin` is no longer part of headless Core defaults or lib exports.
- React `NavigationFeedbackPlugin` owns active target, DOM node props, tx group, and decoration refresh.
- `editor.api.navigation.refresh` is removed instead of kept as a no-op compatibility surface.
- Source audits show no stale Core lib owner or public refresh API references.
- Focused navigation feedback tests, Core typecheck, Core lint, and barrel generation pass or any failure is recorded with owner.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-navigation-feedback-react-owner.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: React navigation-feedback specs and affected editor/plugin specs.
- package proof: `pnpm turbo typecheck --filter=./packages/core`, `pnpm --filter @platejs/core lint`.
- source audits: `rg` for `api.navigation.refresh`, lib navigation-feedback exports/defaults, and stale no-op refresh shapes.
- related Core sweep query / match count / patched count / deferred count:
  fill after code correction.
- Plite/Plate gap ledger: expected N/A unless React owner move exposes a missing primitive.
- broad Core drift ledger gate: N/A: named packet only.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-navigation-feedback-react-owner.md`

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
- allowed edit scope: Core navigation-feedback plugin files, Core/React plugin registries, affected specs, generated barrels, docs that mention the moved API.
- package/API surfaces: `@platejs/core` exports and React plugin defaults.
- docs/browser surfaces: docs only if they mention the wrong owner/API; no app/browser route work requested.
- non-goals: no broad Core cleanup, no rename pass, no Plite redesign, no legacy compat shim.
- out-of-scope package errors: non-Core package failures are recorded unless caused by this Core API cut.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if removing the headless plugin reveals a missing React/Core primitive that cannot be fixed without a public API fork.

Current verdict:
- verdict: move-to-React + hard-cut refresh API
- confidence: final 98 after focused specs, source audits, docs check, and `pnpm check:core`
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: React decoration refresh is the product/runtime owner; headless Core no-op refresh is fake API.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Accepted target captured: move NavigationFeedbackPlugin to React, remove Core headless owner, cut fake refresh API, focused proof. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned none; created this goal. |
| Mode classified as named packet vs broad Core sweep | yes | Named packet; broad Core sweep N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Verdict is React owner plus hard-cut refresh API. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested. |
| Source of truth and allowed workspace recorded | yes | Current checkout `/Users/zbeyens/git/plate-2`; target files listed in Boundaries. |
| Output budget strategy recorded | yes | Use targeted reads/searches; avoid broad manifests. |
| Public API fork routing checked | yes | No new public API fork; remove a fake public method. |
| Gap policy checked | yes | Record N/A unless implementation exposes a missing primitive. |
| Related Core sweep policy checked | yes | Required after correction. |
| Review-mode rename freeze checked | yes | No unrelated rename pass; owner move is the accepted correction. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Focused specs passed: 36 pass. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named packet, not broad Core sweep. |
| Score gate | no | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | N/A: broad score gate not requested. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | React owns navigation feedback; Core headless plugin and fake refresh API removed. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | N/A: no missing primitive after using plugin option subscription for React node props. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Source audits recorded below. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm turbo typecheck --filter=./packages/core`, `pnpm --filter @platejs/core lint`, and `pnpm check:core` passed. |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: proof commands passed. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Forbidden refresh/lib-owner audit clean; only React-owned references remain. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: accepted owner move, no unrelated rename pass. |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | New React navigation-feedback files bucketed as move-to-React. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: focused specs, docs check, source audits, and `check:core` are the review gate for this narrow packet. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-navigation-feedback-react-owner.md` | Run after this evidence update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/navigation-feedback/**` | 4 | move-to-React / hard-cut | React plugin owner | Lib folder deleted; lib index no longer exports navigation feedback. | Keep. |
| `editor.api.navigation.refresh` | 4 | hard-cut | React plugin implementation detail | Source audit has no `api.navigation.refresh` / `navigation.refresh` matches. | Keep removed. |
| `packages/core/src/react/plugins/navigation-feedback/**` | 1 | keep-in-plate | React plugin owner | Focused specs passed; node props subscribe to plugin option store. | Keep. |
| `navigationFeedback` create option | 0 | keep-in-plate | React `createPlateEditor` | React docs and tests keep the option; `withPlite` no longer accepts it. | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Navigation feedback | React-owned Plate plugin with typed API/tx, option-store reactive node props, and `editor.api.react.refreshDecorations()` as an internal implementation detail. | Headless Core plugin, no-op `api.navigation.refresh`, direct DOM mutation as the primary proof path. | Navigation highlight is visual/React behavior; Core should not own fake refresh API. | None for this packet. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None | Option-store subscription avoided the direct DOM mutation fallback. | N/A | Focused React specs and `check:core`. | Closed. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Cut fake refresh API | `rg -n "api\\.navigation\\.refresh|navigation\\.refresh|refresh:\\s*\\(\\)\\s*=>\\s*\\{\\}|clearNavigationElement|setNavigationElement|from ['\\\"]\\.\\./plugins/navigation-feedback|lib/plugins/navigation-feedback|export \\* from './navigation-feedback"` | 4 expected React import/export references, 0 forbidden matches | Removed refresh API and direct DOM helper names. | 0 | Low. |
| Remove headless Core owner | `find packages/core/src/lib -path '*navigation-feedback*' -print` and `rg -n "NavigationFeedbackPlugin|NavigationFeedbackConfig|navigationFeedback|navigation\\." packages/core/src/lib` | 0 lib folder files; 2 React spec references; 1 unrelated comment | Moved plugin/types/transforms/spec coverage to React. | 0 | Low. |

Core drift ledger:
- Applies: N/A: named packet, not broad Core sweep.
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
| N/A | 0 | N/A | N/A | Named packet only. | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Navigation feedback owner move | React plugin | Headless Core owned visual refresh and fake `navigation.refresh`. | `packages/core/src/react/plugins/navigation-feedback/**`, Core/React registries, docs. | keep | Next Plate Next packet can continue broader Core cleanup. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/react/plugins/navigation-feedback/types.ts` | move-to-React | Old owner was lib plugin; accepted owner is React plugin. | keep moved file | focused specs + `check:core` |
| `packages/core/src/react/plugins/navigation-feedback/transforms/flashTarget.ts` | move-to-React | Old owner was lib plugin; direct DOM mutation removed. | keep moved file | focused specs + source audit |
| `packages/core/src/react/plugins/navigation-feedback/transforms/navigate.ts` | move-to-React | Old owner was lib plugin; React refresh callback threaded. | keep moved file | focused specs + source audit |
| `packages/core/src/react/plugins/navigation-feedback/transforms/index.ts` | move-to-React | Barrel moved with transforms. | keep moved file | `pnpm brl` |
| `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.behavior.spec.ts` | move-to-React | Behavior coverage moved from lib spec to React editor. | keep moved spec | focused specs: 36 pass |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | No non-Core failures in proof commands. | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Moved navigation feedback plugin/types/transforms from lib Core to React; removed Core default registration and `withPlite` option; kept React `navigationFeedback` option in `createPlateEditor`; cut `api.navigation.refresh`. |
| tests/proof | Moved/ported behavior spec to React editor; updated React editor plugin-order expectations; focused specs, typecheck, lint, docs check, `pnpm brl`, and `pnpm check:core` passed. |
| docs/templates/skills | Updated navigation feedback docs wording from Core plugin to React editor defaults; created this goal plan. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Import-path break for direct lib consumers | `packages/core/src/lib/plugins/navigation-feedback` is gone by design. | React export `platejs/react` | Keep the hard cut; no compat export. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Navigation feedback React owner move | complete | Focused specs, docs check, source audits, and `pnpm check:core` passed. | Handoff. |

Findings:
- Headless Core no longer needs navigation feedback; React option-store subscription is enough to rerender default node props without direct DOM mutation.

Decisions and tradeoffs:
- Kept `navigationFeedback` as a React `createPlateEditor` option.
- Removed the old lib import path intentionally instead of adding a compat export.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm brl` -> pass.
- `pnpm --filter @platejs/core exec bun test src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.behavior.spec.ts src/lib/editor/withPlite.spec.ts` -> 36 pass.
- `pnpm turbo typecheck --filter=./packages/core` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `pnpm --filter www check:docs` -> pass.
- `pnpm check:core` -> pass; Core tests 703 pass, Plite tests 1890 pass / 85 skip.
- Source audits -> no headless lib navigation-feedback files; no `api.navigation.refresh`, `navigation.refresh`, `clearNavigationElement`, or `setNavigationElement` matches.

Final handoff contract:
- target surface and mode: named NavigationFeedbackPlugin owner packet.
- files/APIs reviewed: Core lib plugin/defaults, React plugin/defaults, moved transforms/types/specs, docs references.
- broad Core drift score coverage: N/A, not requested.
- best Plate v2 recommendation: React-owned plugin; no headless Core plugin; no public refresh method.
- verdict matrix summary: move-to-React + hard-cut refresh; no Plite/Plate gap.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: recorded above; 0 deferred.
- changes made: recorded in changed list.
- tests/proof commands: recorded in verification evidence.
- old compatibility names audited: `api.navigation.refresh`, `navigation.refresh`, old lib folder/export.
- needs attention: only direct old lib import break, accepted hard cut.
- next best Plate Next packet: continue Core cleanup on the next user-selected file/API.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Ready for handoff |
| Where am I going? | Goal completion |
| What is the goal? | Move navigation feedback to React owner and cut the fake refresh API. |
| What have I learned? | React node props need option-store subscription for highlight reactivity; direct DOM mutation is unnecessary. |
| What have I done? | Moved plugin ownership, cut refresh API, updated tests/docs, and ran focused plus Core proof. |

Timeline:
- 2026-07-02T12:30:09.362Z Goal plan created.
- Moved navigation feedback implementation from lib Core to React.
- Cut `api.navigation.refresh` and direct DOM mutation helper path.
- Ran focused specs, package proof, docs proof, source audits, and `pnpm check:core`.

Open risks:
- Direct imports from the old lib navigation-feedback path break intentionally. No compat shim added.
