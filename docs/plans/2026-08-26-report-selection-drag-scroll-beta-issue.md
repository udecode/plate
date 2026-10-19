# Report selection drag scroll Beta issue

Objective:
Publish and verify one `udecode/plate` Beta issue for selection drag loss during vertical scrolling; done when duplicate search, video publication, issue creation, and readback verification pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-report-selection-drag-scroll-beta-issue.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user bug report plus one local MP4
- id / link: `/Users/felixfeng/Library/Application Support/CleanShot/media/media_nVmnqHdFZW/CleanShot 2026-08-27 at 00.13.56.mp4`
- title: Selection drag stops following the pointer during vertical scrolling
- acceptance criteria: Publish exactly one non-duplicate `[Beta]: ` issue in `udecode/plate`; upload and verify the supplied video; state that the reporter held the mouse button continuously; record unknown build data as `NOT_ENOUGH_INFO`; verify the final issue title, body, and evidence URL.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Exactly one issue exists in `udecode/plate` with a `[Beta]: ` title, no verified duplicate, complete repro/expected/actual/caveat fields, and one publicly fetchable reproduction video whose size and MIME match the source; REST readback matches the final published payload.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-report-selection-drag-scroll-beta-issue.md` passes.

Verification surface:
- `prepare-video-evidence.sh` metadata and frame artifacts.
- Open/closed `udecode/plate` issue duplicate search by trigger, surface, and behavior.
- `publish-issue.sh --dry-run` and final publisher/readback verification, or the documented native Chrome attachment verification when no API storage backend is configured.
- Final unauthenticated video fetch status, MIME, and byte size.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Publish only to `udecode/plate` and only with a `[Beta]: ` title.
- Do not change product code, git state, PRs, releases, or existing issues.
- Do not expose secrets or private content; the supplied video contains only the public Plate demo.

Boundaries:
- Source of truth: user clarification, supplied MP4, current repository issue template/policy, live GitHub duplicate/readback data, and documented upload API boundary.
- Allowed edit scope: this goal plan plus temporary issue title/body/evidence artifacts; one new `udecode/plate` issue and its one evidence upload.
- Browser surface: Plate homepage editor at `/` on the `next`/Beta testing lane; local equivalent observed at `http://localhost:3001/`.
- Browser strategy: Existing video plus frame inspection supplies the failure evidence. Chrome is used only if native GitHub attachment upload is required. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: create and verify one new GitHub issue; no comments or edits to other issues.
- Non-goals: code diagnosis/fix, PR creation, branch work, fresh automated recording, stable/main claims, or claiming reproducibility beyond the supplied occurrence.

Output budget strategy:
- Read exact policy/template files only; cap GitHub duplicate search results; save prepared evidence and draft payloads under `/tmp`; print only metadata, candidate issue fields, and final verification summaries.

Blocked condition:
- Stop before publication only if a true duplicate exists, the repository/lane becomes ambiguous, GitHub auth is unavailable, or no documented upload path can produce a verified public video URL after the allowed fallbacks.

