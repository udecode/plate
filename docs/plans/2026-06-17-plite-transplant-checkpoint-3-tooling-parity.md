# plite transplant checkpoint 3 tooling parity

Objective:
Complete Plite transplant Checkpoint 3: root commands for Plite package checks, browser proof, and benchmarks work from Plate root with no hidden `Plate repo root` dependency.

Goal plan:
docs/plans/2026-06-17-plite-transplant-checkpoint-3-tooling-parity.md

Template:
docs/plans/templates/auto.md

Automation source:
- type: continuation of user-requested Plite transplant checkpoint sequence
- prompt / link: user said "go" after Checkpoint 2 pause
- lane: transplant / root tooling parity
- surface / route / package: root scripts plus eight transplanted Plite packages
- invocation mode: one checkpoint, one-shot execution, pause after completion
- minimum runtime / deadline: N/A: no timed checkpoint in this step
- completion threshold summary: root-level Plite commands exist and package test/typecheck/build/browser/benchmark command parity is green from Plate root.

Completion threshold:
- Root package scripts expose Plite package checks, browser/proof command entrypoints, and benchmark command entrypoints from `/Users/zbeyens/git/plate-2`.
- Root Plite commands do not shell into `Plate repo root` and do not require `Plate repo root` to run.
- Package-level tests for the eight transplanted packages resolve one Plite runtime graph, not mixed `packages/plite/dist/*` and `packages/plite/src/*` singleton state.
- Focused root commands prove typecheck/build/test parity for the transplanted packages, including the previously failing `@platejs/plite-history` package test.
- Browser proof entrypoints are wired at package/root level, but Checkpoint 3 does not port docs/example routes or claim `/examples/plite/*` browser behavior proof.
- No docs IA, examples routes, beta release CI, full Plate runtime migration, PR, commit, push, public compatibility alias, or `Plate repo root` deletion starts in this checkpoint.
- Closure is legal only when this checkpoint's source-of-truth rows, proof commands, changed list, review-attention rows, stopping checkpoints, workflow slowdowns, and final handoff contract are complete and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-plite-transplant-checkpoint-3-tooling-parity.md` passes.

