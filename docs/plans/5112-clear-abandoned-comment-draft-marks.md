# Clear abandoned comment draft marks

Objective:
Clear abandoned Plate comment draft marks; done when close-without-submit removes draft/base marks in 5 browser runs, focused checks and P1 autoreview pass; no commit or push.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5112-clear-abandoned-comment-draft-marks.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user-reported browser behavior follow-up
- id / link: related local case for public issue #5112; no tracker mutation authorized
- title: Closing an unsubmitted comment popover removes its comment mark
- acceptance criteria: open a first-comment popover, submit nothing, close it, then verify the popover is gone and the selected text has neither `comment_draft` nor base `comment` styling/state

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A: binary browser/test threshold is stronger
- improvement loop: red -> smallest owner fix -> focused proof -> P1 review -> 5/5 fresh Browser replay
- final score / loop closure: N/A: close only on the named evidence gates

Completion threshold:
- Exact browser test fails before the fix because the abandoned comment mark remains.
- The same test passes after the fix, including popover closure and zero matching `.plite-comment` marks.
- Fresh local source process passes 5/5 retry-free Browser replays with no console errors; P1 autoreview has no accepted finding.
- No commit, push, PR, or tracker mutation occurs.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5112-clear-abandoned-comment-draft-marks.md` passes.

Verification surface:
- Extend `apps/www/tests/browser/comment.spec.ts` with close-without-submit assertions.
- Focused browser command against `apps/www` plus in-app Browser on `/`.
- Scoped Ultracite check, registry changelog generator check, and P1 autoreview.

Constraints:
- Do not commit or push.
- Do not update GitHub issue #5112.
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: latest user requirement, current `BlockCommentDetails.onOpenChange`, current browser regression test.
- Allowed edit scope: comment popover cleanup owner, existing browser test, current registry changelog event, this plan, generated changelog artifacts.
- Browser surface: local `apps/www` homepage `/` Playground.
- Browser strategy: in-app Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: user requested local code repair only.
- Non-goals: no comment submission redesign, no persisted discussion changes, no package/public API change, no commit/push/PR/issue update.

Output budget strategy:
- Read exact owner/test/changelog files only; cap command output; exclude `.next`, test artifacts, generated registry corpus, `node_modules`, and broad repo searches unless a named failure requires them.

Blocked condition:
- Stop only if the exact close action cannot be reproduced in three distinct normal UI attempts or Browser cannot inspect post-close mark state after documented recovery.

Task state:
- task_type: local Plate registry behavior bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: `candidate-local`
- confidence: high for scoped local browser behavior; no pushed-ref claim
- next owner: user-selected integration workflow if commit/push is later desired
- reason: exact pure-draft and overlap cases pass both 5/5 lanes with P1 review clean

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5112-clear-abandoned-comment-draft-marks.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Close without submit removes the comment mark; preserve existing popover fix; no commit/push/tracker mutation |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `patch` owns the behavior repair; `autogoal` owns lifecycle; Browser pack applies |
| Active goal checked or created | yes | New active goal created after prior goal completion |
| Source of truth read before edits | yes | Current `BlockCommentDetails.onOpenChange`, existing browser test, and current registry changelog entry read |
| Tracker comments and attachments read | no | N/A: direct user follow-up supplies the exact requirement; no tracker mutation/read is needed |
| Video transcript evidence required | no | N/A: deterministic text requirement and runnable local route |
| `docs/solutions` checked for non-trivial existing-code work | yes | Relevant block-discussion solution says path-derived state must resolve inside the rerendering wrapper; current owner already follows that rule |
| TDD decision before behavior change or bug fix | yes | Extend the existing browser regression first and prove red before source change |
| Branch decision for code-changing task | no | N/A: current checkout only; user prohibited commit/push |
| Release artifact decision | yes | Update existing uncommitted registry changelog event; no package changeset |
| Browser tool decision for browser surface | yes | In-app Browser for local normal UI; Playwright browser test as durable regression |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker mutation authorized |
| Output budget strategy recorded | yes | Exact-file reads and capped outputs recorded above |
| Browser pack selected | yes | Browser pack materialized in this plan |
| Browser route / app surface identified | yes | `apps/www` homepage `/` Playground comment UI |
| Browser tool decision recorded | yes | In-app Browser plus focused Playwright regression |
| Console/network caveat policy recorded | yes | Assert zero runtime errors; network detail out of scope unless route loading fails |
| Observable browser case captured | yes | `issue-5112:abandon-first-comment`; select plain text, open first comment, submit nothing, click outside, expect popover closed and no draft mark; overlapping existing comments must remain |

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
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Red/green exact case, Playwright 5/5 for both tests, Browser 5/5, lint/unit/changelog checks, P1 clean |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Baseline outside click did not finish cleanly; unsafe first fix made existing comment count fall from 1 to 0 |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `comment.spec.ts` covers pure draft cleanup and overlapping submitted-comment preservation |
| TypeScript or typed config changed | yes | Run relevant typecheck | `www` tsc ran; only existing AI/markdown/source errors, no issue-owned diagnostic |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export/file-layout change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest/lock/install change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran in `/Users/felixfeng/Desktop/repos/plate`; Browser used `apps/www` `/` |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | In-app Browser 5/5: mark 1 before close, 0 after, popover hidden |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Final screenshot emitted and five-run ledger recorded |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output touched |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: registry-only behavior, no package/public API delta |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Canonical registry changelog MDX/JSON event updated; generator write/check passed |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental changelog text matches tested behavior; generator check passed |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Data-loss risk for overlapping existing comments now has dedicated red/green browser coverage |
| Agent-native review for agent/tooling changes | no | For agent/tooling changes, close accepted findings or record N/A | N/A: no agent/tooling source changed |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption signature |
| P1 autoreview for non-trivial implementation changes | yes | Load autoreview and pass `--max-priority P1` within three invocations | Invocation 1 found overlap data loss; fixed. Invocation 2 exited 0 clean |
| PR create or update | no | Run `check` before PR work and sync PR body | N/A: no PR requested; commit/push prohibited |
| Task-style PR body verified | no | Verify the PR body | N/A: no PR |
| PR proof image hosting | no | Host browser proof for PR body or record N/A | N/A: no PR |
| Tracker sync-back | no | Post tracker sync or record N/A | N/A: no tracker mutation authorized |
| Final handoff contract | yes | Fill final handoff fields below | Completed below; final status is `candidate-local` |
| Final lint | yes | Run scoped equivalent | Scoped Ultracite fix/check passed |
| Output budget discipline | yes | Verify no unbounded high-volume output | Exact-file searches and capped outputs used |
| Timed checkpoint | no | If duration was requested, complete it | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5112-clear-abandoned-comment-draft-marks.md` | Passed after final ledger closure |
| Browser interaction proof | yes | Exercise target route/interaction with Browser | In-app Browser real drag, toolbar click, outside click passed 5/5 |
| Browser console/network check | yes | Record console/network state | All five Browser runs had error count 0; route loaded normally |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof | Final Browser screenshot emitted after fifth run |
| Exact case replay | yes | Prove exact case and final-state fields | Each run: selected text, mark 1 before close, popover hidden, mark 0 after, zero errors |
| Final ref and fingerprints | yes | Record final ref and SHA-256 fingerprints | `dirty:d282fd8a33affb40d2b60103b6c1ce370140d2eb`; production `04c56d997cd2e38c1f819e121242f890b41c96f06a0dd066719475d483c7c290`; test `1a28b2b1a12f93d78455d07b7a67caf5313a5c2dd3d12a10e839128d8db18826` |
| Clean final runtime | no | Require clean pushed ref for fixed/completed wording | N/A: fresh local source process proves `candidate-local`; user prohibited commit/push |
| Retry-free stability | yes | Record 5/5 warm runs | Playwright 5/5 across both tests (10/10 total) and in-app Browser 5/5 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | requirement/source/solution audit complete | N/A |
| Implementation | complete | two-step cleanup preserves overlapping comments and clears UI store | N/A |
| Verification | complete | focused checks, 10/10 Playwright, Browser 5/5, P1 clean | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker mutation authorized | N/A |
| Closeout | complete | fingerprints and handoff recorded | final response |

