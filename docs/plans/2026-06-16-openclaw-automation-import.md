# openclaw automation import

Objective:
Import relevant OpenClaw automation; done when maintainer heartbeat, queue ledger, scripts, intake docs, security runbook, routing, and sync skill updates are patched and verified.

Goal plan:
docs/plans/2026-06-16-openclaw-automation-import.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user-approved OpenClaw automation import
- id / link: local prompt: "ok go all" after the file-level automation map
- title: Import the full relevant OpenClaw local-maintainer automation setup
- acceptance criteria:
  - Update `docs/maintainer/heartbeat.md`.
  - Update `.agents/rules/maintainer.mdc`.
  - Add `.agents/rules/maintainer/scripts/queue-snapshot.mjs`.
  - Add/update `docs/maintainer/queue.md`.
  - Add/update `docs/maintainer/runs/*` run-history guidance.
  - Update `docs/plans/templates/maintainer.md`.
  - Update `CONTRIBUTING.md`.
  - Update `.github/ISSUE_TEMPLATE/bug.yml`.
  - Update `.github/ISSUE_TEMPLATE/feature_request.yml`.
  - Update `.github/PULL_REQUEST_TEMPLATE.md`.
  - Update `SECURITY.md`.
  - Add `docs/maintainer/security.md`.
  - Update `.agents/AGENTS.md`.
  - Update `VISION.md` and `docs/vision/common.md`.
  - Update `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md`.
  - Keep no CODEOWNERS, no hosted/API worker, no cloud daemon, no crabbox/taskflow runtime, no GitHub mutation authority.
  - Sync generated mirrors with `pnpm install`.
  - Verify the queue snapshot script, JSON/docs syntax, generated mirror discoverability, no CODEOWNERS, and autogoal completion.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested.
- initial confidence score: N/A: file-artifact checklist is the metric.
- improvement loop: N/A.
- final score / loop closure: N/A.

