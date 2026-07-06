# plate-next react plugin drift repair

Objective:
Repair drift in four Core React plugin files so they stay main-parity where possible and Plite-native where required.

Goal plan:
docs/plans/2026-07-04-plate-next-react-plugin-drift-repair.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user invoked `$plate-next` and asked to "repair any drift" in four named files.
- mode: named file/API packet, not broad Core sweep.
- target surface:
  - `packages/core/src/react/plugin/getEditorPlugin.ts`
  - `packages/core/src/react/plugin/getPlugin.ts`
  - `packages/core/src/react/plugin/PlatePlugin.ts`
  - `packages/core/src/react/plugin/toPlatePlugin.ts`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; the user named four files.
- correction-triggered related Core sweep: yes, for symbols/patterns corrected in these files.
- completion threshold summary: four files reviewed against `origin/main`, obvious drift repaired, same-class Core sweep recorded, focused Core proof passes or blocker is classified.

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A
- semantics: no timed checkpoint requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Done when the four named files have a review matrix verdict, main-parity drift is repaired, Plite-native hard cuts stay intentional, same-class searches are recorded, extracted-file inventory for `packages/core/src/react/plugin` is closed, and focused Core proof passes.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-react-plugin-drift-repair.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands:
  - `pnpm turbo typecheck --filter=./packages/core`
  - targeted `bun test` or `tsc` if the typecheck exposes a narrower owner.
- package proof: Core-only target; prefer Core proof.
- source audits:
  - `git diff origin/main -- <four files>`
  - `git ls-files --others --exclude-standard packages/core/src/react/plugin | sort`
  - correction sweeps with `rg` for any removed hack/legacy symbol.
- related Core sweep query / match count / patched count / deferred count:
  to fill after corrections.
