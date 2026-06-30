# resolve-plugins-shortcut-bridge-review

Objective:
Review resolvePlugins shortcut tx fallback and plugin API cleanup without legacy transform bridge.

Goal plan:
docs/plans/2026-06-29-resolve-plugins-shortcut-bridge-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked to review `packages/core/src/internal/plugin/resolvePlugins.ts` shortcut tx bridge and make sure no regression.
- mode: named file/API review packet.
- target surface: `resolvePlugins.ts` shortcut fallback and plugin API extension cleanup.
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: user named one file/API snippet, not broad Core.
- correction-triggered related Core sweep: exact source audit for old shortcut/transform bridge names in touched Core files.
- completion threshold summary: focused shortcut/API regression tests pass, old fake tx bridge names gone, `pnpm check:core` passes.

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A: scoped named-file packet
- semantics: N/A: scoped named-file packet
- initial confidence score: N/A: scoped named-file packet
- improvement loop: N/A: scoped named-file packet
- final score / loop closure: N/A: scoped named-file packet

Completion threshold:
- Scoped done state: old shortcut bridge removed or justified, regression tests added, focused tests and check:core pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-resolve-plugins-shortcut-bridge-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test src/internal/plugin/resolvePlugins.spec.tsx src/lib/plugin/createBasePlugin.spec.ts` -> 59 pass.
- package proof: `pnpm check:core` -> pass.
- source audits: `rg` for `RuntimeShortcutTransaction|runPluginShortcutTx|pluginSpecificTransforms|editor\.transforms|editor\.tf|getTransforms|extendTransforms` in touched files -> no matches.
- related Core sweep query / match count / patched count / deferred count:
  old shortcut/transform bridge audit in touched files -> 0 matches after patch.
- Plite/Plate gap ledger: no blocking gap; dynamic tx command lookup still needs a runtime lookup because tx group commands are runtime-provided.
- broad Core drift ledger gate: N/A: user requested one file/API review.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-resolve-plugins-shortcut-bridge-review.md`

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
- allowed edit scope: `resolvePlugins.ts`, shortcut regression tests, and the `createBasePlugin` tx metadata needed to distinguish own tx groups from foreign groups.
- package/API surfaces: Core internal plugin resolver and BasePlugin tx extension metadata only.
- docs/browser surfaces: N/A: no docs or browser surface changed.
- non-goals: broad Core sweep, rename pass, public API redesign, non-Core package migration.
- out-of-scope package errors: none; `pnpm check:core` passed.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Block only if Core proof fails from unrelated package drift that cannot be separated from this packet. Not hit.

