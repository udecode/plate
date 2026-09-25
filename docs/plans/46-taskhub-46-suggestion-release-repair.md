---
review_scopes: [authored, selection, suggestions]
review_basis:
  - 2026-09-12-selection-distinct-lifetimes
  - 2026-09-23-suggestions-direct-delete-retained-selection
work_kind: implementation
---

# taskhub 46 suggestion release repair

Status: Complete

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
the pointer must leave one usable semantic selection: the floating toolbar
uses its full text and geometry, and the next real keyboard input, Backspace,
or Delete edits that same range without a compensating click or forced focus.
Preserve ordinary selections and TaskHub #45's held-drag, scroll, reverse-drag,
and projected-highlight behavior.

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
  shows one correctly positioned floating toolbar and accepts immediate real
  keyboard replacement after an ordinary pause. The second ordinary selection
  remains a success control and replaces the first without stale geometry.
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

- current_phase: closure
- next: await TaskHub review and separate commit/push authority

Work Checklist:

- [x] Every applicable user, method, reference and template obligation maps to a source-linked row here or an existing linked ledger; exclusions have reasons.
- [x] Final reconciliation against the original checklists found no omitted requirement; evidence and applicable semantic/completion checks cover the full scope.
- [x] Capture the full outcome, acceptance criteria, scope and actual authority.
- [x] Inspect the named source, current owners and relevant evidence.
- [x] Make the change at its durable owner and adopt every affected consumer.
- [x] Run applicable proof and resolve verified in-scope findings.
- [x] Record the final outcome, evidence, material limits and next action.
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
- [x] Browser pack: clean pushed-ref proof is N/A because Git delivery is not
      authorized. Fresh managed source processes verify the local candidate;
      no clean checkout, pushed-tree, CI, deployment, or acceptance claim is
      made.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Decisions and tradeoffs:

| Decision                                            | Owner and source                                                        | Chosen fix                                                                                                                                                          | Material alternative rejected                                                                          | Proof                               |
| --------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| Represent the post-release selection once           | Plite view-selection owner and the selection review basis               | Extend the existing selection-geometry owner to measure the projected marker union and subscribe to view-selection changes; the toolbar uses one geometry snapshot for both visibility and placement | Registry-only forced-open/focus workaround; it would split toolbar geometry, text, and input semantics | Red toolbar absence; green exact browser and geometry contract tests |
| Preserve #45 interaction lifetime                   | `docs/plans/45-taskhub-45-retained-suggestion-selection-drag-repair.md` | Keep held-drag import suppression and repair only the settled post-release geometry consumer path                                                                    | Reverting #45's drag-active guard                                                                      | `selection-drag-scroll.spec.ts` 1/1, zero retries |
| Prove keyboard behavior without inventing a failure | TaskHub #46 AC3/AC7 and Patch evidence rules                            | Preserve the already-working input controller and record real keydown/beforeinput, DOM focus, React focus, and final document before and after the geometry repair    | Claim focus loss from toolbar absence or activeElement alone                                           | Immediate `2`, paused `222`, Backspace, and Delete exact browser proof |

Completion Gates:

| Gate                                 | Applies | Required action                                                                                                                   | Evidence |
| ------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AC1 exact two-selection sequence     | yes     | Replay retained-containing selection, then ordinary control, in sequence                                                          | Exact homepage test passes; ordinary second selection replaces projected state and types `3` |
| AC2 toolbar text and geometry        | yes     | Toolbar visible after mouseup and bounds track the full semantic selection even when ordinary model selection cannot represent it | Marker union and toolbar bounds asserted after mouseup; screenshot visually inspected |
| AC3 immediate and paused replacement | yes     | Type `2`/`222` with real keyboard immediately and after a normal pause; capture event target, beforeinput, and final document     | Real keydown/beforeinput target editor; `2d Editing` and `222d Editing` asserted |
| AC4 Backspace/Delete/undo            | yes     | Fresh identical fixtures; verify final text, suggestion identity, and exactly one undo restoration                                | Backspace and Delete both pass on fresh pages; authored identities and one-undo restoration asserted |
| AC5 direction and retained endpoints | yes     | Ordinary endpoints with retained inside, retained start/end, forward/reverse; compare native/model/view and single-layer paint    | Existing endpoint/reverse suite plus exact classified selection paint pass |
| AC6 unaffected controls              | yes     | Ordinary, comment-only, and insert-only selection toolbar/replacement/deletion; second selection clears stale state               | Targeted 6/6 browser group passes, including ordinary, comment-only, and insert-only controls |
| AC7 focus plus next input            | yes     | Observe activeElement, DOM/React focus state, and the actual next key without forced focus                                        | DOM and React focus true; no focusout; no focus call added by production fix |
| AC8 #45 regression                   | yes     | Re-run held drag, scroll, reverse drag, and projected-selection preservation                                                      | Drag-scroll 1/1 plus retained endpoint/reverse tests, zero retries |
| AC9 proof integrity                  | yes     | Source-built repo runner, exact route/browser/ref/fingerprints, strict errors; no model-only or mouseup-pre-only evidence         | Proof artifact records ref, runner/browser, strict errors, event path, final fingerprints |
| Implementation review                | yes     | Verify Plate implementation review of ownership, consumers, and generated/public surface                                          | Shared geometry owner adopted by toolbar; no new public API, timers, forced focus, or input workaround; generated registry and release metadata verified |

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
| Browser final proof artifact | pass | Record screenshot/trace/route/native proof or exact caveat | `docs/plans/artifacts/taskhub-46-suggestion-release-repair/proof.md` and visually inspected screenshot |
| Exact case replay | pass | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Exact task-described text endpoints, mouseup phase, immediate/pause input, toolbar geometry, focus, paint, and final model asserted |
| Final ref and fingerprints | pass | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Base HEAD `bdfb69ab5a67b12283aa5a18228666e4bddf5217` plus local diff; fingerprints in proof artifact |
| Clean final runtime | N/A | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | No commit/push authority. Each run used a fresh managed source server, but the verified candidate remains an intentionally dirty, uncommitted working tree |
| Retry-free stability | pass | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Exact test 5/5, one worker, zero retries in Chrome for Testing 149.0.7827.55 via Playwright 1.61.0 |

