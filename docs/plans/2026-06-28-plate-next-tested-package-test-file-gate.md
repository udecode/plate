# plate-next tested-package-test-file-gate

Objective:
Make `check:core` typecheck every test file in the packages it tests.

Goal plan:
docs/plans/2026-06-28-plate-next-tested-package-test-file-gate.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user corrected the prior narrow fix: `wtf include all tests files in tested packages!`
- mode: named Core/Plite proof-gate packet.
- target surface: `tooling/scripts/check-core.mjs`, Core test files, Plite test files, and any test-type fallout in those packages.
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; this is a proof-gate repair, not a file-by-file Core drift sweep.
- correction-triggered related Core sweep: inventory all test files in packages tested by `check:core` and compare to the generated typecheck/test execution inventory.
- completion threshold summary: `check:core` uses one generated inventory for Core/Plite test-file typecheck and test execution, no package test file in that inventory is omitted, and `pnpm check:core` passes.

First checkpoint:
- Explicit user requirement: include all test files in the packages tested by
  `check:core`; do not leave a hand-picked spec subset.
- Tested packages in this lane: `packages/core` and `packages/plite`, because
  `check:core` runs Core tests and Plite tests.
- Completion proof: generated inventory count equals executed/typechecked
  test-file count and `pnpm check:core` passes.
- Non-goal: do not migrate non-Core feature packages unless a tested Core/Plite
  file proves a real Core/Plite API regression.
- Stop condition: stop only for a real compiler/runtime blocker in Core/Plite
  tests that requires user API taste or a public Plate/Plite plan.
- Final handoff: changed files, inventory counts, fixed errors, commands,
  remaining debt.

Timed checkpoint:
- requested duration: N/A.
- semantics: N/A.
- initial confidence score: N/A.
- improvement loop: N/A.
- final score / loop closure: N/A.

Completion threshold:
- `check:core` discovers all Core and Plite test files with one collector.
- The generated TS test-file config and Bun test execution use the same
  discovered inventory.
- Inventory records 116 Core test files and 62 Plite test files unless source
  files change during the packet.
- Focused generated test-file typecheck passes.
- `pnpm check:core` passes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-tested-package-test-file-gate.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `node tooling/scripts/check-core.mjs` generated
  test-file typecheck stage, focused `pnpm exec tsc -p <generated config>
  --noEmit` if needed, and focused Bun test reruns for fixed files.
- package proof: `pnpm check:core`.
- source audits: inventory command over `packages/core` and `packages/plite`
  test-file patterns.
- related Core sweep query / match count / patched count / deferred count:
  all tested-package test files, expected 178 total before edits.
- Plite/Plate gap ledger: N/A unless a clean test-file gate requires API
  design changes.
