# slate-v2-transplant-checkpoint-2-donor-packages

Objective:
Complete Slate v2 transplant Checkpoint 2 donor packages; done when eight donor packages are in final @platejs paths and focused package checks pass.

Goal plan:
docs/plans/2026-06-17-slate-v2-transplant-checkpoint-2-donor-packages.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- package-api rows materialized by helper, despite the template header saying none.

Automation source:
- type: user-requested checkpoint in Slate v2 transplant sequence
- prompt / link: "[$auto] Slate v2 transplant to Plate next branch" follow-up "go"
- lane: transplant / package substrate
- surface / route / package: `packages/slate*`, `packages/browser`, `packages/yjs`, root package graph
- invocation mode: one checkpoint, one-shot execution, pause after completion
- minimum runtime / deadline: N/A: no timed checkpoint in this step
- completion threshold summary: donor package source is transplanted to final flat `@platejs/*` paths, package names/imports are rewritten without public compat aliases, and focused package checks pass.

Completion threshold:
- Eight donor packages from `Plate repo root` commit `f0e5ad1ae7caa14027dc57bc38bd457909bd4b97` are copied or merged into final Plate package paths:
  `packages/slate`, `packages/slate-dom`, `packages/slate-react`, `packages/slate-history`, `packages/slate-hyperscript`, `packages/slate-layout`, `packages/browser`, and `packages/yjs`.
