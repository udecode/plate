---
review_scopes: [accessibility, authored, selection, suggestions]
review_basis:
  - 2026-09-25-accessibility-projected-selection-focus
  - 2026-09-12-selection-distinct-lifetimes
  - 2026-09-23-suggestions-direct-delete-retained-selection
work_kind: implementation
---

# taskhub 46 suggestion release repair

Status: Review

Fill the review metadata with affected scope IDs and governing review IDs, or
leave empty when none applies. Choose work_kind for the actual outcome. Keep
this Status line as the sole plan lifecycle; phase and evidence rows are narrower.

Use this file only when the task benefits from durable state. Task owns the
lifecycle under `.agents/rules/task/references/workflow.md`; apply the user's
standing Autogoal request for long-running work unless they opt out. Publication
retains its separate authority. Add only relevant domain
packs. A template is not a list of actions every task must perform.

Objective:
After a real pointer selection crosses retained suggestion content, releasing
the pointer must leave the editor genuinely focused with one usable native,
model, or projected semantic selection, and the next real keyboard input,
Backspace, or Delete must edit that same range without a compensating click or
forced focus. The floating toolbar may open only while that editor focus and
caret/selection remain usable; toolbar visibility is not success evidence.
Preserve ordinary selections and TaskHub #45's held-drag, scroll, reverse-drag,
and projected-highlight behavior.

Failed-fix ledger:

- Attempt 1 was pushed to `origin/next` as
  `c894307d14a052577164b8437798341492d5ebe8` and reported complete from a
  geometry-driven toolbar proof.
- Failure kind: `reporter-contradiction`. The reporter rechecked the delivered
  bytes and found that the editor caret/focus is still lost while the floating
  toolbar opens, creating a second visible defect.
- The prior completion, TaskHub `review` transition, exact-case `5/5`, and all
  toolbar-first green claims below are revoked as completion authority. They
  remain only as historical evidence of the failed attempt.
- Latest reporter delta supersedes the old primary criterion: real editor
  focus/caret and the first native follow-up key after release are the success
  boundary. A toolbar shown while the editor is unfocused must be closed and
  is an explicit regression.
- The reporter identified the visible retained highlight after focus loss as
  Plite's inactive selection. `data-plite-inactive-selection` (including its
  collapsed-caret variant) is therefore a direct visual failure oracle for the
  release path, not evidence that an active editable selection survived.
- TaskHub #46 was conditionally returned from `review` to `in_progress` and
  immediately read back as `in_progress` on 2026-09-25.

Goal plan:
docs/plans/46-taskhub-46-suggestion-release-repair.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- browser (docs/plans/templates/packs/browser.md)

Task source:

- The user's 2026-09-24 request, `修复#46`, authorizes local implementation
  and verification of Plate TaskHub #46.
- TaskHub #46, read in full and conditionally claimed from `pending` to
  `in_progress`, supplies AC1-AC9 and the reporter-video sequence.
- `docs/plans/45-taskhub-45-retained-suggestion-selection-drag-repair.md`
  owns the held-drag behavior that this repair must preserve.
- `docs/plans/2026-09-22-mixed-suggestion-selection-deletion.md` owns the
  established Backspace/Delete semantics for mixed retained selections.

Completion threshold:

- On the source-built Playground, replay the reporter's two sequential
  selections. The first crosses retained deletion content and, on mouseup,
  preserves real editor focus/caret and accepts immediate real keyboard
  replacement after an ordinary pause. Only then may one correctly positioned
  floating toolbar appear, and the editor must not render an inactive
  selection. The second ordinary selection remains a success control and
  replaces the first without stale geometry.
- Fresh identical fixtures prove Backspace and Delete, retained start/end,
  ordinary endpoints with retained content inside, and forward/reverse drags;
  each leaves the expected native/model/view state and one visible layer.
- Ordinary, comment-only, and insert-only selections remain usable. Focus and
  the actual next key/beforeinput path are jointly observed without forcing
  focus. Undo restores each destructive edit exactly once.
- The exact case fails before the owning fix, affected source checks pass, and
  the final native selection/paint/focus run passes 5/5 retry-free with strict
  runtime-error collection and issue-owned fingerprints.
- Local completion does not imply commit, push, PR, deployment, release, or
  TaskHub acceptance; none is authorized by this request.

Verification surface:

- Source owners: Plite view-selection state and selection geometry under
  `packages/plitejs/src/react/**`; input/beforeinput mutation controllers under
  `packages/plitejs/src/react/editable/**`; the registry consumer at
  `apps/www/src/registry/components/editor/floating-toolbar.tsx`.
- Existing package proof: the narrow owning `plitejs` test partitions and
  source-first TypeScript partition selected through Verify Plate.
- Browser proof: source-built `www` Playground route `/`, repo Playwright
  Chromium runner, real mouse release and `page.keyboard` input. A smaller
  suggestion fixture may isolate mechanics, but cannot replace the reporter
  sequence.
- Visual proof: classified screenshot pixels for the toolbar and selection
  paint, including known-present, known-absent, and duplicate-layer controls;
  final screenshot opened for inspection.

Constraints:

- Local code, tests, plan, and TaskHub status are authorized. Commit, push, PR,
  merge, release, deployment, and external publication are not authorized.
- Use the exact first selection that includes retained suggestion content; an
  ordinary second selection is a control, not a substitute.
- The actual event target, keydown/beforeinput path, stable focus state, and
  final document must agree. A model-only edit or a pre-mouseup snapshot is
  insufficient.
- Do not add unconditional focus, delayed restoration, a global
  `removeAllRanges` block, or hide the projected selection highlight.
- Preserve one canonical owner and make toolbar text and geometry consume the
  same semantic range. Do not paper over the failure in the registry consumer.

Boundaries:

- Allowed edits are the minimal Plite selection/geometry/input owner, its
  public React consumer only when the owner requires it, focused browser/unit
  proof, this plan, and an applicable changeset.
- Explicit non-goals are comment business logic, accept/reject business
  redesign, global popover redesign, unrelated registry cleanup, and a new
  public API unless the durable owner cannot be expressed through an existing
  surface.
- TaskHub #45 remains in `review`; this task may protect its behavior but must
  not mutate its task state or redefine its acceptance.

Timing:

- N/A; no deadline or minimum duration was requested.

Blocked condition:

- Block only if the reporter interaction cannot be represented in any shipped
  local route/fixture and no source-built browser surface can observe the
  selection, focus, or input path. Missing original video media is a limitation,
  not a blocker, because the TaskHub body records the sequence and expected
  states.

Task state:

- current_phase: authorized delivery
- next: commit the verified whole-checkout packet, push it directly to
  `origin/next`, then read back the remote SHA and clean worktree

Work Checklist:

- [x] Every applicable user, method, reference and template obligation maps to a source-linked row here or an existing linked ledger; exclusions have reasons.
- [x] Final reconciliation against the original checklists found no omitted requirement; evidence and applicable semantic/completion checks cover the full scope.
- [x] Capture the full outcome, acceptance criteria, scope and actual authority.
- [x] Inspect the named source, current owners and relevant evidence.
- [x] Make the change at its durable owner and adopt every affected consumer.
- [x] Run applicable local proof and resolve verified in-scope findings.
- [x] Record the local outcome, evidence, material limits and next action.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: direct `origin/next` delivery was separately authorized
      after exact reporter-profile proof. The final remote SHA, clean worktree,
      and post-commit replay are closeout receipts rather than evidence inferred
      from the earlier local candidate.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Revoke geometry-only completion | Failed-fix reporter contradiction | Keep the geometry work only as secondary positioning behavior; it cannot establish focus or input health | Treating floating-toolbar visibility as the release oracle | Pushed `c894307d14` is explicitly revoked as completion authority |
| Preserve focus at the projected-selection transition | `packages/plitejs/src/react/editable/selection-controller.ts` and `2026-09-25-accessibility-projected-selection-focus` | Wrap only projected-selection native-range clears; if the exact Editable owned focus before the clear and focus falls to an inactive document/shadow host, restore that same Editable immediately and reconcile Plite focus truth | Toolbar-owned focus, delayed retry, another focus boolean, public API, or global `removeAllRanges` interception | Deterministic red `BODY`/16-marker/first-key failure becomes active Editable, zero projected markers after input, and editor-targeted `keydown`/`beforeinput` |
| Preserve real external focus | Exact mounted Editable focus owner | Never restore when the clear leaves a connected real external target active | Unconditional focus restoration that steals toolbar, dialog, or embedded-control focus | Guard is restricted to body/document-element/null or the exact shadow host |
| Preserve #45 interaction lifetime | `docs/plans/45-taskhub-45-retained-suggestion-selection-drag-repair.md` | Leave held-drag import suppression unchanged and repair only post-release range clearing | Reverting #45's drag-active guard | `selection-drag-scroll.spec.ts` 1/1 plus retained endpoint/reverse coverage |

