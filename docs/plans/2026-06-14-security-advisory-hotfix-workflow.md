# security advisory hotfix workflow

Objective:
Add security advisory hotfix workflow gates; done when task rule, pack template, generated skill sync, and focused checks pass.

Goal plan:
docs/plans/2026-06-14-security-advisory-hotfix-workflow.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user workflow repair request
- id / link: current thread security advisory follow-up
- title: Add reusable security advisory hotfix gates
- acceptance criteria: future task/autogoal runs for GHSA/CVE/npm advisory hotfixes must include post-merge release, advisory metadata, advisory publish, CVE request, and final readback steps.

Completion threshold:
- `.agents/rules/task.mdc` tells task runs to fetch security advisories, apply `--with security-advisory`, avoid stopping at merge/release PR, and close publish/CVE/readback evidence.
- `.agents/skills/task/SKILL.md` is regenerated from the source rule by `pnpm install`.
- `docs/plans/templates/packs/security-advisory.md` exists and materializes advisory source, release, publish, CVE, and readback gates into a task goal plan.
- Focused checks pass: `pnpm install`, pack materialization smoke, `pnpm lint:fix`, autoreview clean, source audit, and goal-plan checker.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-security-advisory-hotfix-workflow.md` passes.

Verification surface:
- Source audit with `rg` over `.agents/rules/task.mdc`, `.agents/skills/task/SKILL.md`, and `docs/plans/templates/packs/security-advisory.md`.
- `pnpm install` generated skill sync.
- `create-goal-scratchpad.mjs --template task --with security-advisory` smoke plan materialization, then smoke artifact deletion.
- `pnpm lint:fix`.
- `.agents/skills/autoreview/scripts/autoreview --mode local`.
- `check-complete.mjs` on this plan.

Constraints:
- Preserve existing task workflow shape outside security advisory hotfixes.
- Do not hand-edit generated skill mirrors without syncing from `.agents/rules`.
- Do not invent a separate `security-advisory` skill unless the pack proves insufficient.
- Keep the new pack focused on disclosure closeout, not generic package release policy.

Boundaries:
- Source of truth: current user request plus the observed GHSA closeout miss.
- Allowed edit scope: `.agents/rules/task.mdc`, generated `.agents/skills/task/SKILL.md`, `docs/plans/templates/packs/security-advisory.md`, and this plan.
- Browser surface: N/A: agent workflow/docs only.
- Tracker sync: N/A: no issue/PR comment requested for this workflow repair.
- Non-goals: changing release automation, changing advisory content, creating a new skill folder, or opening a PR.

Output budget strategy:
- Use targeted `sed`, `rg`, and focused command outputs only; cap broad searches and avoid streaming all historical plans.

Blocked condition:
- Stop if `pnpm install` cannot regenerate skill mirrors, the pack cannot materialize, or autoreview identifies an accepted issue that cannot be resolved without user choice.

Task state:
- task_type: agent workflow repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: implement the missing workflow gates as a task rule plus autogoal pack
- confidence: high after source sync, pack smoke, lint, autoreview fixes, and final closeout gates
- next owner: task
- reason: the prior GHSA run almost stopped at code/release and needed explicit advisory publish/CVE/readback steps.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-security-advisory-hotfix-workflow.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `task`, `autogoal`, `agent-native-reviewer`, and `autoreview` skill instructions. |
| Active goal checked or created | yes | `get_goal` returned none; created active goal for this workflow repair. |
| Source of truth read before edits | yes | User asked to update `task` or add an autogoal pack for future security hotfixes. |
| Tracker comments and attachments read | N/A: no tracker item | Current request is thread-local workflow repair. |
| Video transcript evidence required | N/A: no video evidence | No screen recording/video was used as source. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: agent workflow repair | Existing source rules/templates were inspected instead. |
| TDD decision before behavior change or bug fix | N/A: no runtime behavior change | This is rule/template behavior. |
| Branch decision for code-changing task | N/A: no PR/commit requested | Work remains local until user asks to ship. |
| Release artifact decision | N/A: no package release | Agent docs/rules only. |
| Browser tool decision for browser surface | N/A: no browser surface | No UI/browser behavior changed. |
| PR expectation decision | N/A: no PR requested | User asked to update workflow, not open a PR. |
| Tracker sync expectation decision | N/A: no tracker sync requested | No issue/advisory comment needed for this workflow repair. |
| Output budget strategy recorded | yes | Targeted searches and capped outputs recorded above. |
| Agent-native pack selected | yes | Active plan uses `--with agent-native` because `.agents/**` changed. |
| Agent-facing action surface identified | yes | Changed future `task` handling of GHSA/CVE/npm advisory hotfixes. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/task.mdc` is source; `.agents/skills/task/SKILL.md` is generated by `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer instructions; manual pass recorded below. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or N/A with reason.
- [x] Final handoff shape decided: local workflow repair summary with verification evidence.
- [x] Branch handling recorded for code-changing work: N/A, no PR/commit requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure: N/A, no suspicious failure occurred.
- [x] Workspace authority recorded: every proof command names `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded for public API, runtime, package-boundary, browser behavior, agent-action, or command-contract changes.
- [x] Review/autoreview target selected from actual diff state for non-trivial implementation work.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches were scoped, capped, counted, or artifacted instead of streamed into goal context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, pack materialization smoke, source audit, `pnpm lint:fix`, final autoreview, and goal checker passed. |
| Bug reproduced before fix | N/A: workflow repair | Record failing test/repro or N/A with reason | Prior GHSA closeout exposed the missing workflow step; no runtime repro applies. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Pack materialization smoke proved `--with security-advisory` rows appear in generated task plans. |
| TypeScript or typed config changed | N/A: no TS/config code | Run relevant typecheck | No typed runtime surface changed. |
| Package exports or file layout changed | N/A: no package exports | Run `pnpm brl` before final verification and keep generated barrel updates | No package/export layout changed. |
| Package manifests, lockfile, or install graph changed | N/A: lockfile unchanged | Run `pnpm install` and relevant package checks | `pnpm install` ran for skill sync; package graph was already up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` ran `skiller apply`; source audit shows `.agents/skills/task/SKILL.md` mirrors `.agents/rules/task.mdc`. |
| Workspace authority proof | yes | Run verification in owning repo/package/app/route/tool and record cwd | All verification ran in `/Users/zbeyens/git/plate`. |
| Browser surface changed | N/A: no browser surface | Capture Browser Use proof or record explicit waiver/blocker | Agent workflow/docs only. |
| Browser final proof | N/A: no browser surface | Attach screenshot or exact browser verification caveat when browser proof applies | No UI/browser behavior changed. |
| CI-controlled template output changed | N/A: no templates output | Restore generated template output or record why it is intentionally kept | No `templates/**` output changed. |
| Package behavior or public API changed | N/A: no package behavior | Add a changeset or record why no changeset applies | Agent workflow only. |
| Registry-only component work changed | N/A: no registry component | Update registry changelog or record N/A | No `apps/www/src/registry/**` change. |
| Docs or content changed | yes | For incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Added a goal pack template and plan; source audit and pack smoke cover structure. |
| High-risk mini gate | yes | Record realistic failure mode, proof plan, and why chosen boundary is right | Failure mode: future agents stop at merged PR and leave advisory unpublished. Boundary: `task` selection plus autogoal pack catches future GHSA/CVE hotfixes. Proof: generated skill sync and pack materialization. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close accepted/actionable findings | Reviewer loaded; manual parity pass says the task skill now exposes the agent action through rule text. |
| Local install corruption suspected | N/A: no install rot | Run `pnpm run reinstall` once, rerun exact failing command, or record N/A | No local-corruption failure occurred. |
| Autoreview for non-trivial implementation changes | yes | Run autoreview until no accepted/actionable findings | Final rerun passed clean: no accepted/actionable findings. |
| PR create or update | N/A: no PR requested | Run `check` before PR work and sync PR body | No PR requested. |
| Task-style PR body verified | N/A: no PR | Verify PR body with `gh pr view --json body` | No PR body. |
| PR proof image hosting | N/A: no PR proof images | Host images or record N/A | No images. |
| Tracker sync-back | N/A: no tracker sync requested | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker. |
| Final handoff contract | yes | Fill final handoff fields below | Filled below; final response will be concise. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; no fixes applied. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed | Searches were targeted; one broad `rg` was capped and truncated by tool output. |
| Goal plan complete | yes | Run `check-complete.mjs` | `check-complete.mjs` passed for this plan. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` ran; source audit confirms generated `task` skill contains advisory workflow text. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` shows `Security Advisory Hotfixes` in `.agents/rules/task.mdc` and `.agents/skills/task/SKILL.md`. |
| Agent-native review | yes | Load reviewer and close accepted findings, or record N/A | Manual agent-native review accepted no additional findings beyond autoreview; agents can now act through `gh api` workflow instructions. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Task/autogoal/agent-native/autoreview skills and task/template sources read | implementation |
| Implementation | complete | Added task rule and `security-advisory` pack; synced generated task skill | verification |
| Verification | complete | `pnpm install`, pack smoke, source audit, `pnpm lint:fix`, and accepted autoreview fixes recorded | closeout |
| PR / tracker sync | N/A | No PR/tracker requested | final response |
| Closeout | complete | Final gate commands named in verification evidence | final response |

Findings:
- The missing reusable rule was not the code fix itself; it was the post-merge advisory closeout: verify fixed package publication, update advisory vulnerabilities, publish, request CVE, and read back state.
- Autoreview correctly flagged that the first rule draft described `security-advisory` like a missing skill instead of an autogoal pack.
- Autoreview correctly flagged the generated plan placeholders; this file is now a completed workflow repair ledger.
- Autoreview correctly flagged that a concrete advisory ID does not belong in a reusable repo-tracked plan; this plan now uses a generic thread-local label.
- Autoreview correctly flagged that repository security advisory URLs and public `github.com/advisories/GHSA-*` URLs require different API endpoints.
- Autoreview correctly flagged that npm-only/private advisories need external-source closure instead of GitHub-only publish/CVE gates.
- Autoreview correctly flagged that public GitHub Advisory Database records need an explicit read-only/global-owner path unless a repo advisory is owned by this repo/org.
- Autoreview correctly flagged that private/draft vulnerability reports need a disclosure guard before public PR/comment/release-note sync.

Decisions and tradeoffs:
- Add a `security-advisory` pack instead of a standalone skill because the workflow composes with normal `task`, `package-api`, `changeset`, and release gates.
- Update `.agents/rules/task.mdc` as source and regenerate `.agents/skills/task/SKILL.md` with `pnpm install`.
- Keep package release policy in `package-api`; the new pack owns disclosure closeout only.

Implementation notes:
- `.agents/rules/task.mdc` now classifies GitHub security advisory/GHSA URLs and adds `--with security-advisory` for GHSA/CVE/npm advisory work.
- `docs/plans/templates/packs/security-advisory.md` adds advisory source, publish, CVE, and readback gates.
- `.agents/skills/task/SKILL.md` was regenerated by `pnpm install`.

Review fixes:
- Accepted autoreview P1: removed the misleading Skill Diet entry that implied a missing `security-advisory` skill; the rule now treats it as an autogoal pack.
- Accepted autoreview P2: replaced generated placeholders in this plan with completed evidence rows.
- Accepted autoreview P2: replaced the concrete advisory identifier in this plan with a generic thread-local label.
- Accepted autoreview P2: removed self-described unfinished closeout language from the tracked plan and made final gate commands explicit.
- Accepted autoreview P2: split repo-scoped advisory fetches from public GitHub Advisory Database fetches in the task rule and pack.
- Accepted autoreview P2: made GitHub publish/CVE gates conditional on repository advisories and added npm/private external-source closure paths.
- Accepted autoreview P2: added a public/global GHSA read-only path and instruction to locate/create a repo advisory before attempting mutation.
- Accepted autoreview P2: added a private/draft disclosure guard for public PRs, issue comments, release notes, and tracker sync.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Autoreview found missing skill reference and unfinished plan | 1 | Patch source wording and complete the plan before rerun | Accepted and fixed. |
| Autoreview found concrete advisory ID and unfinished closeout wording in plan | 1 | Make plan generic and make final gate evidence explicit | Accepted and fixed. |
| Autoreview found repo/public GHSA API ambiguity | 1 | Split repo advisory and public advisory endpoints in source rule and pack | Accepted and fixed. |
| Autoreview found GitHub-only gates over-applied to npm/private advisories | 1 | Add external-source paths and make repository publish/CVE gates conditional | Accepted and fixed. |
| Autoreview found missing private disclosure guard | 1 | Add private/draft disclosure-safe PR/comment/release-note rule and pack gate | Accepted and fixed. |
| Autoreview found public GHSA read-only closeout gap | 1 | Add public/global GHSA owner path and repo-advisory ownership condition | Accepted and fixed. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate` passed and ran `skiller apply`.
- `node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template task --with security-advisory --title "security advisory pack smoke" --path docs/plans/2026-06-14-security-advisory-pack-smoke.md --force` materialized advisory pack rows; smoke file deleted.
- `rg` source audit found `Security Advisory Hotfixes` and `security-advisory` rows in source rule, generated skill, and pack template.
- `pnpm lint:fix` passed with no fixes applied.
- `.agents/skills/autoreview/scripts/autoreview --mode local` first run found two accepted issues; both fixed.
- `.agents/skills/autoreview/scripts/autoreview --mode local` second run found two accepted plan issues; both fixed.
- `.agents/skills/autoreview/scripts/autoreview --mode local` third run found repo/public GHSA endpoint ambiguity; fixed and synced with `pnpm install`.
- `rg` source audit confirms `.agents/rules/task.mdc` and `.agents/skills/task/SKILL.md` name both repo advisory and public advisory endpoints.
- `.agents/skills/autoreview/scripts/autoreview --mode local` fourth run found GitHub-only gates over-applied to npm/private advisories; fixed in task rule and pack.
- `.agents/skills/autoreview/scripts/autoreview --mode local` fifth run found public GHSA read-only closeout gap; fixed in task rule and pack.
- `.agents/skills/autoreview/scripts/autoreview --mode local` sixth run found missing private disclosure guard; fixed in task rule and pack.
- Final `.agents/skills/autoreview/scripts/autoreview --mode local` rerun passed clean: no accepted/actionable findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-security-advisory-hotfix-workflow.md` passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker sync requested.
- Confidence line: high.
- Flow table:
  - Reproduced: prior GHSA closeout needed manual advisory/CVE steps; browser N/A.
  - Verified: source audit, generated skill sync, pack materialization smoke, lint, autoreview, and goal checker; browser N/A.
- Browser check: N/A, agent workflow only.
- Outcome: future task/autogoal security hotfixes get release, advisory publication, CVE request, and readback gates.
- Caveat: no PR/commit created unless the user asks.
- Design:
  - Chosen boundary: `task` rule plus autogoal pack.
  - Why not quick patch: a one-off reminder would not affect future generated plans.
  - Why not broader change: a standalone skill is unnecessary unless the pack grows into a distinct workflow.
- Verified: source audit, generated skill sync, pack materialization smoke, lint, autoreview clean rerun, and goal checker after final gates.
- PR body verified: N/A, no PR.

Task-style PR body contract:
- N/A: no PR requested for this workflow repair.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: no commit/PR created unless requested.

Timeline:
- 2026-06-14T19:32:53.682Z Task goal plan created.
- 2026-06-14: Added task rule for GitHub security advisory/GHSA intake and closeout.
- 2026-06-14: Added `docs/plans/templates/packs/security-advisory.md`.
- 2026-06-14: Ran `pnpm install`; generated task skill sync passed.
- 2026-06-14: Smoke-generated a task plan with `--with security-advisory`; pack rows materialized; smoke file deleted.
- 2026-06-14: Ran `pnpm lint:fix`; no fixes applied.
- 2026-06-14: Ran autoreview; accepted and fixed missing-skill wording and unfinished-plan findings.
- 2026-06-14: Reran autoreview; accepted and fixed concrete-advisory-id and unfinished-closeout wording findings.
- 2026-06-14: Reran autoreview; accepted and fixed repo-scoped versus public GHSA endpoint ambiguity.
- 2026-06-14: Reran autoreview; accepted and fixed GitHub-only gates over-applied to npm/private advisory sources.
- 2026-06-14: Reran autoreview; accepted and fixed public GHSA read-only closeout path.
- 2026-06-14: Reran autoreview; accepted and fixed missing private disclosure guard.
- 2026-06-14: Final autoreview rerun passed clean.
- 2026-06-14: `check-complete.mjs` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run final gates, final response |
| What is the goal? | Add reusable security advisory hotfix workflow gates |
| What have I learned? | A pack is the right unit; naming it like a skill was wrong |
| What have I done? | Added task rule, generated skill sync, security-advisory pack, and verification evidence |

Open risks:
- None after final gates pass.
