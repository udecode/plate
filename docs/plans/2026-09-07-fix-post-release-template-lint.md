# Fix post-release template lint

Objective:
Unify template PR and release regeneration/verification, fix four source lint blockers, prove failure propagation, and update PR #5119.

Goal plan:
docs/plans/2026-09-07-fix-post-release-template-lint.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request / observed CI failure
- id / link: https://github.com/udecode/plate/actions/runs/34052638525
- title: Fix post-release template lint
- acceptance criteria: Four exact lint failures fixed at source; verified PR; templates stay CI-owned

Timed checkpoint:
- requested duration: N/A: none
- semantics: one-shot source repair
- initial confidence score: N/A: pass/fail lint proof
- improvement loop: reproduce, patch, verify, review, PR
- final score / loop closure: four lint blockers fixed and shared CI verification implemented; app types, nine verifier cases, actionlint and final autoreview pass; PR blocked by repeated unrelated fast-suite timing failures

Completion threshold:
- Four CI lint errors eliminated using the exact Biome/Ultracite versions and template configuration; full check, app types and final autoreview pass; PR #5119 updated. Hosted regeneration remains CI-owned after merge.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-07-fix-post-release-template-lint.md` passes.

Verification surface:
- Isolated Biome 2.5.12 / Ultracite 7.11.0 template lint reproduction; source lint; www typecheck; pnpm check; Chrome toolbar route; autoreview; exact PR/plan readback.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user go after proposal to fix source/workflow and open PR; failed release run https://github.com/udecode/plate/actions/runs/34052638525.
- Allowed edit scope: two registry lint owners, CI Templates/Registry/Release workflows, shared checker and integration test, and this plan; expanded explicitly by the user.
- Browser surface: existing toolbar/editor demo; preserve rendering, event propagation and prop overrides.
- Tracker sync: new dedicated PR; no comments or changes to unrelated advisory or fallback template PR.
- Non-goals: manual template/generated registry edits, local build:registry, merges, package releases, advisory publication, general agent workflow changes.

Output budget strategy:
- Scoped file reads and external log files. Initial combined skill output exceeded cap; subsequent reads use bounded sections.

Blocked condition:
- Stop for unavailable exact lint reproduction or review/CI defects outside this scoped repair; report owner and evidence. No waiting for unauthorized merge.

Task state:
- task_type: bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: done
- next_phase: N/A: repair verified; final PR check results tracked on PR #5119
- goal_status: complete

Current verdict:
- verdict: valid
- confidence: high, exact reproduction
- next owner: task
- reason: Four CI failures reproduced under the exact lint versions/config

Pre-solution issue challenge:
- reporter claim: post-release template sync fails
- suggested diagnosis or fix: fix registry source, let CI generate templates
- repro ladder:
  - tests / source-level repro: Biome 2.5.12 and Ultracite 7.11.0 reproduce exactly four errors
  - Playwright / automated browser: N/A: lint failure is observed directly
  - Browser plugin: toolbar sanity check after source fix
  - screenshot / visual proof: N/A: no layout or style change
- reproduction verdict: reproduced
- validity verdict: valid
- best long-term fix boundary: two copied registry components
- harsh honest feedback: rerunning the old SHA cannot fix deterministic source lint failures
- hard-stop decision: proceed; exact failure established

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-07-fix-post-release-template-lint.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | task/autogoal/plate-ui/shadcn; final autoreview |
| Active goal checked or created | no | N/A: plan-only; no durable goal API requested |
| Source of truth read before edits | yes | Failed release log, template lint config and source components |
| Tracker comments and attachments read | no | N/A: CI log source, no issue attachments |
| Video transcript evidence required | no | N/A: no video |
| Pre-solution issue challenge required | yes | Exact isolated lint reproduction supports source repair |
| Reproduction verdict before implementation | yes | Exactly four matching errors |
| Repro escalation ladder selected | yes | Executable lint; browser cannot observe linter diagnostics |
| Suggested fix reviewed against durable boundary | yes | Registry source feeds generated templates; no output edits |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read 2026-03-25 template lint ownership solution |
| TDD decision before behavior change or bug fix | yes | Red/green exact lint reproduction; no syntax-mirroring tests |
| Branch decision for code-changing task | yes | New codex/fix-post-release-template-lint from origin/main |
| Release artifact decision | no | N/A: behavior-preserving lint compatibility; no public shape or install change |
| Browser tool decision for browser surface | yes | CUA Chrome existing editor toolbar route |
| PR expectation decision | yes | task explicitly requires verified patch PR |
| Dedicated task plan selected for exact PR | yes | This dedicated plan; exact PR added after creation |
| Tracker sync expectation decision | no | N/A: CI source; no issue comment required |
| Output budget strategy recorded | yes | External logs and capped source reads; first combined skill read truncated |