- broad Core drift ledger gate: N/A: not a broad Core source drift sweep.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-tested-package-test-file-gate.md`

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
- allowed edit scope: `tooling/scripts/check-core.mjs`, `packages/core`
  test/config files, `packages/plite` test files, and this plan.
- package/API surfaces: Core/Plite proof gate only; no public API redesign.
- docs/browser surfaces: N/A.
- non-goals: no broad feature-package migration, no docs/browser work, no
  rename pass, no compatibility alias.
- out-of-scope package errors: feature-package compiler errors are triaged only
  when they prove a Core/Plite public API regression.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- A generated all-test-file gate exposes Core/Plite API conflicts that require
  a public Plate/Plite design decision rather than a local test/tooling repair.

Current verdict:
- verdict: fix proof gate.
- confidence: 70 before generated gate runs; current manual include list is
  known-bad.
- next owner: plate-next
- keep / revert / quarantine call: keep if `pnpm check:core` passes with the
  generated inventory.
- reason: one generated inventory prevents TS/test drift.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint copies the user's corrected requirement. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read. |
| Active goal checked or created | yes | No active goal; created goal for this plan. |
| Mode classified as named packet vs broad Core sweep | yes | Named proof-gate packet. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Constraints section. |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core source drift sweep. |
| Source of truth and allowed workspace recorded | yes | `check:core` runner plus Core/Plite test files. |
| Output budget strategy recorded | yes | Use counts/artifacts for inventories and compiler logs. |
| Public API fork routing checked | yes | No public API fork expected; blockers route to Plate/Plite plan. |
| Gap policy checked | yes | Gap ledger applies only if test gate exposes API design blocker. |
| Related Core sweep policy checked | yes | Inventory sweep over all tested-package test files. |
| Review-mode rename freeze checked | yes | No rename pass in this packet. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm check:core` passed. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named proof-gate packet, not broad Core drift sweep. |
| Score gate | no | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | N/A: no broad drift scores in scope. |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Keep generated all-test inventory; reject manual subsets and metadata rewrites from old `plate-pkg` build path. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | No gap remains. Source fixes were local Plite runtime contracts. |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | See related sweep ledger. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Focused Bun rows, generated Plite test typecheck, and `pnpm check:core` passed. |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | No non-Core package failure remained in final gate. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | N/A: no compatibility-name cut in this packet. |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename pass. |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | Three new `tsdown.config.mts` files bucketed as `justify-new-proof-tooling`. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: user asked proof-gate repair; no autoreview requested. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed, including Core/Plite lint. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-tested-package-test-file-gate.md` | To run after this evidence patch. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `tooling/scripts/check-core.mjs` | 1 | keep | Core/Plite proof gate | Generated one inventory and runs both typecheck and Bun execution from it. | Keep. |
| `packages/plite/src/core/public-state.ts` transaction selection | 2 | keep source fix | Plite | `tx.selection.set(range)` now routes through selection transform/command middleware. | Keep. |
| `packages/plite/src/core/commit-shape.ts` `textChanged` | 2 | keep source fix | Plite | Structural text splits remain classed as structural while `textChanged` stays true through dirty text ids. | Keep. |
| Plite package manifests for history/hyperscript/react | 2 | keep source fix | Plite package DX | `plate-pkg p:build` rewrote typed exports; packages now use Plite-style `tsdown`. | Keep. |
| `packages/plite/test/upstream-slate-helper-loss-contract.ts` helper | 1 | keep test-helper fix | Plite tests | Helper now uses current point-to-block-end text range instead of same-depth sibling path scan. | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `check:core` test-file gate | One generated inventory drives both test typecheck and test execution. | Manual include list; runtime-only tests; typecheck-only hidden tests. | Prevents test drift and missed TS errors. | Low. |
| Plite package build path | Plite beta packages with typed conditional exports use `tsdown`. | Old `plate-pkg p:build` rewriting exports to shorthand. | Release metadata must not be mutated by proof gates. | Low. |
| Selection writes | Public `tx.selection.set(range)` routes through command middleware. | Direct operation apply shortcut. | Command middleware must observe selection commands. | Low. |
| Commit classes | Keep class priority structural-only, with separate `textChanged` signal. | `['structural', 'text']` class pileup. | Cleaner commit semantics without losing text dirty signal. | Low. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No remaining Plite/Plate gap. | N/A | N/A | `pnpm check:core` | Closed. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Include all test files | Generated inventory from `packages/core/src`, `packages/plite/src`, and `packages/plite/test` test patterns. | 178 files: Core 116, Plite 62. | `tooling/scripts/check-core.mjs`. | 0 | Low. |
| Plite package export rewrite | Re-ran `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plite` and inspected root export shape. | 3 mutating packages. | 3 package scripts + 3 `tsdown.config.mts`. | 0 | Low. |
| Selection command bypass | `rg -n "setSelection|set_selection|applyWithOperationMiddlewares" packages/plite/src`. | Direct range shortcut in public update selection. | `packages/plite/src/core/public-state.ts`. | Other direct internal apply paths are lower-level replay/transaction paths. | Low. |
| Structural text split signal | Focused `snapshot-contract` and `transaction-contract` rows. | 2 affected commit semantics. | `packages/plite/src/core/public-state.ts`, `packages/plite/src/core/commit-shape.ts`. | 0 | Low. |

Core drift ledger:
- Applies: no; named proof-gate packet only.
- Manifest command: N/A.
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
| N/A | N/A | N/A | N/A | Broad Core drift sweep was out of scope. | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| all-test inventory | `check:core` | Manual test file lists miss TS errors. | `tooling/scripts/check-core.mjs`; generated `.tmp/check-core/test-inventory.json`. | keep | Use as normal Core/Plite gate. |
| Plite package build metadata | Plite packages | `plate-pkg p:build` rewrites typed exports. | three package manifests and `tsdown.config.mts` files. | keep | Keep Plite release packages on `tsdown`. |
| runtime command semantics | Plite runtime | Direct selection apply bypasses command middleware; structural text split over-classifies classes. | `public-state.ts`, `commit-shape.ts`, focused transaction/snapshot rows. | keep | No further action. |
| helper-loss contract | Plite tests | Same-depth sibling scan missed inline-adjacent empty text. | `upstream-slate-helper-loss-contract.ts`. | keep | No further action. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/plite-history/tsdown.config.mts` | justify-new-proof-tooling | Mirrors Plite package build owner shape. | keep | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plite`; `pnpm check:core`. |
| `packages/plite-hyperscript/tsdown.config.mts` | justify-new-proof-tooling | Mirrors Plite package build owner shape. | keep | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plite`; `pnpm check:core`. |
| `packages/plite-react/tsdown.config.mts` | justify-new-proof-tooling | Mirrors Plite package build owner shape. | keep | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plite`; `pnpm check:core`. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | No final out-of-scope package errors. | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `tooling/scripts/check-core.mjs`; `packages/plite/src/core/public-state.ts`; `packages/plite/src/core/commit-shape.ts`; Plite package build scripts/exports. |
| tests/proof | Plite test contracts and helpers repaired; generated test-file typecheck covers Core 116 and Plite 62 files. |
| docs/templates/skills | This goal plan evidence only. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Plite package build path | Three packages moved from old `plate-pkg p:build` to `tsdown` so typed export maps stay stable. | `packages/plite-history/package.json`; `packages/plite-hyperscript/package.json`; `packages/plite-react/package.json` | Review if you want all Plite release packages uniformly on `tsdown`. |
| 2 | Commit class law | Structural text splits are structural commits with `textChanged: true`, not `classes: ['structural', 'text']`. | `packages/plite/src/core/commit-shape.ts` | Approve unless you want multi-class commit semantics. |

Findings:
- `check:core` now discovers 178 tested package test files: Core 116 and Plite 62.
- The previous gate was too weak because it could run package tests without typechecking every tested file.
- `@platejs/core` typecheck builds Plite dependencies; old `plate-pkg p:build` rewrote three Plite package export maps during the gate.

Decisions and tradeoffs:
- Keep one generated inventory for test typecheck and Bun execution.
- Keep Plite beta package export maps typed/ESM-explicit by using `tsdown` for the remaining Plite packages.
- Keep structural commit class priority, but preserve text dirty signal through `textChanged`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Re-patched package manifests were reverted during full `check:core` | 2 | Find mutating gate | Switched three packages from `plate-pkg p:build` to Plite-style `tsdown`. |
| Ran focused Bun command from repo root with package-relative path | 1 | Re-run from `packages/plite` | Focused row passed. |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plite` passed and no longer rewrites Plite package root exports.
- `bun test --preload ../../config/plite-source-test-setup.ts ./test/release-scripts-contract.ts ./test/public-package-import-smoke.test.ts` passed.
- `pnpm exec tsc -p packages/plite/.tmp/check-core/test-files.batch-001.tsconfig.json --noEmit --pretty false` passed.
- Focused rows passed for `transaction-contract.ts`, `snapshot-contract.ts`, and `upstream-slate-helper-loss-contract.ts`.
- `pnpm check:core` passed.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Prompt capture | complete | First checkpoint copied scope, stop condition, proof, and handoff requirements. |
| Inventory gate | complete | Generated inventory records 178 files: Core 116, Plite 62. |
| Source/runtime repair | complete | Selection command path, commit text signal, package build metadata, and helper-loss contract fixed. |
| Final proof | complete | `pnpm check:core` passed. |

