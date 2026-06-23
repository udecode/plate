# Core rich text operations AR perf

Objective:
Optimize `core-rich-text-operations-compare` under Plite AR until target
evidence is green, plateaued, or blocked by correctness/architecture proof.

Goal plan:
docs/plans/2026-06-01-core-rich-text-operations-ar-perf.md

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
- title: Run Plite AR perf on `core-rich-text-operations-compare`
- acceptance criteria: initialize or resume the target-backed AR loop, run the
  rich-text compare benchmark, inspect the primary metric and correctness
  gate, optimize if a clear safe owner appears, and stop only when the metric
  is within target, plateaued, or blocked by a correctness/architecture reason.

Completion threshold:
- Done when `core-rich-text-operations-compare` has fresh target-backed AR
  evidence for `rich_text_structural_ops_p95_ms`, and one of these is true:
  metric is below the promotion target, at least two correctness-green packets
  produce less than 5% further gain, or the remaining owner is explicitly
  blocked by correctness/API architecture evidence. Promotion target from the
  registry is below 3x legacy on the structural composite.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-core-rich-text-operations-ar-perf.md` passes.

Verification surface:
- Target setup: `pnpm bench:targets:check`, `pnpm bench:targets:dry-run -- core-rich-text-operations-compare`,
  and `pnpm slate:ar:setup-target -- core-rich-text-operations-compare`.
- Benchmark: `RICH_TEXT_OPS_COMPARE_ITERATIONS=51 bun run bench:core:rich-text-operations:compare:local`
  through the target or AR runner.
- Correctness: `bun check` in `Plate repo root` when a packet is considered keep.
- Completion: autogoal completion check for this plan.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `benchmarks/targets/plite.json` target
  `core-rich-text-operations-compare` plus `Plate repo root/autoresearch.*`.
- Allowed edit scope: `Plate repo root` core/runtime files if profiling points to
  a safe owner, benchmark target/session artifacts, and this plan.
- Browser surface: N/A unless the target reveals a React/browser regression.
- Tracker sync: N/A, no issue/PR/tracker item requested.
- Non-goals: no pagination work in this loop; no review branch, commit, push,
  or PR unless explicitly requested.

Output budget strategy:
- Use target/AR commands and capped `rg`/`sed` reads. Keep large benchmark
  detail in JSON artifacts and report only metrics, deltas, and blockers.

Blocked condition:
- Block if AR refuses a safe segment because existing session/dirty-tree state
  cannot be switched, if `bun check` fails from unrelated existing work and the
  failing owner cannot be isolated, or if the next improvement requires a public
  API/architecture decision outside the current target.

Task state:
- task_type: performance autoresearch
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: green
- confidence: high
- next owner: no implementation owner
- reason: target-backed benchmark and two promotion-repeat packets are under
  the p95 ratio target with `bun check` passing.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-core-rich-text-operations-ar-perf.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal`, `plite-ar-perf`, and `plite-ar`. |
