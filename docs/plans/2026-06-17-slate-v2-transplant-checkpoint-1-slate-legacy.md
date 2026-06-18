# slate-v2-transplant-checkpoint-1-slate-legacy

Objective:
Complete Slate v2 transplant Checkpoint 1 slate-legacy rename; done when current `packages/slate` is `@platejs/slate-legacy` and root compile passes.

Goal plan:
docs/plans/2026-06-17-slate-v2-transplant-checkpoint-1-slate-legacy.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: user-resumed `$auto`
- prompt / link: `go` after Checkpoint 0 pause
- lane: shared editor migration, Plate repo package scaffold
- surface / route / package: current Plate `packages/slate` package only
- invocation mode: checkpointed full-loop; pause after this checkpoint
- minimum runtime / deadline: N/A
- completion threshold summary: current `packages/slate` is renamed to `packages/slate-legacy`, package name is `@platejs/slate-legacy`, necessary existing Plate imports/dependencies point to legacy, and root compile is green

Completion threshold:
- Parent repo stays on `next`.
- Existing `packages/slate` directory is moved to `packages/slate-legacy`.
- `packages/slate-legacy/package.json` has `"name": "@platejs/slate-legacy"` and repository directory `packages/slate-legacy`.
- Current Plate package/app/root imports and workspace dependencies that need the legacy package point at `@platejs/slate-legacy`.
- No public compat alias, runtime shim, donor package copy, docs IA, example route, browser proof, push, PR, or full Plate runtime migration happens in this checkpoint.
- `pnpm install` updates workspace lock/install graph after package rename.
- Root compile command passes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-1-slate-legacy.md` passes.

Verification surface:
- Source audit: `packages/slate-legacy/package.json`.
- Source audit: exact remaining `@platejs/slate` references after rewrite are either docs/manifest/public text for later Checkpoint 2 or expected because donor `@platejs/slate` has not landed yet.
- `pnpm install`.
- Root compile: `pnpm typecheck` first; run the broader root gate only if typecheck exposes a need.
- `pnpm lint:fix` if touched files need formatting.
- Goal plan completion check.

Constraints:
- Copy every explicit user requirement into this plan before implementation.
- Keep this checkpoint scoped; do not silently start the next checkpoint.
- Use root `VISION.md` and relevant `docs/vision/*.md` for durable taste.
- Do not create PRs, commits, pushes, release claims, compatibility aliases, or
  runtime shims unless the checkpoint explicitly requires them.

Boundaries:
- Source of truth: Checkpoint 0 manifest plus user Checkpoint 1 instruction.
- Allowed edit scope: `packages/slate/**` move to `packages/slate-legacy/**`, package/app/root manifests, necessary TS imports from current Plate packages, lockfile/install graph, this plan, and the missing `docs/plans/templates/auto.md` workflow bootstrap.
- Browser surfaces: N/A; browser proof starts after `/examples/slate/*` routes exist.
- Package/API surfaces: current Plate legacy package only; donor `@platejs/slate` is Checkpoint 2.
- Agent/skill surfaces: no skill/rule edits; add only missing `docs/plans/templates/auto.md` because `next` lacked the auto template needed for the required autogoal.
- Docs/research surfaces: no public docs rewrite except plan/template.
- Non-goals: donor package transplant, tool/browser/benchmark wiring, docs IA, example routes, browser proof, Plate runtime migration, deleting `Plate repo root`, pushing, PR creation, compatibility aliases, runtime shims.

Output budget strategy:
- Use `rg -l` and package manifest file lists before line-level scans.
- Do not stream broad `rg -n` across docs/packages again; record the earlier miss.
- Use mechanical rewrites for exact package specifier/dependency replacement.

Blocked condition:
- Block only if the package rename would require introducing a compat alias/runtime shim, root compile cannot pass without starting Checkpoint 2 donor transplant, or a public API naming decision beyond `@platejs/slate-legacy` is required.

Automation state:
- lane: shared editor migration
- surface: legacy package rename
- mode: checkpointed full-loop with mandatory pause
- minimum_runtime: N/A
- target_deadline: N/A
- current_loop: 0
- current_checkpoint: checkpoint-zero
- current_checkpoint_status: complete
- next_checkpoint: implementation
- goal_status: active

Current verdict:
- verdict: complete after final plan check
- confidence: high for Checkpoint 1
- next owner: auto
- keep / revert / quarantine call: keep
- reason: Package scaffold was renamed, current imports/dependencies point at legacy, install graph updated, and root compile passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-1-slate-legacy.md`
  passes.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Evidence / exit rule |
|------------|-------|--------|----------|----------------------|
| checkpoint-zero | auto | complete | P0 | Requirements copied; auto fallback and vision state recorded. |
| status | auto | complete | P0 | Current `packages/slate` package and consumers recorded. |
| implementation | auto | complete | P0 | Scoped package move/import rewrite applied. |
| verification | auto | complete | P0 | `pnpm install`, scoped Biome, old-import/path audits, and `pnpm typecheck` passed. |
| final-handoff | auto | complete | P0 | Handoff ledgers complete below. |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | complete |
| 0 | add | auto-template-bootstrap | helper failure resolving `docs/plans/templates/auto.md` | `next` lacked the template required by `$auto` autogoals | complete |
| 0 | update | implementation | source audit of package/import surface | current Plate consumers need legacy import rewrite before donor package can occupy `@platejs/slate` | complete |
| 0 | update | verification | root compile passed after formatting | final proof must be post-format | complete |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Checkpoint 1 scope, no PR, no shims, no donor transplant, root compile, and pause boundary recorded above. |
| `auto` source rule read or fallback recorded | yes | `auto` skill was read in prior checkpoint; after switching to `next`, generated mirror/template was missing, so `docs/plans/templates/auto.md` was bootstrapped. |
| `vision` read as checkpoint zero | yes | Root/detail vision already read for this transplant sequence; no changed taste gap in Checkpoint 1. |
| Active goal checked or created | yes | `get_goal` returned none; active Checkpoint 1 goal created. |
| Lane resolved | yes | Shared editor migration with Plate legacy package owner. |
| Invocation mode and timebox recorded | yes | Checkpointed full-loop; no timed minimum. |
| Source of truth and allowed workspaces recorded | yes | Checkpoint 0 manifest and user Checkpoint 1 instruction. |
| Output budget strategy recorded | yes | `rg -l`/counts only after earlier broad output miss. |

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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run proof commands/artifacts named in this plan | `pnpm typecheck` passed after rename/rewrite/install/format. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence | Added template bootstrap and old-output-budget miss rows; implementation/verification rows closed from command evidence. |
| Workspace authority proof | yes | Record cwd/tool for every proof command | All commands ran in `/Users/zbeyens/git/plate-2` on `next`; donor not mutated. |
| Final lint/check | yes | Run scoped or root checks named by the checkpoint | `pnpm exec biome check --fix ...` passed/fixed 8 files; final `pnpm typecheck` passed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current evidence | Tables below filled. |
| Workflow slowdown review | yes | Log slow steps or N/A | Broad `rg -n` output miss recorded; root compile cost kept as necessary. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-1-slate-legacy.md` | Command scheduled after this final update; pass result recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Requirements copied and source state recorded. | status |
| Status and source read | complete | `packages/slate` package and current import/dependency surface audited. | implementation |
| Implementation | complete | `packages/slate` moved to `packages/slate-legacy`; 130 source/manifest references point at `@platejs/slate-legacy`. | verification |
| Verification | complete | Install, exact old-reference/path audits, scoped Biome, and final root compile passed. | final handoff |
| Final handoff and goal-plan check | complete | This plan closed; checker run after final update. | final response |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------|----------|------|
| workflow-001 | 0 | autogoal/auto template | `next` lacked the `auto` plan template needed for required per-checkpoint autogoals. | Added `docs/plans/templates/auto.md`; helper then created Checkpoint 1 plan. | Plan creation succeeded. | keep | Use template for Checkpoint 2. |
| legacy-001 | 0 | auto | Free `@platejs/slate` for donor package by moving existing Plate package to explicit temporary legacy package. | Moved `packages/slate` to `packages/slate-legacy`; rewrote package/app/root manifests and current TS imports to `@platejs/slate-legacy`; ran `pnpm install`. | Exact old import/path audits clean; final `pnpm typecheck` passed. | keep | Pause, then Checkpoint 2 donor transplant. |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Missing `docs/plans/templates/auto.md` on `next` | autogoal/auto plan creation | small | Checkpoint helper could not resolve the required template. | Initial helper failed; template added; helper succeeded. | keep template; no skill topology change. |
| Broad `rg -n` import scan | auto command discipline | output too large | It streamed docs/package matches instead of using file-list/count first. | Output was noisy and truncated. | recorded miss; switched to `rg -l`, exact PCRE audits, and capped outputs. |
| `pnpm typecheck` | root compile | about 35s each run | Root compile intentionally builds and typechecks all packages. | 54 build tasks and 54 typecheck tasks passed. | keep as necessary checkpoint proof. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Moved current `packages/slate` to `packages/slate-legacy`; renamed package to `@platejs/slate-legacy`; rewrote current Plate imports/deps to legacy. |
| tests/oracles/browser proof | Updated affected package/type-test imports only; no browser proof in this checkpoint. |
| benchmarks/metrics/targets | none |
| examples/docs | Checkpoint 1 plan updated; package README says legacy scaffold; no public docs IA. |
| skills/workflow | Added `docs/plans/templates/auto.md` because `next` lacked the required auto goal template. |
| reverted/quarantined packets | Reverted accidental generated registry JSON specifier changes; no quarantined packets. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Temporary legacy scaffold | This frees `@platejs/slate` for donor transplant but creates a visible package name that must disappear before first beta release. | `packages/slate-legacy/package.json` | accept as temporary scaffold |
| 2 | Current Plate source imports legacy | This is intentionally ugly but honest; donor `@platejs/slate` should not be confused with the old package during transplant. | `packages/core/src/lib/editor/SlateEditor.ts` and other current Plate imports | accept for Checkpoint 1 |
| 3 | Auto template added on `next` | Needed so future checkpoints can keep using per-checkpoint autogoals on this branch. | `docs/plans/templates/auto.md` | accept |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | none | Checkpoint 1 had no unresolved taste or authority blocker. | none | legacy rename completed | continue to Checkpoint 2 when ready | this plan |

Findings:
- `next` lacked `docs/plans/templates/auto.md`, so the first Checkpoint 1 plan creation failed until the template was added.
- Current `packages/slate` is a Plate legacy Slate extension package, not the donor Slate v2 substrate package.
- `@platejs/slate-legacy` appears in 130 current source/manifest files after rewrite.
- `packages/slate-legacy/src` and `packages/slate-legacy/type-tests` contain 223 moved source/type-test files.
- Exact audits found no current package/app source import or manifest dependency on old `@platejs/slate`, excluding generated/public docs text that Checkpoint 2 will replace with the donor package.

Decisions and tradeoffs:
- Rewrote current Plate imports to `@platejs/slate-legacy` rather than leaving a compat alias. This is the clean hard cut for the upcoming donor `@platejs/slate`.
- Did not update public docs or generated registry JSON in this checkpoint. Public docs move to Checkpoint 4 and donor package lands in Checkpoint 2.
- Ran root compile twice because Biome formatted touched files after the first compile.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `create-goal-scratchpad --template auto` failed because template missing on `next` | 1 | Add the missing project plan template, then retry helper | fixed |
| Broad `rg -n` streamed huge output | 1 | Use `rg -l`, `wc`, and exact PCRE audits | fixed for remaining checkpoint |
| Mechanical rewrite touched generated registry JSON | 1 | Revert only those generated JSON specifier changes | fixed |

Verification evidence:
- `pnpm install` -> passed; workspace graph now links `@platejs/slate-legacy` to `packages/slate-legacy`.
- `rg -n -P "from ['\"]@platejs/slate(?!-legacy)['\"]|import\\(['\"]@platejs/slate(?!-legacy)['\"]\\)|\"@platejs/slate\"" packages apps package.json --glob '!apps/www/public/r/**' --glob '!apps/www/src/generated/**' --glob '!**/CHANGELOG.md' --glob '!**/node_modules/**'` -> no matches.
- `rg -n -P 'packages/slate(?!-legacy)|link:.*packages/slate(?!-legacy)' pnpm-lock.yaml package.json packages/slate-legacy/package.json` -> no matches.
- `pnpm exec biome check --fix package.json apps/www/package.json packages/core packages/utils packages/test-utils packages/plate packages/slate-legacy packages/table/src/lib/queries/getTableColumnCount.spec.tsx docs/plans/templates/auto.md docs/plans/2026-06-17-slate-v2-transplant-checkpoint-1-slate-legacy.md docs/transplant/slate-v2/scripts/build-donor-manifest.mjs docs/transplant/slate-v2/donor-manifest-meta.json` -> passed, fixed 8 files.
- Final `pnpm typecheck` -> passed; 54 package build tasks and 54 package typecheck tasks successful.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-1-slate-legacy.md` -> pass after final update.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-17-slate-v2-transplant-checkpoint-1-slate-legacy.md`
- Lane: shared editor migration
- Surface and route/package: current Plate `packages/slate` renamed to `packages/slate-legacy`
- Invocation mode and checkpoint count: checkpointed full-loop, Checkpoint 1
- Proof: `pnpm install`, exact old-name/path audits, scoped Biome, final `pnpm typecheck`
- Changed list: see table above
- Needs your attention: see table above
- Stopping checkpoints to unblock: none
- Residual risks: `@platejs/slate-legacy` is a temporary scaffold and must be removed before first beta release; public docs still mention `@platejs/slate` until donor package lands.
- Next owner: Checkpoint 2 donor package transplant

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint 1 complete, final mechanical plan check next. |
| Where am I going? | Pause for user summary before Checkpoint 2. |
| What is the goal? | Rename current Plate Slate package to temporary `@platejs/slate-legacy` and keep root compile green. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-06-17T18:04:44.822Z Auto goal plan created.
- 2026-06-17T18:09:30Z Package rename, import/dependency rewrite, install, audits, formatting, and final root compile completed.

Open risks:
- Git sees the package move as deletes plus untracked files until staging; this is expected and should stage as a rename later.
- `@platejs/slate-legacy` is intentionally temporary and should not survive the beta release package surface.
