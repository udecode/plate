# plate-next core spec typecheck gate

Objective:
Fix the Core spec typecheck gate for `pipeNormalizeInitialValue`; done when the
spec is included, its TypeScript errors are fixed, related excluded-spec sweep
is recorded, and `pnpm check:core` passes.

Goal plan:
docs/plans/2026-06-28-plate-next-core-spec-typecheck-gate.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said `go` after review of
  `packages/core/src/internal/plugin/isEditOnlyDisabled.ts` score and why
  `packages/core/src/internal/plugin/pipeNormalizeInitialValue.spec.tsx` type
  error was not caught by `check:core`.
- mode: named Core proof-gate packet.
- target surface:
  `packages/core/src/internal/plugin/pipeNormalizeInitialValue.spec.tsx` and
  `packages/core/tsconfig.spec.json`.
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility.
- broad Core sweep: N/A: not requested; related excluded-spec sweep required.
- correction-triggered related Core sweep: excluded Core specs from the spec
  typecheck gate.
- completion threshold summary: spec included, spec type errors fixed, sweep
  recorded, `pnpm check:core` green.

First checkpoint:
- Requirements copied: include `pipeNormalizeInitialValue.spec.tsx` in Core
  spec typecheck gate; fix its type errors; record related excluded-spec sweep;
  pass `check:core`.
- Scope boundary: Core proof-gate/spec repair only.
- Non-goal: do not migrate every excluded Core spec or feature package in this
  packet.
- Stop condition: stop only if Core proof gate cannot run or the file requires
  a public API fork.
- Final handoff: changed files, commands, sweep result, remaining risk.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `packages/core/tsconfig.spec.json` includes
  `src/internal/plugin/pipeNormalizeInitialValue.spec.tsx`.
- `pnpm exec tsc -p packages/core/tsconfig.spec.json --noEmit` passes.
- `pnpm --filter @platejs/core exec bun test src/internal/plugin/pipeNormalizeInitialValue.spec.tsx` passes.
- Related excluded-spec sweep records total, included, excluded, and all-spec
  typecheck blocker.
- `pnpm check:core` passes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-core-spec-typecheck-gate.md`
  passes.

Verification surface:
- focused spec typecheck: `pnpm exec tsc -p packages/core/tsconfig.spec.json --noEmit`
- focused runtime spec:
  `pnpm --filter @platejs/core exec bun test src/internal/plugin/pipeNormalizeInitialValue.spec.tsx`
- package proof: `pnpm check:core`
- source audits: include audit and excluded-spec sweep commands.
- related Core sweep query / match count / patched count / deferred count:
  see Related Core sweep ledger.
- Plite/Plate gap ledger: no Plite gap; Core proof-gate coverage gap recorded.
- broad Core drift ledger gate: N/A: not a broad Core sweep.
- final plan check:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-core-spec-typecheck-gate.md`

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
- Review-mode rename freeze applies. No rename needed.
- Extracted-file recovery gate applies to the untracked
  `packages/core/tsconfig.spec.json` proof config.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.

Boundaries:
- allowed edit scope:
  `packages/core/src/internal/plugin/pipeNormalizeInitialValue.spec.tsx`,
  `packages/core/tsconfig.spec.json`, and this plan.
- package/API surfaces: Core test/proof config only.
- docs/browser surfaces: N/A.
- non-goals: no all-spec cleanup, no feature-package migration, no public API
  redesign.
- out-of-scope package errors: feature packages pulled into all-spec typecheck
  are recorded but not fixed here.

Output budget strategy:
- Use focused `sed`/`rg` reads.
- Summarize all-spec typecheck output with counts and first errors instead of
  streaming the full log.

Blocked condition:
- Block only if `check:core` cannot pass after the focused spec is included or
  if TypeScript requires changing public Plate/Plite API to typecheck this spec.

Current verdict:
- verdict: keep
- confidence: 100 for this focused gate; broader spec coverage remains separate
  debt.
- next owner: plate-next / Core proof gate.
- keep / revert / quarantine call: keep.
- reason: focused gate catches the original missed type errors and `check:core`
  passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint section. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned none; created active goal for this plan. |
| Mode classified as named packet vs broad Core sweep | yes | Named Core proof-gate packet. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plate Next source and constraints. |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Boundaries section. |
| Output budget strategy recorded | yes | Output budget strategy section. |
| Public API fork routing checked | yes | No public API fork needed. |
| Gap policy checked | yes | No Plite gap; Core proof-gate gap recorded. |
| Related Core sweep policy checked | yes | Excluded-spec sweep recorded. |
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
      this plan, has one row per Core source file before closeout. N/A: not a
      broad sweep.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`. N/A: not a broad sweep.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero. N/A: not a broad sweep.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`. N/A: not a broad sweep.
