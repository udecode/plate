# plate-next createBasePlugin drift review

Objective:
Deep-review `packages/core/src/lib/plugin/createBasePlugin.ts` against the main-branch `createSlatePlugin.ts` owner, fix safe drift, and prove the named-file packet.

Goal plan:
docs/plans/2026-07-03-plate-next-createbaseplugin-drift-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked whether `packages/core/src/lib/plugin/createBasePlugin.ts`
  has zero drift regression vs main and is fully clean under `plate-next`
- mode: named file/API drift review
- target surface: `packages/core/src/lib/plugin/createBasePlugin.ts`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no, user named one file
- correction-triggered related Core sweep: yes, only for same-class smells
  introduced or touched by this packet
- completion threshold summary: source map to `origin/main` owner, review
  accepted Plite-era cuts, patch any concrete local regression/smell, run
  focused Core proof, close plan.

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
- initial confidence score: 85 before patch; main behavior mostly preserved,
  but keyed editor-extension normalization had an untested symbol-property
  drop risk.
- improvement loop: patch only concrete named-file drift; no broad sweep.
- final score / loop closure: 98 after proof; closed as named-file packet

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Named `createBasePlugin` drift review | done | source map, patch, focused tests, typecheck, lint |

Completion threshold:
- Named packet is done when `createBasePlugin.ts` has a source-backed verdict
  against `origin/main:packages/core/src/lib/plugin/createSlatePlugin.ts`, no
  concrete regression remains in the reviewed file, focused tests/typecheck
  pass, and same-class sweeps are recorded.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-createbaseplugin-drift-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts src/lib/plugin/createBasePlugin.typed.spec.ts`
- package proof: `pnpm --filter @platejs/core typecheck`
- source audits: `rg -n "Object\\.fromEntries|CreateBasePluginInput|extendExtension|__editorExtensions" packages/core/src/lib/plugin packages/core/type-tests packages/core/src/lib/editor/withPlite.ts packages/core/src/internal/plugin/resolvePlugins.ts`
- related Core sweep query / match count / patched count / deferred count:
  pending after correction
- Plite/Plate gap ledger: N/A unless proof exposes a missing Plite extension
  capability
- broad Core drift ledger gate: N/A, named-file packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-createbaseplugin-drift-review.md`

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
- allowed edit scope: `createBasePlugin.ts`, its focused specs/type tests, and
  this plan
- package/API surfaces: Core plugin creation and Plite editor-extension bridge
  only
- docs/browser surfaces: N/A
- non-goals: broad Core cleanup, rename pass, Plate package sweep, public API
  redesign
- out-of-scope package errors: non-Core package failures unless they prove a
  Core public API regression

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- None currently.

Current verdict:
- verdict: keep after patch; not literal zero drift, but no known regression vs
  main-owner behavior
- confidence: 98
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: current file intentionally replaces main `createSlatePlugin.ts` with
  `createBasePlugin`, cuts legacy transform/override surfaces, and adds Plite
  extension/tx support. One real normalization bug was fixed.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | target file, no broad sweep, proof/final handoff captured above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read before review |
