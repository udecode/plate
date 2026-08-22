# Re-enable valuable Oxlint rules

Objective:
Re-enable four valuable Oxlint rules without semantic or public-API regressions; done when diagnostics are resolved and all named checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-20-re-enable-valuable-oxlint-rules.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: N/A
- title: Re-enable valuable Oxlint rules in Plate
- acceptance criteria: Enable `typescript/no-array-delete`, `react/display-name`, `typescript/no-unnecessary-type-parameters`, and `typescript/no-redundant-type-constituents`; use structural test overrides only where test semantics genuinely conflict; fix production findings without assertion or helper laundering; leave all other audited global offs unchanged; do not commit or push.

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
- initial confidence score: N/A: command thresholds are concrete
- improvement loop: resolve diagnostics by semantic owner, then rerun focused and full checks
- final score / loop closure: N/A: completion is binary

Completion threshold:
- The four named rules are no longer globally disabled.
- Test-only sparse-array and anonymous-wrapper patterns are structurally scoped, not suppressed inline.
- Every production diagnostic from the two TypeScript rules is fixed or carries a local invariant-backed exception; no laundering helpers or fake annotations are introduced.
- Ultracite lint/fix is clean and idempotent; TypeScript, relevant tests, migration audits, repo check, and P1 autoreview pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-re-enable-valuable-oxlint-rules.md` passes.

Verification surface:
- Source audit of `oxlint.config.ts`, test overrides, and remaining disable directives.
- Focused Oxlint runs for the four rules during repair.
- `pnpm lint:fix`, repeated `pnpm lint`, repo TypeScript/check commands, Ultracite doctor, migration audit, strict config-policy audit, and P1 autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve Plate/Plite public generic inference and runtime sparse-array semantics.
- No assertion wrappers, fake generic witnesses, broad suppressions, unsafe fixes, commits, pushes, or PRs.

Boundaries:
- Source of truth: user-approved audit verdict, `oxlint.config.ts`, current diagnostics, and nearby type/API contracts.
- Allowed edit scope: `oxlint.config.ts`, diagnosed TypeScript/React source and tests, and this goal plan.
- Browser surface: N/A: lint/type contracts only.
- Browser strategy: N/A: no browser-visible behavior changes.
- Tracker sync: N/A: direct request with no tracker.
- Non-goals: re-auditing or re-enabling other rules, changing public runtime behavior, generated templates, package exports, dependencies, or commands.

Output budget strategy:
- Save JSON diagnostics under `/tmp`; inspect counts, filenames, and representative slices. Cap source reads and exclude generated/docs/vendor trees unless a finding owns them.

Blocked condition:
- Stop only if a named rule cannot be enabled without a proven public-API or runtime semantic regression and no narrow, honest exception exists, or required tooling remains unavailable after the repo reinstall recovery path.

Task state:
- task_type: refactor / tooling policy
- task_complexity: non-trivial
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: valid
- confidence: high; diagnostic audit already identified the rule owners
- next owner: task
- reason: two global offs are test-scope leaks; two type rules provide unique production safety not owned by TS7.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-re-enable-valuable-oxlint-rules.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria and no-commit/push constraint recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `migrate-to-ultracite`, `task`, and `autogoal`; P1 `autoreview` is reserved for closeout. |
| Active goal checked or created | yes | Goal tool returned no active goal; creation follows this filled plan shell. |
| Source of truth read before edits | yes | Read user audit decision, full `oxlint.config.ts`, diagnostic audit artifacts, migration policy, and repo instructions. |
| Tracker comments and attachments read | no | N/A: no tracker source. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Existing `docs/plans/2026-08-20-*oxlint*` audit and implementation plans were read; no separate solution owner exists. |
| TDD decision before behavior change or bug fix | no | N/A: lint-policy refactor; diagnostics and typecheck are the executable proof. |
| Branch decision for code-changing task | yes | Current branch is `next`; direct current-checkout work, no PR requested. |
| Release artifact decision | no | N/A: no published runtime/package behavior change. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: user prohibited commit/push and did not request a PR. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | JSON diagnostics under `/tmp`; inspect bounded summaries and representative slices. |

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
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [ ] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A; lint policy does not alter published packages or registry output.
- [x] Final handoff shape decided: direct-task outcome, exact checks, caveats, and no PR/tracker lines.
- [x] Branch handling recorded for code-changing work: current `next` checkout; no branch/PR requested.
- [x] Local-env-rot retry policy recorded: use `pnpm run reinstall` once only for unrelated install corruption.
- [x] Workspace authority recorded: every proof command runs in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: careless generic cleanup can change public inference; proof requires typecheck and contract tests, with local exceptions for valid witnesses.
- [ ] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: none of those surfaces change.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | pending |
| Browser final proof | pending | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| P1 autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-re-enable-valuable-oxlint-rules.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | implementation |
| Implementation | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- `typescript/no-array-delete` has five findings, all intentional sparse-array tests.
- `react/display-name` has 13 findings, all anonymous test wrappers.
- `typescript/no-unnecessary-type-parameters` has 102 findings across 37 files and catches both fake generics and genuine public inference witnesses.
- `typescript/no-redundant-type-constituents` has 22 findings across 14 files, including real `unknown`/`any` poisoning and intentional public teaching shapes.
- Native Oxlint cannot validate React Doctor JS-plugin zero counts; irrelevant to these four native rules.

Decisions and tradeoffs:
- Enable array-delete and display-name globally, then disable them in the shared structural test override.
- Enable both TypeScript rules and repair by API meaning; never bulk-autofix or erase genuine inference witnesses.
- Keep generated barrel and other previously audited offs unchanged.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Design:
  - Chosen boundary: pending
  - Why not quick patch: pending
  - Why not broader change: pending
- Verified: pending
- PR body verified: pending

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
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-08-20T22:18:16.679Z Task goal plan created.
- 2026-08-21 Requirements, skill policy, config, diagnostic counts, and prior audit decisions recorded before implementation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Implementation ready |
| Where am I going? | Enable rules, repair diagnostics, verify, review, closeout |
| What is the goal? | Re-enable four valuable rules without semantic or public-API regressions. |
| What have I learned? | Two rules need test scoping; two need API-aware repair. |
| What have I done? | Completed intake, policy reads, diagnostic audit, and requirement extraction. |

Open risks:
- Generic simplification may alter public inference if diagnostics are accepted mechanically; every public signature requires contract-level inspection.