- Plite/Plate gap ledger: no gap known yet.
- broad Core drift ledger gate: N/A; named files only.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-react-plugin-drift-repair.md`

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
- allowed edit scope: the four named files, directly required type imports, and this plan.
- package/API surfaces: Core React plugin API typing/adaptation only.
- docs/browser surfaces: none.
- non-goals: no broad Core sweep, no rename pass, no old Slate compatibility restoration, no public alias restoration.
- out-of-scope package errors: non-Core package failures unless caused by these files.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Block only if preserving main-parity ownership conflicts with required Plite-native API shape and needs a public Plate API decision.

Current verdict:
- verdict: done
- confidence: 0.97 for this named packet
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: wrapper drift was repaired; Plite-native hard cuts remain intentional and green.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | Prompt requirements and scope copied into this plan. | done |
| Main-parity review | complete | `git diff origin/main -- <target files>` and `git show origin/main:<file>` used to classify drift. | done |
| Patch packet | complete | Wrapper drift repaired in `getEditorPlugin.ts`, `getPlugin.ts`, `toPlatePlugin.ts`, and required `ReactPlugin.ts` caller. | done |
| Proof | complete | Biome, focused Bun tests, and Core typecheck passed. | done |
| Closeout | complete | Review matrix, sweeps, gaps, changed list, and open risks recorded. | done |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Four named files, no broad Core sweep, repair drift only. |
| `plate-next` skill/rule read | yes | Skill loaded before implementation. |
| Active goal checked or created | yes | Active goal points to this plan. |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API packet. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plate wraps Plite without old Slate `tf`/transforms aliases. |
| Broad Core drift ledger initialized when in scope | N/A | User named four files; no broad sweep requested. |
| Source of truth and allowed workspace recorded | yes | `origin/main` used only as drift evidence inside current checkout. |
| Output budget strategy recorded | yes | Targeted `sed`, `rg`, and focused proof. |
| Public API fork routing checked | yes | No new public API fork requiring `plate-plan`. |
| Gap policy checked | yes | No Plite/Plate gap blocks this packet. |
| Related Core sweep policy checked | yes | Sweeps recorded below. |
| Review-mode rename freeze checked | yes | No rename pass or new files. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet.
- [x] Best Plate v2 call recorded for every reviewed target.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path was kept.
- [x] Hack check recorded: copied `getEditorPlugin` context plumbing was cut;
      `inheritEditorExtensions` moved out of plugin config.
- [x] Gap ledger updated: no gap.
- [x] Related Core sweep row added with query, match count, patched count,
      deferred count, and remaining risk.
- [x] Broad Core sweep ledger N/A; this is a named packet.
- [x] Broad Core file row gate N/A.
- [x] Broad Core row-count gate N/A.
- [x] Broad Core drift score gate N/A.
- [x] Bridge scoring law N/A; no bridge touched.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks N/A; no new public API decision.
- [x] Review-mode rename freeze applied.
- [x] Extracted-file recovery gate closed: no untracked files in target dirs.
- [x] Safe cleanup packets kept with proof.
- [x] Focused package proof run after code changes.
- [x] `pnpm brl` N/A; no exports/barrels changed.
- [x] Old compatibility names audited.
- [x] Changed list, needs-attention rows, and next owner filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused proof | Biome, focused Bun tests, Core typecheck all pass. |
| Broad Core drift ledger coverage | N/A | Not broad Core sweep | User named four files. |
| Score gate | yes | Score named rows only | All named rows are keep/fix with proof. |
| Best Plate v2 recommendation | yes | Record current shape | Plite-native plugin/tx types, no old transform/override surface. |
| Plite/Plate gap ledger | yes | Record blockers or N/A | N/A, no gap. |
| Related Core sweep after correction | yes | Run same-class searches | Recorded below. |
| Package/API proof | yes | Run focused package proof | `pnpm turbo typecheck --filter=./packages/core` passed. |
| Non-Core package error triage | N/A | Classify if encountered | No non-Core failure. |
| Source audit | yes | Audit removed compatibility names | `rg` for old names in scoped files. |
| Rename ledger | N/A | No rename postponed | No Added/Deleted rename work. |
| Extracted-file inventory | yes | Record untracked file command | Command returned zero rows. |
| Autoreview / review | N/A | Non-trivial review gate not needed | Scoped type/API packet; focused proof passed. |
| Final lint/check | yes | Run scoped check | `pnpm exec biome check ...` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `check-complete` | To run after this edit. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/react/plugin/getEditorPlugin.ts` | 4 -> 0 | fixed | Base helper owns context plumbing | Manual copied implementation removed; file now delegates to `getBaseEditorPlugin` and diffs clean vs `origin/main`. | keep |
| `packages/core/src/react/plugin/getPlugin.ts` | 2 -> 0 | fixed | React plugin wrapper | Extra `Value` generics and `createPlatePlugin as any` removed; file diffs clean vs `origin/main`. | keep |
| `packages/core/src/react/plugin/PlatePlugin.ts` | 1 | keep with cleanup | Plate React plugin type surface | Plite-native cuts remain; stale "slate fragment" doc fixed; typecheck passed. | keep |
| `packages/core/src/react/plugin/toPlatePlugin.ts` | 3 -> 1 | fixed | BasePlugin-to-PlatePlugin adapter | Stale local `slatePlugin` name removed; wrapper option moved out of plugin config; old `toTPlatePlugin`/transforms remain cut. | keep |
| `packages/core/src/react/plugins/react/ReactPlugin.ts` | 1 | required caller patch | React runtime plugin | Updated to pass `inheritEditorExtensions` as wrapper options, not fake plugin config. | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| React plugin context | Delegate to base `getEditorPlugin` | Local context reimplementation with broad `any` | One owner for plugin context behavior. | no |
| React plugin lookup | Keep main-parity wrapper around `editor.plugins` and `createPlatePlugin` | Extra editor generics and casted factory | `PlateEditor` already carries defaults; extra generics were noise. | no |
| Plate plugin type surface | Keep Plite-native `api` + `tx`, no old transforms/override aliases | Restoring `extendTransforms`, `overrideEditor`, or old Slate aliases | Plate v2 should extend Plite, not preserve old Slate/Plate compat surface. | no |
| `toPlatePlugin` wrapper | Adapt `BasePlugin` to `PlatePlugin`; private wrapper options separate from plugin config | Passing `inheritEditorExtensions` through plugin config | Wrapper control is not product plugin data. | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | none | none | focused Core proof | no gap |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Cut copied `getEditorPlugin` implementation | `rg "resolvedPlugin = editor\\.getPlugin\|setOption: \\(\\(keyOrOptions"` in scoped React plugin files/type-tests | 0 | 1 file fixed | 0 | none |
| Cut stale Slate wrapper naming/surface in scoped files | `rg "slatePlugin\|slate fragment\|toTPlatePlugin\|extendTransforms\|extendEditorTransforms\|EditorTransforms"` | 0 in scoped files | 2 files cleaned | 0 | none |
| Old `overrideEditor` text | `rg "overrideEditor"` in scoped files/type-tests | 5 matches, all local variable names in `packages/core/type-tests/slate-plugin-contracts.ts` | 0 | 5 benign variable-name matches | low; not API surface |
| Extracted React plugin files | `git ls-files --others --exclude-standard packages/core/src/react/plugin packages/core/src/react/plugins/react` | 0 | 0 | 0 | none |

