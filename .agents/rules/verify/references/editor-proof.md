## Choose the interaction contract

Preserve the reporter's entry, active modes, action and follow-up. A slash menu
case includes the real menu/focus consumer, Enter, the resulting caret, and the
next typed key; a store's `open` flag alone cannot prove that journey. A click,
synthetic event, transform call and keyboard gesture are different proof paths.
Use model setters for setup only when setup is not the behavior under test. A component that wraps `Editable`, such as a paged or scaled surface, gets a row that clicks and types through the real `[contenteditable="true"]` target, because visible text does not prove the wrapper lets input through. A row whose contract is model behavior drives the editor handle's command, even when a page-keyboard version would pass. Handle commands run on the model selection, so a row that placed the selection natively calls the handle's `importDOMSelection()` before a handle fallback such as `insertData`.

Before a composition or typing row that starts at an inline edge, a void edge or another mixed-content root, set the intended selection explicitly, through the semantic selection setter or a DOM selection collapsed on the zero-width leaf at native offset 1; a root click can leave the caret outside the leaf the row claims to measure.

A structural key command, including a block-level Tab, Enter, Backspace or Delete override, gets at least a collapsed-caret case, a same-block expanded case (several lines of one code block count), a multi-block case when the command is structural, and a repeated-invocation case when the behavior is hierarchical, such as a command that escalates or peels one level of structure per press; an existing case that already drives a shape counts. Every block-level keyboard override gets at least one multi-line or multi-block selection case besides its collapsed case. Collapsed `deleteBackward` coverage never proves selection deletion: an expanded Backspace or Delete case exercises the fragment-delete path, which a caret case never reaches.

Reuse `@platejs/test/playwright` before adding utilities:

- `selection-snapshots.ts`'s `collapsedModelDOMSelection` checks collapsed
  model/native agreement. `selectionContract` checks only the assertions supplied
  to it; a model-only invocation does not establish native agreement.
- `harness-assertions.ts`, `native-event-trace.ts`, `caret-visibility.ts` and
  `runtime-errors.ts` own focus, event delivery, caret evidence and errors.
- Wait for the actual consumer's expected ready state. The scenario runner's
  generic settle delay cannot establish popup readiness or correct next-key routing.

After a structural key such as Enter or Backspace, wait until model and DOM selection agree in the resulting block (the harness selection-sync wait) before typing follow-up text; the harness `press` and `type` helpers do not wait on their own, and a fixed sleep is not a substitute.

When a browser-visible case touches `beforeinput`, `input`, composition, paste, delete, replace or a suspicious selection jump, capture the event chain with `native-event-trace.ts` and assert its anomalies (missing `beforeinput`, data or container mismatch, selection jump, text leak, node-type change, composition mismatch, sibling creation, double paint), because a final value assertion cannot see them.

IME proof records composition lifecycle state, `beforeinput`/`input` data and target ranges where the browser exposes them, and native selection, and states its claim width for browser-specific `insertCompositionText` behavior; keyboard events alone never prove IME behavior.

For suggestion regressions, derive a small set of neighbors from the violated
invariant: own/foreign author, contiguous/gapped edits, forward/backward/range
deletion, text/block boundary, accept/reject then undo/redo. Preserve foreign
contribution identity as well as visible text. Extend the existing authored
contract suites and `apps/www/tests/browser/suggestion.spec.ts`; do not enumerate
every combination or maintain another coverage database.

Use the in-app Browser for live local routes when a route is named or obvious.
Use Playwright for replayable proof. Use screenshots or geometry assertions when
the failure can be visual, as `docs/vision/plite.md`'s Plite Browser And Behavior Proof section lists.

Selection, navigation, focus, IME, huge-document scrolling and editing regressions need both layers. Assert native selected text through `window.getSelection()`, plus the selection direction when the browser exposes it or anchor and focus order can infer it, and assert exact DOM selection endpoints when the route has stable text-node structure. If expected
native behavior is disputed, compare against the matching upstream
`https://www.slatejs.org/examples` route or captured upstream behavior before
weakening the oracle.

If the user reports a screenshot-visible selection/caret artifact, the proof
must include a fresh screenshot or pixel/geometry artifact from the real route
after the real interaction. Inspect the image before claiming fixed. Pair the
image with model selection, native `window.getSelection()` state, and visible
view-selection marker or caret-rect assertions so a projected selection cannot
hide a second native paint. When a route uses projected/view selection, include
the `@platejs/test/playwright` `noDoubleSelectionHighlight` assertion or an equivalent
pixel/geometry proof.

For vertical selection/navigation, prove reverse movement. A Shift+Down row is
not complete until Shift+Up is run from the resulting state and its focus
sequence equals the reverse of the Shift+Down prefix. Complete-vs-virtualized
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

