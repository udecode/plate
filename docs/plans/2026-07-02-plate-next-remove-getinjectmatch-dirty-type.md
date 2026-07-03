# plate-next remove getInjectMatch dirty type

Objective:
Remove dirty getInjectMatch local plugin type; done when alias is gone, focused Core proof passes, and plan closes.

Goal plan:
docs/plans/2026-07-02-plate-next-remove-getinjectmatch-dirty-type.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked to remove the dirty `InjectMatchPlugin` type from
  `packages/core/src/lib/utils/getInjectMatch.ts`
- mode: one-shot named file/API packet
- target surface: `packages/core/src/lib/utils/getInjectMatch.ts`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, search for `InjectMatchPlugin`
  and same-class local plugin-shape aliases around injection helpers
- completion threshold summary: local duplicated type gone, source-owned plugin
  type used, focused tests/typecheck green, plan check green

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: none
- semantics: not timed
- initial confidence score: 85/100
- improvement loop: inspect real plugin inject owner, patch call signature,
  sweep same-class aliases, run focused proof
- final score / loop closure: 98/100 after alias removal, focused tests,
  Core typecheck, Core lint, and source audit

Completion threshold:
- `type InjectMatchPlugin` is removed from `getInjectMatch.ts`.
- `getInjectMatch` uses a source-owned plugin type rather than a duplicated
  nullable object shape.
- Related source audit finds no remaining `InjectMatchPlugin` alias.
- Focused `getInjectMatch` tests and Core typecheck pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-remove-getinjectmatch-dirty-type.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test src/lib/utils/getInjectMatch.spec.ts src/internal/plugin/pluginInjectNodeProps.spec.ts`
- package proof: `pnpm turbo typecheck --filter=./packages/core`
- source audits: `rg -n "type InjectMatchPlugin|InjectMatchPlugin" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'`
- related Core sweep query / match count / patched count / deferred count:
  `type \w+Plugin = {|interface \w+Plugin {|inject:` sweep found ordinary
  plugin objects/tests and no same-class local shadow type to patch
