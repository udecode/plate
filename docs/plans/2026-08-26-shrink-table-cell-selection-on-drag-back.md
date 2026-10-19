# shrink table cell selection on drag back

Objective:
Fix table drag selection so returning to the origin shrinks back to one cell;
done when the recording-exact browser case is red then green and passes 5/5.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-26-shrink-table-cell-selection-on-drag-back.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user bug report with local screen recording
- id / link: local attachment `/Users/zbeyens/Library/Application Support/CleanShot/media/media_nYcreHnGz2/2026-08-26 at 11.38.19.mp4`
- title: table cell drag selection only expands and does not shrink
- acceptance criteria: while holding the pointer, expand from `Plugin` across
  multiple rows/columns, drag back into `Plugin`, and observe a one-cell Table
  view (`anchors.length === 1`) with zero expanded-cell DOM markers before and
  after pointer-up

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A: one-shot evidence-gated repair
- initial confidence score: N/A: exact red/green and 5/5 are stronger metrics
- improvement loop: reproduce, classify, add exact red, fix owner, verify 5/5
- final score / loop closure: close only after exact case and plan gates pass

Completion threshold:
- The attachment is normalized into `<video-transcripts>` evidence and key
  frames are inspected before edits.
- The reporter-valid case fails before the fix: pointer-down in the origin
  table cell, drag across multiple cells, return to that origin while still
  held, and assert the Table view and expanded-cell DOM projection still
  incorrectly exceed one.
- The same case passes after the durable owner fix with one Table anchor and
  zero `data-table-cell-selected` markers while held back at the origin and
  after pointer-up; the native text Range remains a normal in-cell selection.
