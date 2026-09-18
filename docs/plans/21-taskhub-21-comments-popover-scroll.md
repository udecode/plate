# TaskHub 21 comments popover scroll

Objective:
Fix the Plate homepage comments popover so opening New Comment preserves the
outer page and editor scroll positions while autofocus remains usable, and so
the popover follows its text anchor during editor-internal scrolling in both
directions. Preserve submit, cancel, Escape, reopen and existing-comment flows,
then publish the complete verified checkout to `origin/next`.

Goal plan:
docs/plans/21-taskhub-21-comments-popover-scroll.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
TaskHub #21, including its 2026-09-18 Chrome reproduction and AC1-AC5. The
current user request authorizes implementation, commit and push to `next`.

Completion threshold:
The exact homepage case is red before the fix and green after it; AC1-AC5 pass
with a fresh exact-Chrome 5/5 replay at the final pushed SHA, focused owner
checks and required registry output pass, TaskHub #21 is moved to `review`, and
`origin/next` is read back at the pushed SHA. The existing verified #20 checkout
is included because the authorized publication covers the current checkout.

Verification surface:
`apps/www` homepage Playground using the Radix comments popover, the existing
Playwright comment suite, focused registry/component tests, generated registry
artifacts, source-first types/lint, root `pnpm check`, exact Chrome geometry and
scroll sampling, Git remote readback and TaskHub readback.

Constraints:
Keep New Comment autofocus and immediate typing. Do not globally suppress
selection scrolling, remove autofocus, add arbitrary waits, special-case the
homepage, or redesign comments/popovers/public APIs. Fix lifecycle ownership of
initial focus geometry and the virtual anchor's scroll-observer context.

Boundaries:
Allowed owners are the comments/discussion registry component, its narrow test
surface and generated registry payload. Shared Plite selection scrolling may be
changed only if exact reproduction proves a framework-wide invariant rather
than a popover lifecycle defect. Base UI and unrelated popovers are non-goals
unless the chosen shared owner materially affects them. No PR, merge, release,
deployment or public message is authorized.

Timing:
N/A.

Blocked condition:
The exact homepage cannot render in Chrome after two bounded diagnostics, or
the original source video/browser surface is unavailable and no deterministic
equivalent can prove the named focus and geometry fields.

Task state:
- current_phase: complete
- next: none
- status: complete

Work Checklist:
- [x] AC1: opening New Comment from outer `scrollY ~= 500` preserves outer and
      inner scroll, autofocuses the input and accepts immediate typing.
- [x] AC2: inner editor scroll down/up moves popover with its anchor within 5px
      when collision placement is stable, without manual resize.
- [x] AC3: outer scroll, resize, close/reopen and anchor changes keep positioning
      current; normal collision handling is allowed at viewport boundaries.
- [x] AC4: original selection anchor, existing comments, input, submit, cancel
      and Escape do not regress.
- [x] AC5: the original path passes with no diagnostic runtime interception;
      focused source checks and browser proof are recorded.
- [x] Record exact case `taskhub-21:homepage-comment-popover-scroll`, route `/`,
      viewport 1440x900, setup/action/end-state fields, bad ref and fingerprints.
- [x] Reproduce both reported failures before production edits on the real route.
- [x] Classify focus/browser-event ownership versus rendering/projection and fix
      the smallest durable owner with one provider-neutral placement lifecycle.
- [x] Add the smallest behavior-level regression test that fails on the exact
      focus/scroll and virtual-anchor observer defects.
- [x] Resolve architecture pressure as keep/rework/escalate after first green.
- [x] Run focused browser/component/type/lint proof and required registry build.
- [x] Run root `pnpm check` before authorized publication; classify any unrelated
      failure precisely rather than hiding it.
- [x] Browser errors and relevant network failures are checked.
- [x] Paint classifier is N/A unless the final claim depends on exact pixels;
      scroll coordinates, geometry and focus are the acceptance oracle.
- [x] Start a fresh process and exact Chrome session at the final pushed SHA,
      prove zero issue-owned runtime-input differences, and pass 5/5 retry-free.
- [x] Record final SHA-256 fingerprints for production, test, fixture and harness.
- [x] Registry-only release artifact handling is resolved through the project
      registry-changelog owner; package changeset is N/A unless a package changes.
- [x] Autoreview is N/A because publication is directly from `next`.
- [x] Reconcile the complete original TaskHub checklist with no omitted outcome.
- [x] Commit the complete checkout, push to `origin/next`, read back remote SHA,
      then conditionally move TaskHub #21 `in_progress -> review` and read back.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Initial focus scroll | Floating popover positioning lifecycle | Add provider-neutral `onPlaced`; autofocus only the matching pending composer after placement | passive-effect delay (failed 5/5), timers/polling, global scroll suppression, removed autofocus | exact scroll/focus replay; Base lifecycle unit |
| Virtual anchor observer context | Mounted editor DOM scope | Subscribe with `useEditorRootElement` and memoize the virtual anchor with that context element | render-time root snapshot, resize polling, scroll-container context | root lifecycle unit; inner-scroll geometry replay |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Exact red/green case | yes | Real homepage Chrome replay | exact Chrome 5/5 at pushed production SHA `2d0df9315b` |
| Focus and geometry stability | yes | 5/5 exact Chrome final-SHA runs | 5/5 retry-free; selection/actions 4/4 |
| Registry artifact | yes | Registry changelog/build if registry source changes | 173-event changelog check and registry build pass |
| Root publication check | yes | `pnpm check` | pass: lint, type-aware lint, package typechecks, fast and slow tests |
| Git delivery | yes | Commit/push/readback `origin/next` | `2d0df9315b` pushed and read back before plan closeout |
| TaskHub lifecycle | yes | Conditional review transition/readback | #21 is `review`, project `plate`, not archived |

