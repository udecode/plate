# openclaw maintainer standing orders

Objective:
Import OpenClaw maintainer standing-order setup; done when requested docs/rules/skill updates exist, generated mirrors sync, decisions are recorded, and audits pass.

Goal plan:
docs/plans/2026-06-16-openclaw-maintainer-standing-orders.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request + OpenClaw source-backed import
- id / link: `/Users/zbeyens/git/openclaw/openclaw/docs/automation/standing-orders.md`, `docs/automation/cron-vs-heartbeat.md`, `docs/concepts/agent-loop.md`
- title: Closest relevant OpenClaw maintainer setup for local Codex Plate/Plite maintenance
- acceptance criteria:
  - Implement all eight requested recommendations from the previous answer.
  - Update `.agents/rules/maintainer.mdc` with standing orders.
  - Sharpen `docs/plans/templates/maintainer.md` heartbeat plans.
  - Update `docs/vision/common.md` with local Codex maintainer doctrine.
  - Update `.agents/AGENTS.md` with default command-shape routing.
  - Add `docs/maintainer/heartbeat.md`.
  - Add `docs/maintainer/standing-orders.md`.
  - Record accepted/rejected imports in `docs/sync/openclaw/decisions.json`.
  - Patch `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md` so public intake / maintainer docs are treated as high-signal even when the raw report score is low.
  - Keep the setup Plate/Plite-relevant: local Codex, no CODEOWNERS, no hosted/API worker, no crabbox/cloud daemon, no release/channel/product plumbing.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: N/A: artifact checklist is the metric
- improvement loop: N/A: finish when all requested owners and audits close
- final score / loop closure: N/A