- Plite/Plate gap ledger: no expected gap; `PluginBase` owns the inject shape
- broad Core drift ledger gate: N/A, named file packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-remove-getinjectmatch-dirty-type.md`

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
- allowed edit scope: `packages/core/src/lib/utils/getInjectMatch.ts`,
  focused tests only if type proof requires it, and this plan
- package/API surfaces: Core utility/plugin typing only
- docs/browser surfaces: out of scope
- non-goals: broad Core sweep, naming pass, docs updates, feature package fixes
- out-of-scope package errors: ignore unless caused by this Core utility type

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if removing the alias exposes a broader plugin type design gap that
  cannot be fixed without a public API fork.

Current verdict:
- verdict: main-parity-cleanup
- confidence: 85/100 before patch
- next owner: plate-next
- keep / revert / quarantine call: keep if focused proof stays green
- reason: local alias duplicates `PluginBase['inject']` and can drift from the
  source-owned plugin shape

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target file and dirty type removal recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Use source-owned plugin type, no shadow shape |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core sweep |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`, Core utility owner |
| Output budget strategy recorded | yes | Targeted `sed`/`rg`; capped outputs |
| Public API fork routing checked | yes | No public API fork expected |
| Gap policy checked | yes | Record gap if `PluginBase` cannot express needed shape |
| Related Core sweep policy checked | yes | Sweep `InjectMatchPlugin` and same-class injection helper aliases |
| Review-mode rename freeze checked | yes | No rename pass |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan. Evidence: named file/API packet.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`. Evidence: review matrix below.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate. Evidence:
      local shadow type removed.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
      Evidence: no gap blocks this packet.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout. N/A: named
      file packet, not broad Core sweep.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`. N/A: not broad Core sweep.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero. N/A: not broad Core sweep.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`. N/A: named file packet only.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone. Evidence: no bridge
      involved.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation. N/A:
      no public API fork required.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet. N/A: no
      rename or extracted file.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name. N/A: no untracked/extracted file in
      target scope.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change. N/A: no exports/barrels
      changed.
- [x] Old compatibility names are source-audited when cut. Evidence:
      `InjectMatchPlugin` audit is clean.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Focused tests pass; Core typecheck pass; Core lint pass |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named file packet |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Dirty local type score 3 resolved by source-owned `Pick<BasePlugin, 'inject'>` |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Use `PluginBase` ownership; reject duplicated local nullable inject shape |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | No gap |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Sweep rows below |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm turbo typecheck --filter=./packages/core` pass |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: no non-Core failure |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `InjectMatchPlugin` audit clean |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: no extracted file target |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: one-line type cleanup with focused proof |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/core lint` pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Ledgers below filled |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-remove-getinjectmatch-dirty-type.md` | Final gate to run after this edit |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/utils/getInjectMatch.ts` / `InjectMatchPlugin` | 3 -> 0 | main-parity-cleanup | `BasePlugin['inject']` | Local alias removed; function accepts `Pick<BasePlugin, 'inject'>` | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `getInjectMatch` plugin parameter | Use the source-owned plugin shape with `Pick<BasePlugin, 'inject'>` | Duplicated `InjectMatchPlugin` type with nullable object fields | Prevents drift from `PluginBase` and keeps utility minimal | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing capability | `PluginBase` already owns the shape | `packages/core/src/lib/plugin/SlatePlugin.ts` | Focused tests/typecheck | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Remove `InjectMatchPlugin` | `rg -n "type InjectMatchPlugin|InjectMatchPlugin" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` | 0 after patch | 1 | 0 | none |
| Same-class local plugin-shape aliases | `rg -n "type \w+Plugin\s*=\s*\{|interface \w+Plugin\s*\{|inject:\s*\{" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` | Ordinary plugin objects/tests plus `SlateEditor`/resolver plugin construction | 0 | 0 | no same-class local shadow type found |

Core drift ledger:
- Applies: no, named file packet
- Manifest command: N/A: broad Core sweep not requested
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: `InjectMatchPlugin` local alias was the top drift and is removed

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Broad Core drift ledger not in scope | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Remove dirty local inject plugin type | Core utility typing | Local type duplicated `PluginBase['inject']` and could drift | `getInjectMatch.ts`; focused tests; typecheck; lint; source audit | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | No extracted file in scope | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no non-Core failure | final proof passed | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `getInjectMatch` now accepts `Pick<BasePlugin, 'inject'>`; `InjectMatchPlugin` removed |
| tests/proof | no test files changed |
| docs/templates/skills | updated this autogoal plan only |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none | no user decision needed | N/A | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| getInjectMatch type cleanup | complete | Alias removed; focused tests/typecheck/lint/source audit pass | none |

Findings:
- `PluginBase` already owns the nullable injection shape; the local alias was duplicated sludge.
- Focused tests did not require behavior changes.

Decisions and tradeoffs:
- Use `Pick<BasePlugin, 'inject'>` rather than exporting or inventing another inject-only type.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/utils/getInjectMatch.spec.ts src/internal/plugin/pluginInjectNodeProps.spec.ts` -> 11 pass.
- `pnpm turbo typecheck --filter=./packages/core` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `rg -n "type InjectMatchPlugin|InjectMatchPlugin" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` -> 0 matches.

Final handoff contract:
- target surface and mode: named `plate-next` cleanup for `getInjectMatch.ts`
- files/APIs reviewed: `getInjectMatch`, `PluginBase['inject']`
- broad Core drift score coverage: N/A, named packet only
- best Plate v2 recommendation: source-owned plugin shape, no duplicated local alias
- verdict matrix summary: `InjectMatchPlugin` removed
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: recorded above; 0 deferred
- changes made: recorded in Changed list
- tests/proof commands: recorded in Verification evidence
- old compatibility names audited: `InjectMatchPlugin` 0 matches
- needs attention: none
- next best Plate Next packet: continue user-pointed Core review

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure after proof |
| Where am I going? | Run final plan checker, then complete active goal |
| What is the goal? | Remove `InjectMatchPlugin` and keep `getInjectMatch` source-typed |
| What have I learned? | `PluginBase` already owns the inject shape |
| What have I done? | Removed local alias and ran focused proof |

Timeline:
- 2026-07-02T09:46:18.575Z Goal plan created.
- 2026-07-02T09:47Z Inspected `getInjectMatch.ts`, `PluginBase`, caller, and tests.
- 2026-07-02T09:49Z Removed `InjectMatchPlugin` and switched parameter to `Pick<BasePlugin, 'inject'>`.
- 2026-07-02T09:52Z Focused tests, Core typecheck, Core lint, and source audit passed.

Open risks:
- None.
