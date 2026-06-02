# Slate AR target finalize pagination

Objective:
Target-back Slate AR perf wins, run finalize preview, and set up the next
pagination loop with auditable plan/check evidence.

Goal plan:
docs/plans/2026-06-01-slate-ar-target-finalize-pagination.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user request
- id / link: local chat request, 2026-06-01
- title: Target-back the three Slate AR metrics and prepare pagination AR next step
- acceptance criteria: the fanout, rich-text structural ops, and huge-doc
  virtualized type-to-paint metrics are first-class benchmark targets; target
  report/check artifacts are current; `slate-ar-finalize preview` is run; the
  next pagination AR target setup is inspected without starting unsafe review
  branches or a blind optimization loop.

Completion threshold:
- Done when `benchmarks/targets/slate-v2.json` has exact target contracts for
  `react-runtime-node-fanout`, `core-rich-text-operations-compare`, and
  `react-huge-document-virtualized-type-to-paint`; generated target history and
  report match; all four relevant targets dry-run through Autoresearch setup;
  `pnpm slate:ar:finalize-preview` has recorded the current finalization
  blocker; and `pnpm slate:ar:setup-target -- react-pagination-virtualized-char-burst`
  records the next safe pagination loop setup.
- Task closure is legal only when the verification evidence below is recorded
  and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-slate-ar-target-finalize-pagination.md` passes.

Verification surface:
- Source audit: `benchmarks/targets/slate-v2.json`.
- Generated artifacts: `benchmarks/targets/history/slate-v2-latest.json` and
  `benchmarks/targets/reports/slate-v2.md`.
- Commands: `pnpm bench:targets:check`, `pnpm bench:targets:report:check`,
  `pnpm bench:targets:dry-run -- <target-id>` for the three new/exact targets
  plus pagination, `pnpm slate:ar:setup-target -- react-pagination-virtualized-char-burst`,
  `pnpm slate:ar:state`, `pnpm slate:ar:finalize-preview`, and the autogoal
  completion check.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `benchmarks/targets/slate-v2.json`; generated report/history
  are derived from it.
- Allowed edit scope: benchmark target registry, generated target report/history,
  and this goal plan.
- Browser surface: none changed; browser commands are referenced as correctness
  contracts only.
- Tracker sync: N/A, no issue or PR was requested.
- Non-goals: no Slate runtime changes, no benchmark reruns, no AR branch
  creation, no commit, no push, no PR.

Output budget strategy:
- Reads were scoped to skill files, target registry, target scripts, and
  generated reports. Broad search output was capped with `max_output_tokens`;
  target reports were saved as generated artifacts instead of streamed fully.

Blocked condition:
- A live optimization or finalization branch is blocked without explicit user
  approval because `slate-ar-finalize-preview` reports dirty tree, omitted
  commit overlap, and final-tree coverage warnings. The safe autonomous scope is
  registry setup and read-only AR preview/setup evidence.

Task state:
- task_type: benchmark control-plane update
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: target-backed and verified
- confidence: high
- next owner: user for any mutating finalization or fresh pagination AR segment
- reason: registry/check/report/dry-run/finalize-preview/setup-target all have
  fresh evidence; finalize preview correctly refuses review-branch readiness.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-slate-ar-target-finalize-pagination.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal`, `slate-ar`, `slate-ar-finalize`, and `slate-ar-perf`. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created the active objective. |
