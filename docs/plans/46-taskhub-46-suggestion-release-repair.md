---
review_scopes: [accessibility, authored, selection, suggestions]
review_basis:
  - 2026-09-25-accessibility-confirmed-inactive-focus
  - 2026-09-25-accessibility-projected-drag-dom-handoff
  - 2026-09-25-accessibility-projected-selection-native-caret
  - 2026-09-25-accessibility-projected-selection-focus
  - 2026-09-12-selection-distinct-lifetimes
  - 2026-09-23-suggestions-direct-delete-retained-selection
work_kind: implementation
---

# taskhub 46 suggestion release repair

Status: In progress

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
  Plite's inactive selection. `data-editor-inactive-selection` (including its
  collapsed-caret variant) is therefore a direct visual failure oracle for the
  release path, not evidence that an active editable selection survived.
- Attempt 2 was pushed to `origin/next` as
  `4183236efe73772467d18e46143f02278ef9d084`. It wrapped
  `removeAllRanges()` with a synchronous exact-Editable focus restore.
- Failure kind: `reporter-contradiction`. The reporter confirmed that attempt 2
  still loses the real editor cursor/focus. Its green browser runs, TaskHub
  `review` transition and pushed completion claim are revoked.
- Latest reporter delta: visually retained selection is inactivity selection;
  neither projected paint nor an open floating toolbar proves active editor
  focus. The reporter owns all further real-browser testing; this repair turn
  may use only source, unit-contract and type/lint checks.
- TaskHub #46 was conditionally returned from `review` to `in_progress` and
  immediately read back as `in_progress` on 2026-09-25.
- Attempt 3 was pushed to `origin/next` as
  `ae7f2a83c87a511169a5aab56d0fc5ccc1e9adbc`. It replaced selection-controller
  range clearing with a projected collapsed caret.
- Failure kind: `reporter-contradiction`. The reporter confirmed that attempt 3
  still loses editor focus. Its source contracts remain evidence for the caret
  export owner, but its completion and delivery claim are revoked.
- Root-cause delta: `applyProjectedDragSelectionFromEvent` independently called
  `removeAllRanges()` when root interaction converted the browser-owned drag to
  a projected selection. That path bypassed the repaired selection controller,
  so the real interaction could still lose focus and render inactivity
  selection.
- Attempt 4 was pushed to `origin/next` as
  `84bff82d4c8c0df7df66cb767dd27a8e505d2cb6`. It delegated the projected
  root-drag handoff to the existing DOM selection export owner.
- Failure kind: `reporter-contradiction`. The reporter confirmed that typing
  and the floating toolbar can work, but inactive selection is still activated
  incorrectly and typing still fails intermittently. The earlier claim that a
  whole-paragraph selection always fails was explicitly corrected to an
  intermittent input failure; range shape is not accepted as the cause.
- Root-cause delta: the inactive-selection coordinator eagerly activated from
  `blur.relatedTarget` before the marked control received a real `focusin`.
  That predicted focus transfer paints inactivity and can make selection side
  effects suppress the projected caret handoff even when focus never leaves
  the editor.

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

- Local code, tests, plan, TaskHub status, and one direct commit/push to
  `origin/next` are authorized. PR, merge, release, deployment, and external
  publication are not authorized.
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

- current_phase: fifth source candidate passed non-browser verification;
  direct `origin/next` delivery authorized; browser acceptance delegated and
  open
- next: reporter replays the real release/focus/first-key interaction in their
  browser against the delivered source

Work Checklist:

- [x] Every applicable user, method, reference and template obligation maps to a source-linked row here or an existing linked ledger; exclusions have reasons.
- [ ] Final reconciliation remains open until reporter-owned browser acceptance.
- [x] Capture the full outcome, acceptance criteria, scope and actual authority.
- [x] Inspect the named source, current owners and relevant evidence.
- [x] Make the change at its durable owner and adopt every affected consumer.
- [x] Run applicable local proof and resolve verified in-scope findings.
- [x] Record the local outcome, evidence, material limits and next action.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [ ] Browser pack: reporter-owned real-browser proof remains pending; this turn
      does not launch or drive a browser.
- [ ] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [ ] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [ ] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: direct `origin/next` delivery was separately authorized on
      2026-09-25. The final remote SHA and scoped worktree read-back are delivery
      receipts; they do not replace reporter-owned browser acceptance.
