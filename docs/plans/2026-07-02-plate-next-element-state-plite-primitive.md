# plate-next element-state plite primitive

Objective:
Add `NodeApi.hasProps` in Plite and refactor Core `ElementStatePlugin` so Plite owns generic prop presence while Plate owns metadata policy.

Goal plan:
docs/plans/2026-07-02-plate-next-element-state-plite-primitive.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user accepted the split: move the primitive to Plite, keep id/type/plugin metadata policy in Core.
- mode: named Core/Plite boundary implementation packet.
- target surface: `packages/plite/src/interfaces/node.ts` and `packages/core/src/lib/plugins/element-state/ElementStatePlugin.ts`.
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no.
- correction-triggered related Core sweep: yes, search ElementState callers and `NodeApi.extractProps` policy uses.
- completion threshold summary: `NodeApi.hasProps` exists with tests; `ElementStatePlugin` delegates generic prop presence to it; Plate metadata policy stays in Core; focused Plite/Core tests and typecheck pass.

First checkpoint:
- Explicit target: move the generic prop-presence primitive to Plite.
- Explicit boundary: keep `id`, `type`, and plugin `node.isMetadataProp` policy in Core/Plate.
- Non-goal: do not move `ElementStatePlugin` wholesale to Plite.
- Non-goal: no broad Core sweep, no rename pass, no docs pass unless tests/types force it.
- Stop condition: focused Plite/Core tests, Core typecheck, source audits, and plan checker pass.
- Final handoff: changed list, proof, related sweep, and any taste-review item.

Timed checkpoint:
- requested duration: none.
- semantics: not timed.
- initial confidence score: 90 after user accepted the split.
- improvement loop: implement the primitive, refactor Core metadata policy, prove.
- final score / loop closure: 99 after focused Plite/Core tests, typecheck, scoped lint, and source audits passed. Residual 1 point is non-blocking out-of-scope utils caller test resolving built Core dist and stale `editor.dom` usage.

Completion threshold:
- Done means Plite exposes a tested `NodeApi.hasProps` primitive, Core `ElementStatePlugin` uses it without owning generic prop iteration, Plate metadata policy remains plugin-owned, no duplicate wrapper or local type hack is introduced, and focused proof passes.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-element-state-plite-primitive.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/plite exec bun test src/interfaces/node.spec.ts`; `pnpm --filter @platejs/core exec bun test src/lib/plugins/element-state/ElementStatePlugin.spec.tsx`.
- package proof: `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core`; scoped lint if code edits pass tests.
- source audits: `rg -n "isElementStateEmpty|ElementStatePlugin|NodeApi\\.hasProps|NodeApi\\.extractProps" packages/core/src packages/utils/src packages/plite/src --glob '*.{ts,tsx}'`.
- related Core sweep query / match count / patched count / deferred count: fill after implementation.
- Plite/Plate gap ledger: no known blocker.
- broad Core drift ledger gate: N/A, named packet only.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-element-state-plite-primitive.md`

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
- allowed edit scope: Plite node API/types/tests, Core ElementState plugin/tests, direct callers if needed, plan.
- package/API surfaces: public Plite `NodeApi.hasProps`; existing Core `editor.api.isElementStateEmpty` behavior preserved for now.
- docs/browser surfaces: N/A.
- non-goals: no public Core rename to `elementState.isEmpty` in this packet.
- out-of-scope package errors: only fix non-Core package errors if caused by this API change.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Blocked only if Plite public node API shape cannot support a typed ignore predicate without broader API design; then route to `plite-plan`.