Current verdict:
- verdict: main-parity-cleanup.
- confidence: high for scoped file; Core gate passed.
- next owner: plate-next
- keep / revert / quarantine call: keep.
- reason: preserves tx-backed shortcuts, restores API fallback behavior, avoids fake broad transaction bridge, and proves rerun cleanup.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | user target copied: `resolvePlugins.ts` shortcut bridge, no regression. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read before source edits. |
| Active goal checked or created | yes | `get_goal` returned none; goal created for this packet. |
| Mode classified as named packet vs broad Core sweep | yes | named file/API packet. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | current verdict rejects legacy transform bridge and fake tx record. |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | `origin/main` version, current file, tests, and direct shortcut consumers inspected. |
| Output budget strategy recorded | yes | targeted `sed`, `git diff/show`, and scoped `rg`; no broad output stream. |
| Public API fork routing checked | yes | no public API fork; internal metadata only. |
| Gap policy checked | yes | no blocking Plite/Plate gap. |
| Related Core sweep policy checked | yes | exact old-name audit and direct shortcut consumer search run. |
| Review-mode rename freeze checked | yes | no renames. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Focused tests passed; `pnpm check:core` passed. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: user requested one file/API snippet. |
| Score gate | no | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | N/A: no broad score gate. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Keep tx fallback but make it own-group-aware; reject fake transaction record and legacy transform fallback. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | No blocker; runtime lookup is inherent to dynamic shortcut names. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Old-name audit in touched files -> 0 matches. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm check:core` passed. |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: no non-Core failures. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Old bridge/legacy names audit -> 0 matches. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no renames. |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no extracted files in this packet. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: scoped packet with `check:core`; no separate autoreview requested. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Changed list and needs-attention rows filled. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-resolve-plugins-shortcut-bridge-review.md` | To run after this update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/internal/plugin/resolvePlugins.ts` shortcut tx fallback | 2 | main-parity-cleanup | Plate plugin resolver | main used plugin-specific transform/API fallback; migrated code used fake broad tx record and over-broad `__txExtensions.length` | kept tx-backed shortcut behavior, removed fake record, added no-match/API fallback proof |
| `packages/core/src/internal/plugin/resolvePlugins.ts` plugin API cleanup | 2 | main-parity-cleanup | Plate plugin resolver | plugin API install uses Plite extension cleanup; plugin objects are cloned during resolve | cleanup now scoped by editor + plugin key |
| `packages/core/src/lib/plugin/createBasePlugin.ts` tx extension metadata | 1 | keep-in-plate | BasePlugin tx extension builder | needed to distinguish own plugin tx groups from foreign tx groups without invoking factories early | keep internal metadata; no public API change |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| shortcut fallback | `shortcutName` may call same-name own plugin tx command; if absent, fallback to same-name plugin API; if neither exists return `false` | legacy `plugin.transforms`, broad `Record<string, Record<string, fn>>`, treating foreign tx groups as own commands | preserves keyboard mark shortcuts while avoiding silent no-op/preventDefault regressions | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | none | no gap blocked this packet | Plate plugin resolver | focused tests + `check:core` | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| removed shortcut bridge / transform fallback | `rg -n "RuntimeShortcutTransaction|runPluginShortcutTx|pluginSpecificTransforms|editor\\.transforms|editor\\.tf|getTransforms|extendTransforms" packages/core/src/internal/plugin/resolvePlugins.ts packages/core/src/internal/plugin/resolvePlugins.spec.tsx packages/core/src/lib/plugin/createBasePlugin.ts` | 0 after patch | 3 touched files reviewed | 0 | no same-class smell left in touched scope |

Core drift ledger:
- Applies: N/A: scoped named-file packet
- Manifest command: N/A: scoped named-file packet
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A: scoped named-file packet
- Actual row count: N/A: scoped named-file packet
- Missing row count: N/A: scoped named-file packet
- Extra row count: N/A: scoped named-file packet
- Score gate: N/A: scoped named-file packet
- Top drift rows: N/A: scoped named-file packet

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A: scoped named-file packet | N/A: scoped named-file packet | N/A: scoped named-file packet | N/A: scoped named-file packet | N/A: scoped named-file packet | N/A: scoped named-file packet |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| shortcut bridge cleanup | Plate plugin resolver | fake tx record and broad tx-extension fallback can hide no-op shortcuts | `resolvePlugins.ts`, `resolvePlugins.spec.tsx`, `createBasePlugin.ts`; focused tests; `check:core` | keep | next review packet from user |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A: scoped named-file packet | N/A: scoped named-file packet | N/A: scoped named-file packet | N/A: scoped named-file packet | N/A: scoped named-file packet |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A: scoped named-file packet | N/A: scoped named-file packet | N/A: scoped named-file packet | N/A: scoped named-file packet |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `resolvePlugins.ts`: editor-keyed plugin API cleanup; own-plugin tx shortcut handler; no fake runtime tx record. `createBasePlugin.ts`: internal metadata marks own vs named tx groups. |
| tests/proof | `resolvePlugins.spec.tsx`: tx shortcut, API fallback when tx misses, no preventDefault on missing command, foreign tx group guard, API cleanup rerun regression. |
| docs/templates/skills | this goal plan only. |
| reverted/quarantined packets | none. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | internal tx metadata | It is internal but newly added to extension functions. | `createBasePlugin.ts` lines 329-351 | Accept: it avoids invoking tx factories early and prevents foreign tx groups from becoming shortcut commands. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| scoped resolvePlugins shortcut review | complete | focused tests passed; `pnpm check:core` passed | final handoff |

Findings:
- Main used plugin-specific transforms/API for implicit shortcut handlers.
- Migrated code must use tx instead of transforms, but the broad `RuntimeShortcutTransaction` hid missing command cases.
- Plugin API extension cleanup must be keyed by editor/plugin key, not plugin object, because resolved plugins are cloned.

Decisions and tradeoffs:
- Kept tx-backed shortcuts because mark plugins depend on `shortcuts.toggle` -> `tx.<plugin>.toggle`.
- Added internal metadata rather than evaluating tx group factories during shortcut resolution.
- Returned `false` when no tx/API command matches so hotkeys do not prevent default for a no-op handler.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- pnpm --filter @platejs/core exec bun test src/internal/plugin/resolvePlugins.spec.tsx src/lib/plugin/createBasePlugin.spec.ts -> 59 pass.
- pnpm check:core -> pass: Core+Plite typecheck, lint, Core tests, Plite tests.
- rg audit for RuntimeShortcutTransaction|runPluginShortcutTx|pluginSpecificTransforms|editor\.transforms|editor\.tf|getTransforms|extendTransforms in touched files -> no matches.

Final handoff contract:
- target surface and mode: named `resolvePlugins.ts` review packet.
- files/APIs reviewed: `resolvePlugins.ts`, `resolvePlugins.spec.tsx`, `createBasePlugin.ts` tx extension metadata.
- broad Core drift score coverage: N/A: not requested.
- best Plate v2 recommendation: keep tx-backed shortcut fallback, but own-group-aware and API fallback safe.
- verdict matrix summary: main-parity-cleanup; no Plite gap.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: old bridge/legacy-name audit -> 0 matches after patch.
- changes made: runtime shortcut cleanup, API cleanup owner fix, regression tests.
- tests/proof commands: focused tests and `pnpm check:core`.
- old compatibility names audited: `RuntimeShortcutTransaction`, `runPluginShortcutTx`, `pluginSpecificTransforms`, `editor.transforms`, `editor.tf`, `getTransforms`, `extendTransforms`.
- needs attention: internal tx metadata accepted unless you prefer a different metadata name.
- next best Plate Next packet: continue user-led file review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Closing scoped Plate Next packet |
| What is the goal? | Review resolvePlugins shortcut bridge and prove no regression |
| What have I learned? | Fake tx bridge was hiding missing-command behavior; cleanup map was keyed too weakly. |
| What have I done? | Patched runtime, added regression tests, ran focused tests and `check:core`. |

Timeline:
- 2026-06-29T10:01:17.123Z Goal plan created.
- 2026-06-29 resolvePlugins/main/test source read completed.
- 2026-06-29 patched shortcut tx fallback and plugin API cleanup.
- 2026-06-29 focused tests passed.
- 2026-06-29 `pnpm check:core` passed.

Open risks:
- None for this scoped packet.