Task state:
- task_type: public Beta bug issue publication
- task_complexity: micro
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: report as unexpected drag-state loss; user confirms the primary button remained held while the selection stopped responding
- confidence: high for reporter-observed behavior; exact build and root cause unknown
- next owner: github-issue-reporter
- reason: one failure video plus explicit reporter authority is enough to state expected and actual behavior without implementation guesses

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-report-selection-drag-scroll-beta-issue.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope, publication authority, one-video evidence, continuous mouse hold, Beta target, verification, and caveats are captured above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `github-issue-reporter`, `video-transcripts`, `autogoal`, and GitHub API boundary instructions |
| Active goal checked or created | yes | `get_goal` returned no active goal; create after this static plan shell is filled |
| Source of truth read before edits | yes | Read `CONTRIBUTING.md`, `.github/ISSUE_TEMPLATE/bug.yml`, `.github/ISSUE_TEMPLATE/config.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `SECURITY.md`, reporter upload boundaries, the supplied video, and user clarification |
| Tracker comments and attachments read | yes | #5113 had no comments; final raw body and rendered attachment were read back after publication |
| Video transcript evidence required | yes | Normalized transcript generated for the supplied MP4; direct frame review overrides its incorrect inference about when selection stopped |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no implementation or source diagnosis requested |
| TDD decision before behavior change or bug fix | no | N/A: issue publication only; no product change |
| Branch decision for code-changing task | no | N/A: no code or branch change |
| Release artifact decision | no | N/A: no package/registry change |
| Browser tool decision for browser surface | yes | Existing MP4 is primary evidence; native Chrome only for GitHub attachment fallback |
| PR expectation decision | no | N/A: issue only |
| Tracker sync expectation decision | yes | Create and verify exactly one `udecode/plate` issue |
| Output budget strategy recorded | yes | Narrow reads/searches and `/tmp` evidence artifacts as described above |
| Browser pack selected | yes | browser pack materialized in this plan |
| Browser route / app surface identified | yes | Plate homepage editor `/`, local observed equivalent `http://localhost:3001/` |
| Browser tool decision recorded | yes | Existing user video plus frame evidence; Chrome only if attachment upload requires it |
| Console/network caveat policy recorded | yes | N/A for the observed drag-state issue; no console/network claim will be made |
| Observable browser case captured | yes | Case `selection-drag-scroll-loss`; start at top heading, hold primary button, drag down to auto-scroll, move back while still held; selection stops following and a selection toolbar appears before release; exact Beta ref `NOT_ENOUGH_INFO` |

