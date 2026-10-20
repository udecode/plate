# Refuse DOM lookups into text the page has not caught up to

Status: landed with 2026-10-19-plite-lookup-proof-ledger.md, which took over its benchmarks
Playbook: bug-fix

## Brief

### What will change?

The public DOM range and point lookups read the page text they rely on and return nothing until it matches the editor. Before, they could land one edit behind. Plite's own input and selection code keeps the old lookups.

### What could go wrong?

An expanded range reads every text between its ends, so long ranges in huge documents cost more. A caller that resolves right after an edit can get nothing and must resolve again after paint. Budgets are frozen.

## Teach

After an edit, Plite writes plain text at once, while retained text flows paint a moment later and React re-renders new blocks and custom leaves. Listeners of the edit run in that gap and counted offsets into the old page.

Tracking owed paints and caching verified pages both failed review, because a remount or a direct page change leaves the document untouched. So each lookup reads the page itself. A point compares its text's page text with the editor's text. An expanded range reads each text between its two ends and checks that they match the editor's texts in order, and that each text missing from the page sits inside a block the app hides on purpose.

Only the public lookups check. During IME composition and Android input the browser writes text before the editor applies it, so Plite's input and selection code must map into that newer text. Checking there placed composed text one character late.

## Main changes

- `packages/plitejs/src/dom/plugin/dom-text-freshness.ts` reads a text's page text from every host the runtime's element map holds for its key, and checks an expanded range's texts between its endpoints' hosts. A host is identified by its node key, or by `data-editor-path` when it has none. Nothing is cached.
- A plain leaf reads as its single text node, without the trailing newline the renderer adds to a leaf that carries `data-editor-length`. A leaf split into several nodes reads as unreadable, because the point mapper reads one node per leaf. A zero-width leaf reads as empty, and as unreadable when it holds text besides its FEFF placeholder.
- `readDOMTextFlowHost` in `dom-text-flow-index.ts` reads a retained flow host in one walk. It refuses a host with text no segment owns. It reads a record as unreadable when its segments do not fill the bounds `resolveDOMTextFlowPoint` maps offsets through, when it resumes after another record began, when a segment's text past its bounds is anything but the display newline or FEFF, or when a string element holds text outside its direct text children. A point reads only its own record through `readDOMTextFlowKey`, which also refuses a record whose segments left the host or fell out of page order, so a point in a paragraph of many texts costs the same as in a paragraph of one.
- With `checkPageText`, `resolveDOMPointInRoot` returns `null` when the point's page text differs from the editor's text, and `resolveDOMRangeInRoot` returns `null` for an expanded range whose page texts do not match or whose end host comes before its start host. A root no runtime owns has no coverage record, so only the texts it shows are checked.
- Only the `editor.api.dom` binding passes `checkPageText`, and its `assertDOMPoint` and `assertDOMRange` throw wherever the checked lookups return `null`. The `DOMEditor` and `ReactEditor` statics, and the coordinate, vertical-selection and keyboard code that called the public binding, resolve without the check.
- `syncChangedTextToElement` in `use-plite-node-ref.tsx` hands a leaf to React instead of writing it when the leaf carries `data-editor-length`, the new text ends in a newline, or the leaf holds more than one node. Those are shapes only the renderer draws right.
- Three contract tests imported cyclic modules with `Promise.all` after `vi.resetModules()`, and Vitest handed one of them a half-built `ReactEditor` once the lookup gained a module. They now import in sequence.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What a lagging lookup returns | Nothing until the page catches up; Plite's own consumers already retry after their DOM commit, and public callers resolve again on their next render | Add a public signal that fires when the root catches up | catch-up signal | big |
| What an expanded range checks | Only the texts between its endpoints, read on every call | Cache a verified root until the next change, which review showed a remount defeats | range cache | small |
| Where the check runs | Only on the public lookups, because native input puts the page ahead of the editor on purpose and an editor-wide skip during composition let the stale read back in for other texts | Check every lookup and teach each native-input path to accept its own pending text | internal check | small |

## Steps