| Active goal checked or created | yes | this plan created from `plate-next` template |
| Mode classified as named packet vs broad Core sweep | yes | named file/API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | target surface recorded above |
| Broad Core drift ledger initialized when in scope | N/A | broad Core sweep not in scope |
| Source of truth and allowed workspace recorded | yes | current checkout plus `origin/main:createSlatePlugin.ts` |
| Output budget strategy recorded | yes | targeted reads and capped rg output |
| Public API fork routing checked | yes | no public API fork planned unless proof exposes one |
| Gap policy checked | yes | no local workaround if Plite gap appears |
| Related Core sweep policy checked | yes | same-class sweep required after correction |
| Review-mode rename freeze checked | yes | no rename pass in this packet |

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
| Named verification threshold | yes | Run the proof commands named in this plan | focused tests, typecheck, and lint passed |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | named-file packet, broad Core sweep not requested |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | `createBasePlugin.ts` scored 96 after patch |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | keep `createBasePlugin` as Plite-aware successor; do not restore legacy transforms/override |
| Plite/Plate gap ledger | N/A | Record blockers or N/A when no gap blocks the target | no Plite/Plate gap found |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | `Object.fromEntries` audit shows no remaining extension-normalization copy |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm --filter @platejs/core typecheck` passed |
| Non-Core package error triage | N/A | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no non-Core command run and no non-Core failure |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `rg` found no old transform/override names in `createBasePlugin.ts` |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no rename performed |
| Extracted-file inventory | N/A | Record untracked/extracted file command, row count, and bucket for every file in scope | no extracted file in this named packet |
| Autoreview / review | N/A | Run review gate for non-trivial implementation diffs or record N/A | self-review plus focused proof; full autoreview not needed for two-line runtime fix plus test |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/core lint` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-createbaseplugin-drift-review.md` | passed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugin/createBasePlugin.ts` | 98 | keep after patch | Core plugin factory | source-mapped to `origin/main:packages/core/src/lib/plugin/createSlatePlugin.ts`; focused proof green | no broad cleanup in this packet |
| `normalizePlateEditorExtensions` | 2 before, 0 after | patched | Core plugin factory / Plite extension bridge | `Object.entries` key stripping could drop symbol properties; replaced with object rest helper and added regression test | keep |
| legacy transform/override surfaces | 0 | cut accepted | Plate Next | `extendEditorTransforms`, `extendTransforms`, `overrideEditor`, and `transforms` defaults stay out of `createBasePlugin.ts` | no compat alias |
| Plite editor extensions / tx groups | 1 | keep | Core plugin factory | `extendExtension`, `extendTx`, `extendTxGroup`, metadata consumed by `resolvePlugins.ts` | keep |
| `CreateBasePluginInput` | 0 | made private | Core plugin factory | no external usage; internal test helper now derives from `createBasePlugin` parameter type | keep private |
| `preserveExtensionArrays` | 0 | typed cleanup | Core plugin factory | changed from broad `any` signature to `ExtensionArrayRecord` + generic return | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `createBasePlugin` | Keep as the Plite-aware successor to main `createSlatePlugin` | Do not restore `createTSlatePlugin`, `extendTransforms`, `overrideEditor`, old `transforms`, or raw `extensions` config | Plate plugins should infer `api`/`tx`/state through `createBasePlugin`, while Plite editor extensions install through `extendExtension` | Low: review only if you want to challenge the public `CreateBasePluginInput` type name |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none found | N/A | N/A | focused Core proof | no gap |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| symbol-preserving keyed extension normalization | `rg -n "Object\\.fromEntries|CreateBasePluginInput|preserveExtensionArrays|extendExtension|__editorExtensions|Symbol\\.for\\('plate\\.core\\.implicitExtensionName'\\)" packages/core/src/lib/plugin packages/core/type-tests packages/core/src/lib/editor/withPlite.ts packages/core/src/internal/plugin/resolvePlugins.ts` | `Object.fromEntries` remains only in `resolvePlugins.ts` plugin maps; extension-normalization copy removed | 1 | 0 | duplicate implicit-marker helpers between `createBasePlugin.ts` and `withPlite.ts` are tolerable for now; not a named-file regression |

Core drift ledger:
- Applies: no
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
| `packages/core/src/lib/plugin/createBasePlugin.ts` | 98 | keep after patch | Core plugin factory | focused review/proof only | no broad claim |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| keyed extension symbol preservation | Core plugin factory | stripping `key` with `Object.entries` loses symbol properties | `createBasePlugin.ts`, `createBasePlugin.spec.ts`; focused test/typecheck/lint | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | no extracted file in this packet | N/A | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no out-of-scope command failure | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `createBasePlugin.ts` uses symbol-preserving `key` omission for editor extensions and casts `configurePlugin` to its real method type instead of `any` |
| tests/proof | `createBasePlugin.spec.ts` covers symbol preservation for keyed editor extensions; `resolveCreatePluginTest.ts` no longer imports a public helper type |
| docs/templates/skills | autogoal plan updated |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Overloaded factory internals still use `any` | This is the dynamic implementation boundary behind typed overloads; removing it cleanly is a factory redesign, not a named-file drift patch | `packages/core/src/lib/plugin/createBasePlugin.ts` | keep for now; revisit only with a plugin-factory typing redesign |