- [x] Bridge scoring law applied: no bridge touched.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation. N/A:
      no public API fork.
- [x] Review-mode rename freeze applied: no Added/Deleted rename noise.
- [x] Extracted-file recovery gate closed: untracked `tsconfig.spec.json`
      classified as `justify-new-proof-tooling`.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change. N/A: no exports/barrels.
- [x] Old compatibility names are source-audited when cut. N/A: this packet did
      not cut additional compat names.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Focused typecheck, focused spec, and `check:core` passed. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: not broad Core sweep. |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Review matrix and related sweep ledger. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Best Plate v2 recommendation section. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | Gap ledger records Core proof-gate gap, no Plite blocker. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Related Core sweep ledger. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm check:core` passed. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | All-spec typecheck fallout recorded out of scope. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Include audit and excluded-spec sweep recorded. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename. |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | `git ls-files --others --exclude-standard -- packages/core/tsconfig.spec.json ...` found one untracked proof config. |
| Autoreview / review | yes | Run review gate for non-trivial implementation diffs or record N/A | Diff reviewed manually with `git diff -- ...`; no further correction needed. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Changed list and needs-attention sections. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-core-spec-typecheck-gate.md` | Passed after final plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Focused Core spec proof-gate repair | complete | `pipeNormalizeInitialValue.spec.tsx` included in `tsconfig.spec.json`; focused typecheck, focused spec, excluded-spec sweep, and `pnpm check:core` passed. | Defer staged expansion for the 113 remaining excluded Core specs. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/internal/plugin/isEditOnlyDisabled.ts` | 1 | keep-in-plate | Plate plugin edit-only policy | `plugin: any` remains small type smell; behavior is Plate plugin policy, not Plite substrate | Later tighten to typed `{ editOnly?: EditOnlyConfig | boolean }` when touching this helper. |
| `packages/core/src/internal/plugin/pipeNormalizeInitialValue.spec.tsx` | 0 | keep-in-plate | Core plugin normalization proof | Included in spec typecheck; focused typecheck/spec passed | Keep. |
| `packages/core/tsconfig.spec.json` | 0 | justify-new-proof-tooling | Core proof gate | `check:core` uses it and focused spec is now included | Keep and commit with Core proof changes. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `pipeNormalizeInitialValue` proof gate | Keep current `transformInitialValue` naming and typecheck the current spec. | Do not restore legacy `normalizeInitialValue`; do not hide the type errors behind Bun runtime tests only. | Plate v2 hard-cut already removed legacy alias; proof gate must catch current API test errors. | Low: only notable debt is broader spec typecheck coverage. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| None | No Plite substrate gap for this target. | N/A | N/A | N/A | N/A |
| Core proof-gate debt | Only 3 of 116 Core spec files are included in `tsconfig.spec.json`. | Adding all specs at once currently pulls unrelated package migration fallout and 1,249 TS error lines. | `check:core` / Core spec typecheck lane | Per-spec or per-folder migration packets until all specs are typechecked. | Defer with owner; recorded as related sweep result. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Added `pipeNormalizeInitialValue.spec.tsx` to Core spec typecheck | Node inventory of `packages/core/src/**/*.spec.{ts,tsx}` vs `packages/core/tsconfig.spec.json` includes | 116 total Core specs; 3 included; 113 excluded | 1 focused spec added to include set | 113 excluded specs | Broader all-spec typecheck fails today; needs staged cleanup, not this packet. |
| Validate broad all-spec feasibility | Temporary `packages/core/tsconfig.all-specs.tmp.json`, then `pnpm exec tsc -p ... --noEmit` summarized to `/tmp/core-all-specs-typecheck.log` | 1,249 error lines across 101 files | 0 | 101 files | Many errors are unrelated feature-package migration fallout from imported packages; broad fix is future Plate migration/proof lane. |

Core drift ledger:
- Applies: no
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Not a broad Core sweep | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Include missed spec in typecheck gate | Core proof gate | Bun test passed while TS errors were invisible | `packages/core/tsconfig.spec.json`, `packages/core/src/internal/plugin/pipeNormalizeInitialValue.spec.tsx` | keep | Later expand spec typecheck staged by folder. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/tsconfig.spec.json` | justify-new-proof-tooling | `git show HEAD:packages/core/tsconfig.spec.json` says file is not in `HEAD`; current `check:core` uses it. | keep | `pnpm check:core` passes and includes this config. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| Temporary all-Core-spec typecheck | 1,249 error lines across 101 files; first errors in `packages/code-block`, `packages/link`, `packages/math`, `packages/media`, plus many excluded Core specs. | Objective is focused on the missed `pipeNormalizeInitialValue` gate and sweep recording. Broad all-spec closure is a future staged migration lane. | Plate Next / future Core proof-gate expansion. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | None. |
| tests/proof | `packages/core/src/internal/plugin/pipeNormalizeInitialValue.spec.tsx`; `packages/core/tsconfig.spec.json` current working-tree proof config includes this spec. |
| docs/templates/skills | This plan only. |
| reverted/quarantined packets | Temporary all-spec tsconfig was deleted after sweep. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | 113 Core specs still excluded from spec typecheck | `check:core` is stronger now but still not comprehensive. | Related Core sweep ledger | Open a later staged lane to include specs by folder and fix type debt. |
| 2 | `isEditOnlyDisabled.ts` still uses `plugin: any` | Small but real type smell in Plate plugin policy helper. | `packages/core/src/internal/plugin/isEditOnlyDisabled.ts` | Tighten when touching edit-only helper next. |