- [ ] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Revoke geometry-only completion | Failed-fix reporter contradiction | Keep the geometry work only as secondary positioning behavior; it cannot establish focus or input health | Treating floating-toolbar visibility as the release oracle | Pushed `c894307d14` is explicitly revoked as completion authority |
| Preserve browser input ownership at the projected-selection transition | `selection-controller.ts`, `selection-projected-dom.ts`, and `2026-09-25-accessibility-projected-selection-native-caret` | Delete the empty native-selection state. Collapse the browser Selection to an exact-view writable caret while projected decorations keep the expanded semantic range and paint | Synchronous/delayed focus restoration, toolbar gates, another focus boolean, public API, or keeping two expanded selection paints | Selection-controller contract requires one collapsed native range; reporter contradiction proved this owner alone was incomplete |
| Preserve focus during the root drag ownership handoff | `root-interaction-controller.ts` and `2026-09-25-accessibility-projected-drag-dom-handoff` | When the browser-owned drag becomes a projected view selection, delegate to `syncDOMSelectionToEditor({ preserveScroll: true })` instead of independently clearing every native range | Mouseup focus restoration, delayed focus, toolbar/inactivity gates, or another native-caret owner | Root interaction contract proves the projected branch calls DOM export and does not call `removeAllRanges`; selection export contract proves that owner retains one collapsed caret |
| Activate inactive selection only after confirmed focus transfer | `inactive-selection.ts` and `2026-09-25-accessibility-confirmed-inactive-focus` | A blur only makes the originating store pending; the document coordinator activates it only when a marked control receives the subsequent real `focusin` | Trust `blur.relatedTarget`, clear inactivity from root interaction, or let toolbar/input consumers override the store | Owner-level red/green contract rejects inactive paint between the predictive blur and confirmed focusin; real browser acceptance remains delegated |
| Preserve focus API behavior for an expanded projected selection | `focus-plite-editable.ts` | Programmatic focus also installs the same projected native caret instead of focusing an editing host with no browser selection | A second focus-only repair path that leaves native selection empty | Focus contracts pass 12/12; real browser acceptance remains delegated |
| Preserve #45 interaction lifetime | `docs/plans/45-taskhub-45-retained-suggestion-selection-drag-repair.md` | Leave held-drag import suppression unchanged and repair only post-release range clearing | Reverting #45's drag-active guard | `selection-drag-scroll.spec.ts` 1/1 plus retained endpoint/reverse coverage |

Completion Gates:

| Gate                                 | Applies | Required action                                                                                                                   | Evidence |
| ------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AC1 exact two-selection sequence     | yes     | Reporter replays retained-containing selection, then ordinary control, in sequence                                                | delegated/open |
| AC2 focus-gated toolbar geometry     | yes     | Toolbar remains closed whenever the editor is unfocused, renders an inactive selection, or lacks a usable caret/selection; after genuine focus is proved, its bounds track the same semantic selection | delegated/open; old Chrome greens revoked |
| AC3 immediate and paused replacement | yes     | Type `2`/`222` with real keyboard immediately and after a normal pause; capture event target, beforeinput, and final document     | delegated/open |
| AC4 Backspace/Delete/undo            | yes     | Fresh identical fixtures; verify final text, suggestion identity, and exactly one undo restoration                                | delegated/open |
| AC5 direction and retained endpoints | yes     | Ordinary endpoints with retained inside, retained start/end, forward/reverse; compare native/model/view and single-layer paint    | delegated/open |
| AC6 unaffected controls              | yes     | Ordinary, comment-only, and insert-only selection toolbar/replacement/deletion; second selection clears stale state               | delegated/open |
| AC7 focus plus next input            | yes     | Before any toolbar assertion, observe inactive-selection DOM/paint, native caret/selection, DOM focus API, React focus context, focusin/focusout, and the actual first native key without polling or forced focus | source invariant now retains one collapsed native caret; real browser delegated/open |
| AC8 #45 regression                   | yes     | Re-run held drag, scroll, reverse drag, and projected-selection preservation                                                      | delegated/open |
| AC9 proof integrity                  | yes     | Source-built repo runner, exact route/browser/ref/fingerprints, strict errors; no model-only or mouseup-pre-only evidence         | delegated/open; no browser claim from this turn |
| Implementation review                | yes     | Verify Plate implementation review of ownership, consumers, and generated/public surface                                          | Best API Review `2026-09-25-accessibility-confirmed-inactive-focus` deletes eager blur prediction at the existing coordinator; no new observer, timer, state, public API, toolbar workaround, or input workaround is added |

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
| Browser interaction proof | delegated/open | Reporter performs the real release/focus/first-key replay | No browser was launched in this turn; all earlier green runs are revoked by the latest contradiction |
| Browser console/network check | delegated/open | Reporter records runtime errors if the interaction still fails | Not executed in this turn |
| Browser final proof artifact | delegated/open | Reporter checks active editor focus before treating selection paint or toolbar visibility as success | Not executed in this turn |
| Exact case replay | delegated/open | Replay `[2,0]:5` to `[5,2]:6`, then type without clicking or focusing | Not executed in this turn |
| Source contracts | pass | Exercise inactive selection plus the owning projected selection, drag handoff and focus contracts | Six Plite React files pass 103/103, including the new failed-fix red/green contract and existing marked-control behavior |
| Source type/lint | pass with package-runner caveat | Typecheck changed Plite React source/tests and run focused formatting/lint | Direct Plite React entrypoint and package-test TypeScript checks pass; direct oxfmt/oxlint and `git diff --check` pass. `pnpm exec` remains blocked before the tool by four pre-existing AWS SDK minimum-release-age violations |
| Final ref and fingerprints | authorized | Commit and push only the fifth candidate packet to `origin/next`, then read back the remote SHA | Attempt 4 remote SHA remains failed-fix history; browser acceptance stays open after delivery |
| Retry-free stability | delegated/open | Reporter owns warm real-browser repeats | Not executed in this turn |