| Agent-native pack selected | yes | Shared shell verifier is an agent-callable command |
| Agent-facing action surface identified | yes | bash tooling/scripts/check-templates.sh; logs and nonzero failures |
| Source rule versus generated mirror boundary identified | no | N/A: no rules or mirrors changed |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read and applied to helper failure/authority contract |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Every PR has its own `task` invocation and dedicated plan; this plan is
      not aggregate evidence for another PR.
- [x] If a PR exists, its body has exactly one
      `🧭 Task plan: docs/plans/<plan>.md` line, this file exists at the exact PR
      head, and this plan records that exact PR number or URL.
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

- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors. N/A: no rule or mirror edits.
- [x] Agent-native pack: changed action is discoverable from three workflow callers and this plan; direct CLI command.
- [x] Agent-native pack: generated mirrors synced when rules changed. N/A: rules unchanged.
- [x] Agent-native pack: accepted review findings closed; no orphan UI action or hidden authority.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Exact lint, nine verifier cases, actionlint, app types, browser and review pass; repeated full-check timing failures explicitly accepted by user for this push |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Exact four-error reproduction validates the source repair |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Exact four-error isolated lint reproduction before source edit; browser cannot observe CI lint errors |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Exact four-error isolated lint reproduction before source edit; browser cannot observe CI lint errors |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Exact template Biome/Ultracite red/green proof; source audit preserves truthiness, propagation and caller override |
| TypeScript or typed config changed | yes | Run relevant typecheck | Full www typecheck and root package types pass |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: No exports or file layout changes |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: No repo dependency changes; exact lint dependencies installed only in /tmp fixture |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: No rules or skills changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | /Users/zbeyens/git/plate; temp copied-source fixture uses exact template config and CI lint versions |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Chrome basic-nodes-demo toolbar opens and dismisses list dropdown; headings render |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | No style/layout change; explicit scope is toolbar open/dismiss sanity check, not full template end-to-end proof |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: No template files changed |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: No package behavior or public API changes |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: Behavior-preserving lint compatibility only; no user-visible rendering or install/API delta |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | N/A: No public docs/content changed; task ledger only |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Low-risk existing UI: preserve truthiness for string props and props-after-handler override; exact lint and Chrome proof |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Shared checker is CLI accessible, cwd-independent and fail-fast; nine executable contract checks; source review clean |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: Generated docs export race; sequential regeneration used, no node_modules corruption signal |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Final local gpt-5.5 review after committed-template repair exits 0 with zero actionable findings; /tmp/plate-template-ci-review-repair.log |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | PR #5119 updated after pnpm check; user explicitly overrides unrelated timing failures |
| Per-PR task ownership | yes | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | PR #5119 body read back with one exact task-plan line; plan committed at 0cf837155d with exact PR URL |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | gh pr view 5119 --json body readback confirms required format and one task-plan line; no current-PR self-link |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: No visual change; exact interaction proof recorded without image |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: User/CI request, no issue tracker comments requested |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | PR, exact lint red/green, full checks, browser and clean review; hosted template sync remains after merge |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | pnpm lint:fix passes; exact template fixture lint passes |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | External logs/scoped reads; initial skill read truncated then bounded reads used |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: No requested duration |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-07-fix-post-release-template-lint.md` | Completion checker passes after final ledger update |