- The focused test passes 5/5 without retry, visible Browser proof and runtime
  error checks pass on a fresh process/page, changed owners typecheck/lint, and
  P1 review has no accepted actionable finding.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-shrink-table-cell-selection-on-drag-back.md` passes.

Verification surface:
- Video transcript plus visually inspected key frames from the attached MP4.
- Existing or extended `apps/www/tests/browser/table-selection.spec.ts` on
  `/blocks/table-demo` with a real pointer expand-and-contract gesture.
- Focused package test if the defect classifies to deterministic Table model
  selection; otherwise record why browser input is the lowest exact layer.
- Fresh Browser proof of held and post-release selected-cell counts, native
  selection, focus, toolbar state when applicable, and app runtime errors.
- Five consecutive retry-free final runs, scoped lint/typecheck, registry
  generation when registry source changes, changeset/changelog decision, and
  P1 review policy closure.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: attached recording and latest user acceptance, then current
  Table selection model/DOM owners and executable tests.
- Allowed edit scope: the literal Table selection update owner, its focused
  package/browser test, registry component/generated registry only if it owns
  the defect, and narrow proof config only when required.
- Browser surface: `apps/www` `/blocks/table-demo`.
- Browser strategy: use Browser first for the normal app gesture; use exact
  Chrome only if the recording or reproduction proves browser-specific native
  behavior. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct local report with no issue or PR target.
- Non-goals: no new selection authority, plugin, public API, compatibility
  alias, timing workaround, native Range clearing, commit, push, PR, release,
  or tracker mutation.

Output budget strategy:
- Inspect the attached video through one transcript and a small contact sheet;
  search only current Table selection owners and focused tests with capped
  `rg`/`sed`; exclude generated output until the owning generator is required;
  cap test logs and never stream broad repo scans.

Blocked condition:
- Block only if the attachment cannot be read and the exact gesture cannot be
  reproduced on the real route, or if evidence shows multiple materially
  different expected outcomes that require user choice. Broken local tooling,
  stale hosts, and narrow test failures are repair work, not blockers.

Task state:
- task_type: Plate browser-visible selection/navigation bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: achieved locally

Current verdict:
- verdict: exact local fix verified
- confidence: high: the controller contract failed before the fix, the exact
  browser case failed before the fix, the final case passed 5/5 retry-free, and
  a fresh Browser page reproduced the correct model, DOM, native Range, focus,
  and error state
- next owner: user or checkout coordinator for commit/push if desired
- reason: the stale auto-scroll rollback guard was incorrectly applied to live
  pointer movement; live event ranges now contract normally while stale
  auto-scroll and contradictory mouse-up coordinates remain guarded

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-shrink-table-cell-selection-on-drag-back.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Expand across multiple table cells, return to the origin while held, and unselect every other cell; fix and prove the attached case |
| Timed checkpoint parsed | no | N/A: no duration or hard stop requested |
| Skill analysis before edits | yes | Patch owns the one bug; Autogoal owns evidence closure; Video Transcripts owns attachment normalization |
| Active goal checked or created | yes | New goal created with this exact plan path and red/green plus 5/5 threshold |
| Source of truth read before edits | yes | Latest report captured; transcript, frames, live owner, and current tests must be read before product edits |
| Tracker comments and attachments read | yes | Direct attachment path recorded; no tracker comments exist |
| Video transcript evidence required | yes | Local MP4 must be normalized by Video Transcripts and key frames visually checked before edit |
| `docs/solutions` checked for non-trivial existing-code work | yes | Run a scoped Table/selection search before edit and record result |
| TDD decision before behavior change or bug fix | yes | Exact real-pointer expand-return case must be red before product fix |
| Branch decision for code-changing task | yes | Stay in the current shared checkout; no branch switch, commit, or push authorized |
| Release artifact decision | yes | Add registry changelog if registry UI owns the fix; add changeset only if published package behavior changes |
| Browser tool decision for browser surface | yes | Browser is the primary real-route proof; exact Chrome only if source evidence makes browser specificity material |
| PR expectation decision | no | N/A: user requested a local fix, not a PR |
| Tracker sync expectation decision | no | N/A: no public or Linear tracker target |
| Output budget strategy recorded | yes | One transcript, small frame set, owner-scoped reads, capped logs, no broad generated-tree output |
| Browser pack selected | yes | Visible real-pointer selection behavior requires Browser pack |
| Browser route / app surface identified | yes | `apps/www` route `/blocks/table-demo` |
| Browser tool decision recorded | yes | Browser first; no native OS surface is reported |
| Console/network caveat policy recorded | yes | App runtime errors block green; extension-only or unrelated dev noise is reported separately |
| Observable browser case captured | yes | `table:contract-selection-on-drag-back`; attached MP4; `/blocks/table-demo`; pointer-down origin, expand over multiple cells, return to origin while held, release; expected selected count 1 during return and after release; current dirty ref/fingerprints captured with red/final proof |

Work Checklist:
- [x] Reporter-exact requirement: expanding a held table-cell drag and returning
      to `Plugin` contracts the Table view to one anchor and removes every
      expanded-cell DOM marker before and after pointer-up; the attachment and
      visually inspected frames remain the interaction oracle.
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration was requested.
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
- [x] Branch handling recorded for code-changing work: remained on shared
      `next`; no branch switch, commit, or push was requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A: no install-corruption signal occurred.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 target selected from actual diff state: manual P1 audit of the
      final owner/test hunk found no actionable issue; repo policy forbids
      `autoreview` on `next`.
- [x] Agent-native review decision recorded: N/A because no agent, skill, hook,
      command, prompt, or user-action tooling changed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context, except the one recorded per-file `rg --max-count` mistake.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked: fresh route returned
      HTTP 200 and the fresh Browser tab had zero warning/error logs.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-visible and
      known-absent controls through the identical capture path. Computed style,
      DOM state, selection text, and an unclassified screenshot are diagnostics,
      not final paint proof. The adjacent native-highlight case retained its
      positive/negative pixel controls and passed; contraction itself is the
      structural model/marker contract, with a Browser screenshot as secondary
      visual evidence.
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
      not certify the pushed tree. N/A for integrated wording: this is an
      uncommitted local candidate; a fresh isolated process and page prove the
      current files only.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Pass exact browser case 5/5 | 5/5 retry-free on fresh port 3001 process |
| Bug reproduced before fix | yes | Record failing owner and browser proofs | Unit expected contraction but retained `[2,0]`; browser retained six markers and cross-cell model/native ranges |
| Targeted behavior verification | yes | Run owner and reporter proofs | Owner test green; exact browser case green; adjacent highlight case green |
| TypeScript or typed config changed | yes | Run package typecheck | `pnpm turbo typecheck --filter=./packages/plite-react` passed |
| Package exports or file layout changed | no | N/A | No exports or public file layout changed; `pnpm brl` not required |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest, lockfile, or dependency change; install not required |
| Agent rules or skills changed | no | N/A | No agent/rule/skill source changed |
| Workspace authority proof | yes | Use owning checkout/package/app | All commands ran in `/Users/zbeyens/git/plate-2`; Browser used `/blocks/table-demo` from `apps/www` |
| Browser surface changed | yes | Capture visible Browser proof | Fresh in-app Browser page expanded to six markers, returned to zero while held, and retained zero after release |
| Browser final proof | yes | Record final model/DOM/native/focus/error state | Same-cell model path, native text `ug`, zero markers, focused editor, one native range, zero error logs |
| CI-controlled template output changed | no | N/A | No template output touched |
| Package behavior or public API changed | yes | Add package release artifact | `.changeset/calm-cells-contract.md` adds `@platejs/plite-react` patch |
| Registry-only component work changed | no | N/A | No registry source changed in this task; registry changelog not required |
| Docs or content changed | no | N/A | Only this internal goal plan changed; no public docs/content claim |
| High-risk mini gate | yes | Preserve stale-coordinate rejection while allowing live contraction | Auto-scroll rollback guard remains auto-scroll-only; contradictory mouse-up range remains rejected; full package tests and exact Browser proof passed |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling files changed |
| Local install corruption suspected | no | N/A | No corruption signal; reinstall was not justified |
| P1 review for non-trivial implementation changes | yes | Review final owner/test hunk | Manual P1 audit found zero actionable findings; `autoreview` is forbidden on branch `next` |
| PR create or update | no | N/A | User did not authorize PR work |
| Task-style PR body verified | no | N/A | No PR exists or was requested |
| PR proof image hosting | no | N/A | No PR body exists |
| Tracker sync-back | no | N/A | Direct local report has no issue/Linear target |
| Final handoff contract | yes | Fill fields below | Completed below with exact local status and proof |
| Final lint | yes | Run scoped formatter/linter | `pnpm exec ultracite check` on four changed implementation/proof files passed |
| Output budget discipline | yes | Record any miss and recovery | One per-file `rg --max-count` overflow recorded; all later reads/tests were scoped and capped |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run final checker | Final checker is the last closeout command after this evidence edit |
| Browser interaction proof | yes | Exercise exact route/gesture | Fresh Browser page on `http://localhost:3001/blocks/table-demo` passed |
| Browser console/network check | yes | Check app errors and route response | HTTP 200 in fresh server log; no Browser warning/error entries; Playwright runtime recorder passed |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof | Fresh Browser screenshot emitted while held back at origin; state ledger recorded below |
| Exact case replay | yes | Recheck held and released fields | Six cells at expansion; one-cell model and zero markers at return and release; focus preserved |
| Final ref and fingerprints | yes | Record HEAD and SHA-256 values | Recorded in Verification evidence below |
| Clean final runtime | no | N/A for integrated wording | Fresh isolated process/page proved the current uncommitted files; no pushed immutable ref exists |
| Retry-free stability | yes | Run 5/5 with retry zero | `--repeat-each=5`, five passed, one worker, zero retries |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | transcript, frames, current owners, focused solution read | done |
| Implementation | complete | live pointer accepts every resolved range; stale guard stays in auto-scroll | done |
| Verification | complete | 1103 tests, typecheck, lint, exact 5/5, adjacent case, fresh Browser | done |
| PR / tracker sync | N/A | no PR/tracker authorization or target | done |
| Closeout | complete | evidence and handoff filled; final checker follows | final response |