Findings:
- `createBasePlugin.ts` is not a literal zero-drift file; it is the accepted
  Plite-aware successor to main `createSlatePlugin.ts`.
- Main behavior preserved in scope: function config, configure/configurePlugin,
  extend/extendPlugin, nested plugin updates, node leaf decoration default, and
  withComponent.
- Accepted cuts: old transform/override surfaces are gone.
- Fixed drift: keyed editor-extension normalization no longer drops symbol
  properties while removing the public `key` field.
- Removed public type leak: `CreateBasePluginInput` is local to the factory and
  internal test plumbing derives from the factory signature.
- Tightened `preserveExtensionArrays` from broad `any` to an extension-array
  record while preserving return type.

Decisions and tradeoffs:
- Keep `extendExtension`, `extendTx`, and `extendTxGroup`; they are the right
  Plite-era replacement for old `transforms`/override plugin wiring.
- Do not broaden into a rename or full Core sweep from this named-file prompt.
- Keep remaining implementation `any` boundaries for now; they are inside the
  overloaded dynamic plugin factory, not callback inference loss.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts src/lib/plugin/createBasePlugin.typed.spec.ts` -> 24 pass, 0 fail.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- Source audit: no `Object.fromEntries` remains in `createBasePlugin.ts`; old
  transform/override names are not present in that file.
- Extracted-file inventory for `packages/core/src/lib/plugin`,
  `packages/core/src/internal/plugin`, and `packages/core/type-tests` in this
  packet -> no untracked files.

Final handoff contract:
- target surface and mode: named-file drift review for `createBasePlugin.ts`
- files/APIs reviewed: `createBasePlugin.ts`, `createBasePlugin.spec.ts`,
  `createBasePlugin.typed.spec.ts`, main `createSlatePlugin.ts`, focused
  BasePlugin/withPlite/resolvePlugins/type-test context
- broad Core drift score coverage: N/A
- best Plate v2 recommendation: keep `createBasePlugin` with accepted Plite
  extension/tx additions and no legacy transform/override aliases
- verdict matrix summary: score 98, keep after patch
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: recorded above
- changes made: symbol-preserving extension-key omission, private
  `CreateBasePluginInput`, typed `preserveExtensionArrays`, tighter
  `configurePlugin` method cast, internal test-helper cleanup, focused
  regression test
- tests/proof commands: focused tests, Core typecheck, Core lint
- old compatibility names audited: yes, in target file
- needs attention: only whether you want a later factory-implementation typing
  redesign to eliminate the remaining internal `any`
- next best Plate Next packet: review another named Core file; do not infer a
  broad sweep from this run

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closed named-file packet |
| Where am I going? | Final handoff |
| What is the goal? | Prove `createBasePlugin.ts` clean enough against main-owner behavior |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-03T15:00:01.007Z Goal plan created.
- 2026-07-03T15:05Z Mapped main owner to `createSlatePlugin.ts`; reviewed
  current file/spec/type-test context.
- 2026-07-03T15:10Z Patched keyed extension normalization and added focused
  regression test.
- 2026-07-03T15:15Z Focused tests, typecheck, and lint passed.
- 2026-07-03T15:25Z Rechecked after repeated review request; made
  `CreateBasePluginInput` private, tightened `preserveExtensionArrays`, updated
  internal test helper, and reran focused proof.

Open risks:
- None blocking. Residual aesthetic debt: implementation-level `any` remains in
  the overloaded plugin factory, matching the dynamic nature of this owner.