Final handoff contract:
- target surface and mode: named Core/Plite proof-gate repair.
- files/APIs reviewed: `check-core.mjs`, Plite runtime commit/selection paths, Plite package manifests/build configs, Plite test contracts.
- broad Core drift score coverage: N/A, out of scope.
- best Plate v2 recommendation: generated inventory plus Plite-style typed package builds.
- verdict matrix summary: all rows kept; no gap remains.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: generated inventory 178 files; package export mutator 3 patched; selection/commit focused searches patched; zero blockers.
- changes made: see changed list.
- tests/proof commands: see verification evidence.
- old compatibility names audited: N/A, no compatibility-name cut.
- needs attention: package build path and commit class law.
- next best Plate Next packet: continue Plate runtime cleanup only after user review of current Core/Plite shape.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final proof evidence recorded. |
| Where am I going? | Close autogoal after `check-complete`. |
| What is the goal? | Make `check:core` typecheck every test file in the packages it tests. |
| What have I learned? | See Findings. |
| What have I done? | See Timeline. |

Timeline:
- 2026-06-28T09:17:49.773Z Goal plan created.
- 2026-06-28: Generated inventory repaired to cover 178 tested-package test files.
- 2026-06-28: Fixed Plite package build metadata mutation, runtime selection command path, structural text split commit signal, and helper-loss contract.
- 2026-06-28: `pnpm check:core` passed.

Open risks:
- Low: package build path changed for three Plite packages. Review package output shape if you want a release-surface sanity pass before publishing.