Verification evidence:

- Previous geometry and focus-restore browser greens are historical failed-fix
  evidence only. The latest reporter contradiction revokes them all.
- Attempt 3's source invariant replaces an empty browser Selection with one
  collapsed native caret inside the exact Editable. Projected selection remains
  the expanded semantic range and visual owner, so the caret stays hidden by
  the existing `caretColor: transparent` rule without a second expanded paint.
- Attempt 4 fixed the path attempt 3 missed: root interaction no longer clears
  the browser Selection when a native drag becomes a projected view selection.
  The reporter confirmed partial improvement but contradicted completion after
  inactive selection still activated and input still failed intermittently.
- The fifth candidate removes eager inactive-selection activation from
  `blur.relatedTarget`. Blur records only a pending store; the existing
  document-level `focusin` observer is the sole activation point after a
  marked control actually receives focus.
- The new owner-level contract was red on the pushed attempt-4 behavior: a
  marked `relatedTarget` painted inactive selection before any `focusin`. It is
  green after the change and still proves the selection becomes inactive once
  the marked control receives confirmed focus.
- Six affected Plite React files pass 103/103. Direct Plite React source and
  package-test TypeScript checks, focused `oxfmt`, `oxlint`, and
  `git diff --check` pass.
- Root interaction, selection controller and focus contracts pass 61/61. The
  handoff contract rejects `removeAllRanges()` for the projected branch, while
  the projected-drag export contract proves that an active native drag still
  reaches the one-caret export path.
- Direct Plite React entrypoint and package-test TypeScript checks pass. Direct
  `oxfmt`, `oxlint`, and `git diff --check` pass. `pnpm exec` cannot reach its
  tool because the existing lockfile still fails the four AWS SDK
  minimum-release-age checks; no lockfile change was made.
- Direct Plite React entrypoint TypeScript and package-test TypeScript checks
  pass. Focused `oxfmt --check` and `oxlint` pass.
- Aggregate package typecheck and the publication `pnpm check` did not reach
  project checks because the current lockfile fails the repository's
  minimum-release-age policy for four AWS SDK entries. This repair does not
  change the lockfile.
- Per the reporter's explicit instruction, no real browser was opened or driven
  for the new candidate. Native focus, inactivity paint and first-key acceptance
  remain delegated/open.

Findings and remaining work:

- Root cause of attempt 2's escape: it preserved the empty native Selection
  design and sampled focus only synchronously around `removeAllRanges()`.
  `isUpdatingSelection` can suppress the corresponding blur reconciliation, so
  Plite/React focus truth may remain true and open the toolbar after the browser
  no longer owns an editable caret.
- Attempt 3's partial owner: projected-selection import/export and programmatic focus resolve a
  writable point from the existing projected target and collapse the browser
  Selection there. Scheduled repair re-applies that caret instead of clearing
  every range. The old focus-restoration helper is deleted.
