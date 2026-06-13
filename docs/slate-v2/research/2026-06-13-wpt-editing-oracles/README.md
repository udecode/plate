# WPT Editing Oracles

## Question

Which Web Platform Tests expose portable browser-owned editing invariants that
Slate v2 should lock into package or browser oracles?

## Scope

- Read WPT input-events/editing/selection tests only where they map to Slate
  v2 beforeinput, selection, target-range, or contenteditable behavior.
- Use WPT as browser behavior pressure, not as Slate architecture.
- Do not copy WPT harness code into Slate.

## Local Evidence Gap

Slate had adjacent target-range tests for dirty node maps and native text repair,
but no explicit proof that a destructive `beforeinput` uses the event target
range when live DOM selection has moved before Slate reconciles selection.

## Current Verdict

Kept one package oracle:

- `wpt:beforeinput-target-range-dispatch-snapshot`
- Slate owner: `slate-react`
- Test: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/selection-reconciler-contract.test.tsx:480`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/selection-reconciler-contract.test.tsx -- -t "beforeinput uses event target range instead of later live DOM selection"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`

Kept a second target-range package oracle:

- `wpt:block-spanning-delete-target-range`
- Slate owner: `slate-react`
- Test: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/selection-reconciler-contract.test.tsx:564`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/selection-reconciler-contract.test.tsx -- -t "beforeinput resolves block-spanning element target ranges before live selection fallback"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`

Kept a paste payload package oracle:

- `wpt:paste-inputevent-datatransfer-authority`
- Slate owner: `slate-react`
- Test: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/editing-kernel-contract.ts:344`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/editing-kernel-contract.test.ts -- -t "beforeinput insertFromPaste prefers contenteditable dataTransfer over event data"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`

Kept a destructive data-transfer delete package oracle:

- `wpt:delete-by-cut-drag-beforeinput-command`
- Slate owner: `slate-react`
- Test:
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts:782`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/model-input-strategy-contract.test.ts -- -t "deletes the selected fragment from"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Scope: the package contract proves the Slate-owned beforeinput command path
  for selected-fragment deletion. Route-level keyboard cut/drop behavior remains
  covered by existing plaintext cut and generated drop-data rows.

Closed execCommand inputType coverage as existing proof:

- `wpt:exec-command-inputtype-coverage`
- Slate owner: `slate-react` / `slate-browser`
- Evidence:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/editing-kernel-contract.test.ts test/editable-behavior.test.tsx -- -t "beforeinput format commands resolve|beforeinput and keydown commands resolve|beforeinput data transfer commands preserve|beforeinput insertFromPaste prefers|Editable onDOMBeforeInput exposes raw native format input|Editable onBeforeInput is not replayed"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "applies native beforeinput history undo and redo"`
- Scope: Slate does not mirror browser `execCommand` DOM mutation. The owned
  surface is semantic beforeinput command mapping, raw native format event
  exposure, paste payload authority, and beforeinput history handling.

Kept an editing-host boundary target-range guard:

- `wpt:multi-target-range-editing-host-boundary`
- Slate owner: `slate-react`
- Runtime: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts:946`
- Test: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/selection-reconciler-contract.test.tsx:714`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/selection-reconciler-contract.test.tsx -- -t "beforeinput does not import only the first range from multiple target ranges"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep "(Backspace over a projected Shift\\+Arrow selection removes text across the outer and synced roots|Backspace over a projected selection from a synced body into the owner document deletes without crashing)"`

Kept a no-selection insert/delete beforeinput runtime guard:

- `wpt:no-beforeinput-without-selection`
- Slate owner: `slate-react` / `slate-browser`
- Runtime: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts:158`
- Test: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/runtime-before-input-events-contract.test.ts:145`
- Browser row: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/richtext.test.ts:1122`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/runtime-before-input-events-contract.test.ts -- -t "beforeinput ignores browser events with no selection and no target ranges"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/editable-behavior.test.tsx -- -t "Editable onDOMBeforeInput exposes raw native format input|Editable onBeforeInput is not replayed from native beforeinput"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "(inserts text through browser input|ignores synthetic beforeinput when the browser has no selection ranges)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=firefox --project=webkit --grep "ignores synthetic beforeinput when the browser has no selection ranges"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun check`

Kept another package oracle:

- `wpt:editing-host-removal-selection-collapse`
- Slate owner: `slate-react`
- Test: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/selection-controller-contract.ts:719`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/selection-controller-contract.test.ts -- -t "selectionchange ignores host-removal collapse outside the editor"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`

The broader expanded-selection WPT rows are useful future browser-route pressure,
but not worth a route patch in this packet because current Slate range
resolution already has package owner proof and no live bug points at these
browser variants.

Kept a shadow-DOM removal package oracle:

- `wpt:shadow-removed-empty-selection`
- Slate owner: `slate-react`
- Test: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/selection-controller-contract.ts:807`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/selection-controller-contract.test.ts -- -t "selectionchange ignores removed shadow host empty native selection"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`

Deferred one adjacent WPT shadow lead:

- `wpt:composed-range-dom-removal-rescope`
- Reason: Slate does not currently read `getComposedRanges()` as the selection
  import authority. The useful invariant is preserved as future browser-route
  pressure if that changes.

Kept a native selection direction package oracle:

- `wpt:backward-native-selection-direction`
- Slate owner: `slate-dom`
- Test: `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-dom/test/bridge.ts:313`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-dom && bun test ./test/bridge.test.ts --test-name-pattern "preserves backward native selection direction"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-dom typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`

Closed one direction-related lead as existing coverage:

- `wpt:click-selection-directionless`
- Reason: Slate's DOM range import uses anchor/focus endpoints, not
  `selection.direction`, and existing double/triple-click browser rows cover
  route behavior.

Closed one existing-coverage lead:

- `wpt:cefalse-caret-boundary-navigation`
- Slate owner: `slate-react` / `slate-browser`
- Evidence:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/content-root-navigation-contract.test.ts`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "(moves across editable void child-root boundaries with keyboard|moves vertically across editable void child-root boundaries with keyboard|extends keyboard selection from editable void child root into outer siblings)"`

Kept one plaintext paste route oracle:

- `wpt:plaintext-rich-html-paste-strips-markup`
- Slate owner: `slate-browser`
- Test:
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:532`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "strips rich clipboard markup when pasting into plaintext"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=webkit --grep "strips rich clipboard markup when pasting into plaintext"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Scope: Firefox is skipped because privileged HTML clipboard data is not a
  reliable Playwright proof path there.

Closed plaintext delete boundary parity as existing coverage:

- `wpt:plaintext-delete-boundary-parity`
- Slate owner: `slate-browser`
- Evidence:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "(deletes the current line backward without touching the previous block|applies deleteSoftLineBackward target ranges exactly|applies deleteWord target ranges over tab whitespace exactly|applies delete target ranges over multi-code-unit graphemes exactly)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=webkit --grep "supports WebKit hard-line backward delete without command errors"`
- Scope: The Chromium hard-line-delete row skipped under the current browser
  environment, so the kept-existing claim uses the executed target-range rows
  plus the WebKit hard-line command-error row.

Kept one inline word-delete route oracle:

- `wpt:inline-word-delete-wrapper-parity`
- Slate owner: `slate-browser`
- Test:
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:1578`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "word Backspace around an inline link matches plain editable text"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=webkit --grep "word Backspace around an inline link matches plain editable text"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "(word Backspace around an inline link matches plain editable text|Backspace at an inline link end deletes one character|Backspace deletes selected inline link boundary text only)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Scope: the test compares Slate linked inline text against a same-page plain
  contenteditable reference and uses the key that actually performs native word
  Backspace in that browser lane.

Kept one preserved-space plaintext target-range oracle:

- `wpt:plaintext-preserved-space-delete-target-range`
- Slate owner: `slate-browser`
- Test:
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:1656`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "applies delete target ranges over preserved repeated spaces exactly"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=webkit --grep "applies delete target ranges over preserved repeated spaces exactly"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "(applies delete target ranges over preserved repeated spaces exactly|applies delete target ranges over multi-code-unit graphemes exactly|applies deleteWord target ranges over tab whitespace exactly)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Scope: the test uses synthetic beforeinput target ranges because Slate owns
  target-range application; browser HTML cleanup around collapsible whitespace
  remains WPT pressure unless a Slate route exposes a visible regression.

Kept one non-editable inline paste route oracle:

- `wpt:copy-paste-before-non-editable-preserves-siblings`
- Slate owner: `slate-browser`
- Test:
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:1341`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "pastes before a read-only inline without dropping following content"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=webkit --grep "pastes before a read-only inline without dropping following content"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "(wraps pasted URL text as a link command|pastes content outside inline link boundaries without expanding the link|copies and pastes only selected inline link text|Backspace deletes selected inline link boundary text only)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Workflow repair: while touching `inlines.test.ts`, bare project-gated
  `return` skips were converted to explicit `test.skip(...)` calls. The
  remaining `return` statements are value returns inside browser evaluation
  callbacks.

Closed hidden-content copy serialization as existing coverage:

- `wpt:hidden-content-copy-serialization`
- Slate owner: `slate-browser`
- Evidence:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium --grep "(copies model-backed shadcn hidden content while DOM is absent|copies selected hidden content through model-backed clipboard data|keeps hidden model updates out of the DOM but available to model-backed copy)"`
- Scope: WPT's browser-DOM copy serialization rows are pressure, not a direct
  Slate runtime mirror. Slate owns model-backed copy for hidden/materialized
  content, and the focused rows verify that hidden model text is copied while
  DOM-hidden content stays absent.

Kept one paste handler mutation package oracle:

- `wpt:paste-handler-mutated-clipboard-data`
- Slate owner: `slate-react`
- Test:
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts:655`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/dom-coverage-native-bridge-contract.test.ts -- -t "paste uses clipboard data mutated by an unhandled app paste callback"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Scope: WPT mutates the system clipboard during the browser paste handler.
  Slate cannot honestly prove post-event system clipboard rereads in a package
  contract, so the kept invariant is event-payload mutation before Slate-owned
  insertion.

Kept one inline-boundary offset navigation route oracle:

- `wpt:inline-boundary-offset-navigation`
- Slate owner: `slate-browser`
- Test:
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:1409`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "steps caret by offset across inline link boundaries"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "(steps caret by offset across inline link boundaries|arrow keys skip over read-only inline|keeps text typed after a link when arrowing back into the link|keeps typing after a link-boundary Backspace outside the link)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=webkit --grep "steps caret by offset across inline link boundaries"`
- Scope: WPT's native `Selection.modify("character")` rows are useful pressure,
  but the inlines example deliberately maps left/right to `unit: "offset"` so
  users can step through before-link, inside-link-start, and first-character
  caret positions. The first attempted oracle incorrectly used only `"Here is a
  "` as the prefix and then expected native character movement. The kept oracle
  uses the full model prefix and asserts Slate's offset law.

Kept one inline-link edge delete and typing packet:

- `wpt:inline-link-edge-delete-typing`
- Slate owner: `slate` / `slate-browser`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate/test/snapshot-contract.ts:6563`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate/test/snapshot-contract.ts:6590`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:659`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts --test-name-pattern "legacy delete/selection/inline|collapses outside an inline after deleting"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "(keeps typing outside a surviving inline link after deleting edge text|keeps replacement text inside selected link text|replaces selected inline link text with rich content outside the surviving link|Backspace deletes selected inline link boundary text only|keeps typing after a link-boundary Backspace outside the link)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=webkit --grep "keeps typing outside a surviving inline link after deleting edge text"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Scope: WPT distinguishes direct replacement typing from explicit delete then
  typing around link edges. Slate now keeps direct replacement inside the link
  but collapses explicit first/last selected-character deletion outside the
  surviving inline so follow-up typing does not inherit link membership. The
  runtime fix is in core delete-selection reconciliation; `insertText`
  replacement uses an internal preservation flag so public delete semantics and
  replacement semantics do not fight each other.

Kept one primary mouse selection packet:

- `wpt:mouse-selection-modification`
- Slate owner: `slate-browser`
- API / test:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts:536`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:120`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "(Shift\\+click extends a collapsed text selection|clicking inside selected text collapses the selection|pastes at the clicked caret after Shift state is released|extends a double-click word selection while dragging|stays interactive after dragging selected plain text|mouse drag undo restores manual typed replacement)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=webkit --grep "Shift\\+click extends a collapsed text selection"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-browser typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Scope: WPT primary-button rows map to Slate-visible mouse selection
  behavior: ordinary click collapses/moves the caret, Shift+click extends from
  the existing collapsed selection, native and model selected text agree, and no
  double highlight appears. The repeated text-offset click primitive is now
  exposed as `editor.dom.clickTextOffset(...)`. Non-primary mouse and context
  menu differences remain browser-owned unless a Slate route shows a concrete
  regression.

Closed one initial-focus packet as kept-existing:

- `wpt:initial-selection-on-focus`
- Slate owner: `slate-browser`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/placeholder.test.ts:23`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/visual-native-selection-smoke.test.ts:133`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/placeholder.test.ts --project=chromium --project=webkit --grep "keeps an empty editor value and start selection while showing a placeholder"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --grep "custom placeholder empty state shows one collapsed caret"`
- Scope: WPT's initial focus rows map to Slate's empty placeholder route:
  focusing the empty editor keeps an empty model, visible placeholder, collapsed
  model/DOM selection at `[0,0]` offset `0`, and a single visible caret with no
  double highlight. Raw browser placement around arbitrary HTML tag soup is not
  a Slate route contract.

