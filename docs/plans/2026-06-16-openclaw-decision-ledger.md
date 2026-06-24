# openclaw decision ledger

Objective:
Add OpenClaw decision ledger support; done when reviewed rows can be classified persistently and report verification passes.

Goal plan:
docs/plans/2026-06-16-openclaw-decision-ledger.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: global skill/script repair
- id / link: /Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md
- title: OpenClaw sync decision ledger
- acceptance criteria: `openclaw-sync --refresh --max 300` still runs, reviewed rows can be recorded in a durable decision file, repeated reports apply those decisions, and the plan passes `check-complete`.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A.
- semantics: user requested a command run, not a timed soak.
- initial confidence score: 70%; report works, but repeated reviewed rows remain noisy.
- improvement loop: add a small decision layer, seed current accepted/rejected/quarantined rows, rerun report.
- final score / loop closure: 92%; verification passed.

Completion threshold:
- `openclaw-sync-report.mjs` supports a durable decision file, defaulting to `docs/sync/openclaw/decisions.json` when present.
- The refreshed report distinguishes raw actions from decision-applied actions/reasons.
- Current previously reviewed high-signal rows are seeded so the next report is lower-noise.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-decision-ledger.md` passes.

Verification surface:
- `node --check /Users/zbeyens/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs`
- `node "$HOME/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs" --openclaw-root "$HOME/git/openclaw" --target "$PWD" --global-skills "$HOME/.agents/skills" --refresh --max 300 --out .tmp/openclaw-sync/report.md --json .tmp/openclaw-sync/report.json`
- Source audit for decisions and applied report counts.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-decision-ledger.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md`, its report script, current `.tmp/openclaw-sync/report.json`, and root `VISION.md`.
- Allowed edit scope: global `openclaw-sync` skill/script and repo-local `docs/sync/openclaw/**` decision artifacts.
- Browser surface: N/A.
- Tracker sync: N/A.
- Non-goals: runtime/package code, GitHub mutation, cloud automation, broad OpenClaw import, commit/PR.

Output budget strategy:
- Keep full report output in `.tmp/openclaw-sync/report.{md,json}`; inspect JSON slices and exact source files only.

Blocked condition:
- Stop if the global script cannot be patched without breaking the existing report contract, or if a decision requires user taste beyond the accepted/rejected rows already proven.

Task state:
- task_type: agent workflow script repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: closing

