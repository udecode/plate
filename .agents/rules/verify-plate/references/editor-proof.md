## Vision Proof

Metrics are not enough. Browser-visible editor work needs a human-like proof.

Use the in-app Browser for live local routes when a route is named or obvious.
Use Playwright for replayable proof. Use screenshots or geometry assertions when
the failure can be visual:

- text shifts on selection/focus;
- blank virtualized windows;
- overlapped pages/content;
- wrong scroll anchoring;
- caret at the wrong visual line;
- margin click placed on the wrong side;
- table/page fragment drift;
- native selection handles not matching model selection.

Selection/editing regressions need both layers. Do not call a packet fixed when
only Slate's model selection is green. Assert native selected text through
`window.getSelection()` / `slate-browser` `selectedText`, and assert exact DOM
selection endpoints when the route has stable text-node structure. If expected
native behavior is disputed, compare against the matching upstream
`https://www.slatejs.org/examples` route or captured upstream behavior before
weakening the oracle.

If the user reports a screenshot-visible selection/caret artifact, the proof
must include a fresh screenshot or pixel/geometry artifact from the real route
after the real interaction. Inspect the image before claiming fixed. Pair the
image with model selection, native `window.getSelection()` state, and visible
view-selection marker or caret-rect assertions so a projected selection cannot
hide a second native paint. When a route uses projected/view selection, include
the `slate-browser` `noDoubleSelectionHighlight` assertion or an equivalent
pixel/geometry proof.

For vertical selection/navigation, prove reverse movement. A Shift+Down row is
not complete until Shift+Up is run from the resulting state and its focus
sequence equals the reverse of the Shift+Down prefix. Staged-vs-virtualized
parity is useful, but never sufficient by itself: both modes can be wrong in
the same way. Add an independent oracle such as reverse-path equality, native
or upstream Slate behavior, exact visual-line geometry, or screenshot proof.

Do not trust Playwright rows that use browser/project-gated `return` statements
to avoid unsupported engines or mobile lanes. That is fake green: Playwright
reports a pass while no behavior ran. Convert those gates to `test.skip(...)`
with a concrete reason, or remove the gate and run the row on the broader
browser set. Before trusting a route-level Playwright proof, scan the target
spec with `rg -n "\\breturn\\b|test\\.skip|project\\.name|browserName" <spec>`
and classify every hit in the plan as helper return, explicit skip, or fake
green repaired. For multi-file or route-family skip audits, do not stream raw
hits into chat. Write the raw scan to a scratch/research artifact or summarize
counts by skip class first, then inspect only suspicious rows. When widening a
row exposes browser-specific DOM leaf shape, keep the behavior assertion strict
on model text, collapsed model selection, native caret/selected text, and visual
caret, but do not overfit a Chromium-only leaf path when another browser
preserves the same user-visible contract with a split text node.

Mobile-emulation proof is scoped proof. The Playwright `mobile` project can
prove viewport, touch/semantic-handle, and claim-width behavior, but
`page.keyboard.type(...)` is not raw mobile native typing. For mobile-only
editing rows, use a `slate-browser` semantic insert/composition/touch helper or
record the row as desktop-native keyboard proof with an explicit mobile skip. If
a desktop row keeps `page.keyboard.type(...)`, rerun at least one desktop project
after adding a mobile semantic branch so the desktop-native claim is not
silently downgraded.

Raw mobile/device claims are deferred by default until the repo has a real,
repeatable Android/iOS/Appium or equivalent device lane with artifacts. Do not
ask the user to reconfirm this in every handoff. Record the claim as
`deferred-with-owner` or `scoped proof only`, keep Playwright mobile evidence
for viewport/semantic behavior, and continue with desktop/browser proof unless
the user explicitly asks to build the raw-device lane.

Do not let a single-DOM-text-node selection row stand in for rich editor
coverage. When the selected text can cross marks, links, inline boundaries, or
multiple leaves, add a multi-path row with real keyboard typing, one undo,
model value/selection, native selected text, and DOM endpoint assertions.
`dragTextRange`-style substring helpers are not enough for that row because
they cannot express many-leaf DOM selection.

For route-level editor proof, simulate real use:

- click paragraph, table cell, margin, page corner;
- type bursts and Enter bursts;
- double click word;
- drag selection across lines and pages;
- undo/redo after edits;
- copy/paste/select-all where relevant;
- scroll away and back, then continue typing;
- strategy/control changes when the example exposes them.

When using the in-app Browser:

- use Browser Playwright locators for keyboard shortcut proof such as
  `ControlOrMeta+Z`, select-all, copy, paste, and arrow-key assertions;
- do not count Browser CUA `keypress` shortcut attempts as undo/select-all/
  clipboard proof unless the run verifies the expected editor state changed;
- CUA click/type is acceptable for lightweight visual smoke, but replayable
  behavior claims need Browser Playwright state checks or route Playwright
  integration tests;
- if Browser typing fails with a missing virtual clipboard, stop retrying
  Browser typing in that packet; keep Browser for visual/console proof and use
  route Playwright integration tests for interaction behavior;
- if a tab is stuck on an error page or Browser prints a huge encoded failure
  document, retry once from a fresh in-app Browser tab, catch per-route errors,
  and truncate recorded error text before falling back to Playwright screenshots;
- record a workflow-slowdown row if Browser command shape, not Slate runtime,
  caused a weak or misleading proof packet.

Classify intentionally skipped families in the plan. Do not claim full editor
parity when only one route and one gesture were checked.

## Scenario Generator

Before route-level proof, synthesize a scenario matrix from the named surface
instead of checking random gestures.

Build rows from these axes:

- document topology: paragraphs, wrapped text, lists, tables, voids, pages,
  blank space, hidden/materialized blocks, inline boundaries with marks/links,
  multi-leaf text, and huge-doc windows present on the route;
- viewport and strategy: staged, virtualized, auto, rows/count controls,
  desktop/mobile where relevant, top/middle/end scroll positions;
- editor gesture: click, double click, drag selection, margin click, arrow nav,
  type burst, Enter burst, paste, select-all, undo/redo, scroll away/back;
- assertion family: model selection, DOM selection, caret rect, scroll anchor,
  visible text, DOM node budget, type-to-paint, console errors, and screenshot
  or pixel/geometry stability;
- native parity risk: browser behavior that should remain native unless Slate
  deliberately owns it.

For any row involving selection plus editing, include the post-action selection
state after undo/redo, not just the text delta. The minimum oracle is: model
selection, native selected text, and visible text. Add DOM endpoints or caret
rects when the bug is about the exact selection location.

For any row involving vertical Shift+Arrow selection, include the reverse leg:
drive several steps in the reported direction, then drive back and verify the
focus path reverses the prior sequence. Include staged and virtualized when the
surface has both, but keep a non-parity oracle so two broken strategies do not
produce fake confidence. If the row uses projected/view selection, assert
`noDoubleSelectionHighlight` so the test fails on mixed native and projected
blue highlights.

Pick the smallest matrix that covers the surface risk, then expand when a bug
appears. Add new rows when user reports, screenshots, or Browser observation
show a missed human journey. Promote repeated rows into reusable Playwright or
`slate-browser` helpers instead of retyping the same automation.