Deferred one `selectstart` keyboard-extension packet:

- `wpt:selectstart-prevented-key-extension`
- Slate owner: `slate-plan` / `slate-browser`
- Source:
  `/Users/zbeyens/git/wpt/selection/onselectstart-on-key-in-contenteditable.html`
- Attempt:
  - Added a plaintext route oracle that installed a document-level
    `selectstart` preventDefault listener and pressed `Shift+ArrowRight`.
  - The row failed in Chromium: model/native selected text became `"e"`.
  - Tightening the listener to unconditional document-capture preventDefault
    still failed the same way.
  - The speculative test was removed, and the adjacent existing
    `keeps Shift+ArrowRight cross-block selection on real text` row passed.
- Scope: Current Slate plaintext keyboard selection is model-owned and does not
  expose WPT's browser-native `selectstart` veto point as a route contract.
  Changing that would be editor input policy, not a narrow test repair. Revisit
  through `slate-plan` if app-level `selectstart.preventDefault()` should veto
  model-owned keyboard selection.

Kept one symbol-run word movement packet:

- `wpt:symbol-run-word-movement`
- Slate owner: `slate-browser`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:31`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:1162`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "keeps surrounding symbols in browser word movement"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "(moves word forward out of an empty leading block|keeps surrounding symbols in browser word movement|applies deleteWord target ranges over tab whitespace exactly)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-browser typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Scope: WPT's symbol word-movement row maps to browser-owned word navigation
  imported into Slate's model: `Alt`/`Ctrl` word-backward from before `p`
  in `~>>>>>p+++` lands at offset `0`, and word-forward from after `p` lands
  at the text end. The row is Chromium-scoped to match the existing plaintext
  word-navigation claim width.

Deferred one Korean/Latin word-boundary packet:

- `wpt:korean-latin-word-boundary`
- Slate owner: `slate-plan` / `slate-browser`
- Source: `/Users/zbeyens/git/wpt/selection/move-by-word-korean.html`
- Attempt:
  - Added a Chromium plaintext route oracle for `희진DJ` expecting word-forward
    from offset `0` to stop at offset `2`.
  - The row failed: current Chromium/Slate route landed at offset `4`.
  - The speculative row was removed, and the kept symbol word-movement row
    passed again.
- Scope: This is not a local Slate import failure unless Slate chooses to
  override browser word movement with Unicode word-boundary segmentation. Revisit
  through `slate-plan` if Korean/Latin boundaries should become editor-owned
  rather than browser-owned.

Closed one end-of-line image selection packet as kept-existing, plus repaired
fake-green image spec skips:

- `wpt:end-of-line-image-selection`
- Slate owner: `slate-browser`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/images.test.ts:156`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/images.test.ts:1361`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/images.test.ts:1404`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/images.test.ts --project=chromium --grep "(deletes a clicked selected image with Backspace|extends horizontal selection into an image with Shift\\+ArrowRight|keeps vertical arrow movement into an image synchronized)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-browser typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Scope: WPT's bare contenteditable row drags through an image at line end and
  deletes it. Slate maps this to image-node selection/deletion and model/native
  selection agreement when keyboard navigation enters image nodes. During the
  audit, project-gated early `return`s in `images.test.ts` were converted to
  explicit `test.skip(...)` calls so unsupported browser/project rows no longer
  pass invisibly.

Closed one non-editable boundary-navigation packet as kept-existing:

- `wpt:noneditable-boundary-navigation`
- Slate owner: `slate-react` / `slate-browser`
- Sources:
  - `/Users/zbeyens/git/wpt/selection/contenteditable/modify.tentative.html`
  - `/Users/zbeyens/git/wpt/selection/contenteditable/modify-around-non-editable-span.html`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/content-root-navigation-contract.test.ts:240`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/content-root-navigation-contract.test.ts:290`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts:713`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:1431`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:1477`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/content-root-navigation-contract.test.ts`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/inlines.test.ts --project=chromium --grep "(moves across editable void child-root boundaries with keyboard|moves vertically across editable void child-root boundaries with keyboard|extends keyboard selection from editable void child root into outer siblings|arrow keys skip over read-only inline|steps caret by offset across inline link boundaries)"`