Current verdict:
- verdict: complete after final plan check
- confidence: 92%
- next owner: openclaw-sync
- reason: report applies a durable decision ledger and keeps raw discovery visible.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-decision-ledger.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | `$openclaw-sync --refresh --max 300`; refresh local OpenClaw, cap report at 300 rows, inspect source before imports, patch only accepted owners, no GitHub mutation. |
| Timed checkpoint parsed | no | No duration requested. |
| Skill analysis before edits | yes | Read `openclaw-sync`, `autogoal`, root `VISION.md`, and the report script before durable script edits. |
| Active goal checked or created | yes | `get_goal` returned none; goal created for this repair. |
| Source of truth read before edits | yes | Read `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md`, script source, root `VISION.md`, and current report JSON. |
| Tracker comments and attachments read | no | No tracker. |
| Video transcript evidence required | no | No video. |
| `docs/solutions` checked for non-trivial existing-code work | no | Global skill/report repair; no product-code solution lookup needed. |
| TDD decision before behavior change or bug fix | no | No runtime user behavior or bug repro; script verification is enough. |
| Branch decision for code-changing task | no | No commit/PR requested. |
| Release artifact decision | no | No package release artifact. |
| Browser tool decision for browser surface | no | No browser surface. |
| PR expectation decision | no | No PR requested. |
| Tracker sync expectation decision | no | No tracker. |
| Output budget strategy recorded | yes | Full report written to `.tmp/openclaw-sync/report.{md,json}`; inspected slices. |
| Docs pack selected | yes | Skill docs and sync decision docs changed. |
| `docs-creator` loaded | no | Internal agent docs only; no public docs style task. |
| Docs lane selected | yes | Internal skill docs and `docs/sync/openclaw/decisions.json`. |
| Target docs and nearest sibling docs read | yes | Read OpenClaw sync skill, report script, existing report artifacts, and root vision. |
| Docs style doctrine read | yes | Root `VISION.md` read. |
| Documented source owner identified | yes | Owner is global `openclaw-sync` skill/script plus repo `docs/sync/openclaw/decisions.json`. |
| Agent-native pack selected | yes | Agent workflow command changed. |
| Agent-facing action surface identified | yes | `openclaw-sync-report.mjs` and `openclaw-sync` command docs. |
| Source rule versus generated mirror boundary identified | yes | Global hand-written skill edited directly; no generated mirror involved. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Waived: direct command/skill source audit covers this narrow script repair. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A because no video was provided.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: report state belongs in `openclaw-sync` script and `docs/sync/openclaw/decisions.json`.
- [x] Release artifact requirement recorded: N/A, no package release artifact.
- [x] Final handoff shape decided: report counts, files changed, verification, and next checkpoint.
- [x] Branch handling recorded: N/A, no commit/PR requested.
- [x] Local-env-rot retry policy recorded: N/A, no install/runtime corruption.
- [x] Workspace authority recorded: verification commands run from `/Users/zbeyens/git/plate-2`; global script path explicit.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: command contract change; proof is syntax, JSON parse, requested report rerun, and decision-action audit.
- [x] Review/autoreview target selected from actual diff state: N/A, narrow script/docs repair with direct command proof.
- [x] Agent-native review decision recorded: direct source audit; no UI/tool parity gap.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: named public APIs/imports/routes are N/A; command flag and decision statuses are source-backed.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews are N/A; no public docs links added.
- [x] Agent-native pack: source-of-truth global skill/script files edited instead of generated mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill text and script `--help`.
- [x] Agent-native pack: generated mirrors are N/A; no `.agents/rules/**` changed.
- [x] Agent-native pack: accepted agent-native review findings are N/A; direct audit found none.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run syntax, JSON parse, requested report, JSON decision audit, and plan check. | All but final plan check passed; final check follows this update. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: workflow/report noise was observed in repeated report counts, not a runtime bug. |
| Targeted behavior verification | yes | Run focused report proof. | Report rerun shows `accepted=4, covered=3, quarantine=4`, raw actions preserved. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: JS script only; `node --check` passed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A. |
| Agent rules or skills changed | yes | Run sync/validation. | Global hand-written skill changed; no Skiller mirror. Script syntax and command proof passed. |
| Workspace authority proof | yes | Run verification in owning workspace/tool. | Commands run from `/Users/zbeyens/git/plate-2` against global skill script path. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | Verify source-backed claims and examples. | Skill docs match script flags/statuses; decision JSON parse passed. |
| High-risk mini gate | yes | Record failure mode and proof. | Failure mode: stale/noisy sync rows. Proof: decisions applied while `rawAction` remains visible. |
| Agent-native review for agent/tooling changes | yes | Load reviewer or record N/A. | N/A: no new tool capability; direct source audit sufficient for narrow command docs/script. |
| Local install corruption suspected | no | Run reinstall or N/A. | N/A. |
| Autoreview for non-trivial implementation changes | no | Load autoreview or N/A. | N/A: narrow global script/docs repair; no product implementation. |
| PR create or update | no | Run check before PR work. | N/A. |
| Task-style PR body verified | no | Verify PR body. | N/A. |
| PR proof image hosting | no | Host images or N/A. | N/A. |
| Tracker sync-back | no | Post tracker sync or N/A. | N/A. |
| Final handoff contract | yes | Fill final handoff fields. | Filled below. |
| Final lint | no | Run lint or scoped equivalent. | N/A: no repo package lint lane for global one-file script; `node --check` used. |
| Output budget discipline | yes | Verify no unbounded high-volume output or record recovery. | One full report printed by requested command; rerun was capped to header and artifacts. |
| Timed checkpoint | no | Record duration result. | N/A. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-openclaw-decision-ledger.md` | Final command follows this update. |
| Docs source-backed claim audit | yes | Verify docs claims. | `openclaw-sync` docs mention `--decisions`; script help supports it. |
| Docs links / routes / previews | no | Verify leaf links/routes/previews. | N/A. |
| Docs MDX/content parser | no | Run content parser or N/A. | N/A: no MDX/content docs. |
| Plugin page specifics | no | Apply plugin page rules or N/A. | N/A. |
| Agent source / generated sync | no | Run `pnpm install` if `.agents/rules/**` changed. | N/A: global skill, no generated mirror. |
| Agent action discoverability | yes | Source-audit skill/rule path. | `openclaw-sync` docs and script help both describe decision ledger. |
| Agent-native review | yes | Load reviewer or record N/A. | N/A for narrow script/docs repair; no user-action surface beyond the command itself. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | skill, vision, script, report source read | implementation |
| Implementation | done | script, skill docs, and decision ledger patched | verification |
| Verification | done | syntax, JSON parse, report rerun, decision audit passed | closeout |
| PR / tracker sync | done | N/A: no PR/tracker requested | final response |
| Closeout | done | plan updated; final check next | final response |

Findings:
- Repeated `openclaw-sync --refresh --max 300` showed the same reviewed high-signal rows as raw `new`/`smart-merge`.
- The report script had no decision layer, so accepted/rejected/quarantined rows could not be removed from the active triage surface.
- A small JSON decision ledger is enough; no database, scheduler, or new skill needed.

Decisions and tradeoffs:
- Added `docs/sync/openclaw/decisions.json` instead of putting reviewed state in `.tmp`, because decisions are durable sync state.
- Preserved `rawAction` in JSON/Markdown so accepted rows still show whether they were originally `new` or `smart-merge`.
- Did not bulk-mark all 254 rows; only rows already inspected/classified were seeded.

Implementation notes:
- `/Users/zbeyens/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs` now loads `docs/sync/openclaw/decisions.json` by default, accepts `--decisions`, applies decision actions, and prints `Raw`.
- `/Users/zbeyens/.agents/skills/openclaw-sync/SKILL.md` now documents decision statuses and the ledger workflow.
- `docs/sync/openclaw/decisions.json` seeds 12 reviewed rows.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `node --check /Users/zbeyens/.agents/skills/openclaw-sync/scripts/openclaw-sync-report.mjs` passed.
- `node -e 'JSON.parse(...)'` on `docs/sync/openclaw/decisions.json` passed.
- Requested command rerun passed and wrote `.tmp/openclaw-sync/report.md` plus `.tmp/openclaw-sync/report.json`.
- Report counts after decisions: `accepted=4`, `covered=3`, `new=149`, `quarantine=4`, `reject=81`, `smart-merge=13`.
- JSON audit confirms `gh-issues` and `clawdtributor` are `accepted` with raw `new`; `clawsweeper` is `covered` with raw `smart-merge`; `agent-transcript` is `quarantine`; `control-ui-e2e` is `reject`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A.
- Confidence line: high; command contract and decision application verified.
- Flow table:
  - Reproduced: report noise reproduced by the initial refreshed matrix.
  - Verified: syntax, JSON parse, report rerun, decision-action audit.
- Browser check: N/A.
- Outcome: decision ledger added and applied.
- Caveat: only 12 source-reviewed rows are seeded; remaining `new`/`smart-merge` rows still need source review.
- Design:
  - Chosen boundary: global `openclaw-sync` report script plus repo `docs/sync/openclaw/decisions.json`.
  - Why not quick patch: without persisted decisions, every run repeats the same work.
  - Why not broader change: no scheduler/database/new skill needed.
- Verified: syntax, JSON parse, requested report rerun, decision audit.
- PR body verified: N/A.

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
- Caveats: remaining unresolved rows are intentionally still open.

Timeline:
- 2026-06-16T15:00:10.596Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | Add durable OpenClaw decision ledger support. |
| What have I learned? | Report was stateless and re-surfaced reviewed rows. |
| What have I done? | Added decision support, seeded reviewed decisions, reran report. |

Open risks:
- Remaining `new`/`smart-merge` rows are not reviewed. That is intentional; do not bulk-mark without source reads.