Findings:
- Normalized attachment evidence:

  <video-transcripts>
  <video-transcript title="Table cell selection does not contract on drag back">
  [00:00] (The user clicks and drags from the "Element" cell in the "Heading" row down to the "Inline" cell in the "Mention" row.)
  [00:01] (The selection highlights the "Element" and "Inline" cells across the "Heading", "Image", and "Mention" rows.)
  [00:02] (The user drags the cursor back up towards the "Heading" row.)
  [00:03] (The selection remains expanded across all three rows despite the cursor moving back to the "Heading" row.)
  [00:04] (The user releases the mouse, and the selection remains stuck in the expanded state.)
  </video-transcript>
  </video-transcripts>
- The generated transcript labels the start as `Heading / Element`; the visual
  frames below override that inaccurate label. Both during-return and
  post-release selected-cell state remain acceptance fields.
- Visual inspection corrects the generated transcript: the pointer starts in
  `Plugin`, expands down/right through at least a 3x2 rectangle, returns to
  `Plugin` while still held, and the stale pale-blue expanded-cell overlay
  remains until release. The post-release frame shows a normal text selection
  in `Plugin`, so the defect is live contraction, not release cleanup.

Decisions and tradeoffs:
- Treat each live pointer `resolveEventRange` result as authoritative. Dragging
  back must contract and may cross the origin; suppressing regressive live
  ranges creates monotonic selection.