- Scope: WPT guards against native selection movement entering
  `contenteditable=false` descendants or escaping inline editing hosts. Slate's
  equivalent law is content-root boundary navigation plus route proof for
  editable voids, read-only inlines, and inline link boundaries. Arbitrary DOM
  lineboundary placement remains browser-owned unless a Slate route exposes it.

Closed one target-range lifetime packet as kept-existing:

- `wpt:target-ranges-fixed-at-dispatch`
- Slate owner: `slate-react`
- Source:
  `/Users/zbeyens/git/wpt/input-events/input-events-get-target-ranges-during-and-after-dispatch.tentative.html`
- Test:
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/selection-reconciler-contract.test.tsx:480`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/selection-reconciler-contract.test.tsx -- -t "beforeinput uses event target range instead of later live DOM selection"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
- Scope: WPT proves `getTargetRanges()` is fixed for the event even if a
  listener changes the live selection during propagation. Slate's existing
  package contract sets live DOM selection to a different text node and proves
  `syncSelectionForBeforeInput` imports the event target range instead.

Closed one hidden native-selection packet as kept-existing:

- `wpt:content-visibility-hidden-selection`
- Slate owner: `slate-browser` / `slate-react`
- Source:
  `/Users/zbeyens/git/wpt/selection/selection-content-visibility-hidden.html`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/dom-coverage-boundaries.test.ts:77`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/dom-coverage-boundaries.test.ts:142`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/hidden-content-blocks.test.ts:124`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts:228`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/dom-coverage-native-bridge-contract.test.ts -- -t "copy writes model-backed data when native selection crosses hidden content"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium --grep "(keeps hidden content out of native find until materialized|copies selected hidden content through model-backed clipboard data|copies select-all content through model-backed covered ranges|keeps shadcn hidden content out of the DOM until opened|copies model-backed shadcn hidden content while DOM is absent)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
- Scope: WPT says hidden-rendered text stays out of native selection text. Slate
  already proves hidden content is absent from browser/native find until
  materialized, and separately proves model-backed copy includes hidden content
  only through Slate-owned clipboard policy rather than stale native DOM.

Closed one selected-range deletion packet as kept-existing:

- `wpt:delete-from-document-selection`
- Slate owner: `slate` / `slate-browser`
- Source: `/Users/zbeyens/git/wpt/selection/deleteFromDocument.html`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate/test/delete-contract.ts:398`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate/test/delete-contract.ts:902`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate/test/delete-contract.ts:961`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/richtext.test.ts:3525`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/richtext.test.ts:3571`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/richtext.test.ts:6839`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate/test/delete-contract.ts --test-name-pattern "deletes only the selected formatted leaf window|deletes a selected top-level block range|deletes a selected full-document block range"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "(keeps caret editable after browser Backspace deletes selected range|keeps caret editable after browser Delete deletes selected range|undo restores deleted selected text)"`
- Scope: WPT compares `deleteFromDocument()` to raw DOM
  `Range.deleteContents()` over many HTML shapes. Slate's owned invariant is
  expanded model selection deletion plus browser Backspace/Delete route behavior,
  caret editability after deletion, and undo restoration. Raw DOM normalization
  remains out of claim unless a Slate route exposes it.

Closed one paragraph movement across editing boundary packet as kept-existing:

- `wpt:paragraph-movement-cross-editing-boundary`
- Slate owner: `slate-react` / `slate-browser`
- Sources:
  - `/Users/zbeyens/git/wpt/selection/move-paragraph-cross-editing-boundary.tentative.html`
  - `/Users/zbeyens/git/wpt/selection/move-paragraphboundary-cross-editing-boundary.tentative.html`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/content-root-navigation-contract.test.ts:267`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/content-root-navigation-contract.test.ts:312`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/synced-blocks.test.ts:401`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/synced-blocks.test.ts:506`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/synced-blocks.test.ts:2708`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/content-root-navigation-contract.test.ts -- -t "moves word forward from the previous sibling|moves word backward from the next sibling|moves word forward from the content root end|moves backward from the content root start"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/synced-blocks.test.ts --project=chromium --grep "(moves ArrowDown through paragraphs, separate synced roots, and repeated synced copies|moves ArrowUp through repeated synced copies, separate synced roots, and paragraphs|moves word navigation into synced root blocks instead of skipping them)"`
- Scope: WPT's native paragraph movement crosses
  `contenteditable=false` editing boundaries. Slate's corresponding law is
  content-root and projected-root navigation: movement enters, leaves, and
  traverses synced roots in visible order instead of trapping in or skipping
  non-editable/content-root boundaries.

Skipped one generated-content word-selection shard as not Slate-owned:

- `wpt:generated-content-word-selection`
- Sources:
  - `/Users/zbeyens/git/wpt/selection/selection-modify-extend-word-generated-content.html`
  - `/Users/zbeyens/git/wpt/selection/modify-extend-word-trailing-inline-block.tentative.html`
- Decision: `invalid-skip`
- Reason: these rows test CSS generated text and raw inline-block line layout
  effects on native `Selection.modify("word")`. Slate document content is model
  text and elements, not CSS pseudo-element text. Do not add a Slate oracle
  unless a Slate route intentionally renders model text through CSS generated
  content or a route-visible native word-selection regression appears around
  user-authored inline-block layout.

Closed one anchor-removal selection rescope packet as kept-existing:

- `wpt:anchor-removal-selection-rescope`
- Slate owner: `slate-react`
- Source: `/Users/zbeyens/git/wpt/selection/anchor-removal.html`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/selection-controller-contract.ts:628`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/selection-controller-contract.ts:719`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/selection-controller-contract.ts:807`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/selection-controller-contract.test.ts -- -t "selectionchange ignores detached DOM endpoints before resolving Slate range|selectionchange ignores host-removal collapse outside the editor|selectionchange ignores removed shadow host empty native selection"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-react typecheck`
- Scope: WPT describes native selection rescoping to a parent when the anchor
  node is removed. Slate should not import detached endpoints or parent collapse
  outside the editor as model selection. Existing controller contracts cover
  those import guards.

Closed one triple-click directionless selection packet as kept-existing:

- `wpt:triple-click-directionless-selection`
- Slate owner: `slate-browser`
- Source:
  `/Users/zbeyens/git/wpt/selection/selection-direction-on-triple-click.tentative.html`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/visual-native-selection-smoke.test.ts:263`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:960`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:999`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:1175`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/inlines.test.ts:1210`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts playwright/integration/examples/inlines.test.ts --project=chromium --grep "(inline triple-click paragraph selection matches native text|triple-clicking a paragraph that starts with a link selects the whole paragraph|triple-clicking through a read-only inline selects the whole paragraph|triple-click Backspace removes a paragraph that ends with a link|triple-click paste replaces a paragraph that ends with a link)"`
- Scope: WPT asserts native triple-click selection direction is `none`. Slate
  imports anchor/focus endpoints and proves triple-click selected text, no double
  highlight, and follow-up edit commands; it does not require
  `selection.direction` as an import authority.

Closed horizontal caret move-up/down as kept-existing and deferred vertical
writing-mode caret movement:

- `wpt:horizontal-caret-position-moveupdown`
- Slate owner: `slate-browser`
- Source:
  `/Users/zbeyens/git/wpt/selection/caret-position-should-be-correct-while-moveup-movedown.html`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/richtext.test.ts:3753`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/richtext.test.ts:3815`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/images.test.ts:1361`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/code-highlighting.test.ts:234`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/images.test.ts playwright/integration/examples/code-highlighting.test.ts --project=chromium --grep "(keeps ArrowDown then ArrowRight in the browser-selected paragraph|keeps DOM caret synced after ArrowUp across paragraphs|keeps vertical arrow movement into an image synchronized|keeps ArrowDown navigation stable through a single-line code block)"`
- Deferred:
  - `wpt:vertical-writing-mode-caret-position`
- Scope: Horizontal writing-mode caret movement is covered. WPT also tests CSS
  `writing-mode: vertical-lr` and `vertical-rl`; Slate v2 does not currently
  declare vertical writing-mode editing as supported behavior. Do not claim that
  from ordinary horizontal ArrowUp/ArrowDown proof.

## User-Select Editable Click Movement

Promoted Slate-owned route proof from WPT's editable `user-select` click
movement invariant:

- `wpt:user-select-editable-click-movement`
- Slate owner: `slate-browser`
- Source:
  `/Users/zbeyens/git/wpt/selection/user-select-on-input-and-contenteditable.html`
- Test:
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:174`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "click selection moves through editable user-select overrides"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "(click selection moves through editable user-select overrides|Shift\\+click extends a collapsed text selection|clicking inside selected text collapses the selection|pastes at the clicked caret after Shift state is released)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=webkit --grep "click selection moves through editable user-select overrides"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-browser typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Scope: The plaintext route now proves `auto`, `text`, `none`, `contain`, and
  `all` CSS `user-select` values do not block a pointer click from moving Slate
  model selection and native DOM selection to the clicked text offset.