- Root cause of attempt 3's escape: the root pointer-drag transition had a
  second, independent `removeAllRanges()` call after it created the projected
  selection. Selection-controller contracts never exercised that transition.
- Current owning fix: the inactive-selection coordinator no longer predicts a
  focus transfer from blur metadata. This keeps inactivity paint and its DOM
  selection/focus suppression inactive during a canceled or transient transfer,
  while preserving the marked-control behavior after confirmed `focusin`.
- Toolbar geometry remains secondary and unchanged in this recovery. It may
  render only when the existing focus consumer says the editor is focused; the
  browser acceptance must verify that state is true, not infer it from toolbar
  visibility.
- Remaining work is reporter-owned browser acceptance. A failure should report
  the first divergence among native caret/range, activeElement, Plite/React
  focus state, inactivity selection, keydown and beforeinput.

Final handoff:

- Outcome: local source candidate activates inactive selection only after a
  marked control receives real focus instead of using `blur.relatedTarget` as
  a prediction.
- Proof and limits: 103/103 focused inactive-selection, root-interaction,
  selection-controller and focus contracts plus direct type/format/lint checks
  pass; no browser success is claimed.
- Local / integrated / published state: attempt 4 is pushed and
  reporter-contradicted; the fifth candidate is authorized for one direct
  commit/push to `origin/next`. TaskHub #46 remains `in_progress` until the
  reporter-owned browser replay passes.
- Next action: the reporter performs the real browser replay and reports
  acceptance or the first divergent phase.

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
- 2026-09-25 The reporter contradicted pushed attempt 2 (`4183236efe`) and took
  ownership of all further real-browser testing. TaskHub #46 returned to
  `in_progress`; old browser completion evidence was revoked.
- 2026-09-25 Best API Review
  `2026-09-25-accessibility-projected-selection-native-caret` superseded the
  clear-and-restore mechanism. The source repair now keeps a collapsed native
  caret, and 50 focused unit contracts plus direct type/lint checks pass.
- 2026-09-25 Direct delivery to `origin/next` was authorized. Publication
  `pnpm check` was attempted and stopped before project checks on four existing
  AWS SDK minimum-release-age violations; the lockfile is outside this repair.
- 2026-09-25 The reporter contradicted pushed attempt 3 (`ae7f2a83c8`). Best
  API Review `2026-09-25-accessibility-projected-drag-dom-handoff` found the
  independent root-interaction `removeAllRanges()` path and selected the
  existing DOM selection export as the sole projected handoff owner.
- 2026-09-25 The fourth source candidate passed 61 focused contracts, direct
  Plite React source/test typechecks, formatting, lint and diff checks. No
  browser, commit or push occurred.
- 2026-09-25 Attempt 4 was committed and pushed as `84bff82d4c`; the reporter
  then confirmed the toolbar and input could work but reported stable erroneous
  inactivity paint plus intermittent input failure.
- 2026-09-25 Best API Review
  `2026-09-25-accessibility-confirmed-inactive-focus` reopened the
  inactive-selection activation edge and selected confirmed `focusin` as its
  sole activation authority.

Open risks:

- Real browser focus/caret/input behavior is intentionally unverified in this
  turn and remains the reporter's acceptance boundary.
- The aggregate Plite package command is blocked before TypeScript by the
  existing lockfile supply-chain policy; direct affected typechecks passed.
- The fifth candidate is authorized for direct Git delivery, while the
  reporter-owned browser acceptance remains open.
- Global review-ledger `check` is independently blocked by concurrent stale
  `application/ai-command` inventory. The new immutable accessibility review
  itself is recorded and rendered; this repair does not alter the AI owner.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Browser pack selected | yes | Selection, paint, focus, and real keyboard behavior require browser proof |
| Browser route / app surface identified | yes | Source-built `www` Playground `/`; focused suggestion fixture is diagnostic only |
| Browser tool decision recorded | yes | Repo Playwright Chromium runner supplies deterministic mouse/keyboard/events/pixels; screenshots are opened with local image inspection |
| Console/network caveat policy recorded | yes | Fail on page errors and unexpected console errors; record unexpected failed requests, while known local dev noise must be identified rather than silently ignored |
| Observable browser case captured | delegated/open | Case `TH46-post-release-retained-focus-input`: pushed attempts `c894307d14`, `4183236efe`, and `ae7f2a83c8` are reporter-contradicted; the reporter owns the next real-browser replay of the local root-handoff candidate |