Core drift ledger:
- Applies: N/A
- Manifest command: N/A; named packet only.
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: named rows only
- Top drift rows: `getEditorPlugin.ts` copied helper body, `toPlatePlugin.ts` private flag in plugin config.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A broad ledger | N/A | N/A | N/A | Named packet only. | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| React plugin drift repair | plate-next | Local wrappers drifted from main and leaked private wrapper state through config | five touched files; proof commands below | keep | next Plate Next packet |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | N/A | `git ls-files --others --exclude-standard packages/core/src/react/plugin packages/core/src/react/plugins/react` | closed | zero rows |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | none | no failure | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Restored `getEditorPlugin.ts` and `getPlugin.ts` to main-parity wrappers; cleaned `PlatePlugin.ts` stale docs/type aliases; cleaned `toPlatePlugin.ts`; updated `ReactPlugin.ts` caller for wrapper options. |
| tests/proof | No tests changed. |
| docs/templates/skills | This autogoal plan updated. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `ReactPlugin.ts` still has broader pre-existing drift vs `origin/main` | This packet only moved the wrapper option out of config; the file itself already migrated away from `withPlateReact`. | `packages/core/src/react/plugins/react/ReactPlugin.ts` | Review in a dedicated React runtime packet if desired. |

Findings:
- `getEditorPlugin.ts` should not own plugin context plumbing.
- `inheritEditorExtensions` is wrapper behavior, not plugin config data.
- The remaining `PlatePlugin.ts` / `toPlatePlugin.ts` diff from `origin/main` is mostly intentional Plite migration: `BasePlugin`, `InferTx`, `extendTx`, `extendTxGroup`, and no `toTPlatePlugin`.

Decisions and tradeoffs:
- Kept Plite-native hard cuts instead of restoring main's Slate/transform compatibility.
- Did not start broad Core sweep; user named four files.
- Touched `ReactPlugin.ts` only because the `toPlatePlugin` wrapper option moved out of fake plugin config.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Biome format complaint on `ReactPlugin.ts` call | 1 | Apply formatter shape manually | fixed |

Verification evidence:
- `pnpm exec biome check packages/core/src/react/plugin/getEditorPlugin.ts packages/core/src/react/plugin/getPlugin.ts packages/core/src/react/plugin/PlatePlugin.ts packages/core/src/react/plugin/toPlatePlugin.ts packages/core/src/react/plugins/react/ReactPlugin.ts` passed.
- `pnpm --filter @platejs/core exec bun test src/react/plugin/toPlatePlugin.spec.ts src/lib/plugin/getEditorPlugin.spec.ts src/lib/plugin/createBasePlugin.spec.ts src/react/plugins/react/ReactPlugin.spec.ts` passed with 41 tests across the three existing files; `ReactPlugin.spec.ts` does not exist.
- `pnpm turbo typecheck --filter=./packages/core` passed.
- `git diff origin/main -- packages/core/src/react/plugin/getEditorPlugin.ts packages/core/src/react/plugin/getPlugin.ts ...` confirms `getEditorPlugin.ts` and `getPlugin.ts` are now main-parity; remaining diffs are Plite migration.
- `rg` sweeps above passed with only benign type-test variable names for `overrideEditor`.

Final handoff contract:
- target surface and mode: named React plugin drift packet.
- files/APIs reviewed: four requested files plus required `ReactPlugin.ts` caller.
- broad Core drift score coverage: N/A.
- best Plate v2 recommendation: keep Plite-native `api`/`tx`; no old transforms/override aliases; base helper owns context plumbing.
- verdict matrix summary: fixed two wrapper drifts, cleaned one docs/type drift, separated wrapper option from plugin config.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: recorded above.
- changes made: recorded above.
- tests/proof commands: recorded above.
- old compatibility names audited: scoped `rg` recorded above.
- needs attention: only the broader pre-existing `ReactPlugin.ts` migration deserves a separate review if you want it.
- next best Plate Next packet: review React runtime plugin/keyboard bridge if you want to finish that neighboring drift.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Named packet closed. |
| Where am I going? | Final `check-complete`, then handoff. |
| What is the goal? | Repair drift in four Core React plugin files. |
| What have I learned? | Wrapper drift came from copied context plumbing and config leakage. |
| What have I done? | Patched wrappers, proved Core typecheck/tests, updated plan. |

Timeline:
- 2026-07-04T22:29:03.870Z Goal plan created.
- 2026-07-05T00:00:00.000Z Repaired React plugin drift packet and ran focused proof.

Open risks:
- `ReactPlugin.ts` has broader migration drift from main, but no new blocker from this packet.