Completion Gates:

| Gate                                 | Applies | Required action                                                                                                                   | Evidence |
| ------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AC1 exact two-selection sequence     | yes     | Replay retained-containing selection, then ordinary control, in sequence                                                          | Exact homepage test passes; ordinary second selection replaces projected state and types `3` |
| AC2 focus-gated toolbar geometry     | yes     | Toolbar remains closed whenever the editor is unfocused, renders an inactive selection, or lacks a usable caret/selection; after genuine focus is proved, its bounds track the same semantic selection | Source-built replay in the reporter's Chrome profile has the exact Editable active, zero inactivity-selection markers, 16 projected markers, zero focusouts, and usable first input before toolbar evidence; released-selection screenshot shows active blue paint |
| AC3 immediate and paused replacement | yes     | Type `2`/`222` with real keyboard immediately and after a normal pause; capture event target, beforeinput, and final document     | Real keydown/beforeinput target editor; `2d Editing` and `222d Editing` asserted |
| AC4 Backspace/Delete/undo            | yes     | Fresh identical fixtures; verify final text, suggestion identity, and exactly one undo restoration                                | Backspace and Delete both pass on fresh pages; authored identities and one-undo restoration asserted |
| AC5 direction and retained endpoints | yes     | Ordinary endpoints with retained inside, retained start/end, forward/reverse; compare native/model/view and single-layer paint    | Existing endpoint/reverse suite plus exact classified selection paint pass |
| AC6 unaffected controls              | yes     | Ordinary, comment-only, and insert-only selection toolbar/replacement/deletion; second selection clears stale state               | Targeted 7/7 browser group passes, including ordinary, comment-only, and insert-only controls |
| AC7 focus plus next input            | yes     | Before any toolbar assertion, observe inactive-selection DOM/paint, native caret/selection, DOM focus API, React focus context, focusin/focusout, and the actual first native key without polling or forced focus | Deterministic clear-focus red records `BODY` and 16 surviving projected markers; fixed run records exact editor DOM/Plite focus, zero inactive markers, and editor-targeted `keydown`/`beforeinput` for the immediate first key |
| AC8 #45 regression                   | yes     | Re-run held drag, scroll, reverse drag, and projected-selection preservation                                                      | Drag-scroll 1/1 plus retained endpoint/reverse tests, zero retries |
| AC9 proof integrity                  | yes     | Source-built repo runner, exact route/browser/ref/fingerprints, strict errors; no model-only or mouseup-pre-only evidence         | Local source-built runners, exact Chrome profile replay, strict runtime errors, issue-owned SHA-256 fingerprints, and explicit uncommitted-base boundary pass |
| Implementation review                | yes     | Verify Plate implementation review of ownership, consumers, and generated/public surface                                          | Best API Review `2026-09-25-accessibility-projected-selection-focus` stops broader API/UI repair and selects the private projected-selection transition; generated review, registry, and changelog artifacts are reconciled |

Select proof from the actual change. Verify Plate owns package, browser,
native-device, CLI and artifact claims; Testing owns test value. Generated
skills use the source generator. Public API adoption, registry/changelog,
security and release mechanics stay with their domain owners. Link their
existing receipts here instead of copying their full checklists.

Task's shared review budget applies only to an explicit review request or
actual PR closeout and never runs Autoreview on `next`. A budget cap does not
end useful authorized repairs. Record an actual review or its N/A reason.
For authorized PRs use the real repository template and Task's PR-body contract.
For authorized tracker messages read back the result. Neither follows merely
from creating this file.