Findings:
- Close cleanup currently unsets only `comment_draft`; the base `comment` mark is not explicitly removed.
- `docs/solutions/ui-bugs/2026-04-05-block-discussion-must-resolve-current-path-inside-the-wrapper-component.md` confirms cleanup should stay inside the rerendering `BlockCommentDetails` owner and use current path-derived reads.

Decisions and tradeoffs:
- Keep cleanup in `BlockCommentDetails.onOpenChange`: it owns popover lifecycle and current-path draft state.
- Remove base `comment` only from draft leaves with `getCommentCount(node) === 0`; remove `comment_draft` from every draft leaf.
- Clear `activeId` and `commentingBlock` on close so controlled `open` cannot be reasserted by stale UI state.

Implementation notes:
- No package/public API change; the existing uncommitted registry changelog event now covers abandoned draft cleanup.

Review fixes:
- Accepted P1: direct base-mark deletion corrupted overlapping submitted comments. Added browser red/green coverage and split cleanup into conditional base removal plus unconditional draft removal.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Escape and unrelated discussion-trigger attempts did not exercise the normal outside-dismiss path | 3 | Use page-outside pointer dismissal | Outside click became the durable test and Browser replay action |
| First cleanup implementation removed base mark from overlapping submitted comments | 1 | Preserve base when `getCommentCount(node) > 0` | P1 finding fixed; overlap browser case red then green |