| Source of truth read before edits | yes | Read `benchmarks/targets/slate-v2.json` and `tooling/scripts/bench-targets.mjs`. |
| Tracker comments and attachments read | no | N/A: no tracker item or attachment in this request. |
| Video transcript evidence required | no | N/A: no video evidence is part of this control-plane task. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no runtime/code behavior changed. |
| TDD decision before behavior change or bug fix | no | N/A: target registry/report update only. |
| Branch decision for code-changing task | no | N/A: no branch/commit/PR requested. |
| Release artifact decision | yes | No release artifact: internal benchmark/AR control-plane only. |
| Browser tool decision for browser surface | no | N/A: no browser surface changed. |
| PR expectation decision | yes | No PR requested. |
| Tracker sync expectation decision | yes | No tracker sync requested. |
| Output budget strategy recorded | yes | Recorded above; commands/searches were scoped and capped. |
| Agent-native pack selected | yes | Selected because AR target commands are agent-facing workflow surfaces. |
| Agent-facing action surface identified | yes | `bench:targets:*` and `slate:ar:*` package scripts. |
| Source rule versus generated mirror boundary identified | yes | Source is `benchmarks/targets/slate-v2.json`; report/history are generated. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; no UI action parity gap applies to CLI target registry work. |
| Package/API pack selected | yes | Selected conservatively because target registry describes package/workspace verification. |
| Public surface or package boundary identified | yes | No public package API or export boundary changed. |
| Release artifact path selected | yes | N/A: no published user-visible package delta. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset required. |
| Barrel/export impact decision recorded | yes | N/A: no exports or file layout changed. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the registry/report/setup/finalize commands named in this plan. | `pnpm bench:targets:check`, `pnpm bench:targets:report:check`, four target dry-runs, `pnpm slate:ar:setup-target -- react-pagination-virtualized-char-burst`, `pnpm slate:ar:state`, and `pnpm slate:ar:finalize-preview` completed. |
| Bug reproduced before fix | no | Record N/A with reason. | N/A: no product bug was fixed in this task. |
| Targeted behavior verification | yes | Verify target registry behavior. | `pnpm bench:targets:list` shows exact metrics for fanout, rich-text structural ops, huge-doc virtualized type-to-paint, and pagination char-burst. |
| TypeScript or typed config changed | no | Record N/A with reason. | N/A: no TypeScript or typed config changed. |
| Package exports or file layout changed | no | Record N/A with reason. | N/A: no exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Record N/A with reason. | N/A: no manifest, lockfile, or install graph changed. |
| Agent rules or skills changed | no | Record N/A with reason. | N/A: no `.agents/rules/**` or skill source changed. |
| Workspace authority proof | yes | Run verification in `plate-2`, the control-plane workspace. | All `pnpm bench:targets:*` and `pnpm slate:ar:*` commands ran from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Record N/A with reason. | N/A: browser commands are only target correctness contracts. |
| Browser final proof | no | Record N/A with reason. | N/A: no browser UI changed. |
| CI-controlled template output changed | no | Record N/A with reason. | N/A: no `templates/**` touched. |
| Package behavior or public API changed | no | Record N/A with reason. | N/A: benchmark control-plane only. |
| Registry-only component work changed | no | Record N/A with reason. | N/A: no `apps/www/src/registry/**` component work. |
| Docs or content changed | yes | Verify source-backed claims. | This goal plan records command evidence; generated target report is derived from the JSON registry. |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary. | Failure mode is stale/unsafe AR finalization; `pnpm slate:ar:finalize-preview` reports dirty-tree/overlap/final-tree warnings and says to rework/collapse or use current-tree. |
| Agent-native review for agent/tooling changes | yes | Load reviewer or record waiver. | Loaded `agent-native-reviewer`; no action-parity issue applies because this is CLI target metadata, not user UI action. |
| Local install corruption suspected | no | Record N/A with reason. | N/A: no install-corruption failure shape appeared. |
| Autoreview for non-trivial implementation changes | no | Record waiver. | N/A: current checkout has large unrelated dirty runtime work; this task's change is mechanically verified target metadata, and reviewing the whole dirty tree would be misleading. |
| PR create or update | no | Record N/A with reason. | N/A: no PR requested. |
| Task-style PR body verified | no | Record N/A with reason. | N/A: no PR requested. |
| PR proof image hosting | no | Record N/A with reason. | N/A: no PR/browser proof image. |
| Tracker sync-back | no | Record N/A with reason. | N/A: no tracker item. |
| Final handoff contract | yes | Fill final handoff fields. | Final handoff fields below summarize outcome, caveat, design, and verification. |
| Final lint | no | Record N/A with reason. | N/A: JSON/report/plan update only; formatting validated by JSON parse and target checks. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed. | Search/read commands were scoped and capped; one broad `rg` was truncated by tool output but not needed for decisions. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-slate-ar-target-finalize-pagination.md`. | Run after this plan is filled. |
| Agent source / generated sync | no | Record N/A with reason. | N/A: no agent rule source changed. |
| Agent action discoverability | yes | Source-audit action surface. | `package.json` exposes `bench:targets:*`, `slate:ar:setup-target`, `slate:ar:init-target`, `slate:ar:finalize-preview`, and related shortcuts. |
| Agent-native review | yes | Load reviewer or record N/A. | Loaded reviewer; no UI/agent parity finding for target registry metadata. |
| Public API / package boundary proof | yes | Source-audit boundary. | No public package API/export changed; only benchmark control-plane JSON/report/plan. |
| Release artifact classification | yes | Record classification. | Internal benchmark/AR control-plane and generated evidence report only. |
| Published package changeset | no | Record N/A with reason. | N/A: no published package delta. |
| Registry changelog | no | Record N/A with reason. | N/A: not registry component work. |
| No release artifact | yes | Record exact reason. | Internal-only benchmark/AR target metadata; no user-visible package behavior/API/types/config/runtime delta. |
| Package typecheck/build/test | no | Record N/A with reason. | N/A: no package source changed. |
| Barrel/export generation | no | Record N/A with reason. | N/A: no exported files changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skills, registry, target tooling, and existing AR state read. | implementation |
| Implementation | complete | Target registry patched; report/history regenerated. | verification |
| Verification | complete | Target check/report check/dry-runs/setup-target/state/finalize-preview completed. | closeout |
| PR / tracker sync | N/A | No PR or tracker sync requested. | final response |
| Closeout | complete | Plan filled; autogoal completion check runs last. | final response |

Findings:
- `react-runtime-node-fanout` was missing from the target registry.
- `core-rich-text-operations-compare` still used generic `benchmark_seconds`
  instead of `rich_text_structural_ops_p95_ms`.
- Huge-doc virtualized type-to-paint needed its own target instead of mutating
  the generic browser-trace Evidence Kit import.
- `slate-ar-finalize-preview` is not ready for review branches because the AR
  history overlaps a dirty, broad tree.

Decisions and tradeoffs:
- Added a separate huge-doc virtualized target instead of rewriting the generic
  imported browser-trace target.
- Kept pagination as the next read-only setup target; did not start a new
  mutating AR packet or branch finalization without approval.

Implementation notes:
- Updated `benchmarks/targets/slate-v2.json`.
- Regenerated `benchmarks/targets/history/slate-v2-latest.json` and
  `benchmarks/targets/reports/slate-v2.md`.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `node -e "JSON.parse(...)"`: `json ok`.
- `pnpm bench:targets:check`: `benchmark-targets ok: 26 targets`.
- `pnpm bench:targets:list | rg ...`: the relevant target ids print exact
  metrics:
  `slate_react_runtime_node_fanout_count`,
  `rich_text_structural_ops_p95_ms`,
  `react_huge_doc_type_to_paint_p95_ms`, and
  `pagination_virtualized_vs_table_ratio`.
- `pnpm bench:targets:report`: regenerated target history and Markdown report.
- `pnpm bench:targets:report:check`: generated files match.
- `pnpm bench:targets:dry-run -- react-runtime-node-fanout`: setup OK.
- `pnpm bench:targets:dry-run -- core-rich-text-operations-compare`: setup OK.
- `pnpm bench:targets:dry-run -- react-huge-document-virtualized-type-to-paint`:
  setup OK.
- `pnpm bench:targets:dry-run -- react-pagination-virtualized-char-burst`:
  setup OK.
- `pnpm slate:ar:setup-target -- react-pagination-virtualized-char-burst`:
  setup-plan OK; next safe stage is session setup/new segment, with warnings
  about existing dirty/session artifacts.
- `pnpm slate:ar:state`: current pagination AR session has 3 runs, 2 kept,
  best development metric 2.43, and promotion still blocked by dev-only
  evidence/dirty drift.
- `pnpm slate:ar:finalize-preview`: preview OK but `ready=false`; warnings show
  excluded unkept commits, missing final-tree coverage, planned-file overlap,
  dirty tree, and overlapping kept runs.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high for target setup; medium for promotion readiness because
  finalization preview correctly blocks.
- Flow table:
  - Reproduced: N/A, no product bug.
  - Verified: target registry/report/setup/finalize commands listed above.
- Browser check: N/A, no browser surface changed.
- Outcome: the three finished metrics are target-backed; pagination target setup
  is ready for a fresh safe loop; finalization preview says review branches are
  not safe from the current tree.
- Caveat: AR promotion remains dev-only until a promotion-grade pagination
  repeat/full integration sweep or accepted current-tree finalization path.
- Design:
  - Chosen boundary: benchmark target registry as control plane.
  - Why not quick patch: generic metric placeholders make AR optimize the wrong
    thing.
  - Why not broader change: no runtime/package API change was needed.
- Verified: see verification evidence.
- PR body verified: N/A, no PR.

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker item.
- Browser proof: N/A, no browser surface changed.
- Caveats: finalization preview is blocked by dirty tree/overlap; promotion
  evidence is still dev-only.

Timeline:
- 2026-06-01T15:41:09.342Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I? | Closeout |
| Where am I going? | Final response after autogoal completion check |
| What is the goal? | Target-back three Slate AR metrics, preview finalization, and prepare the next pagination AR loop |
| What have I learned? | Finalization branches are not safe from the current dirty/overlapping AR tree |
| What have I done? | Patched target registry, regenerated reports, ran target checks/dry-runs, inspected pagination setup/state, and ran finalize preview |

Open risks:
- No runtime risk from this task. Workflow risk remains: do not create AR review
  branches from the current preview; use a clean current-tree plan or a fresh
  promotion segment.