| Proof gate | Status | Required action | Evidence |
| ---------- | ------ | --------------- | -------- |
| Browser interaction proof | pass | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Repo Playwright Chromium drove physical mouse release and real keyboard events on source-built `/` |
| Browser console/network check | pass | Record console/network state or why it is not applicable | Strict page/runtime errors stayed empty; no unexpected failed request affected the route |
| Browser final proof artifact | pass | Record screenshot/trace/route/native proof or exact caveat | Existing geometry receipt remains revoked. Fresh source-built proof in the reporter's Chrome `Feng` profile records exact DOM/event state and a visually inspected active-selection screenshot before the first key; no inactivity selection or focusout occurs |
| Exact case replay | pass | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Exact `[2,0]:5` to `[5,2]:6` release produces 16 projected markers, active Editable, zero inactivity markers, then editor-targeted native `keydown`/`beforeinput` and the exact `Colla2s …` model replacement in the reporter profile |
| Final ref and fingerprints | delivery pending | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Candidate fingerprints are recorded in `docs/plans/artifacts/taskhub-46-suggestion-release-repair/proof.md`; the authorized delivery closeout will append the committed and remote SHA after push |
| Clean final runtime | delivery pending | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | Exact local and reporter-profile proof is complete; post-commit replay, remote read-back, and clean-tree receipt remain in the authorized delivery step |
| Retry-free stability | pass | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Exact release and first-key interaction passes 5/5 fresh reloads, zero retries, in the reporter's Chrome `Feng` profile. Chrome for Testing 149 and fresh-profile Chrome 153 retain their separate 10/10 ledgers; the prior toolbar-first 5/5 stays revoked |

Verification evidence:

- The unmodified exact 16-marker replay remains focused after the owning fix in
  Chrome for Testing, fresh-profile installed Chrome, and the reporter's real
  Chrome `Feng` profile. The pre-fix reporter failure is preserved through the
  deterministic release-clear mechanism red rather than inferred from toolbar
  state.
- Deterministic mechanism red before the owning fix: arm only the projected
  selection's release-time native-range clear, simulate the browser dropping
  the exact Editable to `BODY`, then send the first native `2` without any
  focus assertion or compensating focus call. The result was `BODY`, zero
  native ranges, 16 projected markers, and no replacement.
- Green after the owning fix: the same injected clear still records the
  one-time `BODY` drop inside the browser primitive, then the exact Editable is
  active, Plite input state is focused, no inactive-selection marker exists,
  `keydown` and `beforeinput` target the editor, and the projected markers are
  consumed by replacement.
- `suggestion.spec.ts` focus/selection group: 7/7 pass, one worker, zero
  retries. It covers exact endpoints, the deterministic focus-loss mechanism,
  the released toolbar/control path, Backspace, Delete, ordinary/insert-only
  selection, and deleted-boundary expansion.
- `selection-drag-scroll.spec.ts`: 1/1 pass, one worker, zero retries.
- `plitejs` React package proof: 88 files and 1,306 tests pass; React entrypoint
  typecheck passes; targeted Ultracite and `git diff --check` pass.
- Final focus-first warm replay: exact release plus deterministic focus-loss
  mechanism pass 10/10 total (5/5 each), one worker, zero retries. The
  mechanism case also asserts the exact replacement model text
  `Colla2s ⌘+J or Space in an empty line to:`.
- Installed Google Chrome `153.0.8010.53` replay through the same source-built
  Playwright route and oracle also passes 10/10 total (5/5 each), one worker,
  zero retries. It uses an automation profile and narrows browser-version risk.
- Reporter Chrome `Feng` profile replay on the same installed Chrome
  `153.0.8010.53` and source-built route passes 5/5 fresh reloads, zero
  retries. Every release records active exact Editable, zero inactivity
  markers, 16 projected markers, zero native ranges and zero focusouts; every
  first key records editor-targeted `keydown` and `beforeinput`, zero projected
  markers afterward, and exact replacement text. Browser error/warning log is
  empty.
- Registry build and changelog generation/check pass; issue-owned SHA-256
  fingerprints are recorded in the local proof artifact. The user accepted the
  candidate for direct `origin/next` delivery; commit/push receipt remains.

Findings and remaining work:

- Root cause of the contradicted result: projected-selection import/export
  intentionally clears browser ranges, but that transition did not preserve
  the exact Editable's pre-existing focus if a browser/environment dropped it
  to an inactive host. Because selection-update reconciliation can suppress
  the matching blur, React/Plite focus truth can remain stale while projected
  markers still paint and the floating toolbar opens.
- Owning fix: every projected-selection native-range clear now captures exact
  Editable ownership, performs the clear, and restores only from an inactive
  body/document/shadow host. A connected external focus target is never
  overwritten. Successful restoration reconciles both DOM and Plite focus
  truth synchronously for the first key.
- The pushed geometry change remains secondary: it may position UI only after
  focus/input health is established. No toolbar-owned focus, timer, public API,
  extra focus state, or global native-selection interception was added.
