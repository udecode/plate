# resolve pr feedback fork

Objective:
Fork `resolve-pr-feedback` into a repo-local source rule and plan template; done
when the generated skill mirror points to `.agents/rules/resolve-pr-feedback.mdc`,
the CE lock owner is removed, helper scripts validate, the template smoke
generates, `autoreview` is clean or consciously waived with evidence, and this
goal plan passes `check-complete`.

Goal plan:
docs/plans/2026-06-18-resolve-pr-feedback-fork.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user prompt
- id / link: chat request after CE skill audit
- title: fork resolve-pr-feedback locally with autogoal and autoreview
- acceptance criteria:
  - create `.agents/rules/resolve-pr-feedback.mdc` as source owner;
  - remove the CE lock conflict for `resolve-pr-feedback`;
  - use the repo-local PR feedback workflow directly;
  - make the workflow end with `autoreview`;
  - back the workflow with an autogoal plan template;
  - sync generated skills through `pnpm install`;
  - verify source/generation/template/script state.

First checkpoint:
- Complete. Explicit requirements captured above before mutable edits:
  source `.mdc`, local workflow boundary, mandatory `autoreview`, new autogoal
  template, generated sync, and verification.

Timed checkpoint:
- requested duration: N/A, no duration in prompt
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `resolve-pr-feedback` is local-source owned, generated from
  `.agents/rules/resolve-pr-feedback.mdc`, and no longer lock-managed from CE.
- The reusable workflow template
  `docs/plans/templates/resolve-pr-feedback.md` exists and records
  per-feedback ledger rows, source scripts, public mutation authority,
  `autoreview`, reply/resolve, and final re-fetch gates.
- Helper scripts under `.agents/rules/resolve-pr-feedback/scripts` pass shell
  syntax checks.
- `pnpm install` completes after source-rule and AGENTS edits.
- Source audits prove the generated skill references the `.mdc` owner, no
  generated helper scripts remain, and `autoreview` is the closeout gate.