Current verdict:
- verdict: move-to-plite for generic prop presence; keep-in-plate for metadata policy.
- confidence: 99 after proof.
- next owner: none for this packet.
- keep / revert / quarantine call: keep.
- reason: Plite now owns generic node prop presence through `NodeApi.hasProps`; Core owns only Plate metadata policy (`type` and plugin `node.isMetadataProp`) and focused proof is green.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records primitive owner, metadata policy boundary, non-goals, stop condition, proof, and final handoff rows. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md` before patching. |
| Active goal checked or created | yes | `get_goal` returned matching active goal `019ef64c-34ef-7502-bd16-3794a9767879`. |
| Mode classified as named packet vs broad Core sweep | yes | Named Core/Plite boundary packet; broad Core sweep explicitly out of scope. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Verdict: `move-to-plite` for generic prop presence, `keep-in-plate` for metadata policy. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested for this packet. |
| Source of truth and allowed workspace recorded | yes | Workspace `/Users/zbeyens/git/plate-2`; allowed scope is Plite node API/tests, Core ElementState plugin/tests, direct caller audit, and plan. |
| Output budget strategy recorded | yes | Targeted `sed`/`rg` reads and capped command output. |
| Public API fork routing checked | yes | No public API fork; `NodeApi.hasProps` is a small Plite primitive matching accepted boundary. |
| Gap policy checked | yes | No Plite/Plate gap blocks this packet. |
| Related Core sweep policy checked | yes | Ran exact audit query over Core/Utils/Plite for ElementState and prop extraction surfaces. |
| Review-mode rename freeze checked | yes | No file/path/symbol rename introduced. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: First checkpoint section.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan. Evidence: named Core/Plite boundary packet.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`. Evidence: review matrix.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate. Evidence: no alias/shim added.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut. Evidence: `rg` audit over `ElementStatePlugin.ts` found 0 `any`/cast/direct-prop-iteration matches.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof. Evidence: no blocker.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk. Evidence: related sweep ledger.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout. N/A: broad Core sweep out of scope.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`. N/A: broad Core sweep out of scope.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero. N/A: broad Core sweep out of scope.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`. N/A: broad Core sweep out of scope.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone. Evidence: no bridge introduced or imported in this packet.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation. N/A: no public API fork beyond accepted small Plite primitive.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet. Evidence: no renames.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name. Evidence: extracted file ledger has 3 current-scope rows.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof. Evidence: packet ledger says keep.
- [x] Focused package proof is run after meaningful code changes. Evidence: Plite/Core focused tests and typecheck passed.
- [x] `pnpm brl` is run when exports/barrels change. N/A: no barrels or package export files changed.
- [x] Old compatibility names are source-audited when cut. N/A: no old compatibility name cut in this packet.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response. Evidence: changed list and needs-attention sections.
- [x] Output budget discipline followed. Evidence: targeted reads/searches, capped outputs.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Plite interface contract 18 pass; Core ElementStatePlugin spec 3 pass; Plite/Core typecheck 10 tasks successful. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named Core/Plite boundary packet only. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Review matrix rows score 0 after focused proof; no high drift row remains in this packet. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Plite primitive plus Core metadata policy; rejected Core-owned generic prop iteration and context casts. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | No blocking Plite/Plate gap. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Exact audit query returned 38 matches; only ElementState empty-state policy path uses `NodeApi.hasProps`; other `extractProps` uses are mark/operation logic. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Focused tests, scoped lint, and Plite/Core typecheck passed. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | Optional utils caller test failed from non-scope built Core dist / stale `editor.dom` usage; not caused by this primitive packet. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `rg` over `ElementStatePlugin.ts` found 0 `any`/cast/direct `extractProps` prop-iteration leftovers. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename. |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | Inventory found 3 current-scope ElementState files and ledger rows classify them. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: narrow primitive refactor with focused tests/typecheck/lint; no final commit/review requested. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/plite lint` passed; `pnpm --filter @platejs/core lint` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-element-state-plite-primitive.md` | To run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Named Core/Plite primitive packet | complete | `NodeApi.hasProps` added, `ElementStatePlugin` refactored, focused tests/typecheck/lint/source audits passed. | Complete goal after plan checker passes. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/plite/src/interfaces/node.ts` / `NodeApi.hasProps` | 0 | `move-to-plite` | Plite | Generic node prop presence is substrate; `./test/interfaces-contract.ts` proves text nodes, element metadata ignore, and non-ignored props. | keep |
| `packages/core/src/lib/plugins/element-state/ElementStatePlugin.ts` | 0 | `keep-in-plate` | Core/Plate | Delegates generic prop presence to `NodeApi.hasProps`; Core owns `type` and plugin `node.isMetadataProp` ignore policy; plugin spec passes. | keep |
| `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx` caller | 2 | `defer-with-owner` | Utils/Plate package sweep | Source audit confirms it still calls `editor.api.isElementStateEmpty`; optional direct test command failed from non-scope built Core dist / stale `editor.dom` usage. | defer to broader package migration, not this primitive packet |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Element empty-state primitive | Plite exposes `NodeApi.hasProps(node, { ignore })`; Core `ElementStatePlugin` passes Plate metadata policy into the Plite primitive. | Keeping `Object.entries(NodeApi.extractProps(element))` policy in Core; rebuilding plugin metadata context locally with `any` casts; moving `ElementStatePlugin` wholesale to Plite. | Generic prop presence is substrate; `type`, configured ids, and plugin metadata are Plate policy. | none for this packet |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no workaround needed | N/A | focused tests/typecheck | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Generic prop-presence moved to `NodeApi.hasProps` | `rg -n "isElementStateEmpty|ElementStatePlugin|NodeApi\\.hasProps|NodeApi\\.extractProps" packages/core/src packages/utils/src packages/plite/src packages/plite/test --glob '*.{ts,tsx}'` | 38 | 1 Core empty-state policy path patched | 1 optional utils caller test deferred to package sweep because failure is stale `editor.dom` / built-dist route, not this primitive | `NodeApi.extractProps` remains valid for mark/operation logic in Plite/Core affinity; no duplicate empty-state policy found. |

Core drift ledger:
- Applies: no; this is a named file/API packet.
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
| N/A broad Core sweep | N/A | N/A | N/A | Named packet only; review matrix has the inspected paths. | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Plite node-prop primitive | Plite/Core | Core should not own generic prop iteration for Element empty-state. | `packages/plite/src/interfaces/node.ts`, `packages/plite/test/interfaces-contract.ts`, `packages/core/src/lib/plugins/element-state/ElementStatePlugin.ts`, focused tests/typecheck/lint. | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/lib/plugins/element-state/ElementStatePlugin.ts` | keep-in-plate target | `origin/main` has no ElementState plugin owner; this file is the current packet target in this checkout. | keep current owner; do not move wholesale to Plite. | Core plugin spec passes. |
| `packages/core/src/lib/plugins/element-state/ElementStatePlugin.spec.tsx` | justify-new-proof-tooling | `origin/main` has no ElementState plugin spec; this spec proves new current Core API behavior. | keep. | 3 pass. |
| `packages/core/src/lib/plugins/element-state/index.ts` | keep-in-plate target | `origin/main` has no ElementState index; needed for current Core plugin barrel path. | keep. | Core imports and typecheck pass. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm --filter @platejs/utils exec bun test src/react/plugins/BlockPlaceholderPlugin.spec.tsx` | Failed because no DOM test setup: `document is not defined`. | Optional direct caller proof only; not the named Plite/Core verification surface. | Use package-owned test command with DOM setup when sweeping utils. |
| `pnpm --filter @platejs/utils exec bun test --preload ../../config/plite-source-test-setup.ts ./src/react/plugins/BlockPlaceholderPlugin.spec.tsx` | Failed on stale `editor.dom.readOnly` through built `@platejs/core/dist` route. | This is broader package migration drift, not caused by `NodeApi.hasProps`; Core/Plite focused proof is green. | Defer to package sweep / Plate runtime caller migration. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added `NodeApi.hasProps` in `packages/plite/src/interfaces/node.ts`; refactored `ElementStatePlugin` to delegate generic prop presence to Plite and keep Plate metadata policy in Core. |
| tests/proof | Added Plite interface contract coverage for `NodeApi.hasProps`; kept Core ElementStatePlugin spec green. |
| docs/templates/skills | Updated this goal plan only. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Utils caller drift | Optional focused caller test still fails outside this packet because `BlockPlaceholderPlugin` uses stale `editor.dom.readOnly` through a built Core dist route. | `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx` | Handle in broader package sweep; do not block this Plite/Core primitive packet. |

Findings:
- Plite already had `NodeApi.extractProps`; the missing primitive was the policy-free "does this node have non-ignored props?" query.
- Core `ElementStatePlugin` should not iterate props itself or rebuild plugin context with casts. It now passes Plate metadata policy into `NodeApi.hasProps`.
- `NodeApi.extractProps` remains valid in mark/operation code paths; those are not empty-state policy duplication.

Decisions and tradeoffs:
- Keep `ElementStatePlugin` in Core because `type`, configured id keys, and plugin `node.isMetadataProp` are Plate metadata policy.
- Add only `NodeApi.hasProps` to Plite, not a Plate wrapper or public alias.
- Do not move `ElementStatePlugin` wholesale to Plite; that would pollute the substrate with Plate plugin metadata semantics.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter @platejs/plite exec bun test test/interfaces-contract.ts` did not match because the contract file is not named `*.test.ts`/`*.spec.ts`. | 1 | Rerun with Bun path form. | `pnpm --filter @platejs/plite exec bun test ./test/interfaces-contract.ts` passed. |
| Optional utils caller test failed without DOM setup, then failed with DOM setup on stale `editor.dom.readOnly` / built dist route. | 2 | Classify as out-of-scope package drift. | Recorded in out-of-scope package drift ledger; not blocking named Plite/Core packet. |