## User-Select None Placeholder Serialization

Promoted Slate-owned proof from WPT's `Selection.toString()` exclusion for
`user-select:none` content:

- `wpt:user-select-none-placeholder-serialization`
- Slate owner: `slate-browser`
- Source:
  `/Users/zbeyens/git/wpt/selection/toString-user-select-none.html`
- Test:
  `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/placeholder.test.ts:46`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/placeholder.test.ts --project=chromium --grep "excludes placeholder text from native selected text"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/placeholder.test.ts --project=chromium --grep "(keeps an empty editor value and start selection while showing a placeholder|excludes placeholder text from native selected text|undoes typing from the custom placeholder empty state)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/placeholder.test.ts --project=webkit --grep "excludes placeholder text from native selected text"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun --filter ./packages/slate-browser typecheck`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun lint:fix`
- Scope: Slate owns placeholder text as overlay UI, not model content. Native
  select-all in the empty custom-placeholder route now proves the visible
  placeholder does not leak into native selected text, Slate selected text, or
  model text.
- Invalid-skip:
  `wpt:user-select-none-drag-extension` remains browser/CSS-layout-owned unless
  Slate intentionally renders real model text inside CSS `user-select:none`
  islands and expects native drag-selection semantics across them.

## Delete And Paste Input Events

Closed WPT input-events delete/paste pressure against existing Slate-owned
contracts:

- `wpt:forward-delete-target-ranges`
- `wpt:selected-delete-inputtype-content`
- `wpt:contenteditable-paste-event-data-null`
- Slate owner: `slate-browser` / `slate-react`
- Sources:
  - `/Users/zbeyens/git/wpt/input-events/input-events-get-target-ranges-forwarddelete.tentative.html`
  - `/Users/zbeyens/git/wpt/input-events/input-events-delete-selection.html`
  - `/Users/zbeyens/git/wpt/input-events/contenteditable-insertfrompaste-type-inputevent-data.html`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:1548`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:1690`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/plaintext.test.ts:1811`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/editing-kernel-contract.ts:344`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "(applies delete target ranges over multi-code-unit graphemes exactly|applies delete target ranges over preserved repeated spaces exactly|applies deleteWord target ranges over tab whitespace exactly)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/model-input-strategy-contract.test.ts -- -t "deletes the selected fragment|refreshes selection-dependent delete commands"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/editing-kernel-contract.test.ts -- -t "beforeinput insertFromPaste prefers contenteditable dataTransfer over event data"`
- Scope: Slate proves target-range application and selected-fragment deletion.
  The exact native `inputType` string for modifier delete keys is browser-owned;
  Slate consumes the event command and keeps content behavior correct.

## Empty Host And Collapse Scope

Closed WPT empty-host caret pressure against existing Slate empty-editor and
zero-width contracts, while rejecting raw DOM-only selection shapes:

- `wpt:invisible-br-empty-host-caret`
- Slate owner: `slate-browser` / `slate-react`
- Sources:
  - `/Users/zbeyens/git/wpt/selection/caret/editing-host-has-only-invisible-br.html`
  - `/Users/zbeyens/git/wpt/selection/caret/empty-elements.html`
  - `/Users/zbeyens/git/wpt/selection/contenteditable/collapse.html`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/placeholder.test.ts:26`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/placeholder.test.ts:46`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/primitives-contract.test.tsx`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/rendered-dom-shape-contract.test.tsx`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/placeholder.test.ts --project=chromium --project=webkit --grep "(keeps an empty editor value and start selection while showing a placeholder|excludes placeholder text from native selected text)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/primitives-contract.test.tsx test/rendered-dom-shape-contract.test.tsx -- -t "ZeroWidthString renders line-break placeholders without FEFF by default|empty blocks still render one line-break placeholder|EditableText passes overlay defaults to custom placeholder renderers"`