- Keep rollback suppression only in the drag auto-scroll worker, where a range
  captured around a scroll frame can genuinely be stale.
- Keep the narrower mouse-up direction contradiction check because the existing
  contract proves mouse-up may resolve a point on the wrong side after the DOM
  selection disappears.
- Fix Plite React's coordinate-drag owner. A Table-only listener, custom
  selection state, or marker cleanup would hide the bad model range and leave
  every other coordinate-drag consumer broken.

Implementation notes:
- `packages/plite-react/src/editable/root-interaction-controller.ts` always
  applies resolved live move ranges and scopes rollback comparison to
  `applyDragAutoScrollFrame`.
- `packages/plite-react/test/root-interaction-controller.test.tsx` locks
  expand-then-contract behavior while retaining stale auto-scroll and stale
  mouse-up contracts.
- `apps/www/tests/browser/table-selection.spec.ts` replays the recording shape:
  `Plugin` to a 3x2 rectangle and back to `Plugin` before release.
- `.changeset/calm-cells-contract.md` records the Plite React patch impact.

Review fixes:
- Manual P1 audit moved the full regressive comparison back to auto-scroll and
  removed every live-move guard. This avoids a partial fix that would still
  reject legitimate origin crossing when the pointer drifts vertically.
- No remaining actionable P1 finding. Automated `autoreview` was not run because
  repo policy forbids it on `next`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `rg --max-count 40` across `docs/solutions` capped matches per file, not globally, and streamed a huge truncated result | 1 | Read only the one exact Table solution path surfaced by the output; keep all later searches owner-scoped with `head` after file listing | recovered: broad exploration stopped immediately; no source edits occurred |

Verification evidence:
- RED owner contract before product edit:
  `pnpm --filter @platejs/plite-react test:vitest root-interaction-controller.test.tsx -t "contracts coordinate selection"`
  failed because focus stayed at `[2,0]` instead of contracting to `[0,0]`.
- RED exact browser contract before product edit:
  `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www test:www-browser:chromium table-selection.spec.ts --grep "table:contract-selection-on-drag-back"`
  failed with `modelSelectionInOneCell: false`,
  `nativeSelectionInOrigin: false`, and `selectedCount: 6`.
- Final owner safeguards:
  `pnpm --filter @platejs/plite-react test:vitest root-interaction-controller.test.tsx -t "contracts coordinate selection|ignores stale downward drag autoscroll|preserves dragged coordinate selection when mouseup resolves before"`
  passed 3/3.
- Final package proof:
  `pnpm --filter @platejs/plite-react test` passed 75 files and 1103 tests.
- Final type proof:
  `pnpm turbo typecheck --filter=./packages/plite-react` passed five Turbo tasks.
- Final format/lint proof:
  `pnpm exec ultracite check packages/plite-react/src/editable/root-interaction-controller.ts packages/plite-react/test/root-interaction-controller.test.tsx apps/www/tests/browser/table-selection.spec.ts .changeset/calm-cells-contract.md`
  passed.