Findings:
- `check:core` missed the IDE type error because
  `packages/core/tsconfig.spec.json` included only `pipeOnNodeChange.spec.ts`
  and `pipeOnTextChange.spec.ts`.
- `pipeNormalizeInitialValue.spec.tsx` had three focused type errors when
  included: excessive factory type instantiation, implicit `value: any`, and a
  Bun `mock()` type that is not callable under TypeScript.
- Runtime spec was already meaningful; the failure was proof coverage, not
  behavior.

Decisions and tradeoffs:
- Keep `pipeNormalizeInitialValue` current API proof; do not restore legacy
  `normalizeInitialValue` tests.
- Use a `createLoosePlugin` helper only for edge-case runtime plugin setup in
  this spec, avoiding impossible generic inference while preserving runtime
  behavior.
- Do not include all 116 Core specs in this packet because the broad typecheck
  currently fails from unrelated migration surfaces and would turn this focused
  repair into a huge package migration.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial focused typecheck failed with TS2589 / TS7031 / TS2349 | 1 | Remove `mock()` and avoid invalid plugin factory input | Fixed. |
| Counter-based runtime test initially failed because initialization call was no longer cleared | 1 | Reset counter after setting `readOnly` | Fixed. |
| Plain plugin object failed runtime plugin validation | 1 | Use `createLoosePlugin` wrapper around factory | Fixed. |
| All-spec typecheck failed broadly | 1 | Record as related sweep / future owner | Deferred. |

Verification evidence:
- `pnpm exec tsc -p packages/core/tsconfig.spec.json --noEmit` -> pass.
- `pnpm --filter @platejs/core exec bun test src/internal/plugin/pipeNormalizeInitialValue.spec.tsx` -> 10 pass.
- Related sweep inventory -> 116 total Core specs, 3 included, 113 excluded.
- Temporary all-spec typecheck -> 1,249 error lines across 101 files; deferred
  as future staged proof-gate expansion.
- `pnpm check:core` -> pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-core-spec-typecheck-gate.md` -> pass.

Final handoff contract:
- target surface and mode: named Core proof-gate packet.
- files/APIs reviewed:
  `pipeNormalizeInitialValue.spec.tsx`, `tsconfig.spec.json`,
  `isEditOnlyDisabled.ts` score.
- broad Core drift score coverage: N/A; related excluded-spec sweep recorded.
- best Plate v2 recommendation: keep current transform-initial-value API proof;
  do not restore legacy alias tests.
- verdict matrix summary: keep focused spec gate, defer broad all-spec
  typecheck expansion.
- Plite/Plate gaps or blockers: no Plite gap; Core proof-gate coverage debt.
- related Core sweep query/matches/patched/deferred: 116 specs, 3 included, 113
  excluded; one spec patched/included; broad all-spec cleanup deferred.
- changes made: spec typing/test helper, spec include config, plan.
- tests/proof commands: focused typecheck, focused spec, `pnpm check:core`,
  plan check.
- old compatibility names audited: legacy `normalizeInitialValue` not restored.
- needs attention: 113 excluded Core specs remain.
- next best Plate Next packet: staged spec-typecheck expansion by folder, or
  tighten `isEditOnlyDisabled` typing if reviewing that helper next.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Fix focused Core spec typecheck gate and record sweep. |
| What have I learned? | `check:core` was green because this spec was not in `tsconfig.spec.json`; all-spec coverage is real future debt. |
| What have I done? | Included the spec, fixed its TS errors, ran focused and broad proof, recorded sweep. |

Timeline:
- 2026-06-28T08:55:06.732Z Goal plan created.
- 2026-06-28T08:57Z Patched `pipeNormalizeInitialValue.spec.tsx` and
  `tsconfig.spec.json`.
- 2026-06-28T08:59Z Focused typecheck and runtime spec passed.
- 2026-06-28T09:00Z Related excluded-spec sweep recorded.
- 2026-06-28T09:01Z `pnpm check:core` passed.

Open risks:
- 113 Core spec files remain outside `tsconfig.spec.json`; broad all-spec
  typecheck currently fails and needs staged cleanup.
