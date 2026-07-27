# refresh resolve slate issue skill

Objective:
Refresh `resolve-slate-issue` for integrated Plite-in-Plate ownership; done
when source/mirror use current checkout commands and the agent-native review
passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-27-refresh-resolve-slate-issue-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request
- id / link: N/A
- title: Update stale `resolve-slate-issue` skill now that Plite lives in Plate
- acceptance criteria:
  - edit `.agents/rules/resolve-slate-issue.mdc`, never its generated mirror;
  - make the current `udecode/plate` checkout the implementation authority;
  - keep `udecode/slate` as the default issue tracker for bare issue numbers;
  - replace stale separate-repo paths, package names, and proof commands;
  - use normal Plate PR/release truth for code-changing fixes;
  - regenerate skills with `pnpm install`;
  - close agent-native/review findings and verify the generated mirror.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A
- improvement loop: source audit -> patch owner -> regenerate -> review -> verify
- final score / loop closure: N/A

Completion threshold:
- Zero stale separate-repo assertions or obsolete Slate command/package names
  remain in the source rule or generated skill.
- The skill distinguishes issue-repository authority from implementation
  authority, uses current Plite package/browser gates, and does not close an
  issue for an unmerged local-only fix.
- `pnpm install`, generated-mirror comparison, focused source audits,
  agent-native review, changed-file hygiene, and the goal checker pass.
- Repo-wide lint is attempted and any unrelated checkout blocker is recorded;
  changed-file whitespace/source audits remain the scoped closeout gate.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-refresh-resolve-slate-issue-skill.md` passes.

Verification surface:
- Source audit over `.agents/rules/resolve-slate-issue.mdc` and its generated
  `.agents/skills/resolve-slate-issue/SKILL.md`.
- Live root/app package-script inventory and GitHub repository readback.
- `pnpm install`, generated body comparison, `pnpm lint:fix`,
  agent-native review, autoreview, and `check-complete.mjs`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/resolve-slate-issue.mdc`; generated
  `.agents/skills/resolve-slate-issue/SKILL.md` is read-only output.
- Allowed edit scope: the source rule, its necessary discoverability owner,
  this plan, and generated agent mirrors produced by `pnpm install`.
- Browser surface: N/A; this changes workflow instructions, not UI.
- Browser strategy: N/A; future issue runs choose Browser/Chrome/device proof
  from the issue's actual behavior.
- Tracker sync: N/A; no issue is being resolved in this task.
- Non-goals: do not resolve an issue, mutate GitHub, rename the skill, rewrite
  every historical Slate document, or edit package/runtime code.

Output budget strategy:
- Read exact rule/skill files; cap cross-repo searches with `head`; exclude
  generated/build dependency trees. The initial combined audit was too broad,
  so all subsequent reads are owner-scoped.

Blocked condition:
- Stop only if Skiller cannot regenerate the mirror after one install repair or
  current root commands cannot identify an honest Plite proof owner.

Task state:
- task_type: agent-workflow repair
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: valid; stale split-repo workflow requires a source-rule rewrite
- confidence: high
- next owner: task
- reason: the implementation and browser proof owners now live in
  `udecode/plate`; the default issue tracker remains `udecode/slate`.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-refresh-resolve-slate-issue-skill.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria above capture source ownership, current-repo migration, command refresh, generation, review, and proof. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read named skill, source rule, `autogoal`, `agent-native-reviewer`, current maintainer routing, Plite agent start, and live package scripts. |