- Fresh-process exact stability:
  `PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www test:www-browser:chromium table-selection.spec.ts --grep "table:contract-selection-on-drag-back" --repeat-each=5`
  passed 5/5 with one worker and zero retries.
- Adjacent browser protection:
  `PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm --filter www test:www-browser:chromium table-selection.spec.ts`
  passed both contraction and classified-pixel native-highlight cases.
- Final fresh Browser state on `/blocks/table-demo`:
  - expanded: six markers; model paths span `Plugin` through the 3x2 endpoint
  - returned while held: zero markers; model anchor/focus paths both
    `[2,0,0,0,0]`; native text `ug`; editor focused
  - released: zero markers; same-cell model Range; native text `ug`; one native
    range; editor focused
  - runtime: route HTTP 200 and zero Browser warning/error entries
- Final local ref: `168a4490e2ccf90dd9b1bd3230fb2f528460caa2` plus
  uncommitted task files.
- SHA-256 production:
  `51317f410d053f31374f44e7ba9d5d093a26b56471f95f56fa28f8ca7d58936c`
  (`packages/plite-react/src/editable/root-interaction-controller.ts`).
- SHA-256 owner test:
  `f156949eec27c0d5d0cb904071b09e9b853a91aa070b18a57767991cd3deed48`
  (`packages/plite-react/test/root-interaction-controller.test.tsx`).
- SHA-256 browser test:
  `ee8887f1dbcf8fe97d35fbc715387d644043a7ac1cdbd603c815fed9bdc7e814`
  (`apps/www/tests/browser/table-selection.spec.ts`).
- SHA-256 release artifact:
  `bfa6b6b94a95dfe1c9e255e7eb3e3492e794be2a1cd2e2263fb21aa0e24fcf2a`
  (`.changeset/calm-cells-contract.md`).

Final handoff contract:
- PR line: N/A: no PR requested or created
- Issue / tracker line: N/A: direct local report with no tracker target
- Confidence line: high for the current local files; no integrated/shipped claim
- Flow table:
  - Reproduced: red owner contract and red exact browser gesture
  - Verified: green owner safeguards, full package suite, typecheck, lint, exact
    5/5, adjacent pixel case, and fresh visible Browser replay
- Browser check: fresh process/page passed with six-to-zero markers while held,
  same-cell native/model selection after release, focus preserved, no errors
- Outcome: drag selection contracts back to the origin instead of only expanding
- Caveat: work is local and uncommitted; no pushed-ref or release proof exists
- Design:
  - Chosen boundary: Plite React coordinate-drag controller
  - Why not quick patch: clearing Table markers would leave the model and native
    selection expanded
  - Why not broader change: the selection API and Table projection already
    represent contraction correctly; only the misplaced live rollback guard was
    wrong
- Verified: exact evidence and fingerprints listed above
- PR body verified: N/A: no PR exists

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
- PR: N/A: not requested
- Issue / tracker: N/A: no target
- Browser proof: passed on fresh port 3001 process and fresh in-app Browser page
- Caveats: local uncommitted candidate only

Timeline:
- 2026-08-26T09:39:59.004Z Task goal plan created.
- 2026-08-26 Attached MP4 normalized by Video Transcripts before product edits.
- 2026-08-26 Output-budget miss recorded after a per-file `rg --max-count`
  produced excessive `docs/solutions` output; all subsequent reads narrowed.
- 2026-08-26 Exact owner and Browser cases failed before the product edit.
- 2026-08-26 Live drag rollback guard removed; stale auto-scroll and
  contradictory mouse-up guards retained.
- 2026-08-26 Final package, type, lint, 5/5 Chromium, adjacent pixel, and fresh
  Browser proofs passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Contract a multi-cell drag back to the origin while held |
| What have I learned? | Live pointer rollback suppression caused monotonic selection |
| What have I done? | Fixed the owner and proved the exact interaction locally |

Open risks:
- Integration remains unproved because no commit, push, PR, or immutable CI ref
  was authorized. No product-behavior risk remains proven in the current local
  scope.
