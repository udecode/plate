# Wordgard Plite final extraction browser proof

Owner:
Slice 12 interactive closure for
`docs/plans/2026-07-19-wordgard-plite-final-extraction-execution.md`.

Surfaces:

- Static `apps/plite` proof app at `http://localhost:3102`, built from the
  current `apps/www` Plite examples.
- `apps/www` registry demos at `http://localhost:3103`.

Tool policy:

- Use the in-app Browser for ordinary route navigation, DOM assertions,
  keyboard interaction, route-local `DataTransfer` paste, console capture, and
  screenshots.
- Use Chrome for the required native copy, cut, paste, and system-clipboard
  proof on `/examples/plite/plaintext`.
- Use Computer Use only if a native Chrome or OS surface cannot be inspected
  through Chrome. Do not replace the native clipboard row with a synthetic
  clipboard event.

Status:
Pending source freeze, final builds, and interactive execution. Every evidence
cell stays pending until that exact route has been exercised.

## `apps/plite` Browser matrix

| Route | Action | Expected visible outcome | Console/server requests | Visual proof | Status |
| --- | --- | --- | --- | --- | --- |
| `/examples/plite/richtext` | Select text in the first editor block, click `[data-test-id="mark-button-bold"]`, type `!`, then undo | The selection renders in `<strong>`, typing lands at the visible caret, and undo restores the prior text without losing focus | Pending | Pending | pending |
| `/examples/plite/paste-html` | Dispatch route-local `text/html` through the mounted textbox with `<h1>Paste heading</h1><p><strong>Bold leaf</strong></p>`, then type `!` | A heading and bold leaf render as fitted editor nodes; follow-up typing remains editable | Pending | Pending | pending |
| `/examples/plite/tables` | Collapse the selection after `9` in the last table cell, then type `X` | The table remains intact, the last cell reads `9X`, and no extra root block appears | Pending | Pending | pending |
| `/examples/plite/multi-root-document` | Edit `#multi-root-header`, `#multi-root-body`, `#multi-root-footer`, and `[aria-label="Document title"]`, then use the document undo and redo buttons | Each named root/status updates independently; title state commits; undo and redo do not move content across roots | Pending | Pending | pending |
| `/examples/plite/yjs-collaboration` | Click `[data-test-id="yjs-peer-a-insert-text"]`, then inspect both peer surfaces | The local edit appears in the connected peer and both collaboration surfaces remain mounted | Pending | Pending | pending |
| `/examples/plite/shadow-dom` | Focus the textbox inside `[data-cy="outer-shadow-root"]` and type a marker | Text changes inside the shadow-owned editor; focus and selection remain inside that root | Pending | Pending | pending |
| `/examples/plite/huge-document?blocks=100&strategy=staged` | Confirm staged controls and metrics, type in a mounted block, scroll `#huge-document-editor`, then type again | The staged strategy remains active, mounted-block metrics are nonzero, edits survive scrolling, and the visible editor window has no blank or overlapping blocks | Pending | Pending | pending |
| `/examples/plite/pagination` | Focus `[data-plite-paged-editable]` inside `[data-testid="pagination-viewport"]`, type a marker, scroll across a page boundary, then continue typing | Pages remain visually separated, caret ownership survives the scroll, and content does not overlap or jump to another page | Pending | Pending | pending |

## `apps/www` Browser matrix

| Route | Action | Expected visible outcome | Console/server requests | Visual proof | Status |
| --- | --- | --- | --- | --- | --- |
| `/blocks/basic-marks-demo` | Confirm rendered strong, emphasis, and underline marks; collapse the selection, press `Meta+B`, and type a marker | Existing marks render correctly and the marker is inserted with bold active at the visible caret | Pending | Pending | pending |
| `/blocks/indent-demo` | Focus the paragraph beginning `Easily control`, confirm `margin-left: 24px`, press `Tab`, then `Shift+Tab` | The paragraph moves from 24px to 48px and back to 24px without losing focus | Pending | Pending | pending |
| `/blocks/table-demo` | Focus the first body cell, dispatch a route-local 2x2 HTML-table paste, then type in the final pasted cell | The pasted table is fitted into the editor, keeps its 2x2 structure, and the final cell remains editable | Pending | Pending | pending |
| `/blocks/media-demo` | Change the first caption textarea from `Image caption` to `Image caption browser` | The media stays mounted and the visible caption reads `Image caption browser` | Pending | Pending | pending |
| `/blocks/list-demo` | Place the caret after `Disc 1`, press `Enter`, and type `Browser list` | A new list item containing `Browser list` appears beneath `Disc 1` | Pending | Pending | pending |
| `/blocks/list-classic-demo` | Place the caret after `Dogs`, press `Enter`, type `Foxes`, then press `Tab` | `Foxes` is created as a new classic-list item and indents without corrupting adjacent items | Pending | Pending | pending |
| `/blocks/code-block-demo` | Place the caret after the first JavaScript line, press `Enter`, and type `// Browser`; inspect the first `pre` and language combobox | The comment appears on a new code line, the first code block remains a `pre`, and the combobox reads `JavaScript` | Pending | Pending | pending |
| `/blocks/discussion-demo` | Assert `ins.plite-suggestion`, `del.plite-suggestion`, and `.plite-comment`, then click a suggestion and a comment | Insertions, deletions, and comments render; their interactive surfaces open without unmounting the editor | Pending | Pending | pending |
| `/blocks/ai-demo` | Focus the editor, press `Meta+J`, inspect the `Ask AI anything...` input, then press `Escape` without submitting | The AI command surface opens with the expected input and closes cleanly without issuing an AI request | Pending | Pending | pending |
| `/blocks/link-demo` | Click the `hyperlinks` link, choose `Edit link`, fill the `Paste link` field, then press `Enter` | The link editor opens, accepts the value, closes on submit, and the editor remains interactive | Pending | Pending | pending |

## Native Chrome clipboard matrix

| Route | Action | Expected visible outcome | Console/server requests | Native proof | Status |
| --- | --- | --- | --- | --- | --- |
| `/examples/plite/plaintext` | In Chrome, select offsets 8–16 (`editable`), press native `Meta+C`, read the system clipboard, press native `Meta+X`, then native `Meta+V` | Clipboard text is exactly `editable`; cut changes the editor to `This is  plain text, just like a <textarea>!`; paste restores the original sentence | Pending | Pending | pending |

## Evidence ledger

- In-app Browser binding and tab: pending
- Chrome binding and tab: pending
- `apps/plite` build and static server: pending
- `apps/www` development server: pending
- Route screenshots: pending
- Browser console errors: pending
- Chrome console errors: pending
- Failed-request proof: pending. Record server-side 4xx/5xx responses together
  with Browser and Chrome console output; the Browser binding does not expose a
  request-event API.
- Native system-clipboard value: pending
- Browser and Chrome tab finalization: pending

## Result

Pending.