| Agent source / generated sync | no | Sync rules when changed | N/A: no rules/mirrors changed |
| Agent action discoverability | yes | Source-audit command callers | Three workflows invoke shared checker; accepts no implicit remote action |
| Agent-native review | yes | Review action/context parity and failures | Direct CLI, explicit template logs, 8 fail-fast positions verified, no writes beyond local generated workspace |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | CI and exact isolated lint repro | complete |
| Implementation | done | Four registry lint repairs; shared template verifier and reusable CI workflow | complete |
| Verification | done | Scoped checks pass; full-check timing failures explicitly accepted by user | complete |
| PR / tracker sync | done | PR #5119 head/body verified at 0cf837155d; same plan names exact PR | complete |
| Closeout | done | Authorized patch pushed; hosted CI running, no merge or hosted success claimed | complete |

Findings:
- Four exact CI lint errors resolved by source-only changes; no additional product scope.

Decisions and tradeoffs:
- Four exact CI lint errors resolved by source-only changes; no additional product scope.

Implementation notes:
- Four exact CI lint errors resolved by source-only changes; no additional product scope.

Review fixes:
- Four exact CI lint errors resolved by source-only changes; no additional product scope.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Isolated Biome fixture lacked VCS root | 3 | Initialize empty temporary fixture git metadata | Exact four lint failures reproduced; fixture is not a checkout or worktree |
| www types ran concurrently with dev content generation | 1 | Stop dev after browser proof, then regenerate/typecheck sequentially | Full www typecheck passes after stopping dev |

Verification evidence:
- Full www typecheck passes after sequential build:source, docs/registry source checks and both TypeScript graphs.
- First pnpm check passed lint, package builds/types and all tests; speed gate exceeded budgets under concurrent workload. Unchanged full check rerun in isolation; no threshold changes.
- Biome 2.5.12 / Ultracite 7.11.0, unchanged template config: original two files yield exactly four errors; patched files pass `biome check --write --unsafe`. Only temporary copies were autoformatted.
- Source `pnpm lint:fix` passes.
- Autoreview local gpt-5.5: clean first run, zero actionable findings. Frozen scope: two source files, 11 added / 4 removed lines, plus plan.
- Shadcn docs lookup confirms toolbar is not an upstream registry item; retain existing Plate composition.
- Risk: click propagation and caller overrides must remain unchanged; props stay after default handler, truthiness stays equivalent for string id/label.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5119
- Issue / tracker line: CI run 34052638525; no issue ticket
- Confidence line: 95% for four reproduced lint blockers; hosted regeneration remains separate
- Flow table:
  - Reproduced: exact four-error lint fixture; browser N/A for lint diagnostics
  - Verified: exact lint fixture and app types pass, full check speed gate blocked; Chrome toolbar proof pass
- Browser check: Chrome basic-nodes-demo toolbar list dropdown opens and dismisses; headings render
- Outcome: source components satisfy template lint; committed-template validation, Registry regeneration validation and release workflows share install, lint, typecheck and build checks; Registry owns PR regeneration
- Caveat: CI-owned template regeneration and deployment follow merge; no full template sync claim
- Design:
  - Chosen boundary: registry source components copied by the updater; one reusable validation workflow and shared shell verifier
  - Why not quick patch: generated template edits would be overwritten
  - Scope: source and workflow inputs; generated templates remain CI-owned, with lint and timing policy unchanged
- Verified: exact lint versions/config, source lint, full app types, nine verifier contract cases, actionlint, shell syntax and clean final autoreview; speed-gate blocker recorded below
- PR body verified: N/A: body prepared outside repo but not posted

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  exactly one `🧭 Task plan: docs/plans/<plan>.md` line, then an emoji
  confidence line like `🟢 95-100% confidence`. The plan must exist at the
  exact PR head and identify that exact PR.
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
- PR: https://github.com/udecode/plate/pull/5119
- Task plan at exact PR head: N/A: no PR
- Issue / tracker: observed release CI run, no issue ticket
- Browser proof: Chrome basic-nodes-demo toolbar dropdown open/dismiss
- Caveats: CI-owned template regeneration follows merge; no manual output edits

Timeline:
- 2026-09-07T13:32:52.418Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Local verified repair; PR blocked by speed gate |
| Where am I going? | Resolve unrelated test-timing gate or explicit PR override |
| What is the goal? | Eliminate four source lint failures and submit verified PR |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- End-to-end template regeneration cannot be claimed from the source lint proof. CI must regenerate after merge; no local registry build or template output edits performed.
- Browser proof covers existing toolbar dropdown open/dismiss; no visual styles changed.