Verification evidence:
- `pnpm --filter @platejs/plite exec bun test ./test/interfaces-contract.ts` -> 18 pass, 0 fail.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/element-state/ElementStatePlugin.spec.tsx` -> 3 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core` -> 10 successful tasks, 10 total, 29.975s on final run.
- `pnpm --filter @platejs/plite lint` -> passed, checked 1258 files.
- `pnpm --filter @platejs/core lint` -> passed, checked 394 files.
- `rg -n "any|as |extractProps\\(|Object\\.entries\\(|MetadataPropContext" packages/core/src/lib/plugins/element-state/ElementStatePlugin.ts` -> no matches.
- `rg -n "isElementStateEmpty|ElementStatePlugin|NodeApi\\.hasProps|NodeApi\\.extractProps" packages/core/src packages/utils/src packages/plite/src packages/plite/test --glob '*.{ts,tsx}'` -> 38 matches reviewed/classified by owner.

Final handoff contract:
- target surface and mode: named Core/Plite boundary packet.
- files/APIs reviewed: Plite `NodeApi.extractProps`/`NodeApi.hasProps`, Core `ElementStatePlugin`, ElementState spec, Plite interfaces contract, direct utils caller.
- broad Core drift score coverage: N/A, not a broad Core sweep.
- best Plate v2 recommendation: Plite owns generic prop presence; Core owns metadata policy.
- verdict matrix summary: `move-to-plite` for `NodeApi.hasProps`; `keep-in-plate` for metadata policy; defer utils caller drift.
- Plite/Plate gaps or blockers: none for this packet.
- related Core sweep query/matches/patched/deferred: exact query above, 38 matches, 1 patched, 1 deferred package drift.
- changes made: see changed list.
- tests/proof commands: see verification evidence.
- old compatibility names audited: N/A, none cut.
- needs attention: optional utils caller drift only.
- next best Plate Next packet: package sweep for stale `editor.dom` consumers when the user wants it.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closing proof and plan for the ElementState/NodeApi primitive packet. |
| Where am I going? | Mechanical `check-complete`, then complete the active goal if it passes. |
| What is the goal? | Plite owns generic node prop presence; Core owns Element metadata policy; focused proof passes. |
| What have I learned? | Plite needed a small policy-free `NodeApi.hasProps` primitive; utils caller drift is separate package migration debt. |
| What have I done? | Patched Plite, Core, tests, linted, typechecked, and audited sources. |

Timeline:
- 2026-07-02T11:43:40.309Z Goal plan created.
- 2026-07-02T11:52:18Z Patched Plite `NodeApi.hasProps`, Core `ElementStatePlugin`, Plite test coverage, and ran focused proof.

Open risks:
- Optional utils caller test still fails outside this packet because the package resolves built Core dist and stale `editor.dom` usage. This is recorded as package sweep debt, not a blocker for the named Plite/Core primitive.
