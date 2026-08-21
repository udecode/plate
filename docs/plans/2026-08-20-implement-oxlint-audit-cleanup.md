# implement oxlint audit cleanup

Objective:
Implement the accepted Oxlint audit; done when ten rules are active, justified exceptions are local, config/checker debt is removed, and `pnpm check` passes.

Goal plan:
docs/plans/2026-08-20-implement-oxlint-audit-cleanup.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user instruction plus accepted local audit
- id / link: docs/plans/2026-08-20-reaudit-oxlint-config-against-ellie.md
- title: implement Oxlint audit cleanup
- acceptance criteria: implement the full audit; never disable from error volume; fix ordinary diagnostics; localize proven semantic exceptions; defer no accepted item; finish with a green repository check.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: binary lint/check threshold exists
- improvement loop: one rule category at a time, then structural config, checker, review, and full check
- final score / loop closure: N/A

Completion threshold:
- All ten audited rules are globally active; ordinary diagnostics are fixed; remaining exceptions have proven owner-specific P-tier reasons; stale/broad overrides and checker logic are removed or narrowed; Oxlint has zero diagnostics; `pnpm check` passes; P1 and agent-native review findings are closed.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-implement-oxlint-audit-cleanup.md` passes.

Verification surface:
- `node tooling/scripts/check-oxlint-config.mjs`
- `pnpm exec ultracite doctor`
- rule-focused Oxlint JSON counts saved under `/tmp`, then zero-diagnostic `pnpm lint:fix`
- focused owner tests/typechecks where a lint repair can affect behavior
- full `pnpm check`
- P1 autoreview and agent-native review of the final local diff

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Never disable a rule because it has many diagnostics.
- Add no new global disables. Preserve runtime, public API, serialized-data, test, and browser behavior.
- Prefer a direct fix; use an expression/file exception only for a proven valid pattern; use a scoped config override only for a stable owner class.
- Do not run a bulk unsafe fixer.

Boundaries:
- Source of truth: `oxlint.config.ts`, `tooling/scripts/check-oxlint-config.mjs`, the accepted audit plan, Ultracite policy resources, and diagnostics from this checkout.
- Allowed edit scope: lint/config/checker/package scripts and source/test files required to clear the ten rules or narrow existing overrides; no unrelated cleanup.
- Browser surface: none intended; lint-only behavior-preserving rewrites. If a repair changes rendered behavior, browser proof becomes required.
- Browser strategy: N/A unless rendered behavior changes. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct local task.
- Non-goals: no literal Ellie copy, no removal of React Doctor coverage, no global-disable growth, no commits/PRs, no broad product refactor.

Output budget strategy:
- Save full Oxlint JSON and check logs under `/tmp`; inspect rule/file counts and bounded slices only. Exclude generated/build/dependency trees unless a named diagnostic owns them. Cap source reads and command output.

Blocked condition:
- Stop only if three distinct safe approaches hit the same regression/semantic blocker, or repository check fails for an external owner after the required single reinstall retry when corruption signals exist.

Task state:
- task_type: broad tooling/config cleanup with behavior-preserving source repairs
- task_complexity: major
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete pending validator

Current verdict:
- verdict: complete; all ten rules are active and the repository check is green
- confidence: high
- next owner: user
- reason: rule-by-rule repair, focused regression proof, Ultracite Doctor, structural validation, P1 review, and the post-review full check are green.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-implement-oxlint-audit-cleanup.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria, constraints, boundaries, and non-goals above copy the full accepted audit target. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `task`, `autogoal`, and `migrate-to-ultracite`; migration policy owns rule decisions, task owns execution, autogoal owns closure. |
| Active goal checked or created | yes | `get_goal` returned no active goal; this plan is ready for goal creation. |
| Source of truth read before edits | yes | Accepted audit plan, current config/checker audit, migration playbook, and full rule policy read. |
| Tracker comments and attachments read | no | N/A: direct user instruction. |
| Video transcript evidence required | no | N/A: no media evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: the accepted audit plan is the prior-decision owner for this tooling task. |
| TDD decision before behavior change or bug fix | no | N/A: behavior-preserving lint cleanup; focused tests replace fake TDD. |
| Branch decision for code-changing task | yes | Continue in the current checkout; no branch/PR requested and no proactive git-state inspection. |
| Release artifact decision | no | N/A: lint-only refactors do not change published behavior/API. |
| Browser tool decision for browser surface | no | N/A unless a source repair changes rendered behavior. |
| PR expectation decision | no | N/A: user did not request a PR. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Full diagnostics/logs go to `/tmp`; only bounded summaries enter context. |
| Agent-native pack selected | yes | Checker and command contract changes require the agent-native pack. |
| Agent-facing action surface identified | yes | `tooling/scripts/check-oxlint-config.mjs` and package lint command contracts. |
| Source rule versus generated mirror boundary identified | yes | Edit real config/checker/package scripts only; no generated skill mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Required at closeout; load after the final diff exists. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
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
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: local batch cleanup; report outcome, checks, design, and residual risk; PR/tracker N/A.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: current checkout, no PR branch requested.
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: all proof runs in `/Users/zbeyens/git/plate-2`.
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth config/checker/package scripts are edited; no generated mirror is targeted.
- [x] Agent-native pack: the checker command and messages make the structural contract discoverable.
- [x] Agent-native pack: N/A: `.agents/rules/**` is not in scope.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named proof | `pnpm check` exited 0 after review fixes. |
| Bug reproduced before fix | yes | Record failing proof | Full checks exposed indent, Core path-provider, combobox mock, media mock, and footnote mock regressions; P1 review exposed DOM-content logging and nullable tabindex restoration. |
| Targeted behavior verification | yes | Run focused proof | Floating geometry 23/23, Core render 18/18, inline combobox 3/3, footnote 19/19, and final tabbable 11/11 passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Focused floating, Plite DOM, and tabbable typechecks passed; full typecheck passed 60/60. |
| Package exports or file layout changed | no | N/A | No export or file-layout change; `pnpm brl` is not required. |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest dependency or lockfile change; install is not required. |
| Agent rules or skills changed | no | N/A | No `.agents/rules/**` or skill source changed by this task. |
| Workspace authority proof | yes | Run proof in owner | All commands ran in `/Users/zbeyens/git/plate-2`; focused package commands ran through the owning workspace graph. |
| Browser surface changed | yes | Use Browser | Homepage rendered in Browser; affected `/view/editor-ai` route is blocked by stale CI-owned registry imports. |
| Browser final proof | yes | Record proof/caveat | Browser confirmed the app shell/homepage. Exact component tests and the full suite cover semantic repairs; the standalone route cannot compile without forbidden local registry generation. |
| CI-controlled template output changed | no | N/A | No template output was intentionally edited. |
| Package behavior or public API changed | no | N/A | Lint repairs preserve public contracts; no changeset applies. |
| Registry-only component work changed | no | N/A | This is repo-wide lint/config work, not a registry feature release. |
| Docs or content changed | yes | Verify claims | This internal goal plan records command-backed evidence; no user docs changed. |
| High-risk mini gate | yes | Record risk and proof | Risks were runtime identity, live paths, DOM privacy, focus restoration, and native HTML semantics; focused tests/typechecks plus full check own proof. |
| Agent-native review for agent/tooling changes | yes | Close findings | PASS: `pnpm lint`/`pnpm check` route to source config/checker, proof is deterministic, and no generated mirror is involved. |
| Local install corruption suspected | no | N/A | Failures matched real code/mocks and were fixed; no reinstall signal appeared. |
| P1 autoreview for non-trivial implementation changes | yes | Run within three-invocation cap | Three invocations used: oversized full bundle refused; exact config/source split found one split-artifact and two accepted P1s. Both accepted P1s are fixed and post-fix focused/full proof is green; cap forbids a fourth review. |
| PR create or update | no | N/A | User did not request a PR. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR. |
| Tracker sync-back | no | N/A | Direct local task. |
| Final handoff contract | yes | Fill fields below | Completed below. |
| Final lint | yes | Run `pnpm lint:fix` | Passed after review fixes. |
| Output budget discipline | yes | Verify bounded output | Diagnostics were summarized; one dev-server poll overflowed because Next emitted repeated missing-module diagnostics, then the server was stopped and the caveat recorded. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run validator | Run after this update. |
| Agent source / generated sync | no | N/A | No agent source changed. |
| Agent action discoverability | yes | Source audit route | Root package scripts expose lint/check; checker output states its structural contract. |
| Agent-native review | yes | Close findings | PASS with no actionable findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | accepted audit, Ultracite policy, current config/checker | implementation |
| Implementation | completed | ten categories fixed; config/checker simplified; local exceptions justified | verification |
| Verification | completed | Doctor 6/6; lint and full check green; focused regressions green | closeout |
| PR / tracker sync | completed | N/A: no PR or tracker requested | final response |
| Closeout | completed | P1 findings fixed; agent-native PASS; plan updated | final response |

Findings:
- Rule volume is not a policy signal. All ten rules were worth enabling; ordinary diagnostics were repairable.
- Global rule disablement had hidden both mechanical debt and real regressions. Exact local exceptions are cleaner and auditable.
- P1 review caught two genuine repair hazards: DOM subtree content in error text and nullable tabindex state lost by `??`.
- The standalone registry demo route is locally blocked by a stale generated registry importing missing source files. Repo policy forbids local `build:registry`; this is unrelated to the Oxlint result.

Decisions and tradeoffs:
- Re-enabled all ten audited rules globally; added no global disable.
- Used expression/file directives only for proven runtime, test-contract, sparse-array, Suspense-promise, ARIA-composite, or generated-barrel invariants.
- Used one stable generated-owner override for `typescript/consistent-type-exports` on Barrelsby-owned indexes.
- Configured switch exhaustiveness with `considerDefaultExhaustiveForUnions`; the installed Oxlint ignored the documented comment-pattern attempt, so no placebo comments remain.
- Replaced the old exception replay checker with structural checks: literal selector existence, duplicate roots, P-tier reasons, duplicate selector/rule pairs, redundant values, and preset projection.

Implementation notes:
- Globally active rules: `jsx-a11y/prefer-tag-over-role`, `typescript/await-thenable`, `typescript/no-base-to-string`, `typescript/no-deprecated`, `typescript/only-throw-error`, `typescript/switch-exhaustiveness-check`, `typescript/no-unnecessary-type-parameters`, `unicorn/no-document-cookie`, `unicorn/no-new-array`, and `unicorn/prefer-string-slice`.
- Structural config count: 163 root rules and 137 selector/rule pairs.
- Removed duplicate Next plugin settings, stale selectors, the exception replay script, and the obsolete package script.
- The Core `usePath` repair keeps both live Plite path ownership and the scoped legacy provider fallback with unconditional hooks.

Review fixes:
- Accepted P1: replaced `outerHTML` in Plite DOM resolution errors with `nodeName`, preventing editor content leakage.
- Accepted P1: preserved an existing pending tabindex snapshot even when its original value is `null`; added a natural-button reschedule regression test.
- Rejected P1: config-only split claimed enabled rules lacked source repairs. The paired source bundle contains those repairs, and final lint/check are green.
- Review cap: invocation 1 refused the oversized checkout, invocation 2 reviewed config, invocation 3 reviewed source in three complete chunks. No fourth invocation is allowed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full check: floating `ClientRectObject` lost DOMRect contract | 1 | restore a narrow `VirtualElement` boundary | Focused typecheck and 23 geometry tests passed. |
| Full check: lint repairs regressed indent display and test providers/mocks | 1 each | repair the exact owner/mock contract | Focused tests passed; later full suite passed. |
| Autoreview full checkout exceeded eight passes | 1 | baseline from the current index and split config/source without dropping task files | Config 1 pass; source 3 passes. |
| Temporary review copy used zsh special variable `path` | 1 | rename loop variable and reuse isolated directories | Exact split created successfully; no source change. |
| App wrapper misparsed `--port` | 1 | launch Next directly from `apps/www` | Homepage rendered. |
| Standalone editor Browser route failed on missing generated registry imports | 1 | stop; do not run forbidden `build:registry` | Recorded as browser caveat; test proof remains green. |

Verification evidence:
- `node tooling/scripts/check-oxlint-config.mjs` -> 163 root rules, 137 selector/rule pairs, pass.
- `pnpm exec ultracite doctor` -> 6 passed, 0 warnings, 0 failed.
- `pnpm lint:fix` -> 4,165 files formatted, zero lint diagnostics, structural checker pass.
- Focused proofs -> floating geometry 23/23; Core pipe render 18/18; inline combobox 3/3; footnote 19/19; final tabbable 11/11; affected package typechecks pass.
- Final post-review `pnpm check` -> exit 0; 60/60 build and typecheck; 3,242 fast tests; 1,529 slow tests with 60 skips; timing gate passed.
- P1 autoreview -> two accepted findings fixed, one split-artifact rejected with full-check evidence; hard cap reached.
- Agent-native review -> PASS, no findings.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: direct local task.
- Confidence line: high; final post-review `pnpm check` is green.
- Flow table:
  - Reproduced: rule diagnostics and repair regressions were observed in lint/full-check/P1 review.
  - Verified: focused tests/typechecks and final full check are green; homepage renders in Browser.
- Browser check: homepage pass; affected standalone registry route blocked by unrelated stale generated imports.
- Outcome: ten audited rules globally active, justified exceptions local, checker/config debt removed, CI-equivalent check green.
- Caveat: no clean final autoreview line because the mandatory three-invocation cap was reached; every accepted finding is fixed and proved after review.
- Design:
  - Chosen boundary: global rule activation plus direct fixes and the narrowest durable owner exceptions.
  - Why not quick patch: global/file disables would hide valid future diagnostics and repeat the original config debt.
  - Why not broader change: no public API or product redesign was required to satisfy the rules safely.
- Verified: Doctor, structural checker, lint, focused owners, full typecheck/tests/timing gate.
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
- PR: N/A: not requested.
- Issue / tracker: N/A: direct local task.
- Browser proof: homepage rendered; standalone registry demo route blocked as recorded above.
- Caveats: Node emits non-failing typeless-package warnings for TypeScript config loading; adding root `type: module` would be an unjustified repo-wide semantic change.

Timeline:
- 2026-08-20T09:11:05.998Z Task goal plan created.
- 2026-08-20: Ten rule categories implemented; config/checker ownership simplified.
- 2026-08-20: Full check regressions repaired with focused proof.
- 2026-08-20: P1 review findings fixed; final post-review `pnpm check` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete pending validator |
| Where am I going? | Final response |
| What is the goal? | Enable ten audited rules, localize valid exceptions, simplify config/checker ownership, and keep `pnpm check` green. |
| What have I learned? | See Findings and Decisions |
| What have I done? | See Implementation, Review fixes, and Verification evidence |

Open risks:
- No known correctness blocker. Browser coverage is limited by stale CI-owned registry output; component tests and the full suite are green.