Verification evidence:

- Exact red on base HEAD: the released projected selection remained visible
  (`textLength: 230`, 13 markers), the ordinary model selection was collapsed,
  native selection had zero ranges, and the floating toolbar was absent. The
  next real `keydown`/`beforeinput` already targeted the editor and produced
  `2d Editing`, so focus/input was retained as a success control instead of
  inventing a second defect.
- `suggestion.spec.ts` targeted group: 6/6 pass, one worker, zero retries. This
  covers the exact toolbar/input sequence, fresh Backspace/Delete cases,
  ordinary and inserted-only pointer selections, comment-only deletion, and
  retained start/end forward/reverse cases.
- Exact native selection/paint/focus ledger: 5/5 pass, one worker, zero
  retries. Known-present, known-absent, and duplicate-layer controls pass for
  the projected selection and toolbar paint.
- `selection-drag-scroll.spec.ts` and the existing floating-toolbar geometry
  test: 2/2 pass, one worker, zero retries.
- Unit/source proof: floating toolbar 7/7; range geometry 6/6;
  `plitejs` React partition typecheck and package-test typecheck pass;
  targeted Ultracite formatting/lint passes; `git diff --check` passes.
- `www` registry source check, generated registry freshness, route typegen,
  app TypeScript, and package-integration TypeScript pass. The aggregate
  `www typecheck` preflight remains unable to pass its unrelated
  `plugins.generated.ts` freshness check; this task does not touch that file
  or its generator input.
- Registry changelog source and generated JSON agree under
  `generate-ui-changelog-entries.mjs --check`; the `plitejs` patch changeset
  records the package delta.
- Full receipt and fingerprints:
  `docs/plans/artifacts/taskhub-46-suggestion-release-repair/proof.md`.

Findings and remaining work:

- Root cause: after release, a retained-crossing selection can be represented
  only by Plite's projected view selection while the ordinary model selection
  is collapsed. `useSelectionGeometry` observed only the model range, so the
  floating toolbar had no post-release geometry even though the input owner
  still edited the correct semantic range.
- Fix: the shared selection-geometry owner measures visible projected marker
  rectangles and subscribes to view-selection changes. The floating toolbar
  uses that one immutable geometry snapshot for visibility and positioning.
- No new public API, input restoration, focus forcing, timeout, global native
  selection block, accept/reject change, or comment business change was added.
- No implementation work remains in the authorized local scope. Commit, push,
  Preview/deployment, and external acceptance remain separate and unperformed.

Final handoff:

- Outcome and owning fix: repaired post-release selection geometry at the
  Plite React owner and adopted it in the copied floating toolbar.
- Proof and limits: exact red/green, destructive edits, controls, #45
  regression, classified paint, 5/5 stability, unit/type/lint, generated
  registry, changeset, and registry changelog all recorded. Original reporter
  video media was unavailable, so proof replays the complete TaskHub-recorded
  sequence and end states.
- Local / integrated / published state: complete locally in the current
  uncommitted working tree; not committed, pushed, deployed, released, or
  externally accepted.
- Next action or completion: TaskHub #46 is conditionally moved to `review`
  and read back; await review and separate Git delivery authority.

Timeline:

- 2026-09-24T16:26:41.386Z Plan created.
- 2026-09-24T16:39:00Z Exact red isolated: toolbar absent after mouseup while
  real editor keyboard input remained healthy.
- 2026-09-24T17:01:28Z Final source-built 5/5 ledger, screenshot inspection,
  fingerprints, package/registry verification, and closure reconciliation
  completed.
- 2026-09-24T17:05:00Z TaskHub #46 conditionally transitioned from
  `in_progress` to `review` and immediate read-back confirmed the state.

Open risks:

- The original reporter video file was not accessible on this workstation;
  the TaskHub-authored sequence is the exact replay authority.
- A clean pushed-ref replay is not applicable until Git delivery is separately
  authorized. The current proof certifies the local uncommitted candidate.
- The aggregate `www typecheck` preflight reports unrelated stale
  `plugins.generated.ts`; direct affected registry/type checks pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Browser pack selected | yes | Selection, paint, focus, and real keyboard behavior require browser proof |
| Browser route / app surface identified | yes | Source-built `www` Playground `/`; focused suggestion fixture is diagnostic only |
| Browser tool decision recorded | yes | Repo Playwright Chromium runner supplies deterministic mouse/keyboard/events/pixels; screenshots are opened with local image inspection |
| Console/network caveat policy recorded | yes | Fail on page errors and unexpected console errors; record unexpected failed requests, while known local dev noise must be identified rather than silently ignored |
| Observable browser case captured | pass | Case `TH46-post-release-retained-toolbar-input`: bad base ref is `bdfb69ab5a67b12283aa5a18228666e4bddf5217`; final local candidate uses that base plus the recorded working-tree diff and fingerprints in the proof artifact |