Verification evidence:
- Browser red: baseline outside click did not finish clean closure; first cleanup implementation made existing `comments` mark count fall from 1 to 0.
- Browser green: focused `comment.spec.ts` -> 2/2.
- Fresh Playwright: `--repeat-each=5` on source-mode port 3100 -> 10/10.
- In-app Browser: five runs, each beforeCount 1, afterCount 0, popoverHidden true, errorCount 0.
- Unit: block-discussion-index -> 11/11.
- Lint: scoped Ultracite fix/check passed.
- Changelog: generator write/check passed for 82 events.
- Typecheck caveat: `www` tsc reports only existing AI/markdown/source drift, no issue-owned file.
- P1 autoreview invocation 2: clean.
- Changelog source `0c76465863bc075a8ebf8a76bb0b78dc2bd042ca08520e38fc18b0b4925d623b`; generated event `b47107582f7f8c87b5b9a87f809a299ad1a3b4c3cec3e26c5b31440a22c2688f`.
- Goal checker: `check-complete.mjs docs/plans/5112-clear-abandoned-comment-draft-marks.md` -> complete.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker mutation authorized
- Confidence line: high for scoped local browser behavior; `candidate-local`
- Flow table:
  - Reproduced: close cleanup and overlap preservation both failed before their fixes
  - Verified: Playwright 10/10, Browser 5/5, zero errors
- Browser check: outside click hides popover and removes only abandoned draft marks
- Outcome: pure draft marks are removed; submitted overlapping comments survive
- Caveat: full `www` typecheck has unrelated existing errors; no pushed ref exists
- Design:
  - Chosen boundary: `BlockCommentDetails.onOpenChange`
  - Why not quick patch: deleting both marks together corrupts overlapping submitted comments
  - Why not broader change: no package or comment model contract change is needed
- Verified: exact red/green, overlap preservation, focused checks, two P1 passes, fresh 5/5 lanes
- PR body verified: N/A: no PR

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
- PR: N/A
- Issue / tracker: N/A; no mutation
- Browser proof: Playwright 10/10 and in-app Browser 5/5
- Caveats: unrelated full typecheck failures; local unpushed candidate only

Timeline:
- 2026-08-26T14:23:14.698Z Task goal plan created.
- 2026-08-26: captured exact close-without-submit case, read current owner/test/changelog, and checked institutional learnings before editing.
- 2026-08-26: baseline close cleanup reproduced red; initial fix passed pure draft cleanup but failed overlapping comment preservation.
- 2026-08-26: accepted P1 overlap finding, added coverage, applied two-step cleanup, and closed P1 review on invocation 2.
- 2026-08-26: fresh source process passed Playwright 10/10 and in-app Browser 5/5; server stopped after proof.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Goal checker and final local handoff |
| What is the goal? | Remove draft and base comment marks when an unsubmitted first-comment popover closes |
| What have I learned? | Cleanup must distinguish pure draft leaves from draft leaves overlapping submitted comment IDs |
| What have I done? | Two-step cleanup, UI state reset, overlap regression coverage, changelog, focused verification, Browser 5/5, and P1 closeout |

Open risks:
- Full `www` typecheck remains red on unrelated existing AI/markdown/source drift.
- Exact reporter browser/OS is unknown; proof covers local Chromium and in-app Browser.
- No commit/push exists by user request, so the result remains `candidate-local`.