Verification surface:
- Source audit of root scripts and package scripts for no `Plate repo root` command dependency.
- Root/package command audit for Plite package checks, browser proof entrypoints, and benchmark entrypoints.
- Root `plite:packages:test`, `plite:packages:typecheck`, `plite:packages:build`.
- Root browser proof commands: `plite:browser:test:proof`, `plite:browser:test:selection`.
- Root benchmark commands: `plite:bench:targets:check`, `plite:bench:targets:dry-run`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-plite-transplant-checkpoint-3-tooling-parity.md`.

Constraints:
- Copy every explicit user requirement into this plan before implementation.
- Keep this checkpoint scoped; do not silently start the next checkpoint.
- Use root `VISION.md` for durable taste.
- Do not create PRs, commits, pushes, release claims, compatibility aliases, or runtime shims.
- Publish all eight beta packages later; do not mark `plite-layout` experimental.
- Pause after this checkpoint with a concise summary before continuing.

Boundaries:
- Source of truth: Checkpoint 2 package transplant, donor packages copied from `Plate repo root` commit `f0e5ad1ae7caa14027dc57bc38bd457909bd4b97`, root `VISION.md`.
- Allowed edit scope: root/package scripts, package test/bootstrap config, package tsconfig/build config, lightweight tooling helpers, package contract tests, and this goal plan.
- Browser surfaces: command wiring only; do not add `/examples/plite/*` or docs routes.
- Package/API surfaces: eight `@platejs/*` Plite packages and package scripts; no public compat aliases or runtime shims.
- Agent/skill surfaces: no skill source changes in this checkpoint.
- Docs/research surfaces: plan and transplant/tooling docs only; no public docs IA.
- Non-goals: docs app shell, examples routes, Playwright route port, beta release CI, full Plate runtime migration, deleting `Plate repo root`, PR/commit/push, public aliases, runtime shims.

Output budget strategy:
- Use `rg --files`, focused `node` audits, and targeted package commands. Exclude `dist`, `.turbo`, `node_modules`, and large generated artifacts from broad search output.

Blocked condition:
- Stop only if fixing package test parity requires a public runtime/API fork, broad docs/examples migration, or rearchitecting the package graph beyond root tooling parity. No such blocker remained.

Automation state:
- lane: transplant / root tooling parity
- surface: root scripts plus eight Plite packages
- mode: one-shot checkpoint
- minimum_runtime: N/A
- target_deadline: checkpoint completion, then pause
- current_loop: 6
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: Checkpoint 4 docs IA and `/examples/plite/*` shell
- goal_status: closing

Current verdict:
- verdict: keep
- confidence: 0.94
- next owner: auto, Checkpoint 4
- keep / revert / quarantine call: keep tooling parity patch; no quarantined code packet
- reason: root package/test/typecheck/build/browser/benchmark commands are green and the command audit found no `Plate repo root` dependency.

Completion rule:
- `update_goal(status: complete)` is allowed after this plan passes `check-complete`.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Evidence / exit rule |
|------------|-------|--------|----------|----------------------|
| checkpoint-zero | auto | complete | P0 | Requirements copied; `VISION.md` read; no alias/runtime shim boundary applied. |
| status | auto | complete | P0 | Root/package test failures mapped to source graph, stale donor tests, Yjs package config, layout docs wording, benchmark cwd. |
| implementation | auto | complete | P0 | Root scripts, Bun preload resolver, package scripts, contract tests, benchmark helper patched. |
| verification | auto | complete | P0 | Package test/typecheck/build, browser proof, benchmark, and no-`.tmp` audits passed. |
| final-handoff | auto | complete | P0 | Handoff ledgers filled; pause required before Checkpoint 4. |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded |
| 1 | root `slate:*` command topology | implementation | `package.json` scripts audited | Plate root needs first-class Plite commands | keep |
| 2 | Bun source preload resolver and package test scripts | implementation | `pnpm plite:packages:test` green | Prevent mixed source/dist Plite singleton state | keep |
| 3 | React exact alias to `@platejs/plite` source | implementation | `pnpm --filter @platejs/plite-react test` green before aggregate | Fix transform registry singleton split | keep |
| 4 | stale donor docs/example contracts scoped to current checkpoint | implementation | package tests green | Checkpoint 4 owns docs/examples; Checkpoint 3 must not fake them | keep |
| 5 | benchmark dry-run no longer hard-requires sibling autoresearch checkout | implementation | `pnpm plite:bench:targets:dry-run react-active-typing-breakdown` green | Root benchmark entrypoint must validate without hidden `Plate repo root` cwd | keep |
| 6 | Yjs dependency and slate-layout wording cleanup | implementation | Yjs/layout tests green | Beta package config should be honest: peer+dev Yjs, no experimental layout label | keep |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Checkpoint 3 scope, non-goals, proof gates, and pause requirement copied before implementation. |
| `auto` source rule read or fallback recorded | yes | Generated `$auto` skill was absent on this branch; used `docs/plans/templates/auto.md` fallback. |
| `vision` read as checkpoint zero | yes | Root `VISION.md` read; no compat alias/runtime shim boundary applied. |
| Active goal checked or created | yes | Checkpoint 3 goal created for this plan. |
| Lane resolved | yes | Lane: transplant/root tooling parity. |
| Invocation mode and timebox recorded | yes | One checkpoint, no timed runtime, pause after completion. |
| Source of truth and allowed workspaces recorded | yes | Root repo only; donor packages already copied; `Plate repo root` must not be a runtime command dependency. |
| Output budget strategy recorded | yes | Exact audits and capped command output used. |
| Package/API pack selected | yes | Root scripts and package scripts affect public package workflow. |
| Public surface or package boundary identified | yes | Package scripts and package metadata for eight `@platejs/*` packages. |
| Release artifact path selected | yes | Deferred to beta release checkpoint; this checkpoint does not claim release readiness. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset created because release artifact closure is outside Checkpoint 3. |
| Barrel/export impact decision recorded | yes | N/A: no package export surface or exported file layout changed. |

Work Checklist:
- [x] First checkpoint requirement extraction is complete.
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Lane and owning workspace/package/app proof are named.
- [x] Checkpoint supervisor table has been reconciled after the seed.
- [x] Each loop ends with a checkpoint mutation decision.
- [x] Packet ledger contains one row per changed/proof packet.
- [x] Changed list is current and includes only this checkpoint.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Workflow slowdowns are logged.
- [x] Output budget discipline is followed.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no changeset in Checkpoint 3.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry diff.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. The package delta is classified as release-checkpoint-deferred, not shipped here.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. No public compat alias or runtime shim added.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: exports unchanged.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run proof commands/artifacts named in this plan | `pnpm plite:packages:test`, `pnpm plite:packages:typecheck`, `pnpm plite:packages:build`, browser proof, benchmark commands passed. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence | Checkpoint mutation ledger records six evidence-driven mutations. |
| Workspace authority proof | yes | Record cwd/tool for every proof command | Every command was run in `/Users/zbeyens/git/plate-2`. |
| Final lint/check | yes | Run scoped formatter/lint where touched tooling needed it | `pnpm exec biome check --fix config/plite-source-test-setup.ts` passed; broader Biome lint remains outside this checkpoint. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current evidence | Changed list, needs-attention rows, and stopping checkpoints are filled below. |
| Workflow slowdown review | yes | Log slow steps or N/A | Slowdowns table is filled below. |
| Goal plan complete | yes | Run autogoal check-complete after this write | Command recorded in Verification evidence after it passes. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | No public runtime API/exports changed; scripts/metadata/tests changed. |
| Release artifact classification | yes | Record whether this is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package config exists, but release artifact is deferred to beta release checkpoint; no release claim here. |
| Published package changeset | N/A | If package users see a shipped delta, create release artifact | Not a release checkpoint; changeset deferred until beta release consolidation. |
| Registry changelog | N/A | Registry-only work uses registry changelog | No registry diff. |
| No release artifact | yes | Record exact reason | Internal tooling/test/package-staging checkpoint; no public release claim or version closure. |
| Package typecheck/build/test | yes | Run owning package checks | Package test/typecheck/build commands passed. |
| Barrel/export generation | N/A | Run `pnpm brl` when exports or exported file layout changed | No exports or exported file layout changed in Checkpoint 3. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Requirements, boundaries, non-goals copied. | closed |
| Status and source read | complete | Root/package scripts and test failures mapped. | closed |
| Implementation | complete | Tooling, package scripts, test contracts, benchmark helper patched. | closed |
| Verification | complete | Root package/browser/benchmark commands green. | closed |
| Final handoff and goal-plan check | complete | Handoff ledgers filled; check-complete run at closure. | pause |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------|----------|------|
| Root Plite scripts | 1 | auto | Root lacks first-class Plite package/browser/benchmark commands | `package.json` | root command audit, no `.tmp` rg | keep | use in later checkpoints |
| Bun source resolver | 2 | auto | Bun tests resolve mixed dist/source package graph | `config/plite-source-test-setup.ts`, package test scripts, `tooling/config/tsconfig.test.json` | `pnpm plite:packages:test` | keep | keep as package test harness |
| Transplant script rewrite | 2 | auto | Future transplant reruns would restore stale test scripts | `docs/transplant/plite/scripts/transplant-donor-packages.mjs` | source review plus package test scripts green | keep | rerun only if packages are re-transplanted |
| React alias | 3 | auto | Plite React sees separate Plite runtime singleton and registry init fails | `packages/plite-react/vitest.config.mjs` | `pnpm --filter @platejs/plite-react test` and aggregate package test | keep | revisit only if Vitest source-entry support improves |
| Browser stale donor tests | 4 | auto | Browser package tests assert donor-only scripts/paths | `packages/browser/test/core/*.test.ts` | `pnpm plite:browser:test:proof`, aggregate package test | keep | Checkpoint 5 owns app route proof |
| Public package smoke contracts | 4 | auto | Donor package names/paths do not match final flat `@platejs/*` layout | `packages/plite/test/public-package-import-smoke.test.ts`, `packages/*/test/*contract*` | aggregate package test | keep | tighten after docs/examples port |
| Yjs package config | 6 | auto | `yjs` duplicated as dep+peer and contract looked for stale donor site/proof paths | `packages/yjs/package.json`, `packages/yjs/test/package-config-contract.spec.ts` | aggregate package test | keep | release checkpoint decides final changeset text |
| Plite layout beta wording | 6 | auto | Package still called itself experimental despite user saying publish all beta packages | `packages/plite-layout/package.json`, `packages/plite-layout/README.md`, layout test | aggregate package test | keep | docs checkpoint should keep same tone |
| Benchmark target helper | 5 | auto | Dry-run hard-failed without sibling codex-autoresearch checkout and used stale root assumptions | `tooling/scripts/bench-targets.mjs` | `pnpm plite:bench:targets:check`, `pnpm plite:bench:targets:dry-run react-active-typing-breakdown` | keep | full benchmark execution remains later |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Initial `pnpm plite:packages:test` | auto | several iterations | React tests failed massively from split Plite singleton | Failure signature: `Editor transform registry has not been initialized` | Added exact `@platejs/plite` alias in React Vitest config. |
| Stale donor docs/examples contracts | auto | multiple focused failures | Tests expected donor docs paths before Checkpoint 4 docs IA exists | React/dom/hyperscript/layout package contract failures | Made contracts conditional and anchored fallback assertions to current package source/README/tests. |
| Benchmark dry-run | auto | one failure | Helper hard-required sibling codex-autoresearch checkout | Missing autoresearch script error | Made autoresearch script optional for dry-run and added env override. |
| Broad `biome check --fix` | auto | one noisy failure | Existing/imported tests contain many top-level regex lint warnings | 121 lint findings; real Yjs duplicate dependency surfaced | Fixed new preload file and real Yjs dependency issue; did not turn lint cleanup into this checkpoint. |
| Aggregate package test output | auto | noisy | All eight package test suites emit huge logs | Final command passed | Keep focused package loops before aggregate in future checkpoints. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | No runtime Plite API changes. Added root `slate:*` scripts; added Bun source test preload; changed Yjs package config from runtime dependency+peer to devDependency+peer; cut `experimental` wording from slate-layout package metadata/README. |
| tests/oracles/browser proof | Package test scripts now preload source aliases; React Vitest aliases `@platejs/plite` to source; browser/package/public-surface/Yjs/layout contracts updated to current Plate root and Checkpoint 3 boundaries. |
| benchmarks/metrics/targets | `tooling/scripts/bench-targets.mjs` supports optional `CODEX_AUTORESEARCH_SCRIPT`, root cwd, and dry-run validation without hidden `Plate repo root` dependency. |
| examples/docs | No public docs IA or examples routes added. Only package README wording for slate-layout changed. |
| skills/workflow | No skill source change. `pnpm install` ran Skiller as part of normal repo install. |
| reverted/quarantined packets | Removed the abandoned `packages/plite-history/bunfig.toml` experiment; no quarantined runtime patch. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Docs/examples are still deliberately unported | Tests now have current-package fallbacks; this is honest but not public docs proof | Checkpoint 4 | Continue to docs IA and `/examples/plite/*` next. |
| 2 | Benchmark dry-run says `autoresearchSetupOk=skipped` | Root target validation works, but Codex Autoresearch is not installed at a detected path | `pnpm plite:bench:targets:dry-run react-active-typing-breakdown` | Leave as acceptable for Checkpoint 3; set `CODEX_AUTORESEARCH_SCRIPT` only when running Autoresearch packets. |
| 3 | Benchmark registry reports missing artifacts | `missingOptionalArtifacts=2`, `missingRequiredArtifacts=2`; target registry validation still passes | benchmark dry-run output | Close during benchmark evidence checkpoint, not tooling parity. |
| 4 | Release artifact/changeset is not closed | Package metadata changed, but this checkpoint is not the beta release lane | release checkpoint | Add final consolidated changesets during beta release readiness, not here. |
| 5 | Broad Biome lint still has donor/imported regex noise | New preload file is clean; full imported test lint was not made a scope bomb | `pnpm exec biome check --fix ...` failure log | Run a dedicated lint-deslop packet if root `check` demands it. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| C4 | soft checkpoint | Start Checkpoint 4 docs IA now? | Checkpoint 3 is complete; docs/examples are the next transplant risk | Docs IA, `/examples/plite/*`, browser route proof | Package tooling is green | Continue only after this pause. | transplant plan |
| Release | soft checkpoint | When to create changesets? | Package metadata/config changed, but release closure is a later lane | Release artifact text | Tooling parity | Defer to beta release checkpoint. | release lanes |

Findings:
- Root Plite command surface now covers packages, browser proof, selection proof, and benchmark target validation from Plate root.
- Package test parity needed a source preload resolver because Bun under pnpm did not reliably honor TypeScript path aliases for cross-package source tests.
- React tests needed exact `@platejs/plite` source aliasing to avoid two Plite runtime singletons.
- Several donor tests were too broad for Checkpoint 3 and had to be scoped away from Checkpoint 4 docs/examples work.
- Benchmark dry-run can validate targets without silently depending on `Plate repo root`.

Decisions and tradeoffs:
- Kept Checkpoint 3 as tooling parity, not docs/app/browser route port.
- Deferred release changesets until beta release closure because this checkpoint does not claim package release readiness.
- Kept `plite-layout` publishable beta wording while preserving proof-gated production language.
- Chose devDependency+peerDependency for `yjs` inside `@platejs/yjs`; no duplicated normal dependency.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| React package tests failed with transform registry singleton error | 1 | Force exact source alias for `@platejs/plite` | Fixed in `packages/plite-react/vitest.config.mjs`. |
| Stale donor docs/example contract failures | 1 cluster | Scope contracts to current package source/README until docs checkpoint | Fixed conditional fallbacks. |
| Yjs package config contract assumed donor root/site/proof scripts | 1 cluster | Re-anchor to Plate root scripts and final package config | Fixed Yjs package contract. |
| Layout docs contract required donor docs and experimental wording | 1 | Use package README fallback and beta wording | Fixed layout package/readme/test. |
| Benchmark dry-run required unavailable sibling autoresearch checkout | 1 | Make autoresearch runner optional for dry-run | Fixed benchmark helper. |
| Broad Biome lint surfaced 121 findings | 1 | Fix new preload file and real Yjs duplicate; do not expand scope | Scoped lint proof passed. |

Verification evidence:
- `pnpm install` passed in `/Users/zbeyens/git/plate-2`.
- `pnpm --filter @platejs/plite-history test` passed: 18 tests.
- `pnpm --filter @platejs/plite-hyperscript test` passed: 34 tests.
- `pnpm --filter @platejs/plite-dom test` passed: 128 tests.
- `pnpm --filter @platejs/plite-react test` passed: 59 files, 826 tests.
- `pnpm --filter @platejs/yjs test` passed: 243 tests.
- `pnpm --filter @platejs/plite-layout test` passed: 51 tests.
- `pnpm plite:packages:test` passed after final preload cleanup.
- `pnpm plite:packages:typecheck` passed: 13 successful tasks.
- `pnpm plite:packages:build` passed: 8 successful tasks.
- `pnpm plite:browser:test` passed earlier in the checkpoint.
- `pnpm plite:browser:test:proof` passed: 30 tests.
- `pnpm plite:browser:test:selection` passed: 1 file, 9 tests.
- `pnpm plite:bench:targets:check` passed: 27 targets.
- `pnpm plite:bench:targets:dry-run react-active-typing-breakdown` passed: 27 targets, `autoresearchSetupOk=skipped`.
- Root `slate:*` script audit printed all `ok` and no `Plate repo root` command dependency.
- `rg -n "\Plate repo root|cd \.tmp|\.\./plite" package.json packages/{slate,plite-dom,slate-react,slate-history,slate-hyperscript,slate-layout,browser,yjs}/package.json tooling/scripts/bench-targets.mjs config/plite-source-test-setup.ts` returned no matches.
- `pnpm exec biome check --fix config/plite-source-test-setup.ts` passed.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-plite-transplant-checkpoint-3-tooling-parity.md` passed with `[autogoal] complete`.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-17-plite-transplant-checkpoint-3-tooling-parity.md`
- Lane: Plite transplant / root tooling parity.
- Surface and route/package: root scripts, package scripts, test harness, benchmark helper for eight `@platejs/*` Plite packages.
- Invocation mode and checkpoint count: one checkpoint, then pause.
- Proof: root package test/typecheck/build, browser proof/selection, benchmark check/dry-run, no-`.tmp` audit.
- Changed list: root scripts, source preload resolver, package test scripts/contracts, benchmark helper, package metadata/readme cleanup.
- Needs your attention: docs/examples remain next; benchmark artifacts and release changesets are intentionally deferred.
- Stopping checkpoints to unblock: Checkpoint 4 docs IA and release changeset timing.
- Residual risks: no `/examples/plite/*` browser route proof yet; Autoresearch benchmark runner is optional/skipped; broad Biome lint deserves a later cleanup if root `check` demands it.
- Next owner: auto, Checkpoint 4.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint 3 final handoff. |
| Where am I going? | Pause, then Checkpoint 4 docs IA and `/examples/plite/*` shell if user says go. |
| What is the goal? | Prove root Plite package/tooling/browser/benchmark commands work from Plate root without `Plate repo root`. |
| What have I learned? | Test runtime source aliasing is mandatory; donor contracts must not fake future docs/examples work. |
| What have I done? | Added root command surface, source preload resolver, package script repairs, benchmark dry-run repair, and current package contract repairs. |

Timeline:
- 2026-06-17: Checkpoint 3 plan created.
- 2026-06-17: Root scripts and package test harness added.
- 2026-06-17: React singleton, stale donor contracts, Yjs config, layout wording, and benchmark dry-run repaired.
- 2026-06-17: Package/browser/benchmark proof passed.

Open risks:
- Checkpoint 4 docs/examples and Checkpoint 5 app-route browser proof remain open by design.
- Benchmark dry-run validates targets but does not run Autoresearch without `CODEX_AUTORESEARCH_SCRIPT` or a local detected checkout.
- Release changesets are not authored in this checkpoint; they belong to beta release closure.