| Active goal checked or created | yes | `get_goal` returned no active goal; this finite repair uses the generated task plan without creating an inferred goal. |
| Source of truth read before edits | yes | Read `.agents/rules/resolve-slate-issue.mdc`; confirmed `.agents/skills/**` is generated from it. |
| Tracker comments and attachments read | no | N/A: skill repair, not a tracker item. |
| Video transcript evidence required | no | N/A: no media. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Existing owner history is `docs/plans/2026-05-10-resolve-plite-issue-skill.md`; no runtime solution applies. |
| TDD decision before behavior change or bug fix | no | N/A: workflow prose/generated mirror only. |
| Branch decision for code-changing task | no | N/A: no git action requested; work stays in current checkout. |
| Release artifact decision | no | N/A: agent-rule changes do not need a package changeset or registry changelog. |
| Browser tool decision for browser surface | no | N/A: no browser-rendered behavior changes. |
| PR expectation decision | no | N/A for this repair; future code-changing skill runs use Plate PR truth. |
| Tracker sync expectation decision | no | N/A: no live issue mutation. |
| Output budget strategy recorded | yes | Exact-file reads and capped searches recorded above. |
| Agent-native pack selected | yes | `agent-native` pack materialized in this plan. |
| Agent-facing action surface identified | yes | One Slate issue -> current Plate checkout owner -> proof -> Plate PR when changed -> issue comment/close after merge. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/resolve-slate-issue.mdc`; regenerate `.agents/skills/resolve-slate-issue/SKILL.md` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read completely before edits; capability-map review is a completion gate. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no media.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A; agent instructions only.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded: current checkout and skill target are `next`;
      N/A for git mutation because none was requested.
- [x] Local-env-rot retry policy recorded: N/A; no install-corruption signal.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review target is dirty local mode, frozen to the five-file skill packet;
      unrelated checkout findings are out of scope.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files were edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed action is discoverable from the skill and maintainer route.
- [x] Agent-native pack: `pnpm install` synced generated mirrors.
- [x] Agent-native pack: no actionable agent-native finding remains.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source/generation/review checks | Passed; evidence below. |
| Bug reproduced before fix | no | N/A with reason | N/A: stale workflow was source-audited, not a runtime bug. |
| Targeted behavior verification | yes | Verify action/owner/command contract | Passed source, script, and package-owner audits. |
| TypeScript or typed config changed | no | N/A | N/A: prose and generated Markdown only. |
| Package exports or file layout changed | no | N/A | N/A: no package file/layout change. |
| Package manifests, lockfile, or install graph changed | no | N/A | `pnpm install` ran for Skiller; lockfile was already current. |
| Agent rules or skills changed | yes | Regenerate and compare | `pnpm install` succeeded; source and generated bodies match. |
| Workspace authority proof | yes | Verify in Plate root | Commands/package scripts checked in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A | N/A: no rendered UI change. |
| Browser final proof | no | N/A | N/A: workflow instructions only. |
| CI-controlled template output changed | no | N/A | N/A: no template output touched. |
| Package behavior or public API changed | no | N/A | N/A: no changeset. |
| Registry-only component work changed | no | N/A | N/A: no registry component work. |
| Docs or content changed | no | N/A | N/A: repo-agent workflow, not product docs/content. |
| High-risk mini gate | yes | Audit issue/PR/closure authority | Passed; local-only fixes cannot close issues, and `next` is not called stable. |
| Agent-native review for agent/tooling changes | yes | Close findings | Passed capability-map review; no actionable finding remains. |
| Local install corruption suspected | no | N/A | N/A: no corruption signal. |
| Autoreview for non-trivial implementation changes | yes | Run local scoped review until clean | Final scoped run exited clean with no accepted/actionable findings. |
| PR create or update | no | N/A | N/A: user did not ask for GitHub mutation. |
| Task-style PR body verified | no | N/A | N/A: no PR. |
| PR proof image hosting | no | N/A | N/A: no PR/browser image. |
| Tracker sync-back | no | N/A | N/A: no live issue resolved. |
| Final handoff contract | yes | Fill fields below | Filled below. |
| Final lint | yes | Run repo lint and scoped hygiene | Repo lint attempted; blocked only by unrelated artifact diagnostics. Generated/source files are Biome-excluded; `git diff --check` is the scoped gate. |
| Output budget discipline | yes | Record broad output/recovery | Initial broad read recorded; subsequent commands owner-scoped/capped. |
| Timed checkpoint | no | N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run checker | Plan content is resolved; final checker output is recorded in verification evidence. |
| Agent source / generated sync | yes | Run install and compare | Passed. |
| Agent action discoverability | yes | Audit skill and maintainer route | Passed. |
| Agent-native review | yes | Close findings | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Current repo, issue repo, commands, owners, and source boundary read | implementation |
| Implementation | complete | Source rule rewritten; maintainer route refreshed; mirrors regenerated | verification |
| Verification | complete | Generation, body match, stale audit, capability map, and package-script audit | closeout |
| PR / tracker sync | complete | N/A: no external mutation requested | final response |
| Closeout | complete | Accepted review finding fixed; final rerun/checker recorded below | final response |

Findings:
- `origin` is `https://github.com/udecode/plate`; Plite packages, browser
  proof, and examples are all in this checkout.
- `udecode/slate` remains live with issues enabled and is the correct default
  issue repository for bare issue numbers.
- Stale commands are `pnpm slate:test`, `@platejs/slate-react`, and
  `--filter slate`; current owners are `pnpm check:plite:dev`,
  `pnpm check:plite`, `@platejs/plite-*`, and
  `pnpm --filter plite test:plite-browser:chromium`.
- The old no-PR rule can close an external issue from local-only proof. In the
  integrated repo, code-changing fixes need a Plate PR and the issue stays open
  until the fix is merged and verified.

Decisions and tradeoffs:
- Keep the skill name and default `udecode/slate` tracker -> it owns one
  upstream/fork issue workflow; renaming would add churn without changing the
  issue source.