First checkpoint:
- User exact request: go, authorizing the proposed source fix, verification and PR. No duration requested. Plan-only autogoal workflow; no durable goal API requested.
- Four errors reproduced in CI: heading id and toolbar label noLeakedRender, toolbar inner name noShadow, inline stopPropagation noJsxPropsBind. Source ownership confirmed; template config stays intact.
- Branch: codex/fix-post-release-template-lint from fetched origin/main; previous branch is merged. No worktree.
- TDD: exact lint executable is the regression proof; no tests mirroring syntax.
- Release artifacts: N/A, behavior-preserving lint compatibility repair only; no package or registry install/API change.
- Skills: task, autogoal, plate-ui, shadcn and autoreview. No agent-native changes.
- docs/solutions: read 2026-03-25 template-scoped lint and local registry ownership guidance. Current rule forbids local build:registry and manual templates.

Browser evidence:
- Chrome /blocks/basic-nodes-demo renders headings and toolbar. Split-button numbered-list dropdown opens with five list style options and dismisses with Escape. No UI error. Dev server stopped afterward for sequential docs generation/typecheck.

Final blocker evidence:
- Both full `pnpm check` runs pass lint, package types/build and every correctness test; both fail `pnpm test:slowest`.
- Second full run: code-block-node read-only label 80.41 ms and media-file-node 76.25 ms exceed 75 ms case limit.
- Final `pnpm test` passes; isolated `pnpm test:slowest` retry fails on different untouched tests: suggestion file 215.72 ms, useOnClickOutside file 151.35 ms; individual cases 117.41/111.41/89.21/87.25 ms. No thresholds or test classifications changed.
- Logs: /tmp/plate-template-check.log, /tmp/plate-template-check-final.log, /tmp/plate-template-fast-final.log, /tmp/plate-template-www-types-final.log, /tmp/plate-template-review.log.
- Exact scoped lint repro: /tmp/plate-template-lint-proof with Biome 2.5.12, Ultracite 7.11.0 and unchanged template config. Original copies yield four errors; patched copies pass. No template output touched.
- Repository PR gate: Before creating or updating a PR, run check. If it fails, stop and fix it or report the blocker. Do not open a PR with failing check unless the user explicitly says to.
- Stop: fixing unrelated timing tests is outside this two-file release repair. No commit, push or PR performed. No hosted sync success claimed. Dev server stopped. Plan remains incomplete until the PR gate is resolved or explicitly overridden.

Authorized scope expansion:
- User: wtf why that drift. fix. Continue the same task/PR with CI parity as the required outcome.
- CI Templates currently only builds committed template files; Registry skips PR validation with pending changesets; release regenerates and lints templates. Replace PR paths with one reusable regeneration workflow and share install/lint/typecheck/build execution with release and registry publishing.
- Allowed additional owners: .github/workflows/ci-templates.yml, registry.yml, release.yml; tooling/scripts/check-templates.sh and executable contract tests. No general agent-workflow policy changed; maintain-workflow does not apply.
- Revised threshold: exact lint repair plus executable checks for shared verifier failure propagation/order, workflow trigger/call/source audit, full check, final autoreview and one PR. Hosted checks are required before claiming CI parity is live.
- Risk: generated templates must be checked against local package changes on PRs; failures in first template/command must propagate and prevent success or publishing. No credentials or write permissions added to PR jobs.
- Agent-native review applies to the shell helper: a direct CLI operation, explicit stdout/stderr and exit status, no remote writes. Read agent-native-reviewer and include its gate in closeout.
- Review scope baseline updated by explicit user scope expansion; previous clean review covers only the source lint repairs. Run final review on the complete CI patch.