Completion threshold:
- Done state: all requested local/global owners are patched, new maintainer docs exist, generated maintainer skill mirror is synced, OpenClaw decision ledger records the import/rejections, and syntax/source/check-complete audits pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-maintainer-standing-orders.md` passes.

Verification surface:
- `pnpm install` after `.agents/**` source changes.
- Source audit that standing-order / heartbeat / local-Codex routing text exists in source and generated mirror where relevant.
- JSON parse for `docs/sync/openclaw/decisions.json`.
- OpenClaw sync report rerun proving new decision rows apply.
- `test ! -e .github/CODEOWNERS`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-maintainer-standing-orders.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: OpenClaw docs named above, `openclaw-sync` skill, local maintainer/vision/AGENTS/template owners.
- Allowed edit scope: `.agents/rules/maintainer.mdc`, `.agents/AGENTS.md`, generated mirrors via `pnpm install`, `docs/plans/templates/maintainer.md`, `docs/vision/common.md`, `docs/maintainer/*.md`, `docs/sync/openclaw/decisions.json`, `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md`, and this plan.
- Browser surface: N/A: no app/content/package UI touched.
- Tracker sync: N/A: no issue/PR mutation requested.
- Non-goals: no CODEOWNERS, no hosted/API worker, no cloud daemon, no crabbox/taskflow runtime, no release automation, no Discord/Telegram/OpenClaw product plumbing, no package runtime changes.

Output budget strategy:
- Use exact file reads and capped `rg`/Node report slices. Write or reuse `.tmp/openclaw-sync/report.*` for broad OpenClaw sync output instead of streaming full matrices.

Blocked condition:
- Block only if a requested owner is missing, generated mirror sync fails without clear repair, or an import would require the excluded CODEOWNERS/hosted/API/cloud automation model.

Task state:
- task_type: docs + agent workflow import
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until check-complete and tool goal close

Current verdict:
- verdict: proceed
- confidence: high
- next owner: maintainer + openclaw-sync
- reason: OpenClaw standing-order pattern is useful if scoped to local Codex maintainer heartbeat, not copied as cloud automation.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-maintainer-standing-orders.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint lists all eight requested owners plus no CODEOWNERS/no hosted/API/cloud constraints. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `autogoal` and `openclaw-sync` before durable edits. |
| Active goal checked or created | yes | `get_goal` returned none; active goal created for this plan. |
| Source of truth read before edits | yes | Read OpenClaw standing-orders/heartbeat/agent-loop source plus local maintainer/template/vision/AGENTS/decision owners. |
| Tracker comments and attachments read | no | N/A: no tracker item. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: docs/workflow import, no runtime implementation problem. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | no | N/A: no package/release artifact changed. |
| Browser tool decision for browser surface | no | N/A: no `content/**`, `apps/www/**`, or package UI surface touched. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no issue/Linear sync requested. |
| Output budget strategy recorded | yes | Exact file reads, capped audits, and `.tmp/openclaw-sync/report.*` for broad output. |
| Docs pack selected | yes | Applied docs pack because maintainer docs and vision/docs changed. |
| `docs-creator` loaded | no | N/A: not docs-site/plugin docs; repo maintainer runbooks. |
| Docs lane selected | yes | Maintainer runbook / public automation doctrine docs. |
| Target docs and nearest sibling docs read | yes | Read OpenClaw source docs and local target owners before edits. |
| Docs style doctrine read | yes | Read `docs/vision/common.md` and `.agents/AGENTS.md` policy. |
| Documented source owner identified | yes | Owners: maintainer rule/template, `docs/maintainer/*`, `docs/vision/common.md`, `.agents/AGENTS.md`, openclaw-sync global skill, decision ledger. |
| Agent-native pack selected | yes | Applied agent-native pack because `.agents/**` and global skill changed. |
| Agent-facing action surface identified | yes | `maintainer` generated skill, AGENTS routing, and global `openclaw-sync` scoring/review rule. |
| Source rule versus generated mirror boundary identified | yes | Patched `.agents/rules/maintainer.mdc` and `.agents/AGENTS.md`; `pnpm install` regenerated mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer skill; no UI action parity issue, source/generated discoverability verified. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Boundary: maintainer rule/template/runbooks/vision/global sync skill.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: no packages changed.
- [x] Final handoff shape decided: changed files, verification, rejected imports, caveat.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no commit/PR requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no env-rot failure.
- [x] Workspace authority recorded: repo validations ran in `/Users/zbeyens/git/plate-2`; global skill audit named absolute path.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: agent routing/authority boundary; mitigated by standing-order approval gates and source/generated audits.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: docs/rules only; agent-native review loaded.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason. N/A: no product API/demo claims.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason. N/A: repo-local docs use local path references by name.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. No actionable findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`; JSON parse; no CODEOWNERS; source/generated audit; OpenClaw report row audit passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: no bug fix. |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no runtime behavior change. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS/config changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports/file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no package manifest change; `pnpm install` still ran for generated skill sync. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; `rg` found standing-order text in `.agents/rules/maintainer.mdc` and generated `.agents/skills/maintainer/SKILL.md`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Repo commands ran in `/Users/zbeyens/git/plate-2`; global skill audit used absolute path. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no UI/browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no packages. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Docs pack used; docs are repo-maintainer runbooks, source-backed by OpenClaw docs and local owners. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: agent authority broadens accidentally. Mitigation: explicit approval gates, one-item heartbeat, no hosted/API/cloud/CODEOWNERS. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded; no UI action parity issue; discoverability verified via source/generated audit. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: docs/rules only; deterministic source audits are the relevant proof. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no code lint surface. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used capped reads/audits and `.tmp/openclaw-sync/report.*`; no unbounded dump. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-maintainer-standing-orders.md` | Passed. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | `rg` source audit found standing-order/heartbeat/local-Codex text in target owners and generated mirror. |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: local runbooks have no external rendered route claims. |
| Docs MDX/content parser | no | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | N/A: not docs-site MDX/content. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: no plugin page. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found new rules in `.agents/rules/maintainer.mdc`, `.agents/skills/maintainer/SKILL.md`, `.agents/AGENTS.md`, `AGENTS.md`, and global openclaw-sync skill. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded; no accepted findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read OpenClaw standing-orders, cron-vs-heartbeat redirect, agent-loop source, local owners, and global openclaw-sync skill. | implementation |
| Implementation | complete | Patched maintainer rule/template, maintainer docs, common vision, AGENTS routing, decision ledger, and global openclaw-sync skill. | verification |
| Verification | complete | `pnpm install`, JSON parse, no CODEOWNERS, source/generated audit, and OpenClaw row audit passed. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker mutation requested. | final response |
| Closeout | complete | Final handoff rows filled; check-complete next. | final response |

Findings:
- OpenClaw standing orders are useful as a mechanism: scope, triggers, approval gates, escalation, Execute-Verify-Report.
- The direct OpenClaw cron/cloud/channel parts are not relevant; Plate/Plite needs local Codex heartbeat, not daemon/platform runtime.
- Current `openclaw-sync` report scoring underweights public intake and maintainer docs; global skill now overrides that class before rejection.

Decisions and tradeoffs:
- Keep `$maintainer` as the public queue control plane, not an executor for every issue.
- Add local maintainer docs so humans and future local scheduled Codex runs can share the same language.
- Reject CODEOWNERS, hosted/API worker, crabbox, cloud daemon, release automation, and channel plumbing for this setup.

Implementation notes:
- Added `docs/maintainer/standing-orders.md` and `docs/maintainer/heartbeat.md`.
- Updated `.agents/rules/maintainer.mdc`, `docs/plans/templates/maintainer.md`, `docs/vision/common.md`, `.agents/AGENTS.md`, `docs/sync/openclaw/decisions.json`, and `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md`.
- `pnpm install` regenerated `.agents/skills/maintainer/SKILL.md` and root `AGENTS.md`.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm install` passed.
- `node -e "JSON.parse(...docs/sync/openclaw/decisions.json...)"` passed.
- `test ! -e .github/CODEOWNERS` passed.
- `rg` source/generated audit found standing-order, heartbeat, local Codex, public-intake, score override, and no-hosted/API text in target owners.
- `node "$HOME/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs" --openclaw-root "$HOME/git/openclaw" --target "$PWD" --global-skills "$HOME/.agents/skills" --max 20 --out .tmp/openclaw-sync/report.md --json .tmp/openclaw-sync/report.json` passed; counts: accepted=23, covered=6, new=140, quarantine=4, reject=81.
- Node row audit confirmed `standing-orders` accepted, `cron-vs-heartbeat` covered, and `agent-loop` covered through the decision ledger.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no issue/tracker mutation requested.
- Confidence line: High confidence for docs/rules/import update; no runtime behavior changed.
- Flow table:
  - Reproduced: N/A: no bug fix.
  - Verified: `pnpm install`, JSON parse, no CODEOWNERS, source/generated audit, OpenClaw report/row audit.
- Browser check: N/A: no browser surface touched.
- Outcome: Maintainer now has local standing orders, heartbeat runbook, sharper template, default routing, and OpenClaw sync scoring repair.
- Caveat: This intentionally does not create real scheduled automation; it prepares the skill/runbook shape for local Codex activations.
- Design:
  - Chosen boundary: maintainer control plane + docs/runbooks + sync skill.
  - Why not quick patch: maintainer rule alone would not give humans/future automation an operator runbook or prevent future openclaw-sync false rejects.
  - Why not broader change: cloud workers, CODEOWNERS, release/channel runtime are outside this local Codex setup.
- Verified: Commands and source audits listed above; check-complete passed.
- PR body verified: N/A: no PR.

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
- PR: N/A: no PR requested.
- Issue / tracker: N/A: no issue/tracker mutation requested.
- Browser proof: N/A: no browser surface touched.
- Caveats: No actual scheduled automation created; no CODEOWNERS; no hosted/API worker.

Timeline:
- 2026-06-16T21:06:52.404Z Task goal plan created.
- 2026-06-16 Read OpenClaw standing-orders, heartbeat redirect, and agent-loop source docs.
- 2026-06-16 Patched maintainer standing orders and template.
- 2026-06-16 Added `docs/maintainer/standing-orders.md` and `docs/maintainer/heartbeat.md`.
- 2026-06-16 Patched common vision, AGENTS routing, openclaw-sync scoring rule, and decision ledger.
- 2026-06-16 Ran `pnpm install`, JSON/no-CODEOWNERS/source audits, and OpenClaw sync report.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final verification. |
| Where am I going? | Run check-complete and close goal. |
| What is the goal? | Import relevant OpenClaw standing-order/heartbeat setup for local Plate/Plite maintainer automation. |
| What have I learned? | The useful OpenClaw piece is standing authority with approval gates, not the cloud/runtime plumbing. |
| What have I done? | Patched rules, templates, docs, global sync skill, decision ledger, and generated mirrors. |

Open risks:
- None for this scope. Real scheduled automation remains future work.