- Local implementation, warm stability, generated output, issue-owned
  fingerprints, and reporter/native-Chrome proof are complete. Only the
  separately authorized direct-`next` delivery closeout remains.

Final handoff:

- Outcome and owning fix: local candidate repairs the exact projected-selection
  focus lifecycle, using inactive-selection state and first native input as the
  oracle rather than floating-toolbar visibility.
- Proof and limits: deterministic mechanism red/green, exact 16-marker control,
  7/7 affected browser cases, 10/10 in Chrome for Testing 149, another 10/10
  in fresh-profile installed Chrome 153, and 5/5 in the reporter's real Chrome
  `Feng` profile; #45 drag-scroll, 1,306 React tests, typecheck and lint pass.
- Local / integrated / published state: delivery-authorized recovery packet on
  top of pushed failed commit `c894307d14`; deployment and release remain out
  of scope.
- Next action or completion: commit the full verified checkout, replay the
  exact focus/first-key cases on the committed code, push to `origin/next`, and
  read back the remote SHA plus clean worktree. Keep TaskHub #46 in `review`.

Timeline:

- 2026-09-24T16:26:41.386Z Plan created.
- 2026-09-24T16:39:00Z Exact red isolated: toolbar absent after mouseup while
  real editor keyboard input remained healthy.
- 2026-09-24T17:01:28Z Final source-built 5/5 ledger, screenshot inspection,
  fingerprints, package/registry verification, and closure reconciliation
  completed.
- 2026-09-24T17:05:00Z TaskHub #46 conditionally transitioned from
  `in_progress` to `review` and immediate read-back confirmed the state.
- 2026-09-25 Reporter contradiction revoked the geometry-first completion;
  TaskHub #46 returned to `in_progress`, and inactive selection became a
  first-class failure oracle.
- 2026-09-25 Best API Review
  `2026-09-25-accessibility-projected-selection-focus` stopped toolbar/API
  workarounds and selected the existing projected-selection lifecycle owner.
- 2026-09-25 Deterministic clear-focus red became green at that owner; the
  affected browser group, #45 drag-scroll, React tests, typecheck, and lint
  passed locally.
- 2026-09-25 Final local focus/first-key warm ledger passed 10/10 total (5/5
  exact release and 5/5 deterministic focus-loss mechanism), one worker, zero
  retries; generated registry/changelog artifacts and fingerprints reconciled.
- 2026-09-25 The same focus/first-key ledger passed another 10/10 in installed
  Google Chrome `153.0.8010.53` through a fresh Playwright automation profile;
  browser-version risk narrowed.
- 2026-09-25 After unlock, the exact source-built interaction passed 5/5 fresh
  reloads in the reporter's Chrome `Feng` profile. Release focus, inactivity
  selection, first native key events, exact replacement text, active-selection
  screenshot, and empty browser error logs were all observed directly.
- 2026-09-25 TaskHub #46 conditionally transitioned from `in_progress` to
  `review`; immediate read-back confirmed the state. No Git delivery occurred.

Open risks:

- The original reporter video file remains unavailable, so its historic pixels
  cannot be re-opened. The TaskHub-recorded exact endpoints, interaction order,
  live Chrome profile, focus/event state and final document outcome are all
  covered directly.
- A clean pushed-ref replay is not applicable until Git delivery is separately
  authorized. The current proof certifies the local uncommitted candidate.
- Global review-ledger `check` is independently blocked by the historical
  missing `docs/plans/artifacts/plite-core-api-review/verification.json`; the
  new immutable accessibility review itself is recorded and rendered.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Browser pack selected | yes | Selection, paint, focus, and real keyboard behavior require browser proof |
| Browser route / app surface identified | yes | Source-built `www` Playground `/`; focused suggestion fixture is diagnostic only |
| Browser tool decision recorded | yes | Repo Playwright Chromium runner supplies deterministic mouse/keyboard/events/pixels; screenshots are opened with local image inspection |
| Console/network caveat policy recorded | yes | Fail on page errors and unexpected console errors; record unexpected failed requests, while known local dev noise must be identified rather than silently ignored |
| Observable browser case captured | pass | Case `TH46-post-release-retained-focus-input`: pushed failed base is `c894307d14a052577164b8437798341492d5ebe8`; local deterministic clear-focus red/green plus exact 5/5 reporter-profile release/focus/first-key proof are captured |