- Package names are final `@platejs/*` names: `@platejs/slate`, `@platejs/slate-dom`, `@platejs/slate-react`, `@platejs/slate-history`, `@platejs/slate-hyperscript`, `@platejs/slate-layout`, `@platejs/browser`, `@platejs/yjs`.
- Public compat aliases and runtime shims are not added. Temporary `@platejs/slate-legacy` remains only as the Checkpoint 1 migration scaffold.
- Current `packages/slate-legacy` is preserved. Existing `packages/yjs` and any current browser/playwright package are inspected before overwrite/merge.
- `Plate repo root` remains intact and is not deleted.
- This checkpoint does not start docs IA, examples routes, browser proof, tooling parity, or full Plate runtime migration.
- `pnpm install` and focused package checks/source audits pass, or a concrete blocker is recorded.
- Closure is legal only when this checkpoint's source-of-truth rows, proof
  commands, changed list, review-attention rows, stopping checkpoints, workflow
  slowdowns, and final handoff contract are complete or N/A with evidence, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-2-donor-packages.md`
  passes.

Verification surface:
- Manifest/source audit against `docs/transplant/slate-v2/donor-manifest-meta.json` and donor package paths.
- Source audit that package manifests use final `@platejs/*` names and package imports do not point at old donor package names.
- `pnpm install`.
- Focused package typecheck/build/test proof for transplanted packages, adjusted to the package scripts available after transplant.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-2-donor-packages.md`.

Constraints:
- Copy every explicit user requirement into this plan before implementation.
- Keep this checkpoint scoped; do not silently start the next checkpoint.
- Use root `VISION.md` and relevant `docs/vision/*.md` for durable taste.
- Do not create PRs, commits, pushes, release claims, compatibility aliases, or
  runtime shims unless the checkpoint explicitly requires them.
- Work directly on `next`.
- No PR to `next` until first release.
- Pause after this checkpoint with a concise summary before continuing.
- Publish all eight beta packages later; do not mark any package experimental in this checkpoint.
- Root compile is required before push; no push is part of this checkpoint.
- Browser behavior proof must eventually hit `/examples/slate/*`, but browser proof belongs to Checkpoint 5, not this checkpoint.

Boundaries:
- Source of truth: `Plate repo root` donor commit `f0e5ad1ae7caa14027dc57bc38bd457909bd4b97`, Checkpoint 0 manifest under `docs/transplant/slate-v2/`, root `VISION.md`.
- Allowed edit scope: donor package destinations, package manifests/lockfile/workspace wiring needed for those packages, transplant scripts/audits if useful, and this goal plan.
- Browser surfaces: N/A for this checkpoint; do not add `/examples/slate/*` routes yet.
- Package/API surfaces: final `@platejs/*` donor package names and source imports.
- Agent/skill surfaces: no skill source changes unless the checkpoint workflow itself blocks; record missing generated `auto` skill as debt only.
- Docs/research surfaces: this plan and transplant ledger only; no public docs IA yet.
- Non-goals: docs app shell, examples routes, Playwright port, beta release CI, full Plate runtime migration, deleting `Plate repo root`, PR/commit/push, public aliases, runtime shims.

Output budget strategy:
- Read package manifests and package file counts first. Use `rg --files`, `find`, and exact `rg -l`/PCRE audits instead of broad match dumps. Cap command output and save large audit results to `docs/transplant/slate-v2/` artifacts when needed.

Blocked condition:
- Stop only if current `packages/yjs` or package-browser ownership conflicts cannot be merged losslessly inside this checkpoint, a focused package check reveals a deeper tooling migration that belongs to Checkpoint 3, or donor/package source is unavailable at the recorded commit.

Automation state:
- lane: transplant / package substrate
- surface: eight Slate donor packages
- mode: complete
- minimum_runtime: N/A
- target_deadline: checkpoint completion, then pause
- current_loop: 0
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: Checkpoint 3 tooling parity, after user pause
- goal_status: ready-to-close after autogoal check

Current verdict:
- verdict: checkpoint-complete
- confidence: 0.9; package transplant, names, install, source audits, typecheck, and build are green. Package-local Bun tests still need Checkpoint 3 test/tooling parity.
- next owner: auto
- keep / revert / quarantine call: keep
- reason: the eight donor packages are present in final flat `@platejs/*` paths without public compat aliases; the remaining failure is test-runner wiring, not package source loss.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-2-donor-packages.md`
  passes.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Evidence / exit rule |
|------------|-------|--------|----------|----------------------|
| checkpoint-zero | auto | complete | P0 | Requirements copied; `auto` generated skill missing was recorded as workflow debt; root `VISION.md` and transplant boundaries applied. |
| status | auto | complete | P0 | Donor commit and eight package map confirmed. |
| implementation | auto | complete | P0 | Transplant script copied packages and rewrote manifests/imports. |
| verification | auto | complete | P0 | Source audits/typecheck/build pass; package test split recorded for Checkpoint 3. |
| final-handoff | auto | complete | P0 | Ledgers below filled before checkpoint pause. |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | superseded |
| 1 | close Checkpoint 2 after focused proof | verification, final-handoff | package audits, typecheck, build, test probe | package source is transplanted; test runner parity belongs to next checkpoint | keep |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Completion threshold and constraints copied at top of plan before implementation. |
| `auto` source rule read or fallback recorded | yes | `.agents/skills/auto/SKILL.md` is missing on this branch; used `docs/plans/templates/auto.md` fallback and recorded workflow debt. |
| `vision` read as checkpoint zero | yes | Root `VISION.md` drove hard-cut/no-compat boundary; no public alias layer was added. |
| Active goal checked or created | yes | Active goal is this Checkpoint 2 transplant objective. |
| Lane resolved | yes | Lane: transplant/package substrate. |
| Invocation mode and timebox recorded | yes | One checkpoint, no timed loop, pause after completion. |
| Source of truth and allowed workspaces recorded | yes | Donor commit `f0e5ad1ae7caa14027dc57bc38bd457909bd4b97`; allowed scope is package destinations, lockfile, transplant script, and plan. |
| Output budget strategy recorded | yes | Used capped output, exact package audits, and avoided broad source-map dumps after the first miss. |
| Package/API pack selected | yes | Final public package names are the eight `@platejs/*` beta packages. |
| Public surface or package boundary identified | yes | Public boundary is package manifest/export surface; no docs/examples/browser public route work in this checkpoint. |
| Release artifact path selected | yes | No changeset in this checkpoint: beta package birth inside transplant branch, release notes handled later in release checkpoint. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no `.changeset` authored for this transplant checkpoint. |
| Barrel/export impact decision recorded | yes | N/A: donor package export files copied; no repo barrel generator owns these packages yet. |

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
- [x] Workflow slowdowns are logged or marked none.
- [x] Output budget discipline is followed.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: no changeset for this transplant checkpoint; release docs/checkpoints own publication prose.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no `.changeset` required here.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. Reason: package birth/transplant on `next`, public release artifact comes later.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no barrel generator or release note in this checkpoint.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run proof commands/artifacts named in this plan | Eight package manifests, source import audit, `pnpm install`, focused typecheck, focused build, and test probe recorded below. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence | Checkpoint supervisor, packet ledger, slowdowns, risks, and stopping checkpoint updated after verification. |
| Workspace authority proof | yes | Record cwd/tool for every proof command | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Final lint/check | yes | Run scoped or root checks named by the checkpoint | `pnpm exec biome check --fix ...`, package typecheck, and package build passed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current evidence | Changed list, needs-your-attention, and stopping checkpoint tables filled below. |
| Workflow slowdown review | yes | Log slow steps or N/A | Slowdowns logged below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-2-donor-packages.md` | Run after this edit. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Manifest audit shows all eight packages are `@platejs/*` `54.0.0-beta.0` public; old bare donor import audit is clean. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package birth on `next`, no individual changeset here; release checkpoint owns final release docs. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | N/A: transplant checkpoint before first beta release; no changeset file authored. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry files changed. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | No release artifact in this checkpoint because beta publication is a later release gate. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Typecheck/build pass. `@platejs/slate-history` package test fails from source/dist runtime split; routed to Checkpoint 3 tooling parity. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: packages do not use Plate barrel generation yet. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | requirements and boundaries copied into plan | status closed |
| Status and source read | complete | donor commit/package map confirmed | implementation closed |
| Implementation | complete | script copied eight packages into final paths | verification closed |
| Verification | complete | package audits/typecheck/build pass; test probe routed | final handoff closed |
| Final handoff and goal-plan check | complete | ledgers filled; autogoal checker queued | pause before Checkpoint 3 |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------|----------|------|
| donor transplant script | 1 | auto | source copy should be reproducible from fixed donor commit | `docs/transplant/slate-v2/scripts/transplant-donor-packages.mjs` | script run produced file counts for all eight packages | keep | reuse for future parity audits |
| eight package materialization | 1 | auto | final flat `@platejs/*` packages can exist without compat aliases | `packages/slate`, `packages/slate-dom`, `packages/slate-react`, `packages/slate-history`, `packages/slate-hyperscript`, `packages/slate-layout`, `packages/browser`, `packages/yjs` | manifest audit and old bare import audit pass | keep | Checkpoint 3 tool commands |
| workspace wiring | 1 | auto | root install should see every package as workspace dependency | root `package.json`, `pnpm-lock.yaml` | `pnpm install` passed with known unrelated peer warnings | keep | root command aliases in Checkpoint 3 |
| fixture preload | 1 | auto | donor JSX fixture tests need a Plate-local JSX bridge | `config/slate-test-jsx.js`, `config/slate-test-jsx-globals.d.ts`, `packages/slate/test/index.spec.ts`, `packages/slate-history/test/index.spec.ts` | syntax/lint pass; package test exposed deeper runtime split | keep but route | Checkpoint 3 test resolver |
| browser README rename | 1 | auto | private donor browser docs need package name cleanup before public docs lane | `packages/browser/README.md` | stale install/package path audit clean | keep | public docs in Checkpoint 4 |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| broad `rg` over generated maps | auto | noisy output, not compute-heavy | initial audit touched `dist` source maps | learned to add `--glob '!**/dist/**'` and exact package scope | repaired in final audits |
| rerun transplant after install | auto | reinstall required | script deletes package destinations, including local links | `pnpm install` rerun after transplant | acceptable; document before future reruns |
| package-local Bun tests | Checkpoint 3 | blocks test lane, not source transplant | Bun resolves mixed built `packages/slate/dist/*` and source `packages/slate/src/*` | `pnpm --filter @platejs/slate-history test` fails with runtime/transform registry uninitialized | route to Checkpoint 3 tooling parity |
| generated `auto` skill missing | workflow | small | user invoked `$auto`, but generated mirror is absent on `next` | used `docs/plans/templates/auto.md` fallback | repair after transplant checkpoints if still missing |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added eight donor packages in final paths: `packages/slate`, `packages/slate-dom`, `packages/slate-react`, `packages/slate-history`, `packages/slate-hyperscript`, `packages/slate-layout`, `packages/browser`, `packages/yjs`; updated package manifests to `@platejs/*` beta names. |
| tests/oracles/browser proof | Added Slate donor JSX fixture bridge and preloads for `slate` / `slate-history`; no browser proof yet by scope. |
| benchmarks/metrics/targets | None in this checkpoint. |
| examples/docs | Updated `packages/browser/README.md` naming only; no public docs IA or examples routes yet. |
| skills/workflow | Added/updated transplant script and this autogoal plan. |
| reverted/quarantined packets | None reverted; package test runner parity quarantined to Checkpoint 3. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `packages/yjs` is now donor Slate Yjs | It hard-replaces the older Plate Yjs package path; old app/docs imports remain future migration work. | `packages/yjs/package.json` | Accept for transplant; audit Plate Yjs consumers during runtime migration. |
| 2 | Package tests are not green yet | Typecheck/build are green, but Bun package tests mix built/source Slate runtime state. | `pnpm --filter @platejs/slate-history test` | Make test command parity a Checkpoint 3 requirement. |
| 3 | `@platejs/browser` is package-born but not docs-ready | README naming is cleaned, but routes/docs/browser proof are intentionally later. | `packages/browser/README.md` | Keep private until Checkpoints 4-5 wire docs/examples/proof. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| C3-test-runner | soft | Should package tests run against source aliases or built package artifacts? | The current Bun test lane splits Slate runtime singletons between `dist` and `src`. | Full package test closure. | Package source transplant, typecheck, and build. | In Checkpoint 3, pick one model and make focused package tests green before browser proof. | `pnpm --filter @platejs/slate-history test` |

Findings:
- The eight final package manifests are public `54.0.0-beta.0` `@platejs/*` packages.
- No old bare donor imports remain in the transplanted package `src`, `test`, `README.md`, or `package.json` surfaces checked.
- Typecheck/build pass for all eight packages.
- Package-local Bun tests still need resolver/tooling parity; this is not a safe runtime-code patch inside Checkpoint 2.

Decisions and tradeoffs:
- Replaced the old `packages/yjs` path with donor `@platejs/yjs` rather than adding a legacy alias. This follows the no-compat-alias rule and keeps the path final.
- Kept `slate-layout` as `@platejs/slate-layout`, per user decision.
- Kept `Plate repo root` intact as donor authority; no deletion or source-of-truth switch yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter @platejs/slate-history test` resolves mixed built/source Slate runtime | 1 | Checkpoint 3 should wire package test commands/resolution consistently | Recorded as tooling parity debt, not hidden. |
| Biome rejected function-scope regex literals in transplant script | 1 | Move patterns to top-level constants | Fixed and formatted. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2`: passed; emitted existing peer warnings for legacy Slate/Yjs/React peer edges.
- `node --check docs/transplant/slate-v2/scripts/transplant-donor-packages.mjs`: passed.
- Package manifest audit in `/Users/zbeyens/git/plate-2`: all eight package names are final `@platejs/*`, version `54.0.0-beta.0`, access `public`.
- Old bare donor import audit in transplanted package `src`, `test`, `README.md`, and `package.json`: no matches.
- Stale donor package string audit for `npm install -D slate-browser`, `packages/slate-browser`, `packages/slate-yjs`, and `@slate/yjs`: no matches.
- File counts excluding generated dirs: slate 1249, slate-dom 46, slate-react 255, slate-history 38, slate-hyperscript 45, slate-layout 11, browser 73, yjs 61.
- `pnpm exec biome check --fix docs/transplant/slate-v2/scripts/transplant-donor-packages.mjs config/slate-test-jsx.js config/slate-test-jsx-globals.d.ts packages/browser/README.md docs/plans/2026-06-17-slate-v2-transplant-checkpoint-2-donor-packages.md`: passed, fixed one file.
- `pnpm turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-history --filter=./packages/slate-hyperscript --filter=./packages/slate-layout --filter=./packages/browser --filter=./packages/yjs`: passed, 13 tasks successful.
- `pnpm turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-history --filter=./packages/slate-hyperscript --filter=./packages/slate-layout --filter=./packages/browser --filter=./packages/yjs`: passed, 8 tasks successful.
- `pnpm --filter @platejs/slate-history test`: failed with Slate runtime/transform registry uninitialized because tests resolve both `packages/slate/dist/*` and `packages/slate/src/*`; routed to Checkpoint 3.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-17-slate-v2-transplant-checkpoint-2-donor-packages.md`
- Lane: transplant / package substrate
- Surface and route/package: eight Slate substrate packages under `packages/*`
- Invocation mode and checkpoint count: one checkpoint, pause after completion
- Proof: install, syntax, source audits, focused typecheck, focused build; package test probe recorded as Checkpoint 3 blocker
- Changed list: see table above
- Needs your attention: `packages/yjs` replacement, package-test resolver debt, browser package public-readiness debt
- Stopping checkpoints to unblock: C3 test-runner decision
- Residual risks: no docs/routes/browser proof yet; `Plate repo root` remains source authority; package tests not green until tooling parity
- Next owner: auto Checkpoint 3 tooling parity

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint 2 final handoff. |
| Where am I going? | Pause, then Checkpoint 3 tooling parity if user continues. |
| What is the goal? | Transplant eight Slate v2 donor packages into final `@platejs/*` paths. |
| What have I learned? | Package source transplant is green for typecheck/build; package test command parity is the next real blocker. |
| What have I done? | Added packages, package wiring, transplant script, fixture bridge, browser README cleanup, and this plan evidence. |

Timeline:
- 2026-06-17T18:12:44.149Z Auto goal plan created.
- 2026-06-17 Checkpoint 2 package transplant executed from donor commit `f0e5ad1ae7caa14027dc57bc38bd457909bd4b97`.
- 2026-06-17 Verification completed: audits/typecheck/build green; package-test tooling debt recorded.

Open risks:
- Package tests are not green until Checkpoint 3 resolves Bun source/dist runtime singleton mixing.
- Docs IA, examples routes, browser proof, benchmark commands, and beta CI wiring are still future checkpoints.
- `Plate repo root` remains required donor authority until final no-reference gate.