Work Checklist:
- [x] N/A: no duration requested.
- [x] First checkpoint captured every user requirement, publication boundary, deliverable, stop condition, verification surface, and success criterion before public mutation.
- [x] Objective, threshold, verification surface, constraints, boundaries, output budget, and blocked condition are concrete.
- [x] Source is classified as one-video `next`/Beta behavior report; route `/`; owner surface intentionally `Unsure`; exact build `NOT_ENOUGH_INFO`.
- [x] Normalized `<video-transcripts>` XML was generated, then corrected with direct frame evidence and the reporter's continuous-button-hold clarification.
- [x] Read repository intake, security, issue-template, PR-template, upload-boundary, Chrome, file-upload, and Computer Use instructions.
- [x] N/A: no implementation. The issue stays at the observed drag-state boundary and makes no root-cause claim.
- [x] N/A: no changeset, registry changelog, release, package, or product-source change.
- [x] Final handoff requires classification, lane/build caveat, recording decision, issue URL, evidence URL, verified title/repro/expected/actual, and remaining caveats.
- [x] N/A: no branch, commit, push, or PR work.
- [x] N/A: no repository test/build/install failure or local-env-rot signal.
- [x] Workspace authority: repo policy and duplicate commands ran in `/Users/felixfeng/Desktop/repos/plate`; issue readback used live `udecode/plate`; native upload used authenticated Chrome.
- [x] High-risk note: the only public mutation was one new issue plus one supplied video; raw/visible/public-fetch verification prevents incomplete or misplaced evidence.
- [x] N/A: no implementation diff, so P1 autoreview does not apply.
- [x] N/A: no agent/tooling source changed; the instantiated goal plan is runtime evidence only.
- [x] Output stayed scoped except one rendered-HTML tail accidentally emitted a short-lived signed media URL; subsequent checks emitted booleans only and the stable public URL remains the canonical evidence.
- [x] Browser pack route/action/outcome recorded: `/`, continuous primary-button drag, vertical auto-scroll, selection stops following and toolbar appears before release.
- [x] Chrome handled exact rendering and GitHub upload; Computer Use handled the native macOS picker after extension upload access failed.
- [x] Console/network are N/A for the bug claim; public evidence network fetch was verified twice.
- [x] Existing video and final Chrome DOM visibility supplied visual proof; no screenshot waiver was needed.
- [x] Exact reporter video is the failure oracle. Automated Chrome drag did not reproduce the loss and is explicitly not counted as a green result.
- [x] N/A: this task reports the bug and makes no final-code or fixed-state claim.
- [x] N/A: no fixed/completed wording, pushed ref, or clean-runtime certification is claimed.
- [x] N/A: no 5/5 fixed-state stability claim; reproducibility remains one supplied occurrence.
- [x] No stub, alias, generated-file edit, proxy route, or unshipped scaffold was counted as behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Verify issue payload, one rendered attachment, and two public byte/MIME fetches | Passed: #5113 open, `[Beta]:` title, `bug` label, one attachment, rendered video, two HTTP 200 `video/mp4` fetches at 4,108,634 bytes |
| Bug reproduced before fix | yes | Record failing evidence | One supplied 8.26-second video plus reporter confirmation; automated repro did not reproduce and is not counted |
| Targeted behavior verification | no | N/A | N/A: report only; no product fix |
| TypeScript or typed config changed | no | N/A | N/A: no code/config change |
| Package exports or file layout changed | no | N/A | N/A: no package change |
| Package manifests, lockfile, or install graph changed | no | N/A | N/A: no install graph change |
| Agent rules or skills changed | no | N/A | N/A: no source skill/rule change |
| Workspace authority proof | yes | Verify in owning repo and tracker | Repo policy/duplicate search ran in Plate cwd; live GitHub issue and public media were read back |
| Browser surface changed | no | N/A | N/A: publication only; no browser product change |
| Browser final proof | yes | Verify rendered evidence | Fresh Chrome reload showed `Reproduction video` and the MP4 label |
| CI-controlled template output changed | no | N/A | N/A: none changed |
| Package behavior or public API changed | no | N/A | N/A: no changeset |
| Registry-only component work changed | no | N/A | N/A: no registry change |
| Docs or content changed | yes | Verify source-backed goal ledger | This instantiated goal plan records exact commands/results; no user-facing docs changed |
| High-risk mini gate | yes | Record public mutation risk and proof | Exactly one issue and one supplied public demo video; raw/rendered/public-fetch checks close incomplete-evidence risk |
| Agent-native review for agent/tooling changes | no | N/A | N/A: no agent tooling changed |
| Local install corruption suspected | no | N/A | N/A: no install failure |
| P1 autoreview for non-trivial implementation changes | no | N/A | N/A: no implementation patch |
| PR create or update | no | N/A | N/A: issue only |
| Task-style PR body verified | no | N/A | N/A: no PR |
| PR proof image hosting | no | N/A | N/A: no PR |
| Tracker sync-back | yes | Create and verify issue | #5113 created and final body read back after native upload |
| Final handoff contract | yes | Fill final fields | Completed below |
| Final lint | no | N/A | N/A: no code/user-facing docs lint surface |
| Output budget discipline | yes | Record output behavior | Narrow searches used; one signed rendered URL escaped during inspection and subsequent commands were reduced to booleans |
| Timed checkpoint | no | N/A | N/A: no duration requested |
| Goal plan complete | yes | Run checker | `[autogoal] complete: docs/plans/2026-08-26-report-selection-drag-scroll-beta-issue.md` |
| Browser interaction proof | yes | Verify GitHub UI | Chrome saved and reloaded #5113; video heading and label visible |
| Browser console/network check | no | N/A | N/A for issue content; public attachment HTTP was checked twice |
| Browser final proof artifact | yes | Record final artifact | https://github.com/udecode/plate/issues/5113 with one native MP4 player |
| Exact case replay | no | N/A | N/A: issue report, no fix/final-code claim; supplied video is the failure oracle |
| Final ref and fingerprints | no | N/A | N/A: exact Beta ref is `NOT_ENOUGH_INFO`, intentionally recorded in issue |
| Clean final runtime | no | N/A | N/A: no fixed/completed wording |
| Retry-free stability | no | N/A | N/A: reproducibility remains one observed occurrence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Video, transcript, repo policies, issue template, upload boundary, and duplicate candidates read | complete |
| Implementation | completed | N/A: no product implementation; created final issue payload and one issue | complete |
| Verification | completed | Raw/rendered/browser/public MIME and size checks passed | complete |
| PR / tracker sync | completed | N/A PR; #5113 created and verified | complete |
| Closeout | completed | Final handoff and residual caveats recorded | final response |

Findings:
- One-video classification. Direct frames show the selected range extends through `Images and Media` and the comparison table during downward scroll. Later, while the reporter says the primary button remains held, the pointer moves but the selection no longer changes and the floating selection toolbar appears. This is evidence of drag-state loss, not proof of a selection-model root cause.
- Fresh recording is not needed: the supplied video captures the motion/failure and the user explicitly supplies the otherwise-missing mouse-button state. An isolated automated recorder did not reproduce the loss and would weaken rather than strengthen the report.
- Testing lane is Plate `next`/Beta by the invoked skill. Exact commit/package version is `NOT_ENOUGH_INFO`.