CI parity implementation evidence:
- CI Templates is reusable and always regenerates the registry and both templates before validation; direct triggers include templates, the reusable/release workflow and helper inputs.
- Registry PR validation calls the reusable workflow and no longer skips for pending changesets. PR-only local tarball overrides preserve testing of unpublished package changes.
- Release sync and registry publishing call the same check-templates.sh verifier: install, lint, explicit typecheck and build for each template. No PR write permission or secrets introduced.
- Nine subprocess integration cases prove order, cwd independence and failure propagation at each of eight steps. The workflow runs them explicitly; subprocess tests are outside the fast in-process timing lane.
- actionlint 1.7.7 checks all three workflows; bash -n checks helper syntax. No local registry generation executed.
- Scope baseline for final review: five tracked source/workflow owners plus checker/test/plan. The user authorized CI expansion after the initial two-file review.

Review repair and latest verification:
- Accepted review finding: regeneration alone can overwrite broken committed template files before checking. Direct template PR/push events now run the shared checker before regeneration and again afterward. Registry-source caller explicitly skips the committed-output check and validates regenerated artifacts, preserving CI ownership.
- The reusable input defaults to false for skipping committed checks; absent inputs on direct events also run the committed check. No permissions widened.
- Final actionlint and shell syntax pass; nine checker subprocess tests pass. Source lint/app types/Chrome checks remain valid because source did not change after their proof.
- Full check on the expanded patch again passed lint, package builds/types and all correctness tests but failed unchanged fast timing budgets (media-file-node 97.77 ms, code-block-node 95.17 ms, media-preview-dialog file 179.02 ms and suggestion file 154.58 ms). No timing policy or unrelated tests modified.
- Final autoreview after the committed-output repair exits 0: no accepted/actionable findings, patch correct (0.86). Evidence: /tmp/plate-template-ci-review-repair.log. The remaining PR blocker is the repository check timing gate; explicit user override is required to open the PR while that check fails. No commit, push or PR performed.

PR authorization and ownership:
- Exact PR: https://github.com/udecode/plate/pull/5119. This task invocation and plan own the source/CI repair on that existing template PR.
- User explicitly authorized pushing this patch to the template PR after the failing-check override question. The unrelated timing failures are accepted for this push and disclosed in the PR body; no timing policy changed.
- Applied the entire local patch on top of PR head 1be4341d0b6f3ab6762d8737882aa03d424aa186, retaining CI-produced template changes. No manual template edits.
- Prior blocker entries are historical; the user override resolves the PR authorization blocker. Hosted CI remains separate proof.

Delivery evidence:
- PR #5119 head readback: 0cf837155d945b69cb4cb65bad52ca8278d16833. Body has one exact task-plan line and discloses the accepted timing failure.
- Final full check: /tmp/plate-template-pr5119-check.log, exit 1 only at timing gate after correctness passes. Nine checker integration tests pass again.
- CI Templates run 34132705816 and Registry validation run 34132706179 started on the pushed head. Hosted outcomes remain pending; this delivery does not claim hosted success or merge.
- Final ledger-only follow-up records delivery and completion under the explicit check override.

