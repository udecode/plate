---
review_scopes: [selection, native, geometry]
review_basis: [2026-09-12-selection-distinct-lifetimes, 2026-09-12-native-input-authority, 2026-09-12-geometry-widget-carrier-cut]
work_kind: implementation
---

# TaskHub 46: retained selection input ownership

Status: Completed (user confirmed the repair; direct next delivery authorized)

## Outcome and boundary

Repair the source owner responsible for the retained-selection release failure
on `next`, baseline `45afe6d7d3e7664ae511487889e28cc86b0fcd61`. The latest user
report (2026-09-26) supersedes the TaskHub body's old plan and all old success
claims. User owns real-browser acceptance; this task supplies causal diagnosis,
source candidate, minimal executable regression and reproduction instructions.
The initial handoff excluded Git delivery. On 2026-09-26 the user tested the
current source on localhost:3000, reported "fix is working", and authorized
commit/push to next. Tracker mutation, PR, deployment and changes to AI /
TaskHub 45 remain outside this delivery.

## Acceptance (latest user request)

- [x] Identify the first divergence among native/model/projected selection,
  DOM activeElement, ReactEditor focus, view focus, and inactive paint/store.
- [x] Trace the release and first input owners before product edits. Distinguish
  true inactive markers from projected paint; toolbar is only a consumer.
- [x] Repair the diagnosed native transport owner without delayed focus, additional focused
  booleans, CSS concealment, global selection-clear suppression or input bypass.
- [x] Prove the diagnosed boundary red/green with minimal regression tests.
- [x] Check first replacement, Backspace/Delete/Undo, ordinary selection,
  forward/reverse and retained endpoints at the applicable automated boundary.
- [x] Preserve one semantic range and one visible selection layer; preserve
  TaskHub 45 held-button drag behavior.
- [x] Run affected source checks, inspect final changes, provide exact manual
  verification and explicitly leave native browser acceptance with the user.

## Failed fix recovery

Failure kind: reporter-contradiction. All six prior fixes are revoked:
`c894307d14`, `4183236efe`, `ae7f2a83c8`, `84bff82d4c`, `4c5165e348`,
`059fd3882d`. No old test pass or completion authority carries forward.
Base acceptance: selection release, immediate no-click keyboard replacement,
single paint, correct focus and secondary toolbar geometry remain required.
Latest reporter delta: inactive appearance is stable; input failure is intermittent.
Input working alongside inactive appearance is an illegal state.

## Evidence and ownership review

- HEAD and current branch match the requested baseline. TaskHub 46 read in full;
  current status is in_progress. No TaskHub writes.
- Prior feature history keeps model selection, private projected view target and
  rebasing lifetimes distinct. It does not establish present native focus proof.
- Current native clearing occurs in selection import, root drag release, and
  DOM export. The inactive coordinator and projected decoration are separate
  paint producers. Determine actual producer before choosing a repair.
- Best API Review required after repeated failures: compare retaining native
  transport for representable semantic ranges with merging inactive/focus owners;
  reject toolbar focus compensation and another independent boolean gate.

## Causal evidence

The local ignored diagnostic receipt at
`docs/plans/artifacts/taskhub-46-native-selection-evidence.json` retains baseline
and candidate observations, summarized below for the committed record.
Source served the homepage through
`PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1 next dev --port 3297` in isolated
Playwright Chromium and WebKit contexts. These are automated engine checks,
not the user's browser acceptance. Temporary browser-handle focus logging was
removed from product source after diagnosis.

The held gesture starts in normal `Collaborative Editing` text at offset 5 and
ends in normal `Boost your` text at offset 10, crossing the retained deletion.
Before release it has one expanded native range and no synthetic paint.
The first native clear is:

`onMouseUpCapture -> importExpandedDOMSelection -> importDOMSelection ->
syncDOMSelectionFromRuntime -> syncEditorSelectionFromDOM ->
importProjectedDOMSelection -> Selection.removeAllRanges`.

DOM export also clears native selection during React commit and scheduled
microtask/frame work. After release, activeElement remains the exact Editable,
ReactEditor focus and view focus remain true, the model range is collapsed,
the semantic view range is expanded, native rangeCount is zero, and 14 projected
selection markers appear. No blur/focusout or inactive-store activation was
observed. Retained fragment views do not mount another focusable Editable.

Chromium can recover an input caret when the first key arrives. WebKit sends
keydown to the focused Editable but emits no beforeinput with this empty native
selection, so no replacement occurs. This establishes a native input transport
failure without inventing a focus-state failure. The visible paint in this
reproduction belongs to `view-selection-decoration.ts` (`Highlight`), not
`inactive-selection.ts`. There is consequently no observed first-visible
inactive-store stack to report. The user's actual inactive appearance remains
unconfirmed rather than being relabeled as solved.

## Target and implementation

The strongest cut is to remove the redundant projected paint/native-clear
handoff for an expanded text range representable inside one ordinary Editable.
Keep model coordinates and private retained/view coordinates distinct: retained
text has no equivalent accepted-model coordinate. Merging those contracts or
moving focus ownership to toolbar code would lose required semantics. True
inactive selection still belongs to actual focus transfer; no new focus gate,
focus call, delay, CSS concealment or input-policy bypass is introduced.