- Replace no-PR closure with state-aware shipping -> already-accounted rows may
  comment/close directly; code-changing rows create a Plate PR and close only
  after merge/readback.
- Keep one skill rather than a wrapper -> this cross-repo issue-to-Plate flow is
  a distinct recurring job and maintainer routing already names it.

Implementation notes:
- Rewrote `.agents/rules/resolve-slate-issue.mdc` around split authority:
  Slate issue tracker, Plate `next` implementation/PR, and release readback.
- Replaced obsolete Slate package/command names with current Plite package,
  app, and root checks.
- Updated the maintainer routing sentence and regenerated agent mirrors via
  `pnpm install`.

Review fixes:
- Accepted autoreview P2: plan still said implementation was in progress.
  Closed all plan gates with actual evidence before final review.
- Accepted autoreview P3: advertised `#number` input was passed to an unquoted
  shell placeholder. Normalize the leading hash before `gh issue view`.
- Two-cycle reclassification: both findings are direct in-scope blockers in
  the changed plan/skill packet; no owner or contract expansion is required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial combined skill/source search streamed more output than intended | 1 | Read exact files and bounded owner slices | Subsequent commands are capped and owner-scoped. |
| `pnpm lint:fix` found unrelated architecture-audit diagnostics | 1 | Use changed-file hygiene and preserve unrelated user work | Biome ignores the changed `.mdc`/Markdown files; final scoped gate is `git diff --check`. |

Verification evidence:
- Live identity: current branch `next`; origin `https://github.com/udecode/plate`;
  remote `next` exists.
- Issue owner: `udecode/slate` is live with issues enabled.
- Command owners: root/package script inventory confirms
  `check:plite:dev`, `check:plite`, `check:plite:browser-matrix`,
  `@platejs/plite*`, and the `apps/plite` Chromium runner.
- Generation: `pnpm install` succeeded and ran Skiller.
- Mirror: Node source/generated body comparison passed.
- Stale audit: obsolete `slate:test`, `@platejs/slate-react`,
  `--filter slate`, old split-repo proof, and no-PR closure language are absent.
- Agent-native capability map:

  | User action | Route | Source owner | Generated/discovery owner | Proof | Result |
  | --- | --- | --- | --- | --- | --- |
  | Resolve one Slate issue | `resolve-slate-issue` | `.agents/rules/resolve-slate-issue.mdc` | generated skill plus maintainer route | source/mirror/command/authority audits | pass |

- Agent-native failure modes checked: wrong implementation repo, local-only
  issue closure, merge without authority, and stable-release overclaim.
- Autoreview command: local mode with a strict five-file scope prompt.
- Final autoreview: clean; no accepted/actionable findings, 0.87 overall
  confidence.
- Plan validator: `[autogoal] complete`.
- Root lint: attempted, but unrelated current-tree artifact files produce 170
  diagnostics; no fixes were applied.

Final handoff contract:
- PR line: N/A; no PR requested or created.
- Issue / tracker line: N/A; no issue mutation requested.
- Confidence line: high; source/generated and live-command evidence agree.
- Flow table:
  - Reproduced: stale source assertions found; browser N/A
  - Verified: source/mirror/command/review checks; browser N/A
- Browser check: N/A; no UI change.
- Outcome: `resolve-slate-issue` is truthful for Plite inside Plate `next`.
- Caveat: repo-wide lint remains red on unrelated architecture-audit artifacts.
- Design:
  - Chosen boundary: source rule plus its existing maintainer discoverability row.
  - Why not quick patch: replacing command names alone would preserve unsafe
    local-only closure and false release claims.
  - Why not broader change: the skill name and Slate issue owner remain valid.
- Verified: generation, body equality, live scripts, stale audit, agent-native review, autoreview.
- PR body verified: N/A; no PR.

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
- Caveats: unrelated repo-wide lint diagnostics only.

Timeline:
- 2026-07-27T11:44:34.571Z Task goal plan created.
- 2026-07-27T11:48Z Source rule and maintainer route updated.
- 2026-07-27T11:49Z `pnpm install` regenerated skills; body match passed.
- 2026-07-27T11:53Z Autoreview found one stale plan-state row; accepted and fixed.
- 2026-07-27T11:58Z Autoreview found unsafe `#number` command shape; accepted and fixed.
- 2026-07-27T12:00Z Final autoreview clean; no accepted/actionable findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete and clean. |
| Where am I going? | Final response. |
| What is the goal? | Make `resolve-slate-issue` truthful for Plite inside `udecode/plate`. |
| What have I learned? | Issue tracker and implementation repo are intentionally different owners. |
| What have I done? | Rewritten source ownership, regenerated mirrors, audited commands/authority, and fixed the review finding. |

Open risks:
- None in the changed skill. Repo-wide lint is independently red on unrelated
  architecture-audit artifacts.