A CDP IME row proves end-of-text composition and its kernel trace. It claims a mid-mark insertion only when it asserts the insertion point itself, and it never makes a mobile-device claim. A composition contract ported from another editor, such as a ProseMirror row, lands first as a direct DOM-composition row; a CDP row joins it only after CDP offsets are proved on that surface.

A Chrome composition fallback change asserts model text, visible text, model selection, the DOM caret and the composition kernel trace after `compositionend`.

Mobile-emulation proof is scoped proof. The Playwright `mobile` project can
prove viewport, touch/semantic-handle, and claim-width behavior, but
`page.keyboard.type(...)` is not raw mobile native typing. For mobile-only
editing rows, use an `@platejs/test/playwright` semantic insert/composition/touch helper or
record the row as desktop-native keyboard proof with an explicit mobile skip. If
a desktop row keeps `page.keyboard.type(...)`, rerun at least one desktop project
after adding a mobile semantic branch so the desktop-native claim is not
silently downgraded.

On Firefox, `page.keyboard.insertText` (the harness `composeTextDirect` lane) can make the browser emit `insertCompositionText` input events. A row whose native event trace shows them is stronger than synthetic composition but is still not OS or device IME proof. WebKit's `insertText` emits only `insertText`, so it proves direct input, never composition; keep the synthetic composition helper as that engine's proxy lane.

Android Chrome soft-keyboard claims run through the local device lane:
`apps/plite/playwright.device.config.ts` with cases in `apps/plite/tests/device`,
after `node tooling/device/android.mjs setup`, `calibrate` and `doctor` pass.
It types with real Gboard touches, refuses every DevTools `Input.*` command,
and fails a case whose trace the witness rejects. Its scope is the emulator
and Gboard version in the run log; OEM keyboards, physical phones and iOS stay
unproven. A known product failure is a named `device.knownFailure` with a
local issue draft, never `test.fail()`.

When a browser or device row goes red, name its owner before patching: the React runtime, the browser harness, the DOM bridge, core, or an accepted platform limitation. When a device or mobile row goes red, rerun the same semantic sequence on desktop Chromium on the same route before changing runtime code. If desktop also fails, treat it as a product bug and fix the shared editor path first; if desktop passes, the defect is platform-specific, so inspect the transport, the proof harness and the platform input path (such as Android input management) before changing shared editor code. Read the document state before the row's final action: when it is already wrong, the earlier step is the defect. A first-insert row types key by key with a pause, not only a whole-string insert or a composition, because a stale first-insert caret reorders text (`sushi` lands as `ushis`), and that reorder is a product bug. After the fix, report behavior proof and transport proof separately.

Raw IME or device proof needs a real device or emulator lane, or a deterministic test IME that drives platform composition primitives. Appium Unicode or direct text insertion, desktop Playwright keyboard rows and Chromium CDP `imeSetComposition` rows are useful scoped signals, but they never prove OS keyboard candidate UI, Android or iOS IME behavior or raw mobile typing.

Raw mobile/device claims for the release gate are deferred by default until
the repo has a real, repeatable Android/iOS/Appium or equivalent device lane
with artifacts. Do not ask the user to reconfirm this in every handoff. Record
the claim as `deferred-with-owner` or `scoped proof only`, keep Playwright
mobile evidence for viewport/semantic behavior, and continue with
desktop/browser proof unless the user explicitly asks to build the raw-device
lane.

For a LAN mobile capture, run `pnpm --filter plite dev:lan`, open the printed LAN URL on the target browser, append `/mobile-lab`, reproduce the input, take a snapshot and export the replay JSON. The JSON records events, model and DOM state, selections, commit and kernel traces and device facts as bug evidence; it never certifies a raw-device or release-ready claim, which needs the real-device runner, device and OS receipts and evidence bound to the exact source commit.

Do not let a single-DOM-text-node selection row stand in for rich editor
coverage. When the selected text can cross marks, links, inline boundaries, or
multiple leaves, add a multi-path row with real keyboard typing, one undo,
model value/selection, native selected text, and DOM endpoint assertions.
`dragTextRange`-style substring helpers are not enough for that row because
they cannot express many-leaf DOM selection.

For Firefox multi-cell table selection, drive native mouse selection across real cells and assert `rangeCount > 1` before any editor-triggered sync; scripted `Selection.addRange(...)` yields one range and cannot show the regression.

A cursor or caret claim wider than the reported route also needs a generated stress replay run: `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/stress/generated-editing.test.ts`, focused with `STRESS_ROUTES`, `STRESS_FAMILIES` and `STRESS_SEED`, and any emitted artifact replayed with its `replayCommand`. Use focused Playwright specs for behavior routes and generated stress replay for portable editing failures. Without a passing stress run, the claim stays scoped to the routes that ran.

For route-level editor proof, simulate real use:

- click paragraph, table cell, margin, page corner;
- type bursts and Enter bursts;
- double click word;
- drag selection across lines and pages;
- undo/redo after edits;
- copy/paste/select-all where relevant;
- scroll away and back, then continue typing;
- rendering-control changes when the example exposes them.

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
## Caret side proof

Prove where a caret sits, or on which side of an inline boundary such as struck
text, by typing a sentinel character right after the first gesture and reading
where it lands. Text left after a run of keys does not show the caret between
them, so it cannot dismiss a finding about caret position or side.

## Scenario Generator

For a broad sweep or a defect that crosses several states, derive a small
scenario matrix from the violated invariant. One exact local bug does not
require the full editor matrix.

Build rows from these axes:

- document topology: paragraphs, wrapped text, lists, tables, voids, pages,
  blank space, hidden/materialized blocks, inline boundaries with marks/links,
  multi-leaf text, and huge-doc windows present on the route;
- viewport and rendering: complete, virtualized, paginated virtualization,
  rows/count controls,
  desktop/mobile where relevant, top/middle/end scroll positions;
- editor gesture: click, double click, drag selection, margin click, arrow nav,
  type burst, Enter burst, paste, select-all, undo/redo, scroll away/back;
- assertion family: model selection, DOM selection, caret rect, scroll anchor,
  visible text, DOM node budget, type-to-paint, console errors, and screenshot
  or pixel/geometry stability;
- native parity risk: browser behavior that should remain native unless Slate
  deliberately owns it;
- selection topology: content root, multi-root, synced root, editable void, DOM coverage boundary and mixed topologies (visible to hidden to root to synced or void and back to visible);
- selection direction: forward, backward and vertical, both into a surface and out of it so the selection is never trapped, across one boundary and across many boundaries without double selection or skipped nodes;
- selection commands: horizontal Shift+Arrow extension, word and line-edge movement and extension, bottom-to-top drag and drag from an unfocused editor.

Each selection starting state carries its assertion: collapsed at start lands on the first intended point; collapsed at end crosses the next boundary exactly once; expanded forward extends from the stable anchor; expanded backward keeps anchor and focus orientation; selected all extends or collapses without double highlight or stale DOM; a multi-line block moves up and down by visual line, not only model order; after a focus handoff no stale DOM selection is imported; after undo/redo the selection belongs to its original root and path; after hidden materialize the revealed content gets a real DOM selection once mounted.

For any row involving selection plus editing, include the post-action selection
state after undo/redo, not just the text delta. The minimum oracle is: model
selection, native selected text, and visible text. Add DOM endpoints or caret
rects when the bug is about the exact selection location. Assert the model first: exact Plite anchor and focus paths and offsets, the value after each type, delete, Backspace, Enter or paste, and that undo/redo restores both value and selection. When the row copies, assert the copy payload matches the model range.

Browser-visible selection rows also assert that the DOM selection is not doubled, non-editable chrome stays out of the browser selection, focus belongs to the expected editable or root, hidden content opens only when its policy says so, and no stale placeholder, zero-width or boundary DOM captures the selection.

Prove a directionless browser selection, such as a double- or triple-click paragraph selection, through selected text, anchor and focus, and visual and native agreement instead of `selection.direction`.

For any row involving vertical Shift+Arrow selection, include the reverse leg:
drive several steps in the reported direction, then drive back and verify the
focus path reverses the prior sequence. Include complete and virtualized when the
surface has both, but keep a non-parity oracle so two broken strategies do not
produce fake confidence. If the row uses projected/view selection, assert
`noDoubleSelectionHighlight` so the test fails on mixed native and projected
blue highlights.

Pick the smallest matrix that covers the surface risk, then expand when a bug
appears. Add new rows when user reports, screenshots, or Browser observation
show a missed human journey.

For one bug that touches selection, navigation, focus, hidden DOM, multi-root or synced roots, editable voids, or clipboard, delete or insert-break after a selection, start with this slice unless the bug clearly needs less: the reported command and direction, its reverse, the Shift or collapsed variant, one follow-up mutation and one sibling topology that shares the owner. If a slice row fails, fix the owner before adding route-specific tests, and record skipped rows when the handoff could imply broader coverage. Route coverage means every relevant command family on one route; engine coverage means those families across plain, hidden DOM, root, void, synced and virtualized topologies.

A `selectionPolicy: 'materialize'` bug's slice covers Shift+ArrowDown and Shift+ArrowUp from visible text into closed hidden content with exact model selection and a mounted-DOM assertion, a mid-line caret on the last rendered line, two hidden shapes when the owner is generic, a row proving the next plain vertical Shift+Arrow stays native once the content is mounted, unless it enters another unmounted materialize boundary, and repeated extension across exclusive surfaces such as tabs keeping the focus-side panel active; `apps/plite/tests/plite-browser/donor/examples/hidden-content-blocks.test.ts` covers every row except the native follow-up.