Completion threshold:
- All requested OpenClaw automation owners above are patched or explicitly recorded as N/A/rejected with reason.
- Maintainer queue snapshot has a local validation path and a generated queue ledger.
- Maintainer heartbeat has run-history and task-ledger language.
- Public intake docs capture agent-ready issue/PR/security state.
- Agent rules are regenerated and discoverable in generated skill mirrors.
- OpenClaw sync skill knows to propose owner patches and not only raw row reports.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-automation-import.md` passes.

Verification surface:
- `pnpm install`.
- `node --check .agents/rules/maintainer/scripts/queue-snapshot.mjs`.
- Run queue snapshot with a local fixture or live `gh` when available, writing `docs/maintainer/queue.md`.
- JSON parse for `docs/sync/openclaw/decisions.json`.
- Source/generated audit with `rg` across source rules, generated skills, docs, and global `openclaw-sync`.
- `test ! -e .github/CODEOWNERS`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-automation-import.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: OpenClaw source docs/skills already inspected, root `VISION.md`, `docs/vision/common.md`, maintainer rules/docs/templates, public intake docs, global `openclaw-sync`.
- Allowed edit scope: `.agents/rules/maintainer.mdc`, `.agents/rules/maintainer/scripts/**`, `.agents/AGENTS.md`, generated mirrors via `pnpm install`, `docs/maintainer/**`, `docs/plans/templates/maintainer.md`, this plan, `VISION.md`, `docs/vision/common.md`, `CONTRIBUTING.md`, `SECURITY.md`, `.github/ISSUE_TEMPLATE/*.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `docs/sync/openclaw/decisions.json`, `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md`.
- Browser surface: N/A: no `content/**`, `apps/www/**`, or `packages/**` UI changed.
- Tracker sync: N/A: no issue/PR mutation requested.
- Non-goals: no CODEOWNERS, no hosted/API worker, no cloud daemon, no crabbox/taskflow runtime, no release/channel workflow, no GitHub labels/comments/closes/reviews/PRs.

Output budget strategy:
- Use capped exact file reads. Save broad OpenClaw report output under `.tmp/openclaw-sync/report.*`. Do not stream full queues or generated reports into chat. Use `rg` audits and JSON summaries.

Blocked condition:
- Block only if generated mirror sync fails without clear repair, `gh` absence prevents live queue proof and fixture fallback also fails, or an import would require excluded hosted/API/cloud/CODEOWNERS authority.

Task state:
- task_type: docs + agent workflow automation import
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: proceed
- confidence: high
- next owner: maintainer + openclaw-sync
- reason: User approved all relevant OpenClaw automation imports; scope is local Codex automation, not hosted OpenClaw runtime.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-automation-import.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | All requested owners and non-goals copied into acceptance criteria and boundaries. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `autogoal`, `openclaw-sync`, `agent-native-reviewer`, and current maintainer rule/template before edits. |
| Active goal checked or created | yes | `get_goal` returned none; active goal created for this plan. |
| Source of truth read before edits | yes | Read root `VISION.md`, `docs/vision/common.md`, `.agents/AGENTS.md`, maintainer rule/template, and OpenClaw source docs from prior sync pass. |
| Tracker comments and attachments read | no | N/A: no tracker item. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no runtime bug or implementation pattern lookup. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change. |
| Branch decision for code-changing task | no | N/A: no branch/PR/commit requested. |
| Release artifact decision | no | N/A: no package/release artifact changed. |
| Browser tool decision for browser surface | no | N/A: no browser/UI/package-facing route changed. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker mutation requested. |
| Output budget strategy recorded | yes | Capped reads and artifacted OpenClaw report under `.tmp/openclaw-sync/report.*`. |
| Docs pack selected | yes | Applied docs pack. |
| `docs-creator` loaded | no | N/A: maintainer/governance docs, not public docs-site/plugin docs. |
| Docs lane selected | yes | Maintainer automation docs, public intake docs, and security runbook. |
| Target docs and nearest sibling docs read | yes | Read existing maintainer heartbeat/standing orders, public intake docs, security policy, vision docs. |
| Docs style doctrine read | yes | Read root `VISION.md`, `docs/vision/common.md`, `.agents/AGENTS.md`. |
| Documented source owner identified | yes | Maintainer rule/template/docs, public intake docs, security docs, vision docs, global `openclaw-sync`. |
| Agent-native pack selected | yes | Applied agent-native pack because `.agents/**` and global skill changed. |
| Agent-facing action surface identified | yes | Maintainer generated skill, AGENTS routing, queue snapshot script, global `openclaw-sync` skill. |
| Source rule versus generated mirror boundary identified | yes | Patch `.agents/rules/**`; regenerate `.agents/skills/**` via `pnpm install`; global `openclaw-sync` is hand-written skill. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer; parity concern is discoverability/command/script surface, not UI action parity. |

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
      is recorded with reason. Boundary: local maintainer control plane and public intake docs, not hosted runtime.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: no packages changed.
- [x] Final handoff shape decided: changed files, validations, caveats, next heartbeat.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no commit/PR requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A unless `pnpm install` fails with env-rot shape.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: agent-action authority; mitigated with no public mutation by default.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: docs/rules/scripts only; deterministic audits and agent-native review.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason. N/A for product API; command/script docs are source-backed by local script and `gh` usage.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason. N/A: mostly local file docs.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Passed: `pnpm install`; queue script syntax, fixture, and live `gh`; JSON parse; Ruby YAML parse; source/generated audit; no CODEOWNERS; redaction audit; OpenClaw report. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: no bug fix. |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no runtime behavior changed. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS/config changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports/file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | No manifest changes; `pnpm install` still passed for generated skill sync. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; `rg` found queue snapshot/run artifact guidance in `.agents/rules/maintainer.mdc` and `.agents/skills/maintainer/SKILL.md`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Repo validations ran in `/Users/zbeyens/git/plate-2`; global skill audit used `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser/UI/package route changed. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no packages. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Docs pack used; source-backed by inspected OpenClaw docs and local source owners. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: agent maintainer authority could widen. Mitigation: no public mutations, local-only heartbeat, explicit approval gates, redacted security ledger. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded; no UI parity issue; discoverability verified through source/generated audit. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: docs/rules/scripts only; deterministic audits and agent-native review are the relevant proof. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no code lint surface. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used capped reads/audits and artifacted report output. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-automation-import.md` | Ready for final command. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Source/generated `rg` audit passed; OpenClaw decisions recorded. |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: local markdown docs and GitHub issue forms, not docs-site routes. |
| Docs MDX/content parser | no | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | N/A: no docs-site MDX/content route. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: no plugin page. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found queue snapshot/run artifact guidance in source rule, generated skill, AGENTS, template, docs, and global sync skill. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded; no accepted findings beyond discoverability audits already closed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read autogoal/openclaw-sync/agent-native/maintainer sources, root vision/common, AGENTS, and OpenClaw security/task docs. | implementation |
| Implementation | complete | Added queue snapshot script, fixture, queue ledger, run docs, security runbook, maintainer docs/rules/template, public intake fields, vision, decisions, and global sync rule. | verification |
| Verification | complete | Commands and source audits listed below passed; Node YAML parser miss fixed by Ruby parser; queue ledger redacted. | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker mutation requested. | final response |
| Closeout | complete | Final handoff fields filled; check-complete next. | final response |

Findings:
- OpenClaw task/cron runtime is product-specific, but the durable activity-ledger idea maps cleanly to `docs/maintainer/queue.md` and `docs/maintainer/runs/*`.
- Public queue automation needs a scriptable snapshot first; otherwise every heartbeat wastes context rediscovering the queue.
- Live `gh` can expose private advisory summaries, so versioned queue docs must redact advisory details.
- OpenClaw sync needed owner-patch queue output, not just row classification.

Decisions and tradeoffs:
- Kept local Codex heartbeat model; rejected hosted/API worker, cloud daemon, crabbox/taskflow runtime, release/channel automation, and CODEOWNERS.
- Added a queue snapshot script with fixture validation so the workflow is testable without cloud-only infrastructure.
- Kept sensitive GHSA details out of versioned queue docs; local `.tmp` artifact and live GitHub remain the detailed source.
- Treated remaining OpenClaw `new` rows as not auto-imported because they are product/runtime/channel skills or generic docs without a proven local owner.

Implementation notes:
- Added `.agents/rules/maintainer/scripts/queue-snapshot.mjs` and fixture.
- Generated live `docs/maintainer/queue.md`.
- Added `docs/maintainer/runs/README.md` and `docs/maintainer/security.md`.
- Updated maintainer rule/template/heartbeat/standing-orders, AGENTS, vision, public intake docs, security policy, decisions ledger, and global `openclaw-sync`.

Review fixes:
- Fixed versioned queue ledger leaking private GHSA summaries by redacting advisory item/title in markdown output.
- Switched YAML validation from missing Node `yaml` package to Ruby stdlib parser; no dependency added.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Node YAML parse used missing `yaml` package | 1 | Use Ruby stdlib `YAML.load_file` instead of adding dependency | Ruby YAML parse passed for issue templates. |
| Live queue ledger included private advisory summaries | 1 | Redact advisory rows in versioned markdown; keep details in live GitHub/local `.tmp` only | Redaction audit passed. |

Verification evidence:
- `pnpm install` passed.
- `node --check .agents/rules/maintainer/scripts/queue-snapshot.mjs` passed.
- Fixture queue snapshot command passed.
- Live queue snapshot command passed: advisories 7, PRs 4, issues 4, rows 15, warnings 0.
- JSON parse passed for decisions ledger and fixture.
- Ruby YAML parse passed for `.github/ISSUE_TEMPLATE/*.yml`.
- `test ! -e .github/CODEOWNERS` passed.
- Source/generated `rg` audit passed for queue snapshot, run artifacts, takeover fields, security runbook, and openclaw-sync owner-patch queue.
- OpenClaw sync report passed: 254 rows, accepted 30, covered 6, quarantine 4, reject 81, new 133, smart-merge 0.
- Queue privacy audit passed: no GHSA IDs or advisory summaries in `docs/maintainer/queue.md`.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no issue/tracker mutation requested.
- Confidence line: High confidence for local maintainer automation docs/rules/scripts; no runtime/package behavior changed.
- Flow table:
  - Reproduced: N/A: no bug fix.
  - Verified: `pnpm install`, queue script syntax/fixture/live run, JSON/YAML parse, source/generated audit, no CODEOWNERS, redaction audit, OpenClaw report.
- Browser check: N/A: no browser surface touched.
- Outcome: Maintainer now has queue snapshot automation, queue ledger, run-history guidance, stronger heartbeat/template/routing, stronger public intake, security runbook, and openclaw-sync owner-patch queue.
- Caveat: This still does not create a real scheduler or hosted worker; it prepares local Codex heartbeat automation.
- Design:
  - Chosen boundary: local maintainer control plane plus public intake/security docs.
  - Why not quick patch: rule-only update would still make future heartbeats rediscover the queue and lose run state.
  - Why not broader change: OpenClaw Gateway/crabbox/cloud runtime is product-specific and explicitly out of scope.
- Verified: Commands and audits listed above.
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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: no scheduler, no hosted/API worker, no CODEOWNERS, no public GitHub mutations.

Timeline:
- 2026-06-16T21:20:17.656Z Task goal plan created.
- 2026-06-16 Read required skills and local maintainer/vision owners.
- 2026-06-16 Added queue snapshot script and fixture.
- 2026-06-16 Added/updated maintainer queue, run, heartbeat, standing-order, and security docs.
- 2026-06-16 Updated public issue/PR/security intake and vision doctrine.
- 2026-06-16 Updated global openclaw-sync to emit owner-patch queues.
- 2026-06-16 Ran `pnpm install` and verification commands.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final check-complete, update goal complete, final response |
| What is the goal? | Import relevant OpenClaw automation into local Codex maintainer setup |
| What have I learned? | Queue/run ledgers are the reusable OpenClaw primitive; cloud runtime is not |
| What have I done? | Patched scripts/docs/rules/templates/intake/security/vision/sync and verified |

Open risks:
- No real scheduler exists yet; heartbeat remains manually or future locally invoked.
- `docs/maintainer/queue.md` is a snapshot, not truth; live GitHub must be read before action.