- [x] Add the freshness module and the flow host reader, gate points and expanded ranges in `dom-editor.ts`, hand renderer-only leaf shapes to React, and import the three contract tests' modules in sequence.
- [x] Contract tests in `packages/plitejs/test/react/dom-lookup-freshness-contract.test.tsx`, each failing at base for its own reason: a layout effect after a text insert, a commit listener, a selector over a custom leaf, a range across a paragraph whose text changed, a range across a removed and an inserted paragraph, a layout effect above the editable around an inserted paragraph, a remount not yet painted, page text the editor never applied, and text no flow segment owns. Each review round's criticals got a case that fails on the reviewed tree, such as a lookup in another paragraph during composition, a pending Android diff past the old segment end, a void whose flow host lost its text nodes and an assert during the paint gap. Must-accept cases pass on both: the read after the page catches up, a selection-only expanded range, and a custom leaf ending in a newline.
- [x] Chromium proof, IME cases included.
- [ ] Benchmark pre-acceptance probe, base against candidate, on the budgets frozen in the run directory: painted points on the flow, plain-leaf and segmented paths, repeated short ranges in a 1k-block document, and the first point, short range and select-all after an edit in a 10k-block document.

## Verification

- Each contract test fails at base for its own reason and passes after the build; the must-accept cases pass on both.
- The plitejs react suite passes apart from the kernel authority audit case, owned by suggested task t_c1908482.
- Chromium under Node 22 with forced proof and no retries: plaintext, richtext (IME composition included), huge-document (burst typing and arrows), code-highlighting, decorations-async, dom-integrity, external-text, search-highlighting, collaboration-demo, yjs-collaboration, placeholder, inlines, mentions, editable-voids, hidden-content-blocks, markdown-shortcuts and mobile-input-proxy.

## Open work

- The kernel authority audit case stays red at base. owner: suggested task t_c1908482. stop: that task lands or is dropped.
- A native insert into a retained flow refuses lookups on that text until the flow owner commits, because the old segment bounds no longer describe the page, even where an interior offset would still map right. owner: zbeyens. stop: a suggested task moves the flow bounds with native input.
- Plite's internal lookups keep the base behavior, so selection export, IME, Android and keyboard code can still map into page text that lags the editor. They run after paint or during native input. owner: zbeyens. stop: a design that tells native input ahead of the editor from a paint still owed.
- `isDOMTextFlowSegmentSynchronized` and `resolveDOMTextFlowRecordDOMText` still read a flow segment by the old rules, so a shape the lookup refuses can still count as synchronized for direct text sync. owner: zbeyens. stop: one segment reader shared by all three.
- A void child drawn as a zero-width placeholder with a length, the shape `editable-text-blocks.tsx` draws for a void with child text, reads as empty text, so a public lookup into it, or an expanded range across it such as select-all, returns `null` for as long as the child text is not empty. The default and a custom leaf both draw the void's text in a flow host, so no case covers it. owner: zbeyens. stop: a renderer that draws that shape gets a contract case.
- `resolveDOMPoint` ignores `point.root` and resolves in the editor's main root. The base does the same. owner: zbeyens. stop: a suggested task routes a point to its own root.
- Android keeps typed text in the page ahead of the editor between flushes. No Android device runs here, so whether a lookup in that window now refuses is unproven. owner: zbeyens. stop: an Android device run of the input specs.
- `resolveRangeRect`, `resolveVisualPoint` and `useSelectionGeometry` read through the unchecked lookups, so a rect in the paint gap can still come from old text. owner: zbeyens. stop: a suggested task decides whether rects take the check, which would also refuse during IME composition.
- The registry `lint.tsx` popover falls back to an empty rect when `resolveDOMRange` returns `null`, so during composition in an unpainted lint mark its anchor can jump to the viewport origin. Not run. owner: zbeyens. stop: the lint popover keeps its last rect.
- A point on a retained flow reads only its own record, so text no segment owns elsewhere in that host does not refuse it. The point maps only into its own segments. An expanded range still refuses such a host. owner: zbeyens. stop: a case where foreign text moves a point's own mapping.