Decisions and tradeoffs:
- Publish the user statement as expected-behavior authority and avoid implementation guesses -> preserves the observed fact/root-cause boundary -> root cause remains intentionally unknown.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Chrome `fileChooser.setFiles` returned `Not allowed` | 1 | Use the documented native macOS picker without changing extension permissions | MP4 selected through Command+Shift+G and uploaded successfully |
| Rendered-HTML tail printed an ephemeral signed media URL | 1 | Emit only boolean structure checks and stable public attachment URLs | Later verification exposed no signed URL and confirmed `attachment_inside_code: false` |

Verification evidence:
- `prepare-video-evidence.sh` -> H.264 MP4, 1540x1026, 8.26 seconds, 4,108,634 bytes, eight frame artifacts and one contact sheet.
- Live GitHub duplicate searches across selection/scroll/drag terms -> no exact duplicate. #4589 is Enter-triggered scroll jumping, not active drag-state loss.
- GitHub REST creation/readback -> #5113 open, exact `[Beta]:` title, `bug` label, one attachment URL, zero upload placeholders.
- Rendered HTML boolean audit -> native video element present; attachment is not inside `pre` or `code`.
- Fresh Chrome reload -> issue title, `Reproduction video` heading, and `CleanShot.2026-08-27.at.00.13.56.mp4` label visible.
- Two unauthenticated fetches -> HTTP 200, `video/mp4`, 4,108,634 bytes each, matching the source size.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-report-selection-drag-scroll-beta-issue.md` -> `[autogoal] complete`.

Final handoff contract:
- PR line: N/A: issue publication only
- Issue / tracker line: https://github.com/udecode/plate/issues/5113
- Confidence line: High confidence in publication/evidence integrity; exact Beta ref, root cause, and broader reproduction frequency remain `NOT_ENOUGH_INFO`.
- Flow table:
  - Reproduced: tests N/A, one native reporter video with continuous-button-hold clarification
  - Verified: tests N/A, Chrome reload plus REST/render/public-fetch checks passed
- Browser check: Fresh Chrome reload visibly rendered the native MP4 player.
- Outcome: Published one non-duplicate Beta behavior issue with one verified video.
- Caveat: Automated drag did not reproduce the loss; exact commit/version and cause remain unknown.
- Design:
  - Chosen boundary: State observed drag-state loss and reporter authority without naming an implementation owner.
  - Why not quick patch: No root-cause proof or repeatable automated failure exists.
  - Why not broader change: The task authorizes issue reporting, not product mutation.
- Verified: Exact title/body/state/label, one rendered attachment, and two public byte/MIME fetches.
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
- Issue / tracker: https://github.com/udecode/plate/issues/5113
- Browser proof: Chrome reload showed one native video player under `Reproduction video`.
- Caveats: Exact Beta commit/package versions and root cause are `NOT_ENOUGH_INFO`; occurrence count is one.

Timeline:
- 2026-08-26T16:23:55.392Z Task goal plan created.
- 2026-08-27 User confirmed the primary mouse button remained held after the visible selection stopped responding.
- 2026-08-27 Searched live open/closed issues; #4589 was the only nearby result and was rejected as a duplicate because its trigger and behavior differ.
- 2026-08-27 Created #5113 through the Issues REST API with the `bug` label.
- 2026-08-27 Uploaded the supplied MP4 through GitHub's native Chrome/macOS file picker and saved it once at the final body location.
- 2026-08-27 Verified raw body, rendered video placement, fresh Chrome reload, and two anonymous 4,108,634-byte `video/mp4` fetches.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Publish and verify one non-duplicate Beta issue with the supplied video |
| What have I learned? | Continuous mouse hold turns the apparent post-release state into unexpected drag-state loss; exact build/root cause remain unknown |
| What have I done? | Published and verified #5113 with one native MP4 attachment and exact caveats |

Open risks:
- Exact `next` commit/package versions and implementation owner are unknown.
- The loss is recorded once and did not reproduce under automated Chrome drag; the issue must remain an observed Beta report, not a deterministic/fixed claim.