- Invalid-skips:
  - `wpt:empty-element-native-range`: Slate points target text leaves, not empty
    element DOM points.
  - `wpt:selection-collapse-arbitrary-editing-hosts`: raw DOM focus transfer
    across arbitrary contenteditables is browser-owned unless it manifests as a
    Slate root import failure.

## Selectionchange After Delete

Closed WPT selectionchange-after-delete pressure against Slate-owned deletion
and selectionchange import contracts:

- `wpt:selectionchange-after-inline-delete`
- Slate owner: `slate` / `slate-react`
- Sources:
  - `/Users/zbeyens/git/wpt/selection/fire-selectionchange-event-on-pressing-backspace.html`
  - `/Users/zbeyens/git/wpt/selection/fire-selectionchange-event-on-deleting-single-character-inside-inline-element.html`
  - `/Users/zbeyens/git/wpt/selection/onselectionchange-on-document.html`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate/test/snapshot-contract.ts`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react/test/selection-controller-contract.test.ts`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts --test-name-pattern "delete/point/inline|delete/selection/inline|current non-empty selection across adjacent mixed-inline"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react && bun test:vitest test/selection-controller-contract.test.ts -- -t "native editor-owned selectionchange clears model preference before DOM import|repair-induced selectionchange clears its origin after model repair|native selectionchange clears its origin after import handling"`
- Scope: Slate proves inline/range deletion and selectionchange ownership/import
  behavior. Exact browser document-level selectionchange scheduling and event
  counts are browser-owned, so `wpt:selectionchange-document-scheduling` is
  invalid-skip unless a Slate route drops or duplicates an import.

## Bidi Line-Boundary Navigation

Deferred WPT bidi line-boundary pressure:

- `wpt:bidi-lineboundary-selection-modify`
- Slate owner: `slate-plan` / `slate-browser`
- Source:
  `/Users/zbeyens/git/wpt/selection/bidi/modify.tentative.html`
- Current Slate proof found:
  - RTL text-unit package coverage exists.
  - Shadow DOM RTL deletion route coverage exists.
  - String coordinate placement has RTL physical-edge mapping coverage.
- Gap: no Slate route or law currently proves mixed bidi line-boundary
  `Selection.modify("extend", left/right, "lineboundary")` parity.
- Status: `deferred-with-owner`. Do not claim mixed bidi line-boundary
  navigation until `slate-plan` decides the expected Slate behavior and
  `slate-browser` adds route proof.

## Selection Extend And Shadow DOM

Closed WPT shadow-tree `Selection.extend()` pressure against Slate-owned shadow
selection import/export proof:

- `wpt:selection-extend-shadow-tree`
- Slate owner: `slate-browser` / `slate-dom`
- Sources:
  - `/Users/zbeyens/git/wpt/selection/extend-selection-in-shadow-tree.html`
  - `/Users/zbeyens/git/wpt/selection/extend-00.html`
  - `/Users/zbeyens/git/wpt/selection/extend-exception.html`
- Tests:
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/shadow-dom.test.ts:145`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/shadow-dom.test.ts:178`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/playwright/integration/examples/shadow-dom.test.ts:221`
  - `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-dom/test/bridge.ts:313`
- Verification:
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/shadow-dom.test.ts --project=chromium --grep "(sets the native caret through slate-browser DOM helpers inside shadow DOM|keeps shadow DOM ArrowLeft movement model-owned inside the shadow root|deletes RTL text with Backspace inside shadow DOM)"`
  - `cd /Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-dom && bun test ./test/bridge.test.ts --test-name-pattern "preserves backward native selection direction"`
- Scope: Slate does not implement the browser Selection API. The broad
  `Selection.extend()` subset matrix and no-range exception are invalid-skip
  unless a Slate route fails to import/export an extended native selection.

## Next Search Shard

Continue WPT selection direction and beforeinput composition candidates only if
they map to a Slate-owned seam. Do not add generic WPT mirrors that do not
raise a Slate-specific oracle.