| Active goal checked or created | yes | `get_goal` returned none; created this goal. |
| Source of truth read before edits | yes | Read target `core-rich-text-operations-compare` from `benchmarks/targets/plite.json`. |
| Tracker comments and attachments read | no | N/A: no tracker item or attachment. |
| Video transcript evidence required | no | N/A: no video evidence in this task. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no code owner was changed; target was already green. |
| TDD decision before behavior change or bug fix | no | N/A: no behavior patch was needed. |
| Branch decision for code-changing task | no | N/A: no branch/commit/PR requested. |
| Release artifact decision | yes | No release artifact: no runtime/package source change was kept. |
| Browser tool decision for browser surface | no | N/A unless a browser/React regression appears. |
| PR expectation decision | yes | No PR requested. |
| Tracker sync expectation decision | yes | No tracker sync requested. |
| Output budget strategy recorded | yes | Recorded above. |
| Agent-native pack selected | yes | Target/AR package scripts are agent-facing workflow surfaces. |
| Agent-facing action surface identified | yes | `bench:targets:*`, `slate:ar:*`, and `Plate repo root` benchmark scripts. |
| Source rule versus generated mirror boundary identified | yes | Target registry/session files are source for this loop; no generated skill mirror touched. |
| `agent-native-reviewer` loaded or waiver recorded | no | N/A: no agent rule/skill/tool source changed; only existing AR session files were pointed at the selected target. |
| Package/API pack selected | yes | Possible package runtime perf changes in `packages/**`. |
| Public surface or package boundary identified | yes | Potential package runtime only; no public API planned. |
| Release artifact path selected | yes | N/A: no published user-visible delta. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset required. |
| Barrel/export impact decision recorded | no | N/A: no exports or file layout changed. |

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
| Named verification threshold | yes | Run the target setup, benchmark, promotion repeat, checks, and state proof named in this plan. | Target setup OK; benchmark lint emitted primary metric; packet 4 was `1.03ms`; promotion repeats were `1.6ms` and `0.94ms`; all packet checks passed. |
| Bug reproduced before fix | no | Record N/A with reason. | N/A: no product bug was fixed. |
| Targeted behavior verification | yes | Run target benchmark plus correctness gate. | `pnpm slate:ar:next` packets ran `bash ./autoresearch.sh` and `bash ./autoresearch.checks.sh`; checks passed each time. |
| TypeScript or typed config changed | no | Record N/A with reason. | N/A: no TS or typed config source changed. |
| Package exports or file layout changed | no | Record N/A with reason. | N/A: no exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Record N/A with reason. | N/A: no manifest, lockfile, or install graph changed. |
| Agent rules or skills changed | no | Record N/A with reason. | N/A: no agent source changed. |
| Workspace authority proof | yes | Run proof in the owning workspace. | `plate-2` ran target commands; `Plate repo root` ran benchmark/check wrappers. |
| Browser surface changed | no | Record N/A with reason. | N/A: no browser behavior changed. |
| Browser final proof | no | Record N/A with reason. | N/A: no browser proof required. |
| CI-controlled template output changed | no | Record N/A with reason. | N/A: no `templates/**` touched. |
| Package behavior or public API changed | no | Record N/A with reason. | N/A: no runtime patch was kept. |
| Registry-only component work changed | no | Record N/A with reason. | N/A: no registry component work. |
| Docs or content changed | yes | Verify source-backed plan claims. | This plan records exact command evidence; no docs claim depends on runtime rendering. |
| High-risk mini gate | yes | Record failure mode and proof plan. | Risk was optimizing wrong target due stale AR wrapper; benchmark-lint caught it, wrapper files were corrected, new segment was created, and promotion repeats passed. |
| Agent-native review for agent/tooling changes | no | Record N/A with reason. | N/A: no `.agents/**`, `.claude/**`, `.codex/**`, skill, hook, command, or prompt source changed. |
| Local install corruption suspected | no | Record N/A with reason. | N/A: no install corruption signal appeared. |
| Autoreview for non-trivial implementation changes | no | Record N/A with reason. | N/A: no product/runtime code patch was kept; session and plan changes are mechanically verified. |
| PR create or update | no | Record N/A with reason. | N/A: no PR requested. |
| Task-style PR body verified | no | Record N/A with reason. | N/A: no PR requested. |
| PR proof image hosting | no | Record N/A with reason. | N/A: no PR/browser proof image. |
| Tracker sync-back | no | Record N/A with reason. | N/A: no tracker item. |
| Final handoff contract | yes | Fill final handoff fields. | Final handoff fields below record outcome, caveat, design, and verification. |
| Final lint | no | Record N/A with reason. | N/A: no product code changed; benchmark/check wrappers executed successfully. |
| Output budget discipline | yes | Verify output stayed bounded. | Long benchmark output was summarized by AR tails and metrics; tool output was capped. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-01-core-rich-text-operations-ar-perf.md`. | Run after this plan is filled. |
| Agent source / generated sync | no | Record N/A with reason. | N/A: no `.agents/rules/**` changed. |
| Agent action discoverability | yes | Source-audit action surface. | `bench:targets:*`, `slate:ar:*`, `Plate repo root/autoresearch.sh`, and `Plate repo root/autoresearch.checks.sh` identify the target loop. |
| Agent-native review | no | Record N/A with reason. | N/A: no agent source changed. |
| Public API / package boundary proof | yes | Source-audit boundary. | No public package API/export changed; no code patch kept. |
| Release artifact classification | yes | Record classification. | Internal AR/session/plan evidence only. |
| Published package changeset | no | Record N/A with reason. | N/A: no published package delta. |
| Registry changelog | no | Record N/A with reason. | N/A: no registry component work. |
| No release artifact | yes | Record exact reason. | Internal-only measurement/session update; no user-visible package behavior/API/types/config/runtime delta. |
| Package typecheck/build/test | yes | Run owning package check or N/A. | `bun check` ran as the AR correctness command for packets 4, 5, and 6 and passed. |
| Barrel/export generation | no | Record N/A with reason. | N/A: no exports changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Target contract and AR skills read. | implementation |
| Implementation | complete | Corrected stale AR session wrappers and started target/promotion segments. | verification |
| Verification | complete | Benchmark lint, packet 4, promotion repeats 5/6, and `slate:ar:state` passed. | closeout |
| PR / tracker sync | N/A | No PR or tracker sync requested. | final response |
| Closeout | complete | Plan filled; autogoal check runs last. | final response |

Findings:
- `pnpm slate:ar:init-target` updated config but kept stale pagination wrappers;
  benchmark-lint caught this by emitting pagination metrics instead of
  `rich_text_structural_ops_p95_ms`.
- After correcting wrappers and starting a new segment, the target emitted the
  intended metric and passed the correctness gate.
- Promotion repeats were green: `1.6ms` / p95 ratio `2.36`, then `0.94ms` /
  p95 ratio `1.85`; both passed `bun check`.

Decisions and tradeoffs:
- Logged benchmark packets as `measure`, not `keep`, because there was no
  product patch to commit. `keep` would have been fake here.
- Stopped after the promotion-repeat gate because the target is under the p95
  ratio threshold; further tuning would chase noise.

Implementation notes:
- Updated `Plate repo root/autoresearch.sh` to run
  `RICH_TEXT_OPS_COMPARE_ITERATIONS=51 bun run bench:core:rich-text-operations:compare:local`.
- Updated `Plate repo root/autoresearch.checks.sh` to run `bun check`.
- Updated `Plate repo root/autoresearch.md` so the session text matches the core
  rich-text target.

Review fixes:
- None: no product code patch.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial benchmark-lint emitted pagination metrics | 1 | Patch stale AR wrapper files and start a new rich-text segment | Resolved; benchmark-lint then emitted `rich_text_structural_ops_p95_ms=0.98` |

Verification evidence:
- `pnpm bench:targets:check`: `benchmark-targets ok: 26 targets`.
- `pnpm bench:targets:dry-run -- core-rich-text-operations-compare`: setup OK
  for `rich_text_structural_ops_p95_ms`.
- `pnpm slate:ar:setup-target -- core-rich-text-operations-compare`: detected
  current metric was still pagination and recommended setup.
- `pnpm slate:ar:init-target -- core-rich-text-operations-compare`: initialized
  rich-text config.
- First `pnpm slate:ar:benchmark-lint`: failed because stale wrapper emitted
  pagination metrics; fixed wrapper/session files.
- `node ... autoresearch.mjs new-segment --cwd Plate repo root --reason "Switch active target from pagination to core-rich-text-operations-compare" --yes`: segment 2 created.
- Second `pnpm slate:ar:benchmark-lint`: OK,
  `rich_text_structural_ops_p95_ms=0.98`, worst p95 ratio `2.46`, worst mean
  ratio `2.27`.
- `pnpm slate:ar:next` packet 4: `1.03ms`, worst p95 ratio `2.35`, worst mean
  ratio `3.17`, `bun check` passed.
- Logged packet 4 as accepted `measure`; no commit created.
- `node ... promote-gate --cwd Plate repo root --reason "Core rich-text baseline is below the <3x legacy p95 promotion target" --gate-name "rich-text promotion repeat" --query-count 2 --yes`: promotion segment 3 created.
- Promotion packet 5: `1.6ms`, worst p95 ratio `2.36`, worst mean ratio
  `3.75`, `bun check` passed; logged accepted `measure`.
- Promotion packet 6: `0.94ms`, worst p95 ratio `1.85`, worst mean ratio
  `1.92`, `bun check` passed; logged accepted `measure`.
- `pnpm slate:ar:state`: active target
  `core-rich-text-operations-compare`; segment 3 has 2 measured, 0 checks
  failed; researchIntegrity OK; next hint says close target as green.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high for target green; no runtime patch was needed.
- Flow table:
  - Reproduced: N/A, no product bug.
  - Verified: benchmark lint, packet 4, two promotion repeats, `bun check` in
    each packet, and `slate:ar:state`.
- Browser check: N/A, no browser surface changed.
- Outcome: `core-rich-text-operations-compare` is green under the target's p95
  ratio threshold.
- Caveat: worst mean ratio was noisy in packets 4/5, but promotion packet 6
  brought p95 and mean ratios both under 2x; the primary target is p95.
- Design:
  - Chosen boundary: AR target/session proof, not runtime code.
  - Why not quick patch: metric already passes; code edits would be noise.
  - Why not broader change: this target is scoped to rich-text structural ops,
    not pagination or full all-lane benchmarking.
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
- Caveats: no code patch; AR session files changed to point at this target.

Timeline:
- 2026-06-01T16:07:28.588Z Task goal plan created.
- 2026-06-01T16:11Z Rich-text AR session segment created after wrapper fix.
- 2026-06-01T16:12Z Packet 4 measured `1.03ms` with `bun check` green.
- 2026-06-01T16:15Z Promotion gate segment created with 2 repeats.
- 2026-06-01T16:16Z Packet 5 measured `1.6ms` with `bun check` green.
- 2026-06-01T16:17Z Packet 6 measured `0.94ms` with `bun check` green.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after completion check |
| What is the goal? | Optimize or prove green `core-rich-text-operations-compare` under Plite AR |
| What have I learned? | It is already green under p95 target; stale AR wrappers were the only setup bug |
| What have I done? | Fixed target wrappers, ran baseline and promotion repeats, logged accepted measurements |

Open risks:
- None for this target. Further optimization would be benchmark-noise chasing
  unless a future all-lane sweep exposes a regression.