Hosted CI follow-up (same task, PR #5119):
- User reports CI fails. Exact head 77074e1ead: root CI passes; CI Templates rejects four stale committed-output lint errors before regeneration; Registry regeneration reaches playground and fails 332 lint errors after automatic Biome/Ultracite upgrades.
- Repair boundary: generated templates are CI-owned output. The trusted template repair branch uses the existing Registry publication job to regenerate and commit templates before final direct validation; retain committed-output checks. After dependency/shadcn updates, pin template Biome and Ultracite to the root manifest versions before lint. No template output or lint rules edited manually.
- Local copied playground source: 214 files pass exact root tool versions (Biome 2.5.0, Ultracite 7.8.3) with unchanged template config. Eleven subprocess checks cover shared verifier and updater alignment/failure propagation.
- Scope: ci-templates.yml, registry.yml, update-template.sh, existing integration test, this plan. No source component changes; previous browser/typecheck proof remains applicable. Hosted CI success on final PR head is the remaining verification target.

Follow-up review repair:
- Accepted missing-committed-output finding. Retained precheck; expanded existing trusted push-only Registry publisher to templates/release-sync-failure. It commits only templates on that branch, pushes back to the triggering branch with existing credentials, skips its own [skip release] commits, and bypasses pending-changeset publication suppression only for the repair branch. PR validation remains read-only.
- Root pnpm check completed successfully on this follow-up (including timing gate). Registry workflow repair validated with actionlint; no product source changed.

- Final follow-up autoreview clean (0.83), /tmp/template-followup-review-final.log. Root check exit 0, /tmp/template-followup-check.log. Eleven integration tests pass; actionlint passes. Copied basic/playground lint checks cover 32/214 source files. Hosted write-back and final PR checks remain pending.

Compiler/toolchain follow-up:
- Hosted Registry push run 34137031859 regenerates both templates successfully, then ESLint rejects TypeScript 7.0 installed by bun update --latest. This is the same automatic-toolchain drift class. Align all six source toolchain dependencies to installed root versions, including parser, ESLint, hooks plugin and TypeScript. Installed metadata uses direct root node_modules paths because Ultracite does not export package.json.
- No workflow permission expansion or product-source change in this repair. Existing full root check passes; rerun required root check and final local review before push.

- Full toolchain repair local proof: pnpm check exit 0 (/tmp/template-toolchain-check.log); autoreview clean 0.82 (/tmp/template-toolchain-review.log); eleven integration cases pass; both copied templates pass Biome and ESLint with exact root-installed toolchain. CI regeneration and final committed-output checks remain pending.

Hosted repair verification:
- Registry publication run https://github.com/udecode/plate/actions/runs/34137655181 passed both generated templates through install, lint, typecheck and build, then committed only CI-generated template files as 3aa4bf51209c66d6d1144ab05b5c1016f7190e2e.
- Both committed manifests contain exact root-installed compiler/lint versions: Biome 2.5.0, parser 8.56.1, ESLint 10.2.1, hooks plugin 7.1.1, TypeScript 6.0.2 and Ultracite 7.8.3.
- Registry PR validation also passes on generated head 3aa4bf5120: https://github.com/udecode/plate/actions/runs/34138017781. Final direct-template and root PR checks are tracked on PR #5119; no merge performed.
- Full local check passes, eleven regression cases pass, final autoreview clean. This ledger-only closeout records the verified repair; no further source changes.

Review-directed update (same PR #5119):
- User asks to update after full-branch review identified missing root-toolchain triggers and duplicate regeneration/cancellation debt.
- Acceptance: root package.json/pnpm-lock.yaml and generation helpers trigger Registry validation; direct template checks do not regenerate; Registry calls the shared workflow with regenerate=true; superseded PR checks cancel within separate caller workflow groups.
- Scope: ci-templates.yml, registry.yml and task evidence only. Existing generated templates and source components remain unchanged.
- Direct template runs install only Bun and Node for committed-output checks; Registry regeneration installs the monorepo toolchain. Both use the same fail-fast checker and eleven contract cases.
- Verification: workflow event/mode routing matrix, actionlint, eleven subprocess cases, pnpm check, final autoreview and exact-head hosted CI. No local registry generation, template edits or merge.

Routing verification:
- 30 path/event cases pass for root manifests, registry sources, generator helpers, committed templates and unrelated docs. Four target/event execution cases prove one verifier per invocation, regeneration only in Registry mode, Node setup for committed checks and local package overrides only for PR regeneration.
- Read-only validation concurrency uses caller workflow plus ref, separate from publication. Eleven subprocess contracts and actionlint pass; root source lint passes.

- Review-directed patch passes pnpm check (/tmp/template-routing-check.log), actionlint, source lint and eleven integration cases. Final autoreview is clean at 0.86 (/tmp/template-routing-review.log). Source routing is verified; PR push/readback and hosted results remain.

Review-directed update delivery:
- Source head 4c5f19a7e10b006e092f37195f318e702dfc3536 is pushed to PR #5119. Direct template CI run 34140477304 passes; its step readback explicitly skips monorepo install, registry build and regeneration, then verifies committed templates.
- Registry PR validation run 34140477695 passes with regenerate=true. Trusted publication run 34140474720 also passes without changing the template tree. Root manifest/lockfile and generator inputs are covered by both Registry event filters.
- Root local check, eleven verifier tests, 30 path/event cases, four execution cases, actionlint and final autoreview pass. PR body has the exact plan line and current committed/generated ownership. Final PR check outcomes are tracked on PR #5119. No merge.