- [selection-projected-dom.ts](../../packages/plitejs/src/react/editable/selection-projected-dom.ts)
  resolves exact-root native endpoints for supported contiguous text selections.
  Cross-root/owner, viewport-backed and nontext selections retain projected handling.
- [selection-controller.ts](../../packages/plitejs/src/react/editable/selection-controller.ts)
  and [root-interaction-controller.ts](../../packages/plitejs/src/react/editable/root-interaction-controller.ts)
  retain/export that native range, including mouseup handoff. A stale scheduled
  projected clear rechecks the current representation before clearing it.
- [view-selection-decoration.ts](../../packages/plitejs/src/react/view-selection-decoration.ts)
  assigns paint to the native range, preserves retained DOM endpoint identity,
  and invalidates decorations through existing DOM-scope lifecycle events.
  A selection created before mount initially exposed two stale projected markers;
  its new regression proves removal after mount, without another focus flag.
- [use-selection-geometry.tsx](../../packages/plitejs/src/react/hooks/use-selection-geometry.tsx)
  measures the supported DOM range through the existing geometry owner.
  [FloatingToolbar](../../apps/www/src/registry/components/editor/floating-toolbar.tsx)
  consumes expanded native text selection plus existing exact-view focus and
  overlay behavior. Neither consumer repairs focus or establishes input success.

Public setup/call shapes, authored decisions, inactive-selection coordinator,
AI and the existing held-button drag lifecycle remain unchanged. No package
barrel or public API change requires doctrine regeneration.

## Verification

- New four-case retained selection test: baseline 4 failures on native rangeCount
  zero; candidate passes forward/reverse and retained endpoints with DOM focus,
  semantic copy target, exact native endpoints, zero inactive/projected markers,
  beforeinput cancellation and exact replacement contents. The pre-mount case
  separately went red on duplicate paint, then green.
- `bun run test:react test/react/authored-fragment-provider.test.tsx
  test/react/range-geometry-contract.test.tsx
  test/react/selection-controller-contract.test.ts
  test/react/root-interaction-controller.test.tsx`: 121 passed.
- `bun run test:react test/react/editable-behavior.test.tsx
  test/react/selection-side-effect-policy-contract.test.ts
  test/react/runtime-before-input-events-contract.test.ts`: 51 passed, including
  genuine blur/inactive control and input policy contracts.
- `bun test ./apps/www/src/registry/components/editor/floating-toolbar.spec.tsx`:
  7 passed / 26 assertions. Consumer tests use DOM ranges; focus is mocked and
  does not establish actual browser focus.
- Plite React source typecheck and partition lint pass. www source `tsc --noEmit
  -p tsconfig.json` passes. A missing explicit Bun mock import in the changed
  toolbar test was repaired. Affected-file OXC lint and `git diff --check` pass.
- Registry build passes and generated output is included. The new draft registry
  changelog and its indexes match generation. Full changelog check also reports
  14 unrelated historical JSON drifts (old code-block-lowlight metadata/line
  references); those initially clean outputs were restored instead of widening
  this change. Package changeset: no additional main-relative repair entry;
  local `origin/main` has no Plite and existing canonical/retained-caret entries
  describe the branch's final package behavior.

In both isolated engines, full forward/reverse replacement, Backspace, Delete,
Undo and ordinary selection pass. The first trusted key is sent immediately
after mouseup, without an intermediate click, focus call or settling delay.
Native rangeCount is one and synthetic paint counts are zero at keydown.
Undo checks document children and retained content, not append-only provenance.

Retained endpoints have a separate limitation: the minimal four-case fixture
replaces correctly at both ends. On the richer homepage, partial retained anchor
selection receives trusted beforeinput and reaches the existing model mutation,
yet remains unchanged. The resolver/acceptance topology, not observed focus loss,
is implicated. That case is recorded only as transport/paint/Undo evidence, never
as successful replacement. No general claim about partial selections follows.

## User verification and remaining boundaries

1. In the user's usual browser and affected page, start on normal text, hold the
   mouse across the retained deletion, then release. Do not click/focus again.
2. Check that only the normal active native selection is painted. Record exact
   activeElement, native range/text, semantic view selection and actual inactive
   markers if the appearance is still wrong; toolbar opening alone is irrelevant.
3. Type one real character immediately. It must replace the full visible semantic
   range. Undo, then repeat backward and with Backspace/Delete. Compare an ordinary
   text selection. Check retained endpoint cases separately, retaining the known
   homepage partial-anchor limitation above.
4. Move real focus into an external input: editor input must stop and toolbar
   must obey actual focus. Any active editor plus inactive paint is a failure.

The user subsequently reported the original fix working on the current source
served at localhost:3000 and authorized push. This establishes reporter
acceptance of the reported repair, without expanding the automated claims to
the separate partial-anchor limitation, OS focus transitions, IME or mobile.
No tracker transition, PR, deployment or release is authorized. Existing shared
review-ledger conflicts do not constitute implementation or browser evidence.

Review recording was attempted with the local ignored comparison draft at
`docs/plans/artifacts/taskhub-46-selection-review.json`; its comparison is
summarized in Target and implementation above.
The ledger refuses recording because its pre-existing feature inventory lacks
`application/ai-copilot`. This task does not reconcile unrelated AI ownership.
The draft is not an immutable recorded verdict; the older governing review IDs
remain in the plan. The shared decision page also has an existing
single-current-review metadata gap. Neither tracking gap changes the source
test results or supplies missing user-browser acceptance.