Verification evidence:
- `HEAD` and freshly fetched `origin/next` both start at
  `8748befe14b00cc9ab554fecba467075d207ad12`.
- TaskHub #21 was claimed atomically from `pending` to `in_progress` and read back.
- The task's prior diagnostic reports RED: opening at `scrollY=500` jumps to 0;
  inner `scrollTop += 160` moves the anchor 160px while popover Y stays fixed.
- Fresh exact Chrome RED on `/` recorded outer scroll delta `500px` on initial
  open and reopen. A passive-effect-only autofocus delay still failed 5/5 with
  a `432px` delta, rejecting timing guesses as the owner.
- Fresh exact Chrome GREEN after the placement/root-lifecycle repair passed 5/5
  at 1440x900 with retry 0. It covers immediate typing, inner scroll down/up,
  outer scroll, resize, Escape/reopen and a changed selection anchor.
- The existing comment-action case passed 5/5 beside the exact regression, and
  all three Issue 5127 entry paths pass with the original multi-line selection
  visibly painted while the delayed composer autofocus owns focus.
- Base provider `onPlaced` behavior and the subscribed virtual-anchor root are
  covered by 16 focused Bun component tests with 101 assertions.
- `www` typecheck, registry build, the 173-event registry changelog check,
  source/mirror formatting, Plate Next v201 validation and root `pnpm check`
  pass. The root check covers lint, type-aware lint, four package typechecks and
  the complete fast/slow test inventories.
- Best API hard-cut result: keep the existing floating-popover owner and expose
  only placement completion. No store, provider, scheduler, coordinates or
  editor-global policy is added. Plate Next doctrine advanced to v201 and its
  fingerprint/registry validation pass.
- Final pre-publication fingerprints: `discussion.tsx`
  `55750d7413a95c4ce16f44c21fe49d0b102ecd2595c2c34f8463d895b73b30ca`,
  Base floating popover
  `93c5ff49450f32c232d99c7ae588cb3beec225aadba93080209da896472cace1`,
  Radix floating popover
  `bbc10580c43dc84a27e4ab2e38eb999b4cfcfff01df97d268728f750dc8cb012`,
  browser test
  `896a900b7eca51ae739a480f9e1ad54a0607f9b8a870af25d97fa0b8dd792649`,
  homepage editor fixture
  `40d625ae18bfa249fc4cf56d2bfc00e587f6233dd3b54b3bed99e30f149e8989`,
  and browser harness
  `f9254fd0decdfa706134c110b239238f8efe205b0a3f8bb97782ac689b476991`.
- Complete-checkout commit `2d0df9315ba530fca9d25eadf745bd5ce07f0f1d`
  was pushed to and read back from `origin/next` with a clean worktree. A fresh
  Next process at that SHA passed the exact installed-Chrome scroll/geometry
  case 5/5, all three Issue 5127 selection entry paths and the comment action
  case 4/4, with retry 0 and no runtime errors.
- TaskHub #21 conditionally transitioned from `in_progress` to `review`; final
  readback confirms project `plate`, `archived: false`.

Findings and remaining work:
- `NewComment` previously autofocused while Radix still held the content at its
  initial offscreen transform. The popover now publishes actual placement and
  autofocus is released only for that exact pending comment cycle.
- The virtual anchor previously snapshotted `editor.api.dom.root()` during
  render. It now subscribes to the mounted root and gives Floating UI the
  correct editor-scroll ancestry without polling.
- No acceptance work remains within the authorized scope.

Final handoff:
- Outcome and owning fix: floating popovers expose provider-neutral placement
  readiness; the discussion composer autofocuses only after placement, and its
  virtual anchor subscribes to the mounted editor root for internal scroll.
- Proof and limits: exact Chrome 5/5 plus selection/actions 4/4, focused
  components, `www` typecheck, registry/changelog checks and root `pnpm check`
  pass. Deployment and release are not claimed.
- Local / integrated / published state: complete checkout is published to
  `origin/next`; TaskHub #21 is in review.
- Next action or completion: complete; maintainer review is the next external
  lifecycle step.

Timeline:
- 2026-09-18: TaskHub #21 claimed; current `next` and remote SHA matched; plan created.
- 2026-09-18: exact homepage RED recorded; provider-neutral placement and
  subscribed-root fix reached 5/5 pre-commit exact-Chrome green.
- 2026-09-18: registry changelog generated; Best API review retained the
  smallest placement lifecycle and Plate Next doctrine v201 validated.
- 2026-09-18: focused components, three inactive-selection entry paths, exact
  scroll/actions 5/5, `www` typecheck, registry generation and root `pnpm check`
  passed before publication.
- 2026-09-18: complete checkout pushed as `2d0df9315b`; fresh pushed-ref exact
  Chrome replay passed 5/5 plus 4/4 companion cases; TaskHub #21 moved to review.

Open risks:
- None within the accepted local and `origin/next` delivery scope. CI,
  deployment, release and non-Radix browser integration were not requested and
  are not claimed.
