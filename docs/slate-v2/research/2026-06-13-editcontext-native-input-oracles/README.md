# EditContext Native Input Oracles

## Question

Which EditContext and native-input invariants should pressure Slate v2 proof
without pretending that Playwright keyboard events are raw IME or mobile-device
coverage?

## Scope

- Read local source snapshots from `../edit-context`, `../wpt`, and `../vscode`.
- Extract portable invariants for text input, composition, selection mapping,
  focus deactivation, layout bounds, and composition decoration.
- Route current Slate v2 work to existing contenteditable/browser proof first.
- Do not implement an EditContext adapter from research alone.
- Do not use this packet to claim raw mobile or real IME coverage.

## Current Verdict

No runtime patch in this packet. EditContext is useful pressure for the next
native-input and raw-device proof layer, not a replacement for the current
contenteditable lane.

Promoted proof/doc work:

- `editcontext:selection-layout-proof-contract`
  - Owner: `slate-browser` / `slate-plan`
  - Kept in:
    `docs/slate-v2/selection-navigation-coverage.md#native--visual-proof-contract`
  - Action: native-input proof requirements now say selection checks must
    capture model selection, `window.getSelection()`, selection direction where
    available, visual bounds, scroll-adjusted caret/selection rectangles, no
    double paint, and follow-up mutation after navigation.
  - Reason: EditContext makes `updateSelection()`, `updateSelectionBounds()`,
    `updateControlBounds()`, and character bounds explicit. That matches the
    exact bug class the huge-document lane keeps finding: model/native agreement
    can look green while visual target or scroll-adjusted geometry is wrong.

- `editcontext:composition-decoration-raw-ime-backlog`
  - Owner: `slate-plan` / raw-device IME lane
  - Action: keep as raw-device backlog, not Playwright-only proof.
  - Reason: EditContext exposes `textformatupdate`/`TextFormat` for IME visual
    decoration. Slate should eventually prove composition decoration and
    selection highlight do not double-paint or leak stale state, but synthetic
    keyboard tests are too weak for that claim.

Closed as current existing pressure:

- Slate already owns text/model updates, beforeinput command routing, deletion,
  paste, history, and DOM mutation repair through WPT-derived contenteditable
  oracles. EditContext confirms the same architecture direction but does not
  create a new immediate test without an adapter.

Rejected:

- Do not mirror WPT EditContext API surface tests directly in Slate. Slate does
  not expose the browser `EditContext` object.
- Do not rewrite Slate to use EditContext now. Browser support, raw-device IME
  proof, clipboard/drop semantics, spellcheck, and native selection constraints
  are still open enough that this would be architecture churn, not closure.

## Freshness

This packet used local repository snapshots. Re-open with a fresh web/GitHub
scan before treating browser support or API status as current.

Fresh web refresh on 2026-06-13:

- MDN still marks EditContext as limited availability, experimental, and not
  Baseline.
- W3C published an EditContext Working Draft on 2026-06-10, so the API remains
  active but draft-stage.
- Chrome's public guidance still scopes shipping support to Chromium-based
  browsers and says authors must map caret/selection navigation and selection
  bounds themselves.

Decision remains unchanged: keep EditContext as proof pressure and future
adapter research, not a current Slate v2 runtime rewrite.