- Final mechanical gate:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-resolve-pr-feedback-fork.md`.

Verification surface:
- `pnpm install`
- `bash -n` for every source helper script
- `node -e "JSON.parse(...skills-lock.json...)"`
- `node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template resolve-pr-feedback --title "resolve pr feedback template smoke" --path .tmp/resolve-pr-feedback-template-smoke.md --force`
- `rg` source audit across source rule, generated mirror, template, AGENTS, and
  lockfile
- `find .agents/skills/resolve-pr-feedback -maxdepth 2 -type f`
- `autoreview` closeout for the local diff, unless blocked
- `check-complete.mjs` for this plan

Constraints:
- Preserve unrelated repo behavior.
- Do not hand-edit generated `SKILL.md`; edit `.agents/rules/**` and run
  `pnpm install`.
- Do not import another PR feedback command topology.
- Do not broaden into cleaning every remaining CE skill lock row.
- Keep generated helper scripts out of `.agents/skills/**`; source helper
  scripts live under `.agents/rules/resolve-pr-feedback/scripts`.

Boundaries:
- Source of truth: `.agents/rules/resolve-pr-feedback.mdc`,
  `.agents/rules/resolve-pr-feedback/scripts/*`,
  `docs/plans/templates/resolve-pr-feedback.md`, `.agents/AGENTS.md`, and
  `skills-lock.json`.
- Allowed edit scope: the files above plus generated mirrors from
  `pnpm install` and this goal plan.
- Browser surface: N/A, no app/browser UI changed.
- Tracker sync: N/A, no PR review thread is being resolved in this task.
- Non-goals: no runtime package code, no CE-wide lock cleanup, no PR creation,
  no GitHub public mutation.

Output budget strategy:
- Reads are scoped to the named skill/rule/template files.
- Audits use `rg`, `find`, `bash -n`, and capped command output.
- Template smoke output is written to `.tmp/resolve-pr-feedback-template-smoke.md`.

Blocked condition:
- Stop if `pnpm install` cannot regenerate skills, source/generation ownership
  conflicts remain, helper scripts fail shell syntax, or `autoreview` reports a
  valid finding that cannot be fixed inside the allowed edit scope.

Task state:
- task_type: agent workflow fork
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implemented, verification in progress
- confidence: high after sync and source audits; final confidence depends on
  autoreview and check-complete
- next owner: resolve-pr-feedback
- reason: local source owner now exists and CE lock conflict is removed

Completion rule:
- Do not call `update_goal(status: complete)` until verification evidence below
  is final and `check-complete.mjs` passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria and first checkpoint list the requested `.mdc`, autogoal template, local workflow boundary, and `autoreview` closeout requirements. |
| Timed checkpoint parsed | no | N/A: user did not give a duration. |
| Skill analysis before edits | yes | Read `resolve-pr-feedback`, `autogoal`, `autoreview`, `task`, `autoclosure`, `review-sweep`, and `agent-native-reviewer` instruction surfaces. |
| Active goal checked or created | yes | `get_goal` returned no active goal; created objective for this plan. |
| Source of truth read before edits | yes | Read local generated `resolve-pr-feedback`, upstream PR feedback material, and relevant local templates/rules. |
| Tracker comments and attachments read | no | N/A: this task does not resolve a real PR thread. |
| Video transcript evidence required | no | N/A: no video or screen recording source. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: workflow-source fork, not product-code bug work. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | no | N/A: agent workflow files only. |
| Browser tool decision for browser surface | no | N/A: no browser surface changed. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker mutation requested. |
| Output budget strategy recorded | yes | Output budget strategy section records scoped reads/audits and `.tmp` smoke artifact. |
| Agent-native pack selected | yes | Applied `agent-native` pack because `.agents/**` and user-action tooling changed. |
| Agent-facing action surface identified | yes | `resolve-pr-feedback` is the agent-facing PR feedback workflow. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/resolve-pr-feedback.mdc` is source; `.agents/skills/resolve-pr-feedback/SKILL.md` is generated mirror. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `agent-native-reviewer`; manual review found source/mirror discoverability sufficient. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A because no duration was requested.
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
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: source `.mdc`,
      source scripts, lock owner, generated mirror, and autogoal template.
- [x] Release artifact requirement recorded: N/A for agent workflow files.
- [x] Final handoff shape decided: changed list plus verification and caveat.
- [x] Branch handling recorded for code-changing work: N/A, no branch action.
- [x] Local-env-rot retry policy recorded: N/A, no suspicious install failure;
      the first install failure was a real lock-owner conflict and was fixed.
- [x] Workspace authority recorded: proof commands run in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: agent-action contract changed; proof is
      generated sync, source audit, template smoke, and review closeout.
- [x] Review/autoreview target selected from actual diff state: local diff.
- [x] Agent-native review decision recorded for `.agents/**` and user-action
      tooling; manual review after loading skill found no action-parity gap.
- [x] Output budget discipline recorded and followed: broad searches were
      scoped and capped.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, shell syntax checks, JSON parse, template smoke, source audits, generated mirror audit, autoreview closeout, and final `check-complete` are recorded here. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: no product bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Template smoke generated `.tmp/resolve-pr-feedback-template-smoke.md`; source audit confirms workflow text. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS or typed config changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or package file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A for package graph; `pnpm install` still ran for skill sync and passed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed after removing the CE lock conflict; generated skill has `source: .agents/rules/resolve-pr-feedback.mdc`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd | All commands run in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser UI changed. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser UI changed. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI template output. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior or public API change. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: no public docs/content changed; plan template is workflow infrastructure. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: agents keep using CE or skip review; proof: source rule rejects CE, template requires `autoreview`, AGENTS routes `resolve-pr-feedback`, and generated mirror points to source. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded skill; manual review found the user action has a discoverable skill, source scripts, generated mirror, and template. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: install conflict was a real lock conflict, not env rot. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | To run after this plan update; result recorded in Verification evidence before completion. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body` | N/A: no PR requested. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof image. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker mutation. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff contract below is filled. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: changed files are Markdown and shell helpers; focused shell syntax and generation proof are the relevant checks. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One `rg` command had shell-backtick quoting noise; reran with single quotes and recorded it in Error attempts. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-resolve-pr-feedback-fork.md` | Final command to run after `autoreview`; this row names the exact gate. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; mirror metadata points at `.agents/rules/resolve-pr-feedback.mdc`. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found AGENTS routing, generated skill source metadata, source scripts section, and `autoreview` gate. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded and applied manually; no accepted action-parity finding. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read local/CE resolver skills plus autogoal/autoreview/task/review-sweep/agent-native surfaces. | implementation |
| Implementation | complete | Added source rule, source scripts, plan template, AGENTS routing, removed lock owner, synced generated skill. | verification |
| Verification | complete except final review/check | `pnpm install`, shell syntax, JSON parse, template smoke, and source audits passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker mutation requested. | final response |
| Closeout | in_review | `autoreview` and `check-complete` are final gates. | final response |

Findings:
- CE resolver had useful robustness: outdated threads, silent bot-wrapper drop,
  `declined` verdict, untrusted comments, combined validation, thread-id
  verification, and repeat-cycle stop.
- Local resolver lacked a source `.mdc`, so Skiller rejected the fork until the
  CE lock entry was removed.
- Generated skill helper scripts from the old lock-managed install were stale;
  deleted them so source scripts live only under `.agents/rules/**`.

Decisions and tradeoffs:
- Forked into `.agents/rules/resolve-pr-feedback.mdc` because users should
  remember the local skill name.
- Kept only this lock cleanup. Other CE lock rows remain for a separate skill
  topology cleanup.
- The template is dedicated to PR feedback instead of generic `task`, because
  PR feedback has unique rows for verdicts, public mutation authority,
  reply/resolve, and final re-fetch.

Implementation notes:
- Added `.agents/rules/resolve-pr-feedback.mdc`.
- Added `.agents/rules/resolve-pr-feedback/scripts/*`.
- Added `docs/plans/templates/resolve-pr-feedback.md`.
- Removed `resolve-pr-feedback` from `skills-lock.json`.
- Added `.agents/AGENTS.md` route line; `pnpm install` regenerated root
  `AGENTS.md` and generated skill mirror.
- Deleted stale `.agents/skills/resolve-pr-feedback/scripts/*` generated copies.

Review fixes:
- To be filled if `autoreview` reports valid findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm install` failed because local rule conflicted with lock-managed `resolve-pr-feedback` | 1 | Remove only the `resolve-pr-feedback` lock row | Fixed; rerun `pnpm install` passed. |
| `rg` audit used a double-quoted pattern containing backticks | 1 | Rerun with single-quoted pattern | Fixed; rerun audit passed. |

Verification evidence:
- `pnpm install` initially failed with local rule versus lock-managed
  `resolve-pr-feedback`; after removing that lock row, `pnpm install` passed.
- `bash -n .agents/rules/resolve-pr-feedback/scripts/get-pr-comments &&
  bash -n .agents/rules/resolve-pr-feedback/scripts/get-thread-for-comment &&
  bash -n .agents/rules/resolve-pr-feedback/scripts/reply-to-pr-thread &&
  bash -n .agents/rules/resolve-pr-feedback/scripts/resolve-pr-thread` passed.
- `node -e "JSON.parse(require('fs').readFileSync('skills-lock.json','utf8')); console.log('skills-lock ok')"` passed.
- `node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template resolve-pr-feedback --title "resolve pr feedback template smoke" --path .tmp/resolve-pr-feedback-template-smoke.md --force` wrote `.tmp/resolve-pr-feedback-template-smoke.md`.
- `rg -n 'Feedback source:|Autoreview \| yes|Source scripts selected|Feedback ledger:' .tmp/resolve-pr-feedback-template-smoke.md` found the expected generated template rows.
- `find .agents/skills/resolve-pr-feedback -maxdepth 2 -type f -print | sort` returns only `.agents/skills/resolve-pr-feedback/SKILL.md`.
- `rg` source audit found generated source metadata, source-script references,
  `autoreview` closeout, AGENTS route, and template goal-plan gate.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker mutation requested.
- Confidence line: high after final review/check complete.
- Flow table:
  - Reproduced: N/A, workflow fork not product bug.
  - Verified: `pnpm install`, shell syntax, JSON parse, template smoke,
    source/mirror audits, final `autoreview`, final `check-complete`.
- Browser check: N/A, no browser UI changed.
- Outcome: `resolve-pr-feedback` is now repo-local source-owned and backed by a
  dedicated autogoal template.
- Caveat: remaining CE lock rows are intentionally out of scope.
- Design:
  - Chosen boundary: local `resolve-pr-feedback` owns PR feedback; CE is
    upstream raw material only.
  - Why not quick patch: editing generated `SKILL.md` would be overwritten.
  - Why not broader change: CE-wide skill cleanup is separate and riskier.
- Verified: evidence listed above plus final gates.
- PR body verified: N/A.

Task-style PR body contract:
- N/A: no PR requested.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: remaining CE lock cleanup is separate.

Timeline:
- 2026-06-18T10:52:06.077Z Task goal plan created.
- Created repo-local resolver source rule, source scripts, and feedback template.
- Removed `resolve-pr-feedback` lock-managed CE owner.
- Ran `pnpm install` successfully after conflict repair.
- Ran focused syntax, JSON, template smoke, and source/mirror audits.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run autoreview, patch if needed, run check-complete, final response |
| What is the goal? | Local-source fork of `resolve-pr-feedback` with autogoal template and autoreview closeout |
| What have I learned? | CE had useful robustness, but local ownership needs `.mdc` plus lock removal |
| What have I done? | Added source rule/scripts/template, synced skill mirror, removed stale generated scripts |

Open risks:
- None known after focused checks; final `autoreview` may still find an issue.
