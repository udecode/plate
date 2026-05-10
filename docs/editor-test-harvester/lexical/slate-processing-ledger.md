# Lexical To Slate Processing Ledger

source report: [report.md](./report.md)
source inventory: [inventory.md](./inventory.md)
source test index: [test-index.md](./test-index.md)
plan: [Slate v2 Lexical Harvest Test Processing Ralplan](../../plans/2026-05-09-slate-v2-lexical-harvest-test-processing-ralplan.md)
status: done
generated_at: 2026-05-09
consolidated_at: 2026-05-09

## Verdict

This pass accounts for every live Lexical inventory row at file granularity: 271
inventory rows, 137 runnable portable/portable-mixed files, and 1996 indexed
test/describe/it line pointers.

The consolidation rerun found no new Lexical files, no removed Lexical files, no
portable files missing from the index, no stale index files, and no unresolved
top-level `create-new`, `copy-now`, or `refactor-existing` source rows in the
selected apply lane.

The selected non-table apply lane is closed. Remaining rows are explicit
future-owner deferrals: table model/navigation, raw mobile/device proof,
slate-yjs collaboration browser proof, HR/block-void behavior, drag/drop, and
optional extension/state/update-metadata/memory rows if those owners are
accepted. Residual plugin/product rows are `plate-owned` when the right target
is a Plate package, kit, example, docs page, or backlog item rather than raw
Slate v2.

Do not copy Lexical tests one-for-one. Keep the invariant, steal the strongest
proof shape, and reject Lexical internals.

## Status Vocabulary

| Status | Meaning |
| --- | --- |
| `already-applied` | The selected Lexical apply lane already added or strengthened the matching Slate v2 proof. |
| `covered` | Current Slate v2 has a good enough proof row; no action unless a later audit finds drift. |
| `refactor-existing` | Strengthen, split, rename, or broaden current Slate tests. Prefer this over duplicates. |
| `create-new` | Add a new Slate v2 unit/browser row. |
| `defer` | Valid behavior, but it needs raw device, yjs browser, table model, or a later accepted owner. |
| `plate-owned` | Valid behavior, but it should fit Plate, not raw Slate. Name the likely Plate package/docs/example/backlog owner. |
| `reject` | Not a portable raw Slate behavior target. |

## Current Slate Owners

| Owner | Path |
| --- | --- |
| Core model and query invariants | `../slate-v2/packages/slate/test` |
| Clipboard model/DOM contracts | `../slate-v2/packages/slate/test/clipboard-contract.ts`, `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts` |
| Text units | `../slate-v2/packages/slate/test/text-units-contract.ts` |
| Input runtime policy | `../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts` |
| DOM repair policy | `../slate-v2/packages/slate-react/test/dom-repair-policy-contract.ts` |
| Browser stress rows | `../slate-v2/playwright/stress/generated-editing.test.ts` |
| Paste HTML browser corpus | `../slate-v2/playwright/integration/examples/paste-html.test.ts` |
| Plaintext browser input transport | `../slate-v2/playwright/integration/examples/plaintext.test.ts` |
| Rich text browser behavior | `../slate-v2/playwright/integration/examples/richtext.test.ts` |
| Table browser containment | `../slate-v2/playwright/integration/examples/tables.test.ts` |
| Mentions/inline atom browser behavior | `../slate-v2/playwright/integration/examples/mentions.test.ts` |
| Collaboration/history substrate | `../slate-v2/packages/slate/test/collab-history-runtime-contract.ts`, `../slate-v2/packages/slate-history/test/history-contract.ts` |

## Plate-Owned Residual Routing

| Residual family | Status | Plate owner | Raw Slate split |
| --- | --- | --- | --- |
| Link/autolink grammar, nested-link policy, unlink/relink UI, link styling, autolink parser/tokenizer matrices | `plate-owned` | Plate link/autolink package, examples, docs, or backlog | Inline boundary, paste, and safe link insertion rows are already covered separately. |
| List/checklist indentation, empty-item exit, ordered metadata, checklist ARIA, list toolbar policy | `plate-owned` | Plate list/checklist packages and list docs | Structural list fragments, wrappers, and path/query behavior stay in Slate v2. |
| Markdown import/export, transformer grammar, MDX/custom transformers, markdown-link policy, code-fence serializer UX | `plate-owned` | Plate markdown serializer/transformer package and docs | Markdown shortcut browser rows stay in Slate v2. |
| Mention/hashtag/keyword/date-time/emoji/equation/media plugin grammar and styling | `plate-owned` | Plate feature packages and examples | Decoration, inline atom, void, and markable-void substrate proofs stay in Slate v2. |
| React Composer, typeahead, nested composer, menu, plugin host, toolbar/product shell behavior | `plate-owned` when reusable | Plate React/plugin ergonomics, kits, and examples | No raw Slate target unless a framework-agnostic invariant is split out. |

## Processing Rows

### Core Package Behavior

| Source | Status | Slate owner | Next decision |
| --- | --- | --- | --- |
| `../lexical/packages/lexical-code-shiki/src/__tests__/unit/LexicalCodeNodeTabs.test.ts` | `already-applied` for Slate code-highlighting Tab behavior; `reject/defer` for Lexical command matrix | `../slate-v2/playwright/integration/examples/code-highlighting.test.ts` | Source-read complete with the matching `lexical-code` tab suite. Added browser proof that Tab inside a Slate code line inserts the example's configured spaces and advances the caret. Lexical `INDENT_CONTENT_COMMAND`/`OUTDENT_CONTENT_COMMAND`, backward-selection preservation matrix, Shiki tokenizer/theme loading, node class APIs, and product command dispatch stay out or require a future accepted code-block indent owner. |
| `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts` | `already-applied` for Slate code-highlighting multi-line indent/outdent; `reject/defer` for Lexical code-node internals | `../slate-v2/playwright/integration/examples/code-highlighting.test.ts`, `../slate-v2/site/examples/ts/code-highlighting.tsx` | Source-read complete. Added browser proof that Tab and Shift+Tab indent/outdent every selected Slate code line, and updated the example handler so collapsed Tab still inserts configured spaces while expanded code-line selections update line starts. Lexical constructor/createDOM/updateDOM/exportJSON, code language metadata policy, tokenizer/highlighter transform policy, command dispatch APIs, Alt+Arrow line shifting, Home/End visual-caret policy, node keys, raw mobile, collaboration, table-model, and issue claims stay out. |
| `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNodeTabs.test.ts` | `already-applied` for Slate code-highlighting Tab behavior; `reject/defer` for Lexical command matrix | `../slate-v2/playwright/integration/examples/code-highlighting.test.ts` | Same tab matrix as the Shiki package without Shiki loading. The accepted Slate behavior is the code-highlighting example's Tab-to-configured-spaces browser row. Lexical indent/outdent command semantics, backward-selection matrix, and code node class policy stay out unless a future code-block indent owner accepts them. |
| `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx` | `already-applied` for accepted Slate history rows; `reject/defer` for Lexical command/shared-history internals | `../slate-v2/packages/slate-history/test/history-contract.ts` | Source-read complete. Added history package proofs that a new edit after undo clears redo history, selected block property changes undo and redo cleanly, and no-op updates are ignored while node property commits are undoable. Existing rows cover insert grouping, push/merge/skip metadata, composition merge/skip, restored selections, structural batches, delete/insertBreak/move undo, and custom props. Lexical CAN_UNDO/CAN_REDO command notifications, CLEAR_HISTORY command shape, shared parent/nested editor state, node-key/node-selection internals, React harness details, raw mobile, collaboration, table-model, and issue claims stay out. |
| `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts` | `already-applied` for selected-fragment clipboard export and paragraph alignment import; `reject/defer` for standalone HTML serializer and custom node export APIs | `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`, `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/site/examples/ts/paste-html-import.ts` | Source-read complete. Current Slate DOM clipboard contracts already prove selected-fragment payload export/import, and paste-html browser proof already covers legacy `align`, CSS `text-align` precedence, and invalid align rejection. Lexical `$generateHtmlFromNodes` as a standalone full-editor HTML serializer, node class `exportDOM`/`importDOM`, and custom DocumentFragment export APIs stay out until a generic Slate HTML serializer owner exists. |
| `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts` | `already-applied` for public path/list ancestry behavior; `reject` for Lexical helper API shape | `../slate-v2/packages/slate/test/query-contract.ts` | Source-read complete. Added package proof that public `Path`/`Node` queries expose nested list depth, non-root top list ancestry, descendant list ancestors, and terminal/non-terminal list-item paths. Lexical `$getListDepth`, `$getTopListNode`, `$isLastItemInList`, command APIs, list class APIs, extension wiring, DOM serializer shape, raw mobile, collaboration, table-model, and issue claims stay out. |
| `../lexical/packages/lexical-playground/__tests__/regression/231-empty-text-nodes.spec.mjs` | `already-applied` for token-like destructive delete; `reject` for hashtag/plugin/CSS/collab harness | `../slate-v2/packages/slate/test/delete-contract.ts`, normalization/leaf lifecycle/rendered DOM owners | Source-read complete. Added package proof that repeated Backspace through token-like marked text collapses to a canonical empty block with selection at `[0, 0]` offset `0`. Existing lifecycle owners cover empty block anchors and invalid empty leaf cleanup. |
| `../lexical/packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs` | `already-applied` for markdown-created adjacent list merge | `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`, `../slate-v2/site/examples/ts/markdown-shortcuts.tsx` | Source-read complete. Added browser proof that a markdown-created list immediately before an existing list becomes one list with `two` before `one`; the example now merges adjacent bulleted-list wrappers after applying the list shortcut. |
| `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs` | `defer` | table model owner | Depends on table/column selection model; do not hide under generic selection tests. |
| `../lexical/packages/lexical-playground/__tests__/regression/4697-repeated-table-selection.spec.mjs` | `defer` | table model owner | Same table selection model boundary as #2558. |
| `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts` | `already-applied` for heading Enter behavior; `reject` for class/DOM API rows | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx`, core split/transform owners | Source-read complete. Browser proof covers middle heading split, heading-end paragraph insertion, and empty-heading paragraph insertion. The richtext example handles end/empty paragraph-after policy while core split covers middle split. Constructor/createDOM/updateDOM/setTag/$create/$is/node key/theme rows stay out. |
| `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts` | `already-applied` for empty blockquote Enter behavior; `reject` for class/DOM API rows | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx` | Source-read complete. Browser proof covers Enter in an empty blockquote creating a paragraph after the quote. Constructor/createDOM/updateDOM/$create/node key/theme rows stay out. |
| `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts` | `already-applied` for selected text fragment slicing; `reject` for helper API internals | `../slate-v2/packages/slate/test/clipboard-contract.ts` | Source-read complete. Package proof now covers a selection spanning unmarked and bold text leaves, returning sliced fragment leaves without mutating source text. Lexical helper API shape, node keys, token/segmented internals, DOM/browser transport, raw mobile, collaboration, table-model, and issue claims stay out. |
| `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsInsertNodeToNearestRoot.test.tsx` | `already-applied` for highest-block insertion; `covered`/`reject` for the rest | `../slate-v2/packages/slate/test/transforms-contract.ts`, insertNodes fixtures | Source-read complete. Added direct package proof that `insertNodes` with `mode: 'highest'` splits the highest selected block and inserts the block node at the root level. Existing insertNodes path/block/selection fixtures cover paragraph middle/start/end, empty paragraph, root start/child/end, and default selection insertion rows. Lexical command dispatch, node keys, decorator node class shape, shadow-root wording, and list HTML specifics stay out or route to list/plugin owners. |
| `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsSplitNode.test.tsx` | `already-applied` for root split rejection; `covered` for split rows | `../slate-v2/packages/slate/test/transforms-contract.ts`, splitNodes fixtures, operations contracts | Source-read complete. Added public transform proof that `Editor.splitNodes` rejects the editor root with a direct root-split error instead of leaking an internal root-path error. Existing splitNodes fixtures and operation/snapshot contracts cover paragraph middle/start/end, multi-text element split, nested block split, highest-mode ancestor split, marks/property preservation, selection rebase, and root operation rejection. Lexical node keys, `$splitNode` helper API, HTML output shape, and list-specific DOM rows stay out or route to list/plugin owners. |

### Serialization, Parsing, Marks, And Rich Text

| Source | Status | Slate owner | Next decision |
| --- | --- | --- | --- |
| `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts` | `already-applied` for non-empty list-item split; `defer/reject` for plugin-policy and Lexical internals | `../slate-v2/packages/slate/test/snapshot-contract.ts`, existing list fragment/delete owners | Source-read complete. Package proof now covers `insertBreak` inside a non-empty list item splitting the item while preserving the list wrapper. Lexical class/DOM/update/create/type-guard/export rows stay rejected; replace/remove nested-list normalization, indent/style inheritance, and ordered-list restart policy stay deferred to explicit list-plugin/model owners. |
| `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts` | `already-applied` for numbered-list wrapper creation; `defer/reject` for plugin-policy and Lexical internals | `../slate-v2/packages/slate/test/snapshot-contract.ts`, existing list fragment/query owners | Source-read complete. Package proof now covers converting selected top-level blocks to list items and wrapping them in a numbered-list wrapper. Lexical class/DOM/depth classes/update/create/type-guard/subclass rows stay rejected; append/splice coercion, checklist role cleanup, and list-value transforms stay deferred to explicit list-plugin/model owners. |
| `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts` | `plate-owned/reject` | Plate list/checklist package if extension ergonomics are accepted | Lexical extension wiring is not raw Slate. Reopen only for Plate list/plugin ergonomics or if a framework-agnostic list invariant is split out. |
| `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts` | `covered/plate-owned/reject` | `../slate-v2/packages/slate/test/snapshot-contract.ts`, markdown/richtext/browser list owners, Plate list-exit/list-normalization/list-indent owners | Source-read complete. Existing Slate owners cover root list formatting, numbered/bulleted wrapper creation, and non-empty list continuation. Empty-list-item exit/split, whitespace-only exit, decorator-list extension, table-cell insertion, strict subclass preservation, and indent/outdent helper behavior are Plate plugin/model/table/product policies unless a raw invariant is split out. |
| `../lexical/packages/lexical-list/src/__tests__/unit/registerListStrictIndentTransform.test.ts` | `covered/defer` | `../slate-v2/playwright/integration/examples/paste-html.test.ts`, future list-normalization/HTML serializer owner | Source-read complete. Existing paste-html browser corpus already covers compact malformed nested-list HTML import. Lexical's exact strict indentation rewrite and `$generateHtmlFromNodes` output shape stay deferred until Slate accepts a list-normalization or generic HTML serializer owner. |
| `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts` | `covered/plate-owned/reject` | `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`, Plate markdown serialization/shortcut owner | Source-read complete. Current Slate v2 has markdown shortcut and preview examples, not a markdown import/export package. Heading/list/quote shortcut behavior is already covered by browser examples; broad import/export, normalization, nested fences, whitespace, hard breaks, link/mark escaping, MDX/custom transformers, list-marker metadata, checklist, and code-fence Enter behavior are Plate markdown owner rows unless a raw shortcut invariant is split out. |
| `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts` | `plate-owned/reject` | Plate markdown-link transformer owner; existing inline-link clipboard/browser owners for adjacent raw behavior | Source-read complete. The file tests Lexical markdown link transformer behavior: preserving text before a parsed markdown link, avoiding greedy matches, and not creating a markdown link inside an existing link. Current Slate v2 has raw inline-link boundary and clipboard proofs; markdown-link parser/serializer policy belongs in Plate. |
| `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs` | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx` | Source-read complete. Added richtext clear-formatting browser proof and example command for selected mark removal plus block alignment reset while preserving blockquote structure. Link, mention, hashtag, indent/outdent, toolbar-shell styling, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs` | `already-applied` for selected paragraph-to-code-block conversion and existing code-line editing rows; `defer/reject` for residual code-fence/navigation/product rows | `../slate-v2/playwright/integration/examples/code-highlighting.test.ts`, `../slate-v2/site/examples/ts/code-highlighting.tsx`, `../slate-v2/packages/slate/test/snapshot-contract.ts` | Source-read complete. Added browser proof that selecting paragraph text and using the code-block control creates a code block with code-line content while preserving existing code blocks. Existing code-highlighting rows cover Enter, collapsed Tab, and selected multi-line Tab/Shift+Tab. Markdown code fences, language parser matrix, line movement, visual-caret navigation, theme DOM, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs` | `already-applied` for empty-paragraph center alignment; `defer/reject` for link+indent/product rows | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx`, future link/block-format and indent owners | Source-read complete. Added richtext browser proof that a fresh empty paragraph can be center-aligned from the toolbar while preserving collapsed selection. The richtext example now targets the containing block explicitly for collapsed alignment. Lexical link+indent exact row stays deferred because current Slate has no combined link/block-format owner and no indent owner; toolbar shell/theme rows stay rejected. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsBackspaceAtStart.spec.mjs` | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts` | Source-read complete. Added browser proof that Backspace at offset `0` of the first heading is a no-op: the heading text, heading element, and collapsed selection stay intact. Lexical Playground setup, toolbar shell, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterAtEnd.spec.mjs` | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx` | Source-read complete. Existing richtext browser proof covers Enter at the end of a heading converting the next block to a paragraph while preserving the heading. The richtext example owns this through `handleExitBlockEnter`. Lexical Playground setup, toolbar shell, theme DOM, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterInMiddle.spec.mjs` | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts` | Source-read complete. Existing richtext browser proof covers Enter in the middle of a heading splitting it into two headings. Lexical Playground setup, toolbar shell, theme DOM, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs` | `covered/defer/reject` | existing code-highlighting and list outdent owners; future paragraph/list/table indent owner | Source-read complete. Existing Slate rows cover code-line Tab/Shift+Tab and basic list outdent model flow. Paragraph/table indent depth, max-depth caps, nested list indent limits, negative indent import/outdent cleanup, and toolbar shell stay deferred or rejected until Slate accepts an indent/list/table policy owner. |
| `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs` | `already-applied` for toolbar list toggle/conversion; `covered/plate-owned/reject` for residual list-plugin policy | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/packages/slate/test/snapshot-contract.ts`, Plate list-plugin/list-exit/list-indent owners | Source-read complete. Added richtext browser proof that selected blocks can be turned into a bulleted list, toggled back to paragraphs, turned into a numbered list, and converted back to a bulleted list from the toolbar. Existing snapshot/browser owners cover basic list wrapper creation, numbered/bulleted list formatting, non-empty list continuation, and markdown-created adjacent list merge. Checklist, indent/outdent depth, empty-item exit, list collapse-at-start, ordered start metadata, format-menu list splitting, autolink/list policy, and exact Lexical DOM output are Plate list/product rows unless a raw invariant is split out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs` | `already-applied` for ordered-list start shortcut; `covered/defer/reject` for residual markdown transformer policy | `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`, `../slate-v2/site/examples/ts/markdown-shortcuts.tsx`, future markdown serializer/transformer owners | Source-read complete. Added browser proof and example support for numeric ordered-list markdown shortcuts such as `25. `, preserving the rendered `<ol start="25">`. Existing markdown-shortcuts rows cover headings, blockquote, bulleted lists, list continuation, and adjacent markdown-created list merge. Markdown import/export cycles, inline text transformers, emoji/image/equation decorators, code-formatted text transformer exclusions, selection-after-link-transform, list-marker export/copy, HR, code fences, raw mobile, collaboration, table-model, and theme DOM output stay deferred or rejected until explicit future owners accept them. |
| `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs` | `already-applied` for mark hotkey insertion/toggle-off; `covered/defer/reject` for residual product formatting | `../slate-v2/packages/slate/test/snapshot-contract.ts`, `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx`, future typography/product owners | Source-read complete. Added package proof that `Editor.toggleMark` and `tx.marks.toggle` clear inherited collapsed marks before the next insertion. Fixed `tx.marks.toggle` default value and richtext hotkey default prevention. Added browser proof that bold, italic, underline, and code hotkeys create formatted inserted text and clear active marks before subsequent text. Existing owners cover expanded mark add/remove, toolbar bold, clear formatting, warm toolbar mark selection, mark click/caret gauntlets, and partial selected-mark clearing. Capitalization, font-size/family, date-time/decorator formatting, toolbar active-state CSS, raw mobile, collaboration, table-model, and Lexical DOM output stay deferred or rejected until explicit future owners accept them. |
| `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs` | `already-applied` for heading-start paragraph insertion and marked-boundary Enter; `covered/defer/reject` for residual text-entry rows | `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`, `../slate-v2/site/examples/ts/markdown-shortcuts.tsx`, `../slate-v2/playwright/integration/examples/richtext.test.ts`, plaintext/richtext input and generated stress owners, future soft-break owner | Source-read complete. Added browser proof that Enter at the start of a markdown-created heading inserts a paragraph before the heading and preserves selection in the heading, plus proof that native Enter at the boundary between plain and bold text splits into a plain paragraph followed by a bold paragraph. Basic typing, select-all replacement, partial replacement, character delete, word delete, and selection sync map to current plaintext/richtext input and generated stress rows. Soft-break/newline-node navigation stays deferred to an explicit soft-break/line-break owner; Lexical emoji/theme spans, browser/OS labels, raw mobile, collaboration, table-model, and issue claims stay out. |
| `../lexical/packages/lexical/src/__tests__/unit/CodeBlock.test.ts` | `already-applied` for code-source HTML import; `covered/defer/reject` for residual mixed HTML rows | `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/site/examples/ts/paste-html-import.ts`, future HTML typography/serializer owners | Source-read complete. Added DataTransfer browser proof for Quip-style `<pre>`, VS Code-style `white-space: pre` line `<div>`s, and GitHub-style code tables importing as one code block without source gutters. The importer now extracts code-source text, preserves line breaks, normalizes non-breaking spaces, and strips trailing source newlines. Existing paste-html rows cover single-line inline `<code>` and supported text formatting. Source-token colors/bold keyword styling, broad Google Docs title inference, sub/sup typography, raw mobile, collaboration, table-model, and issue rows stay deferred or rejected until explicit future owners accept them. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts` | `covered/defer/reject` | `../slate-v2/packages/slate/test/snapshot-contract.ts`, `../slate-v2/packages/slate/test/transaction-contract.ts`, `../slate-v2/packages/slate/test/collab-history-runtime-contract.ts`, `../slate-v2/packages/slate/test/apply-onchange-hard-cut-contract.ts` | Source-read complete. Slate already covers the portable subscriber lifecycle through `Editor.subscribe`/`editor.subscribe` unsubscribe, `Editor.subscribeSource` routing, and `Editor.registerCommitListener` cleanup/public commit rows. Lexical `registerRootListener`, `registerEditableListener`, private `_listeners`, `setRootElement`, and `setEditable` cleanup callback semantics are API/root-shell policy and stay deferred or rejected unless Slate accepts an explicit React root/editable lifecycle owner. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx` | `already-applied` for empty-list toolbar toggle; `defer/reject` for residual plugin/list-policy rows | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/packages/slate/test/snapshot-contract.ts`, future list-indent/list-normalization owner | Source-read complete. Added richtext browser proof that a fresh empty paragraph toggles into one bulleted-list item and back to one empty paragraph while preserving collapsed selection. Existing browser/snapshot owners cover selected block list toggle/conversion, list wrapper creation, and basic list outdent. Lexical React plugin setup, command dispatch shape, contenteditable/theme DOM snapshots, empty-list indent/outdent, and regression #7036 block-type-after-nested-list behavior stay deferred or rejected until Slate accepts explicit list-indent, list-normalization, or list-plugin policy owners. |

### Clipboard And Paste

| Source | Status | Slate owner | Next decision |
| --- | --- | --- | --- |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs` | `already-applied` for multiline paragraph and code-BR rows; `defer` for HR rows | `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/site/examples/ts/paste-html-import.ts` | Source-read complete. Added browser proof for multiline HTML paragraphs with extra raw newlines, and extended code-source HTML proof to `<code>` elements with `<br>` line breaks. HR insertion/splitting stays deferred to a future HR/block-void plus block-fragment owner. |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs` | `already-applied` | `../slate-v2/playwright/stress/generated-editing.test.ts` | Multi-image paste/undo applied; reopen only for distinct image attributes. |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs` | `already-applied` for accepted raw rows; `plate-owned/reject` for plugin policy | paste-html, clipboard-contract, inline-link owners, and Plate link owner | Source-read complete. Simple anchor import, noisy link-in-list import, partial link fragment copy, and paste at inline-link boundaries are applied. Autolink URL paste, paste-inside-link splitting, nested link prevention, and multi-block paste through a link are Plate link-policy rows unless a raw inline-fragment invariant is split out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs` | `already-applied` for accepted HTML list import rows; `defer/reject` for plugin-policy rows | `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/packages/slate/test/clipboard-contract.ts` | Source-read complete. Existing paste-html browser rows cover basic unordered-list import, compact nested `ul` variants, and nested `<div>` boundaries inside list items. Clipboard fragment contracts cover structural fragment selection placement. Checklist private attributes stay rejected; top-level HR-in-list waits for a future HR/block-void plus list-split owner; Lexical toolbar indent/outdent assertions stay deferred or rejected under explicit list-indent policy. |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs` | `already-applied` for accepted import rows; `defer` for table layout/model rows | paste-html and future table model owners | Source-read complete. Google Docs, Quip, and Google Sheets table HTML import rows are applied. Custom widths, merge grids, nested block/inline table-cell normalization, merged cells, unequal rows, and empty rows stay deferred to accepted table layout/model owners. |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs` | `already-applied` | paste-html/richtext owners | Google Docs BIU spans and guarded semantic `<b>` handling applied; highlight markup rejected as app mark policy. |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs` | `reject` | none | Browser context-menu product flow is not a raw Slate invariant unless a native clipboard gap is split out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs` | `applied` for paragraph-into-quote; `already-applied`/`covered` for accepted residual rows; `defer/reject` for product policy | `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`, `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`, clipboard-contract, paste-html, inline-link, richtext, and stress owners | Source-read complete. Added DOM clipboard proof that a multi-paragraph fragment pasted into an empty block quote keeps the first text block in the quote and promotes the tail paragraph after it. The fragment insertion empty-block path now preserves the target block for the first pasted text block and keeps later text blocks source-shaped. Existing owners cover multi-block copy/paste, full-document replacement, inline link fragments, multiline plain-text splitting, font-size HTML, and empty-selection copy/cut preservation. Heading source-wrapper paste, hashtag/product spans, decorator embeds, exact plaintext rendering, native transport flake tags, raw mobile, collaboration, and table-model rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs` | `applied` | `../slate-v2/packages/slate/test/clipboard-contract.ts`; `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts` | Added native list fragment package rows for partial list item fragments, list-fragment insertion into selected text, paragraph fragments inside list items, and paragraph fragments at list end. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs` | `already-applied` | `../slate-v2/playwright/integration/examples/plaintext.test.ts` | `execCommand` and synthetic `ClipboardEvent` rows applied; keep Firefox skip honest. |
| `../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts` | `applied` | `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/site/examples/ts/paste-html-import.ts`, stress image rows | Source-read complete. Added browser proof for Lexical image HTML export shapes with no caption and with plain-text figcaption. The paste-html importer now unwraps paragraph wrappers that only contain block elements, so `<p><img></p>` imports as a block image instead of nesting a block void under a paragraph. Caption text imports as a following paragraph. Solution note: `docs/solutions/logic-errors/2026-05-09-block-only-html-paragraphs-must-not-wrap-block-voids.md`. Exact Lexical `alt`, `height`, `width`, serializer API, caption editor, native clipboard transport, raw mobile, collaboration, table-model, and export claims stay out. |
| `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalTabNode.test.ts` | `covered` | mark/text insertion owners | Source-read complete. Lexical `INSERT_TAB_COMMAND` mark inheritance is rich-text command policy; generic Slate keeps literal tab insertion as text, with mark-preservation covered by existing mark/text insertion behavior. |
| `../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts` | `applied` for accepted block-shape rows; `already-applied` for mark/iOS rows; `plate-owned/reject` for checklist rows | `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/site/examples/ts/paste-html-import.ts`, Plate checklist/list-plugin owner | Source-read complete. Added browser proof for core HTML block shapes: plain DOM text, malformed paragraph pair, single `div`, nested spans/divs, nested span in `div`, and nested `div` in span. The paste-html importer now treats generic `div` as a block-boundary fragment while preserving list-item boundary handling. Existing proof covers strong paste mark inheritance and the iOS prediction plain-text fallback. Google Docs/GitHub/Joplin checklist rows are Plate checklist policy unless a raw HTML invariant is split out. |
| `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx` | `already-applied` for tab/newline paste; `reject`/`defer` for the rest | `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`, `../slate-v2/playwright/integration/examples/paste-html.test.ts` | Added package proof that multiline plain-text fallback preserves literal tabs while splitting blocks, and browser proof that Google Docs `Apple-tab-span` HTML preserves tab text across the paragraph plus loose-line shape. Lexical TabNode class/schema/serialization/type-guard rows stay out; tab-indent behavior routes to future code/list/input owners. |

#### Clipboard HTML Row-Level Source Drill

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs`
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs`
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs`
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs`
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs`
- `../slate-v2/site/examples/ts/paste-html-import.ts`
- `../slate-v2/playwright/integration/examples/paste-html.test.ts`

Current Slate paste-html already owns `strong`, `code`, Google Docs font-size
spans, iOS prediction plain-text fallback, Google Sheets table import, and
generated clipboard/drop gauntlets. The residuals below are the only accepted
clipboard HTML work from these four Lexical files.

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| HTMLCopyAndPaste: `Copy + paste multi line html with extra newlines` | `already-applied` | paste-html browser owner and importer | Browser row now proves four pasted paragraphs, strips raw newline noise from normal HTML text, drops whitespace-only inter-block text, removes the empty paste target, and preserves inline `<b>` / `<i>` formatting in the final paragraph. |
| HTMLCopyAndPaste: `Copy + paste a code block with BR` | `already-applied` for code-source import; `defer` for source token styling/language UI | paste-html browser owner and importer | The source-code HTML corpus now includes a `<code data-language>` element with `<br>` line breaks and imports it as one code block. Token class styling, gutters, and language UI stay out of this paste parser row. |
| HTMLCopyAndPaste: paragraph between horizontal rules | `defer` | future HR/block-void plus selection owner | `paste-html` has no accepted HR element owner. Inserting a paragraph between two decorator/void HRs needs explicit HR and selection policy before copying. |
| HTMLCopyAndPaste: paste top-level HR in the middle of a paragraph | `defer` | future HR/block-void plus block-fragment owner | Splitting an existing paragraph around a pasted HR is portable, but only after Slate accepts an HR/block-void import and block-fragment insertion owner. |
| TextFormat: `Copy + paste html with BIU formatting` | `already-applied` | `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/site/examples/ts/paste-html-import.ts` | Browser row now proves Google Docs-style spans produce bold, italic, underline, and combined bold+italic+underline while preserving `font-size: 11pt`. |
| TextFormat: `Copy + paste html with highlight formatting` | `reject` for `<mark>` highlight; `already-applied` for guarded semantic `<b>` handling | paste-html example only | The example has no highlight leaf/render contract, so copying Lexical highlight markup would import app policy. Standard `<b>` now maps to bold unless inline `font-weight` explicitly marks the wrapper as non-bold. |
| Links: `Copy + paste an anchor element` | `already-applied` | paste-html browser owner | Browser row now proves `<a href="https://facebook.com">Facebook!</a>` imports one safe link with href `https://facebook.com/` and text. Lexical toolbar unlink/relink assertions stay rejected. |
| Links: `Copy + paste in front of or after a link` | `already-applied` | `../slate-v2/playwright/integration/examples/inlines.test.ts` | Browser row now proves plain-text and rich-HTML paste at inline-link boundaries stay outside the link instead of expanding it. |
| Links: `Copy + paste link by selecting its (partial) content` | `already-applied` | `../slate-v2/packages/slate/test/clipboard-contract.ts` | Package row now proves a selected partial link fragment preserves link attributes when inserted into another text position. |
| Links: `Copy + paste empty link #3193` | `already-applied` | paste-html browser owner | Browser row now uses a minimized noisy social-HTML fixture: block before list, two list items, and a safe link in the first item. Emoji/image/theme noise stays rejected. |
| Links: `Paste a link into text` | `reject` | none | Plain-text URL autolinking is plugin/product behavior, not raw HTML paste. |
| Links: `Paste text into a link` | `reject` for generic core; `defer` for app link policy | future link-plugin owner | Generic Slate should not special-case `link` so pasted text inside an inline link loses link affinity. A link plugin can choose that policy later. |
| Links: `Paste formatted text into a link` | `reject` for generic core; `defer` for app link policy | future link-plugin owner | Marks are portable, but "do not inherit surrounding link" is link-plugin policy unless the public link example accepts it explicitly. |
| Links: `Paste a link into a link` | `defer` | future link-plugin owner | Nested link prevention is a link-plugin normalization decision, not a generic inline-fragment law. |
| Links: `Paste multiple blocks into a link` | `defer` | future link-plugin/block-fragment owner | Multi-block paste through an inline link needs an accepted link/block-fragment policy before adding browser proof. |
| Lists: `Copy + paste a list element` | `already-applied` | paste-html browser owner | Browser row now proves basic `<ul><li>Hello</li><li>world!</li></ul>` import. Lexical toolbar indent/outdent assertions stay rejected. |
| Lists: nested `ul` variants | `already-applied` | paste-html browser owner, list fragment contract owner if model behavior differs | Browser corpus now covers a nested list item, a directly nested `ul`, and `li` text plus child `ul`. Toolbar indent/outdent assertions stay rejected. |
| Lists: `Copy + paste a checklist` | `reject` | none | Lexical private `__lexicallisttype="check"` and checklist ARIA/theme output are app/list-plugin policy, not generic HTML paste. |
| Lists: `Paste top level element in the middle of list` | `defer` | future HR/void plus list split owner | Portable shape, but `paste-html` has no HR element owner and the test is about splitting an existing list around a decorator. Not this clipboard parser slice. |
| Lists: `Copy + paste a nested divs in a list` | `already-applied` | paste-html browser owner | Browser row now proves nested `<div>` content inside list items preserves paragraph boundaries without unwrapping the list item. |
| Tables: `Copy + paste (Table - Google Docs)` | `already-applied` | paste-html browser owner | Browser row now proves Google Docs table HTML imports rows/cells, multi-paragraph cell content, and `11pt` text. Column widths stay unclaimed. |
| Tables: `Copy + paste (Table - Google Docs with custom widths)` | `defer` | future table layout/model owner | Width preservation needs table column/layout policy. Current paste-html intentionally ignores `COL` and `COLGROUP`. |
| Tables: `Copy + paste (Table - Quip)` | `already-applied` | paste-html browser owner | Browser row now proves Quip table HTML imports rows/cells and preserves `b<br>b` as newline text inside the second cell. Width claims stay out. |
| Tables: `Copy + paste (Table - Google Sheets)` | `covered` | `../slate-v2/playwright/integration/examples/paste-html.test.ts` | Current browser row imports Google Sheets table cells and style marks. |
| Tables: `Copy + paste - Merge Grids` | `defer` | future table selection/model owner | Multi-cell replacement in an existing table is table-model behavior, not generic HTML paste. |
| Tables: `Copy + paste nested block and inline html in a table` | `defer` | future table-cell block-normalization owner | Valuable, but it needs an accepted table-cell block-normalization policy before adding proof. |
| Tables: merged cells, unequal rows, and empty row | `defer` | future table model/parser owner | Rowspan/colspan grid filling and empty-row synthesis are table model decisions. Do not hide them under the paste-html example. |

Selected clipboard HTML source rows for this phase are applied. Inline-link
boundary copy/paste rows are now applied for the raw Slate owners. Paste-inside
link splitting stays deferred to an explicit link-plugin policy; table custom
widths, merge grids, rowspan/colspan, empty rows, and table-cell block
normalization stay deferred to accepted table/layout owners.

#### Lexical Core HTMLCopyAndPaste Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts`
- `../slate-v2/playwright/integration/examples/paste-html.test.ts`
- `../slate-v2/site/examples/ts/paste-html-import.ts`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `plain DOM text node` | `already-applied` | paste-html browser owner | Browser proof now covers HTML-only text import producing one paragraph. |
| `a paragraph element` | `already-applied` | paste-html browser owner | Browser proof now covers malformed `<p>Hello!<p>` producing the visible paragraph plus the parser-created empty paragraph. |
| `a single div` | `applied` | paste-html browser owner and importer | Browser proof failed red as one `123456` paragraph, then passed after generic `div` import became a block-boundary fragment. |
| `multiple nested spans and divs` | `applied` | paste-html browser owner and importer | Browser proof now preserves the nested `div` boundary as `a b c d e` then `f g h`. |
| `nested span in a div` | `applied` | paste-html browser owner and importer | Browser proof now splits `123` and `456` instead of flattening them. |
| `nested div in a span` | `applied` | paste-html browser owner and importer | Browser proof now splits `123` and `456` even when the block boundary is nested under an inline wrapper. |
| Google Docs, GitHub, and Joplin checklist rows | `defer/reject` | future checklist/list-plugin owner | The rows depend on checklist schema, private attributes, ARIA/theme output, and checkbox normalization. Current paste-html list owner only accepts generic list import. |
| `pasting inheritance` | `already-applied` | paste-html browser owner | Existing rich HTML paste proof now asserts typed text after `<strong>Hello Bold</strong>` stays inside `<strong>`. |
| iOS prediction plain-text fallback | `already-applied` | paste-html browser owner and DOM clipboard runtime | Existing browser proof covers identical `text/html` and `text/plain` payloads inserting plain text into a formatted selection with the selection preserved. |

#### Lexical Playground Native CopyAndPaste Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs`
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`
- `../slate-v2/playwright/integration/examples/paste-html.test.ts`
- `../slate-v2/playwright/integration/examples/inlines.test.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`
- `../slate-v2/playwright/stress/generated-editing.test.ts`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `Basic copy + paste` | `covered` | DOM clipboard boundary and generated clipboard/stress rows | Current rows cover model-backed fragment write/read, multi-block insertion into a text block, selection placement, and native clipboard stress. Exact Lexical rich/plain DOM theme output stays out. |
| `Copy and paste heading` | `defer/reject exact source wrapper` | future block-format paste policy, if accepted | Current Slate rule is target-owned for single text-block fragment replacement, including empty targets. Preserving a copied heading wrapper into an empty paragraph would contradict the documented target-block policy unless a new block-format paste owner accepts it. |
| `Copy and paste between sections` | `covered/defer product spans` | clipboard-contract and inline-token future owners | Full-document replace and mixed inline fragment extraction/insertion are covered. Lexical hashtag classes/theme output are product rows and route to future inline-token owners if needed. |
| `Copy and paste an inline element into a leaf node` | `already-applied` | clipboard-contract and inlines browser owner | Package proof preserves partial inline link fragments; browser rows cover paste at inline-link boundaries without expanding the link. |
| `Copy + paste multi-line plain text into rich text produces separate paragraphs` | `covered/defer exact heading tail policy` | slate-dom plain-text fallback; future richtext block-split policy if accepted | Current package proof splits multiline plain text at a collapsed rich-text selection. Lexical's exact "tail line becomes paragraph after heading" is app block-format policy; generic Slate currently preserves the target block type for split lines. |
| `Pasting a decorator node on a blank line inserts before the line` | `defer/reject` | future decorator/block-void paste owner | YouTube embed decorator, block cursor DOM, and product shell are not raw Slate behavior. Block void/image paste rows are covered elsewhere. |
| `Copy and paste paragraph into quote` | `applied` | `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`, `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts` | Added DOM clipboard proof that two copied paragraphs pasted into an empty block quote produce a block quote with the first paragraph text plus a following paragraph tail. First focused proof failed red because Slate replaced the quote with paragraphs. |
| Google Docs/MS Word font-size rows | `already-applied` | paste-html browser owner and importer | Paste-html browser rows cover Google Docs font-size spans and pt/px normalization. |
| `Cut then copy empty selection preserves clipboard` | `already-applied` | highlighted-text browser owner | Browser proof preserves clipboard text when copy or cut runs on a collapsed text selection and proves the document is unchanged. |

#### LexicalHistory Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx`
- `../slate-v2/packages/slate-history/test/history-contract.ts`
- `../slate-v2/packages/slate-history/test/integrity-contract.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`
- `../slate-v2/packages/slate/test/collab-history-runtime-contract.ts`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `LexicalHistory after clearing` | `reject` for command event API; `covered` for empty-stack state | history contract | Slate exposes history stacks and undo/redo methods, not CAN_UNDO/CAN_REDO or CLEAR_HISTORY command notifications. Empty stacks and stack identity are already covered by current history setup/undo rows. |
| `LexicalHistory.Redo after Quote Node` | `already-applied` | `../slate-v2/packages/slate-history/test/history-contract.ts` | Added package proof that a selected block property change is undoable and redoable, preserving tree and selection-visible state. Lexical quote-node class and JSON shape stay out. |
| `LexicalHistory in sequence: change, undo, redo, undo, change` | `already-applied` | `../slate-v2/packages/slate-history/test/history-contract.ts` | Added package proof that a new edit after undo clears redo history and redo becomes a no-op. Lexical CAN_UNDO/CAN_REDO command payloads stay out. |
| `undoStack selection points to the same editor` | `reject` | none | Lexical shared history across parent/nested editors and NodeSelection class ownership are not generic Slate v2 history behavior. |
| `Changes to TextNode leaf are detected properly #6409` | `already-applied` | `../slate-v2/packages/slate-history/test/history-contract.ts` | Added package proof that empty/no-op updates are not saved, while node property commits enter history and undo back to the original document. |
| `SharedHistoryExtension can create a parent editor` | `reject/defer` | future nested-editor/shared-history owner, if accepted | Lexical extension dependency injection, decorator child editor DOM mounting, and shared history state across nested editors are framework/product integration details, not a raw Slate history contract. |

#### LexicalHtml Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts`
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `../slate-v2/playwright/integration/examples/paste-html.test.ts`
- `../slate-v2/site/examples/ts/paste-html-import.ts`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `[Lexical -> HTML]: Empty editor state` | `reject/defer` | future generic HTML serializer owner, if accepted | Lexical asserts `$generateHtmlFromNodes` emits `<p><br></p>` for an empty editor. Current Slate v2 has clipboard/DOM payload owners, not a standalone full-editor HTML serializer contract. Do not hide serializer API design under clipboard tests. |
| `[Lexical -> HTML]: Use provided selection` | `covered` for selected-fragment export; `reject` Lexical serializer API shape | `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts` | Existing package rows prove `writeSelection` emits Slate fragment and HTML payloads for the current selection and can paste them into a target selection. Lexical's direct `$generateHtmlFromNodes(editor, selection)` API shape stays out. |
| `[Lexical -> HTML]: Default selection (undefined) should serialize entire editor state` | `reject/defer` | future generic HTML serializer owner, if accepted | Whole-editor HTML string export is not currently a Slate v2 public owner. Raw document JSON portability is covered separately by the public state API; it is not this HTML serializer row. |
| `If alignment is set on the paragraph, don't overwrite from parent empty format` | `already-applied` | `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/site/examples/ts/paste-html-import.ts` | Current browser row proves legacy `align="right"` imports to paragraph `text-align: right` and invalid alignment is ignored. |
| `If alignment is set on the paragraph, it should take precedence over its parent block alignment` | `already-applied` | `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/site/examples/ts/paste-html-import.ts` | Current browser row proves CSS `style="text-align: center"` wins over legacy parent/right alignment for paragraph import. |
| `It should output correctly nodes whose export is DocumentFragment` | `reject` | none | Lexical custom node `exportDOM` returning `DocumentFragment` is a class-extension serializer API. Slate v2 should only add this if a generic HTML serializer owner exists. |

#### LexicalList Utils Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts`
- `../lexical/packages/lexical-list/src/utils.ts`
- `../slate-v2/packages/slate/test/query-contract.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `../slate-v2/packages/slate/test/delete-contract.ts`
- `../slate-v2/playwright/integration/examples/paste-html.test.ts`
- `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`
- `../slate-v2/playwright/integration/examples/check-lists.test.ts`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `getListDepth should return the 1-based depth of a list with one levels` | `already-applied` | `../slate-v2/packages/slate/test/query-contract.ts` | Added package proof that `Path.levels` plus public `Node` lookup exposes list depth for a top-level logical list, even when the list is inside a non-root container. |
| `getListDepth should return the 1-based depth of a list with two levels` | `already-applied` | `../slate-v2/packages/slate/test/query-contract.ts` | Same proof covers a nested list as the second list ancestor in the path chain. |
| `getListDepth should return the 1-based depth of a list with five levels` | `already-applied` for the mechanism; no five-level duplicate | `../slate-v2/packages/slate/test/query-contract.ts` | Slate does not need a depth-count copy of every Lexical fixture depth. The new proof locks the public path mechanism for arbitrary nested list levels. |
| `getTopListNode` direct root / non-root / deeply nested rows | `already-applied` | `../slate-v2/packages/slate/test/query-contract.ts` | Added package proof that list ancestors resolve to the first logical list path even when the list is not a root child and when the inspected item is deeply nested. |
| `isLastItemInList` nested and non-nested true/false rows | `already-applied` | `../slate-v2/packages/slate/test/query-contract.ts` | Added package proof that terminal and non-terminal list-item paths are observable through `Node.has(editor, Path.next(path))`, including a nested item whose ancestor still has a following sibling. |

#### Lexical Regression #231 Empty Text Nodes Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/regression/231-empty-text-nodes.spec.mjs`
- `../slate-v2/packages/slate/test/delete-contract.ts`
- `../slate-v2/packages/slate/test/normalization-contract.ts`
- `../slate-v2/packages/slate/test/leaf-lifecycle-contract.ts`
- `../slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`
- `docs/solutions/logic-errors/2026-04-25-slate-v2-destructive-delete-must-clean-empty-leaves-before-render.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `Does not generate segment error when editing empty text nodes` | `already-applied` for token-like delete lifecycle; `reject` for hashtag plugin/CSS/collab harness | `../slate-v2/packages/slate/test/delete-contract.ts`, existing normalization/leaf/render owners | Package proof now deletes backward through `{ token: true, text: '#foo' }` after leading `a` and lands on a canonical empty paragraph with selection at `[0, 0]` offset `0`. Existing owners cover empty block anchoring, invalid empty marked leaf cleanup, and rendered empty-block shape. |

#### Lexical Regression #3433 Merge Markdown Lists Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs`
- `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`
- `../slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `../slate-v2/packages/slate/test/transforms/insertFragment/of-lists/merge-lists.tsx`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/transforms-contract.ts`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `can merge markdown lists created immediately before existing lists` | `already-applied` | `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`, `../slate-v2/site/examples/ts/markdown-shortcuts.tsx` | Browser proof now creates an existing list item `one`, converts the immediately preceding block with `- two`, and asserts one `ul` with `two` then `one`. The example merges adjacent bulleted-list wrappers after wrapping the current block as a list item. Lexical Playground HTML/CSS, plain-text skip, collaboration harness, and issue claim stay out. |

#### LexicalHeadingNode Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/transforms-contract.ts`
- `docs/solutions/logic-errors/2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md`
- `docs/solutions/logic-errors/2026-04-07-slate-v2-split-node-should-keep-left-branch-id-and-rebase-inward.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `HeadingNode.constructor`, `HeadingNode.createDOM`, `HeadingNode.updateDOM`, `HeadingNode.setTag`, `$createHeadingNode`, `$isHeadingNode` | `reject` | none | Lexical class lifecycle, tag setter helpers, node keys, and theme class output are not portable Slate behavior. Slate owns block type plus rendering through examples and element renderers. |
| `HeadingNode.insertNewAfter()` in the middle of a heading | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts`, core split owners | Browser proof now splits `hello world` at offset 5 into two `h1` elements. Generic Slate split behavior owns the model row; the richtext browser row proves the example transport. |
| `HeadingNode.insertNewAfter()` at heading end | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx` | Browser proof now shows Enter at the end of a heading creates a paragraph after the heading instead of another heading. |
| `HeadingNode.insertNewAfter()` in an empty heading | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx` | Browser proof now shows Enter in an empty heading leaves the heading and creates a paragraph after it. |

#### LexicalQuoteNode Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/transforms-contract.ts`
- `docs/solutions/logic-errors/2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `QuoteNode.constructor`, `QuoteNode.createDOM`, `QuoteNode.updateDOM`, `$createQuoteNode` | `reject` | none | Lexical class lifecycle, node keys, and theme class output are not portable Slate behavior. Slate owns blockquote rendering through the richtext example. |
| `QuoteNode.insertNewAfter()` from an empty quote | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx` | Browser proof now shows Enter in an empty blockquote keeps one blockquote and creates a paragraph after it. The richtext example shares one exit-on-Enter policy for headings and blockquote. |

#### Lexical Selection `$sliceSelectedTextNodeContent` Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `../slate-v2/packages/slate/src/interfaces/node.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `docs/solutions/logic-errors/2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md`
- `docs/solutions/logic-errors/2026-04-09-slate-node-fragment-must-clone-and-prune-in-root-relative-space.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| full selection returns both original Lexical text nodes | `covered` for selected text content; `reject` object identity | `../slate-v2/packages/slate/test/clipboard-contract.ts` | Slate already exposes selected fragments through `state.fragment.get()`. It does not promise Lexical node object identity. |
| partial first/last text selection clones only sliced text | `already-applied` | `../slate-v2/packages/slate/test/clipboard-contract.ts` | Package proof now selects `01234` + bold `56789` from offset 1 to 4 in the second leaf and asserts fragment text `1234` plus bold `5678`. |
| sliced clone has no side effects on the source text node | `already-applied` | `../slate-v2/packages/slate/test/clipboard-contract.ts` | The same package proof mutates the returned fragment leaves and asserts the editor snapshot still contains the original unmarked and bold text leaves. |

#### LexicalListItemNode Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `../slate-v2/packages/slate/test/delete-contract.ts`
- `docs/solutions/logic-errors/2026-04-05-list-unit-fragment-proofs-should-treat-list-item-fragments-as-sibling-units-and-assert-real-paste-landings.md`
- `docs/solutions/best-practices/2026-05-09-lexical-list-utils-harvest-rows-need-path-ancestry-contracts.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| constructor/createDOM/updateDOM/$create/$is/exportJSON/value/theme rows | `reject` | none | Lexical node lifecycle, DOM class/value output, node keys, and JSON schema are not portable Slate behavior. |
| `ListItemNode.insertNewAfter(): non-empty list items` | `already-applied` | `../slate-v2/packages/slate/test/snapshot-contract.ts` | Package proof now shows `insertBreak` inside `onetwo` splits the list item into `one` and `two` under the same `bulleted-list`, with selection at the start of the new item. |
| replace first/last/middle/only list item with paragraph | `defer` | future list-exit/list-normalization owner | Useful list behavior, but it is a list-plugin policy in this checkout rather than a generic core transform law. Do not hide first/middle/last list splitting under a broad node replacement test. |
| remove list item with non-nested, nested, and deeply nested siblings | `defer` | future list-normalization owner | These rows encode Lexical's nested-list repair strategy. Slate needs an explicit list model owner before porting the merge/promote matrix. |
| `ListItemNode.setIndent()`, fractional indent, marker style inheritance | `defer/reject` | future list-indent/plugin owner | Indent/outdent and marker style inheritance are plugin-level list behavior, not raw Slate core. Fractional indent coercion is Lexical API policy. |
| splitting an ordered list with reset or preserved numbering | `defer` | future ordered-list restart owner | Ordered-list restart preservation is a public list policy decision. Keep it out until the list owner accepts restart metadata semantics. |

#### LexicalListNode Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `../slate-v2/packages/slate/test/query-contract.ts`
- `docs/solutions/logic-errors/2026-04-05-wrapper-unit-insert-seams-should-generalize-from-bulleted-list-to-compatible-list-containers-before-adding-new-geometry.md`
- `docs/solutions/logic-errors/2026-03-30-markdown-ordered-list-restarts-must-emit-listrestartpolite.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| constructor/getTag/createDOM/updateDOM/$create/$is/subclass/config rows | `reject` | none | Lexical node lifecycle, DOM depth classes, node keys, and subclass transform wiring are not portable Slate behavior. |
| `ListNode.append()`/`splice()` wraps list items, lists, paragraphs, inline nodes, and text nodes | `covered/defer` | current list formatting and fragment owners; future list-normalization owner for exact coercion | Slate already proves list-item wrapper units and list formatting flows. Lexical's append/splice helper coercion matrix needs an explicit list-normalization owner before copying. |
| bullet vs number list wrapper creation | `already-applied` | `../slate-v2/packages/slate/test/snapshot-contract.ts` | Existing proof covers bulleted-list formatting; new package proof covers numbered-list formatting by wrapping selected top-level blocks as `list-item` children. |
| checklist role cleanup and nested checklist attribute clearing | `defer` | future checklist/list-plugin owner | Checklist role, ARIA, and checked metadata are plugin/rendering policy, not raw Slate core. |
| list item value transform and ordered-list start/restart behavior | `defer` | future ordered-list restart owner | Slate needs explicit restart metadata semantics before porting Lexical's value/start transform rows. |

#### lexical-list `formatList` Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/delete-contract.ts`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `../slate-v2/packages/slate/test/query-contract.ts`
- `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/site/examples/ts/markdown-shortcuts.tsx`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `$insertList`: empty root selection and existing root child | `covered/already-applied` | `../slate-v2/packages/slate/test/snapshot-contract.ts`, richtext/markdown list browser owners | Slate already proves selected top-level blocks can be converted to `list-item` children and wrapped in `bulleted-list` or `numbered-list`; browser examples prove toolbar/markdown list creation paths. |
| `$insertList`: empty shadow root selection in table cell | `defer` | future table-cell list/model owner | Lexical shadow-root table behavior depends on table model policy. Do not hide it under generic root list formatting. |
| `$insertList`: formatting empty list items from bullet to number | `defer` | future list-normalization and ordered-list restart owner | Converting empty nested list items and preserving/recomputing list numbering is list-plugin/model policy, not a generic Slate core transform law in this checkout. |
| `$insertList`: element-anchored selection after paragraph plus linebreak conversion | `defer/reject Lexical shape` | future rich linebreak/list selection owner if accepted | Lexical's LineBreakNode and element selection shape do not map directly to Slate's text leaf ranges. Reopen only if Slate accepts a linebreak/list selection policy beyond existing list formatting rows. |
| `$handleListInsertParagraph`: empty or whitespace-only final list item exits list | `defer` | future list-exit/list-normalization owner | Useful editor behavior, but it is a list-plugin policy here. Current raw Slate proof only covers non-empty `insertBreak` list-item split and browser markdown continuation. |
| `$handleListInsertParagraph`: non-whitespace list item extends list | `already-applied` | `../slate-v2/packages/slate/test/snapshot-contract.ts`, `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts` | Package proof covers `insertBreak` inside non-empty `onetwo` splitting to two `list-item` siblings; markdown browser proof covers native desktop list continuation text. |
| `$handleListInsertParagraph`: decorator node extends list | `defer` | future decorator/void list-plugin owner | Lexical decorator nodes are product/rendering policy. Raw Slate needs an accepted void/decorator-in-list owner before copying this row. |
| `$handleListInsertParagraph`: empty middle item splits surrounding list | `defer` | future list-exit/list-normalization owner | Splitting one list into previous-list, paragraph, next-list is a plugin/model decision. Keep it explicit instead of burying it in generic `insertBreak`. |
| `$handleIndent` and `$handleOutdent` preserving extended list subclasses | `defer/reject subclass API` | future list-indent/plugin owner | Slate already has a basic list outdent transform proof; Lexical helper APIs and subclass preservation are not portable raw Slate behavior. |

#### lexical-list `registerListStrictIndentTransform` Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-list/src/__tests__/unit/registerListStrictIndentTransform.test.ts`
- `../slate-v2/playwright/integration/examples/paste-html.test.ts`
- `../slate-v2/site/examples/ts/paste-html-import.ts`
- `docs/solutions/best-practices/2026-05-09-lexical-tab-node-harvest-rows-need-clipboard-browser-proof-boundaries.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `applyStrictListIndentation` malformed nested `ul` import cases | `covered/defer` | paste-html nested-list browser corpus; future list-normalization owner for exact rewrite | Current Slate browser coverage already pastes compact nested-list variants, including a direct nested `ul` child and `li` text plus child `ul`, without flattening visible list content. The Lexical row also asserts exact normalized HTML serialization with `value` attributes and strict nested wrapper placement; Slate does not currently expose that generic HTML serializer/list-normalization contract. |
| `$generateHtmlFromNodes` expected nested-list output | `defer` | future generic HTML serializer owner, if accepted | This is Lexical serializer output shape, not a raw Slate invariant. Reopen only if Slate accepts a full-editor HTML serializer contract. |
| `registerListStrictIndentTransform(editor)` setup | `reject` | none | Lexical transform registration and command wiring are framework internals. |

#### LexicalMarkdown Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts`
- `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`
- `../slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `../slate-v2/site/examples/ts/markdown-preview.tsx`

| Source test family | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| heading, blockquote, and unordered-list markdown shortcut creation | `covered/already-applied` | `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`, `../slate-v2/site/examples/ts/markdown-shortcuts.tsx` | Browser rows already prove blockquote presence, list item creation/continuation, adjacent markdown-created list merge, and h1 shortcut creation. |
| full markdown import/export matrix for headings, quotes, lists, ordered starts, marks, links, code, escapes, whitespace, hard breaks, nested code fences, and multiline paragraphs | `defer` | future markdown serialization owner | Slate v2 currently has no markdown parser/serializer package. Do not add model tests that pretend a public markdown import/export contract exists. |
| custom transformers, MDX HTML transformers, `replace` returning false, and transformer ordering | `reject/defer` | future markdown extension API owner, if accepted | These rows test Lexical transformer API shape and extension policy. Reopen only if Slate v2 accepts a comparable markdown transformer API. |
| list marker memory and checklist marker behavior | `defer/reject` | future list/checklist markdown owner | Marker preservation, checklist syntax, and list metadata are plugin/serializer policy. They are not raw Slate behavior in this checkout. |
| Enter-key code fence shortcut creating a code block | `defer` | future code-block markdown shortcut/browser owner | Useful browser behavior, but current Slate markdown-shortcuts example owns quote/list/headings only. Do not smuggle code-block shortcut policy into core or unrelated examples. |
| `normalizeMarkdown` line-merge, table, HTML-like tag, whitespace, and MDX handling | `defer` | future markdown normalizer/parser owner | Pure markdown preprocessing utility behavior; no current Slate v2 owner exists. |
| import should leave no selection | `reject/defer` | future markdown import owner | A headless markdown import helper can decide selection semantics. Current Slate v2 has no such import API. |

#### MarkdownTransformers Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts`
- `../slate-v2/playwright/integration/examples/inlines.test.ts`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `docs/solutions/best-practices/2026-05-09-inline-link-harvest-rows-need-link-policy-boundaries.md`
- `docs/solutions/logic-errors/2026-04-17-markdown-link-automd-must-move-selection-after-inserted-link.md`
- `docs/solutions/logic-errors/2026-04-11-link-paste-autolink-must-stay-literal-inside-markdown-source-entry.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| text before a markdown link is preserved | `defer` | future markdown-link transformer owner | This is markdown shortcut parsing, not raw link model behavior. Existing paste/clipboard link rows prove HTML/fragment link boundaries, not markdown automd. |
| formatted text before a markdown link is preserved | `defer` | future markdown-link transformer owner | Same owner as above. Mark preservation before markdown link insertion belongs in a markdown-link plugin/serializer once accepted. |
| link parser is not too greedy after a preceding unprocessed match | `defer` | future markdown-link transformer owner | Valuable parser regression, but Slate v2 has no markdown link transformer API in this checkout. |
| markdown link should not be created inside another link | `defer/reject generic core` | future markdown-link plugin owner; existing inline-link boundary owners for raw behavior | Generic Slate should not special-case markdown syntax inside a custom inline link. A markdown-link plugin can reject nested link transforms later; current raw inline-link paste/copy boundaries remain covered separately. |

#### ClearFormatting Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/packages/slate/src/editor/remove-mark.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/primitive-method-runtime-contract.ts`

| Source test family | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| clear selected BIU/code marks | `already-applied` | `../slate-v2/site/examples/ts/richtext.tsx`, `../slate-v2/playwright/integration/examples/richtext.test.ts` | Richtext now exposes a clear-formatting toolbar command that removes the example's text marks from the current selection. Browser proof locks selected multi-block mark removal without clearing unselected formatted text. |
| preserve semantic block structure while clearing explicit formatting | `already-applied` | `../slate-v2/site/examples/ts/richtext.tsx`, `../slate-v2/playwright/integration/examples/richtext.test.ts` | Browser proof clears underline and alignment from selected blockquotes while keeping `blockquote` elements intact. |
| clear left/center/right/justify alignment | `already-applied` | `../slate-v2/site/examples/ts/richtext.tsx`, `../slate-v2/playwright/integration/examples/richtext.test.ts` | Clear-formatting command resets the richtext example's `align` block prop over the selected blocks. |
| selected text spanning more than one paragraph | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts`, existing mark model contracts | Browser proof selects from the middle of paragraph one through the middle of paragraph two, clears selected marks, and keeps the unselected `Foo ` and ` qux` ranges bold/italic. |
| preserve default styling of links, hashtags, and mentions | `defer/reject product rows` | future clear-formatting link/mention plugin owner, if accepted | The richtext example has no link, hashtag, or mention schema. Existing link/mention rows cover raw inline behavior, not a generic clear-formatting plugin. Do not add link/mention policy to raw Slate core. |
| clear indent/outdent formatting | `defer` | future indent/list/code/block-format owner | The current richtext example owns alignment but not indent/outdent state. Keep this as a later owner decision. |
| Lexical additional-style dropdown and theme/DOM class output | `reject` | none | Product shell and theme markup are not portable Slate behavior. |

#### CodeBlock Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs`
- `../slate-v2/playwright/integration/examples/code-highlighting.test.ts`
- `../slate-v2/site/examples/ts/code-highlighting.tsx`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `Can create code block with markdown` | `defer` | future markdown code-fence shortcut owner | Current Slate markdown-shortcuts example owns quote/list/heading shortcuts, not fenced code-block creation. Do not hide code-fence parsing under the code-highlighting example. |
| `Can create code block with markdown and wrap existing text` | `defer` | future markdown code-fence shortcut owner | Same code-fence parser boundary, with selected text wrapping as an additional browser behavior once the owner exists. |
| `Can select multiple paragraphs and convert to code block` | `covered/refactor-existing` | `../slate-v2/packages/slate/test/snapshot-contract.ts`, code-highlighting browser owner | Generic wrap/range model rows already cover multi-block wrapping mechanics. Browser coverage now locks the user-facing selected-paragraph code-block control; broaden only if the code-highlighting example gains a clean multi-paragraph fixture owner. |
| `Can select partial paragraphs and convert to code block` | `covered/refactor-existing` | snapshot wrap owners, future richer code-highlighting fixture | Partial cross-block conversion is a transform/wrap split policy. Current browser proof intentionally locks the control and code-line output without creating a brittle product fixture. |
| `Can select a line within line breaks and convert to code block` | `defer` | future line-break/code-block conversion owner | Slate v2 models soft line breaks as text/newline behavior, not Lexical LineBreakNode children. Needs a deliberate code-block conversion policy before adding proof. |
| `Can switch highlighting language in a toolbar` | `defer` | code-highlighting browser owner | The example has `LanguageSelect`, but this slice does not add a shallow select-value assertion. Add a semantic projection row only if the language switch proof checks token output, not just product control wiring. |
| `Can maintain indent when creating new lines` | `defer` | future code indentation owner | Current code-highlighting Enter proof creates a code line in the same block. Auto-indent-on-newline is a distinct editor policy. |
| `Can indent text via tab when selecting the line with Shift+Down` | `already-applied` | `../slate-v2/playwright/integration/examples/code-highlighting.test.ts` | Existing browser proof covers selected code-line indentation with Tab. |
| `Can (un)indent multiple lines at once` | `already-applied` | `../slate-v2/playwright/integration/examples/code-highlighting.test.ts` | Existing browser proof covers selected multi-line Tab and Shift+Tab. |
| `Can move around lines with option+arrow keys` | `defer` | future code-line movement owner | Slate v2 code-highlighting does not expose line move commands. |
| `prevents selection and typing outside code block boundaries` | `defer` | future code-block selection boundary owner | Current Slate has general selection/delete boundaries, but no accepted code-block-specific clamp policy. |
| `When pressing CMD/Ctrl + Left/Right...` | `defer` | future visual-caret/navigation owner | Native visual navigation is browser-specific and needs a deliberate code navigation proof owner. |
| `Can create code block with language diff` / `diff-javascript` | `defer` | future markdown code-fence language owner | Code-fence language parsing belongs with markdown code-block shortcuts, not the current Prism example. |
| Lexical Playground toolbar/theme/output details | `reject` | none | Toolbar layout, Shiki/theme DOM, screenshots, and command dispatch are product shell, not portable Slate v2 behavior. |

#### ElementFormat Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/playwright/integration/examples/inlines.test.ts`
- `../slate-v2/site/examples/ts/inlines.tsx`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `Can center align an empty paragraph` | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx` | Browser proof creates a fresh empty paragraph, clicks center alignment, asserts CSS `text-align: center`, and verifies the collapsed selection remains on that empty block. The richtext example explicitly targets the containing block for collapsed alignment. |
| `Can indent/align paragraph when caret is within link` | `defer/reject split` | future link/block-format owner and future indent owner; current inlines and richtext owners remain separate | The source mixes link caret position, indent policy, and alignment. Current Slate has inline-link behavior and richtext block alignment separately, but no combined owner and no indent API. Do not add product indent or link-specific block-format policy to raw richtext. |
| Lexical dropdown/theme/DOM class shell | `reject` | none | Product shell, screenshots, theme classes, and toolbar layout are not portable Slate behavior. |

#### HeadingsBackspaceAtStart Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsBackspaceAtStart.spec.mjs`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/packages/slate/test/delete-contract.ts`
- `docs/solutions/logic-errors/2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `Headings - stays as a heading when you backspace at the start of a heading with no previous sibling nodes present` | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts` | Browser proof creates a single heading, collapses at `[0, 0]` offset `0`, presses Backspace, and asserts the heading text, single `h1`, zero paragraphs, and collapsed selection remain unchanged. Runtime already behaved correctly; this pass added the missing proof. |
| Lexical Playground initialization, dropdown clicks, theme class HTML | `reject` | none | Product shell and theme DOM are not portable Slate behavior. |
| raw mobile/collaboration/table-model/issue variants | `defer/reject` | future explicit owners only | This source row is a desktop richtext behavior. It does not claim raw device, collaboration, table-model, or issue closure. |

#### HeadingsEnterAtEnd Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterAtEnd.spec.mjs`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `docs/solutions/logic-errors/2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `Headings - changes to a paragraph when you press enter at the end of a heading` | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx` | Existing browser proof in `handles heading Enter behavior from the browser` creates a single heading, collapses at the end, presses Enter, and asserts one `h1` plus a following paragraph. `handleExitBlockEnter` owns the example policy for heading end and empty heading exit. |
| Lexical Playground initialization, dropdown clicks, theme class HTML | `reject` | none | Product shell and theme DOM are not portable Slate behavior. |
| raw mobile/collaboration/table-model/issue variants | `defer/reject` | future explicit owners only | This source row is a desktop richtext behavior. It does not claim raw device, collaboration, table-model, or issue closure. |

#### HeadingsEnterInMiddle Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterInMiddle.spec.mjs`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `docs/solutions/logic-errors/2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `Headings - stays as a heading when you press enter in the middle of a heading` | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts` | Existing browser proof in `handles heading Enter behavior from the browser` creates one heading, collapses in the middle, presses Enter, and asserts two `h1` blocks with the text split around the caret. |
| Lexical movement helpers, initialization, dropdown clicks, theme class HTML | `reject` | none | Movement helper timing, product shell, and theme DOM are not portable Slate behavior. |
| raw mobile/collaboration/table-model/issue variants | `defer/reject` | future explicit owners only | This source row is a desktop richtext behavior. It does not claim raw device, collaboration, table-model, or issue closure. |

#### Indentation Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/playwright/integration/examples/code-highlighting.test.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `docs/solutions/logic-errors/2026-05-09-slate-v2-code-highlighting-tab-must-indent-selected-lines.md`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `Can create content and indent and outdent it all` | `covered/defer/reject split` | code-highlighting browser owner, list outdent model owner, future paragraph/list/table indent owner | Existing Slate code-highlighting rows cover code-line Tab/Shift+Tab indentation. Existing snapshot row covers basic list outdent by lifting selected list items back to paragraphs. Paragraph padding indent, table-cell paragraph indent, all-content toolbar behavior, and exact Lexical DOM output wait for explicit indent/list/table owners. |
| `Can only indent paragraph until the max depth` | `defer` | future paragraph indent owner | Current richtext example owns alignment, not paragraph indent depth. Do not invent an indent prop or max-depth law in raw richtext. |
| `Can only indent until the max depth when list is empty` | `defer` | future list indent owner | Nested empty-list indentation and max-depth policy are list-plugin behavior. |
| `Can only indent until the max depth when list has content` | `defer` | future list indent owner | Same max-depth list policy, with text content. |
| `Can only indent until the max depth a list with nested lists` | `defer` | future list indent owner | Multi-selected nested-list max-depth behavior is valid product pressure, but Slate has no accepted list-indent API in this checkout. |
| `Cannot have negative indents (#7410)` | `defer/reject split` | future paragraph-indent import/outdent plus list-format owner | Preventing negative indent after HTML padding import and repeated outdent needs an accepted indent importer/outdent policy. The final bullet-list conversion is product/list formatting behavior, not generic raw Slate today. |
| Lexical toolbar/dropdown clicks, table shell, theme classes, screenshot-style HTML | `reject` | none | Product shell and theme DOM are not portable Slate behavior. |

#### List Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`

| Source test family | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| Create list, toggle list off, and convert unordered/ordered list types | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx` | Browser proof now selects two richtext blocks, applies a bulleted list, toggles it back to paragraphs, applies a numbered list, and converts it back to a bulleted list from the toolbar. |
| Multi-block list wrapping and quote-to-list replacement | `covered` | `../slate-v2/packages/slate/test/snapshot-contract.ts`, richtext browser owner | Snapshot rows already prove selected top-level blocks can become `list-item` children inside bulleted and numbered list wrappers. The new browser row proves the toolbar path. Exact quote-class replacement is product rendering, not a separate raw model law. |
| Partial copy from a list into a paragraph | `covered/defer split` | clipboard contract and future list-fragment browser owner | Current clipboard rows cover selected text/fragment slicing and list HTML paste. A native browser row for partial list copy can be added later only if it proves a gap beyond existing clipboard/list owners. |
| Backspace outdent, Enter outdent, empty list item exit, collapse-at-start, nested-list break removal | `defer` | future list-exit/list-indent owner | These are useful editor behaviors, but this checkout has no accepted generic list-exit or list-indent API. Do not smuggle Lexical's plugin policy into raw Slate. |
| Nested list indentation, max-depth, indent/outdent toolbar helpers, ordered-list restart/start metadata | `defer` | future list-plugin/list-normalization owner | Valid list-engine pressure, but it needs an explicit owner for indentation depth, numbering metadata, and normalization. |
| Markdown ordered-list start and paragraph markdown inside a list | `defer` | future markdown/list shortcut owner | Current markdown browser rows cover list shortcuts and adjacent markdown-list merge, not ordered start numbers or "do not process heading markdown inside list" policy. |
| Checklist focus, checklist toggle, checklist keyboard navigation | `reject/defer` | future checklist plugin owner | Checklist ARIA/focus behavior is plugin/product policy, not generic richtext/list toolbar behavior. |
| Format menu converting list items to Normal paragraphs | `defer` | future format-menu/list-split owner | Slate richtext has toolbar block buttons, not Lexical's format dropdown or its exact list splitting policy. |
| New indented list item preserving bold and autolink inside collapsed list item | `defer` | future list-insertion plus mark/link owner | The mark/link invariants are valuable, but the list insertion/indent policy is not accepted in this slice. Existing mark/link owners remain separate. |
| Toolbar shell, theme classes, DOM `value` numbering, screenshots, collaboration variants | `reject` | none | These are Lexical Playground output details, not portable Slate v2 behavior claims. |

#### Markdown Playground Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs`
- `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`
- `../slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `../slate-v2/site/examples/ts/markdown-preview.tsx`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

| Source test family | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| Numeric ordered-list shortcut, including non-1 start numbers | `already-applied` | `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`, `../slate-v2/site/examples/ts/markdown-shortcuts.tsx` | Browser proof now types `25. `, inserts text, and asserts a numbered list with `start="25"` and one item. The example parses `\d+.` shortcuts and wraps list items in `numbered-list`. |
| Heading, blockquote, bulleted-list shortcuts and list continuation | `covered/already-applied` | markdown-shortcuts browser owner | Existing rows cover h1, quote, bullet list creation, list continuation, and adjacent markdown-created bulleted-list merge. H3-H6 are supported by the example shortcut table but not duplicated as separate proof rows in this slice. |
| Markdown import/export cycles, full markdown code-block import, export next to newline | `defer` | future markdown serializer/import-export owner | Current Slate v2 exposes markdown shortcut and preview examples, not a full markdown serializer package. Do not hide import/export API design under shortcut tests. |
| Inline text transformers: bold/italic/strike nesting, intraword rules, markdown links, emoji | `defer` | future markdown text-transformer/link owner | Useful future rows, but current Slate shortcut example owns block shortcuts only. Raw inline-link clipboard/browser owners are separate and should not claim markdown-link parsing. |
| Image/equation/decorator markdown imports and several text match transformers on one line | `reject/defer` | future product decorator/markdown owner | Image/equation decorators are product/plugin behavior. They need explicit owners before any Slate proof. |
| Code-formatted text exclusion for text transformers `#7349` | `defer` | future markdown text-transformer owner | Valuable bug class, but no current markdown inline transformer owner exists. |
| Selection after link text-match transform | `defer` | future markdown-link owner | Selection placement after generated inline link needs an accepted markdown-link transform before proof. |
| List marker export/copy-paste preservation | `defer` | future markdown serializer/list owner | This is markdown export/copy policy, not the block shortcut owner. |
| HR and code-fence shortcuts | `defer` | future HR/code-block shortcut owner | Current markdown-shortcuts example does not expose HR or code-block shortcut ownership. Code-block editing is covered elsewhere. |
| Toolbar shell, markdown action button UI, theme classes, collaboration variants | `reject` | none | Product shell and Lexical Playground DOM output are not portable raw Slate behavior. |

#### TextFormatting Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs`
- `../slate-v2/packages/slate/src/editor/toggle-mark.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/richtext.tsx`

| Source test family | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| Active bold/italic/underline/code hotkeys create formatted inserted text and clear before later text | `already-applied` | `../slate-v2/packages/slate/test/snapshot-contract.ts`, `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx` | Package proofs now lock `Editor.toggleMark` and `tx.marks.toggle` clearing inherited collapsed marks. Browser proof now types with bold, italic, underline, and code hotkeys and proves later plain text stays unmarked. |
| Expanded selected text bold/italic and repeated toggle-off | `covered` | snapshot contract plus richtext browser owners | Current package rows cover expanded add/remove and mark preservation across mixed leaves. Existing richtext rows cover toolbar bold and selected-word toggle-off behavior. |
| Multiple partially overlapping marks and backward formatting at a text-node boundary | `covered/defer split` | snapshot contract and browser mark gauntlets | Core rows cover expanded mark add/remove across mixed leaves. Generated browser mark gauntlets cover selection/repair risks. Exact Lexical DOM split shape is not a separate Slate claim. |
| Underline plus strikethrough | `covered/defer split` | existing underline owner; future strikethrough owner | Richtext owns underline but does not expose strikethrough. Do not invent a strikethrough product control in this slice. |
| Capitalization, font-size, font-family, input fields, reset-on-space/tab/enter | `reject/defer` | future typography/product owner | These are Lexical Playground typography/product controls, not raw Slate mark behavior. |
| Date-time/decorator node formatting at text-node edge `#2523` | `defer` | future decorator/markable-void owner | Slate has markable void package coverage, but the date-time plugin/browser product row needs an explicit owner before claiming it. |
| Toolbar active-state CSS display | `defer/reject` | future toolbar UI owner | Active CSS class assertions belong to product UI, not raw mark behavior, unless a toolbar-state owner accepts them. |
| Multiline selection toolbar underline active state | `defer` | future toolbar UI owner | Useful UI signal, but not this mark model/browser input slice. |
| Product shell, theme classes, screenshots, collaboration variants | `reject` | none | These are Lexical Playground output details, not portable Slate v2 behavior claims. |

#### LexicalTabNode Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx`
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalTabNode.test.ts`
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
- `../slate-v2/playwright/integration/examples/paste-html.test.ts`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `can paste plain text with tabs and newlines in plain text` | `already-applied` | `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts` | Package row now proves DOM clipboard plain-text fallback keeps literal `\t` text while splitting multiline paste into separate blocks and placing selection at the end of the final line. Lexical's single-plain-text-paragraph rendering is not Slate rich-text behavior. |
| `can paste plain text with tabs and newlines in rich text` | `already-applied` | `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts` | Same package row covers rich-text block splitting with literal tab preservation. |
| `can paste HTML with tabs and new lines (2)` | `already-applied` | `../slate-v2/playwright/integration/examples/paste-html.test.ts` | Browser row now proves Google Docs `Apple-tab-span` HTML preserves two visible `Hello\tworld` lines across the paragraph plus loose-line source shape. |
| commented `#4429` span with raw tab/newline | `covered` | paste-html/browser owner | Covered by the accepted Google Docs tab row plus existing body-inline normalization. The commented Lexical TODO stays source context, not a separate claim. |
| tab at block start / multi-block tab indent | `defer` | future code/list/input keyboard owner | Indentation policy is plugin/product behavior unless a code/list owner accepts it. |
| tab in the middle / replacing selected text with tab | `defer` | future text insertion or keyboard owner | Literal tab keyboard insertion is valid, but this slice only accepted clipboard/browser paste. Do not route Lexical command API into generic Slate core. |
| TabNode serialization/type guards/selection-boundary normalization | `reject` for class/schema; `defer` for adjacent literal-tab selection | none / future text-boundary owner | Slate stores `\t` as normal text, not a TabNode class. Adjacent tab/text selection replacement can be mined later as a generic text-boundary row if a source-read owner accepts it. |
| rich-text `INSERT_TAB_COMMAND` mark inheritance | `covered`/`reject command API` | existing mark/text insertion owners | Generic mark preservation belongs to mark insertion behavior. Lexical command and TabNode format bits are not Slate API. |

### IME, Composition, And Input Runtime

| Source | Status | Slate owner | Next decision |
| --- | --- | --- | --- |
| `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs` | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/packages/slate-react/src/components/editable.tsx` | Browser rows now prove the caret stays visible while typing through line breaks in a scrollable editor root and parent. Default scroll fallback now handles Chrome zero-rect caret ranges by scrolling the leaf. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs` | `already-applied` | IME stress rows, richtext/mentions/rendering browser rows, history contract | High-value IME rows applied; only residual exact names need audit. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs` | `applied` | `../slate-v2/playwright/integration/examples/plaintext.test.ts`, `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`, `../slate-v2/packages/slate-react/src/editable/mutation-controller.ts`, `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts` | Source-read complete. Added browser proof for Mac-style beforeinput substitutions: autocapitalization via a native `insertText` followed by `insertReplacementText`, and double-space period replacement after emoji via an expanded `insertText` target range. Runtime now flushes queued native text repair before the next model-owned beforeinput, model text input applies provided replacement target ranges even after native repair moves current selection, and expanded `insertText` target ranges are honored even when model selection is preferred. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs` | `already-applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts` | Browser row now proves Slate keeps the model selection when focus moves outside the editor. Lexical plain-text tab-out row stays out unless a raw tab navigation owner is accepted. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Keyboard.spec.mjs` | `already-applied` for `insertTranspose` beforeinput | `../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`, `../slate-v2/playwright/integration/examples/plaintext.test.ts`, `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`, `../slate-v2/packages/slate-react/src/editable/mutation-controller.ts`, `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts` | Source-read complete. Added a first-class model-owned `transpose-character` command for `insertTranspose`, package proof that two adjacent transposes move `abc` to `bca`, and plaintext browser proof that synthetic `beforeinput` follows the runtime event path and preserves the collapsed selection after the swapped pair. Lexical Playground setup, OS/browser transpose flake tags, rich fixture shell, raw mobile, collaboration, table-model, and issue claims stay out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs` | `already-applied` for accepted richtext/code-block shortcut rows; `defer/reject` for product typography, checklist, and indent rows | `../slate-v2/playwright/integration/examples/richtext.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx`, `../slate-v2/playwright/integration/examples/code-highlighting.test.ts`, `../slate-v2/site/examples/ts/code-highlighting.tsx` | Source-read complete. Added browser proof and example handlers for richtext paragraph/heading block shortcuts, alignment shortcut handling, clear-formatting shortcut, and code-block conversion shortcut. Existing mark hotkeys, clear-formatting, toolbar block/list/alignment, and code-block rows cover the adjacent behavior. Heading 3, checklist, lowercase/uppercase/capitalize, strikethrough/subscript/superscript, font-size controls, paragraph indent/outdent, toolbar active-state DOM, raw mobile, collaboration, table-model, and issue claims stay deferred or rejected until explicit owners accept them. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs` | `already-applied` | DOM repair policy plus `../slate-v2/playwright/integration/examples/richtext.test.ts` | Richtext browser rows already cover native text mutation, selection, and repair traces; `dom-repair-policy-contract.ts` now locks structural child-list rollback while leaving character-data text sync alone. No desktop structural repair or raw Android device claim. |
| `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs` | `already-applied` for accepted heading-start and marked-boundary Enter rows; `covered/defer/reject` for residual text-entry rows | `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`, `../slate-v2/site/examples/ts/markdown-shortcuts.tsx`, `../slate-v2/playwright/integration/examples/richtext.test.ts`, plaintext/richtext browser and stress owners | Source-read complete. Added browser proof and markdown-shortcuts keydown policy for heading-start Enter inserting a paragraph before the heading, plus richtext browser proof for native Enter splitting between plain and bold text. Basic typing/replacement/delete rows are covered; soft-break/newline-node and whitespace-normalization rows stay deferred to explicit future owners. |
| `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs` | `defer` | WebKit/browser IME owner | Needs honest WebKit composition/delete proof; do not promote from Chromium or model-only tests. |

#### KeyboardShortcuts Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs`
- `../lexical/packages/lexical-playground/__tests__/keyboardShortcuts/index.mjs`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/site/examples/ts/code-highlighting.tsx`
- `../slate-v2/playwright/integration/examples/code-highlighting.test.ts`
- `../slate-v2/packages/slate-dom/src/utils/hotkeys.ts`

| Source test family | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| paragraph/heading block shortcuts | `already-applied` for paragraph, heading-one, and heading-two; `defer` heading-three | richtext example/browser owner | Browser proof now drives editor key events through the richtext example and proves `mod+alt+1`, `mod+alt+0`, and `mod+alt+2` convert the selected block between heading/paragraph forms. Heading three stays out because the current richtext example renders only heading one and two. |
| alignment shortcuts | `already-applied` for accepted richtext alignment owner | richtext example/browser owner | The richtext example now maps alignment hotkeys through the same `toggleBlock` owner as toolbar alignment, and browser proof covers a delivered alignment shortcut changing the selected heading alignment. Exact Lexical toolbar dropdown text stays rejected. |
| clear-formatting shortcut | `already-applied` | richtext example/browser owner | Browser proof applies a mark by shortcut, clears by `mod+\`, removes the selected mark, clears block alignment, and preserves the semantic heading block. |
| insert code block shortcut | `already-applied` | code-highlighting example/browser owner | The code-highlighting example now reuses its code-block conversion command for `mod+shift+c` and `mod+alt+c`; browser proof converts a selected paragraph into a code block with code-line content. |
| bold/italic/underline/code mark shortcuts | `covered/already-applied` | existing richtext mark-hotkey browser and package mark owners | `TextFormatting.spec.mjs` already added package and browser proof for active mark hotkeys, default prevention, inserted formatted text, and clearing active marks before later text. |
| list shortcuts | `covered/defer split` | existing richtext toolbar list owner; future stable list shortcut owner if accepted | Current browser proof covers toolbar list toggle/conversion and empty paragraph list toggle. Lexical digit-based `mod+shift+7/8/9` shortcut bindings are layout/product keymap policy; checklist is not accepted in the richtext example. |
| lowercase/uppercase/capitalize, strikethrough, subscript, superscript, font-size controls | `defer/reject` | future typography/product owner | These are Lexical Playground product formatting controls, not raw Slate editor behavior in this checkout. |
| indent/outdent shortcuts | `defer` | future paragraph/list/table indent owner | Current Slate owners cover code-line Tab/Shift+Tab and basic list outdent model flow. Paragraph padding indent/outdent by `mod+[`/`mod+]` needs an explicit indent policy owner. |
| toolbar active state, dropdown text, theme classes, browser/OS labels | `reject` | none | Product shell assertions and upstream harness labels are not portable Slate behavior. |
| raw mobile, collaboration, table-model, issue closure | `defer/reject` | future explicit owners only | This slice makes no raw-device, yjs/collaboration, table-model, or Slate issue claim. |

#### Lexical Playground TextEntry Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs`
- `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/playwright/integration/examples/plaintext.test.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- current richtext/plaintext browser stress owners

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `Can type 'Hello' as a header and insert a paragraph before` | `applied` | markdown-shortcuts browser owner and example keydown policy | Browser proof now creates a heading through the markdown shortcut, places the DOM selection at the heading start, presses Enter, and asserts one empty paragraph before the heading with selection preserved at the start of the heading. The example now converts the split empty heading to a paragraph for heading-start Enter. Solution note: `docs/solutions/logic-errors/2026-05-09-heading-start-enter-must-normalize-split-block-type.md`. |
| `Can insert a paragraph between two text nodes` | `applied` | richtext browser owner | Browser proof now types plain text, toggles bold, types bold text, places the DOM selection at the plain/bold boundary, presses native Enter, and asserts a plain paragraph followed by a bold paragraph with selection at the start of the bold text. |
| basic typing, fill/replace, select-all replacement, partial replacement, character Backspace, and word deletion | `covered` | plaintext/richtext browser rows, delete contracts, generated destructive edit and word-delete stress owners | Existing owners already prove typed insertion, select-all replacement through editor state, selected range Delete/Backspace, character deletion, word movement/delete, and follow-up insertion with synchronized model/DOM selection. No duplicate one-line browser rows were added. |
| paragraphed text entry and selection | `covered/defer split` | richtext browser stress and IME rows; future emoji/product transform owner | Current generated editing rows prove paragraph text entry plus selection movement and replacement across rich text. Lexical emoji shortcode/theme rendering is product transform output and stays out. |
| first paragraph Backspace after trimmable spaces | `defer` | future whitespace-normalization/backspace policy owner if accepted | Lexical trims playground whitespace before the paragraph Backspace assertion. Slate should not silently adopt that as generic text-entry law without an explicit whitespace-normalization owner. |
| soft-break/newline-node navigation and deletion rows | `defer` | future soft-break/line-break owner | Slate v2 currently stores hard block splits for `insertSoftBreak` in the proved core path; Lexical LineBreakNode selection behavior needs a deliberate line-break owner before copying. |
| Lexical Playground shell, theme DOM, browser/OS labels, raw mobile, collaboration, table-model, and issue claims | `reject/defer` | none / future explicit owners | This slice makes no raw-device, yjs, table-model, theme DOM, browser-flake, or issue-closure claim. |

#### Lexical Playground Events Row-Level Source Read

Source-drilled on 2026-05-09 against:

- `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs`
- `../slate-v2/playwright/integration/examples/plaintext.test.ts`
- `../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`
- `../slate-v2/packages/slate-react/test/selection-reconciler-contract.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`
- `../slate-v2/packages/slate-react/src/editable/mutation-controller.ts`
- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`

| Source test | Decision | Slate owner | Expected Slate proof |
| --- | --- | --- | --- |
| `Autocapitalization (MacOS specific)` | `applied` | plaintext browser input transport plus model-input strategy | Browser proof dispatches a native `insertText` beforeinput, mutates DOM as the browser would, then dispatches `insertReplacementText` before the `input` repair. First proof failed red with only `I`, then with `iSI`; runtime now imports queued native text before the replacement and applies the replacement to its provided target range, producing `IS`. |
| `Add period with double-space after emoji (MacOS specific) #3953` | `applied` | plaintext browser input transport plus selection reconciler | Browser proof dispatches expanded `insertText` target range over the trailing space after `🙂 `. First proof failed red as `🙂 . `; selection reconciliation now honors expanded `insertText` target ranges even when model selection is preferred, producing `🙂. `. |
| Lexical Playground emoji shortcode rendering, theme spans, `page.pause`, OS label, and plain-text/rich-text fixture shell | `reject` | none | Product shell and test harness details are not raw Slate behavior. The portable invariant is the beforeinput target-range substitution flow. |

### Selection, Inline Atoms, Voids, And Caret Movement

| Source | Status | Slate owner | Next decision |
| --- | --- | --- | --- |
| `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs` | `applied` for single-URL paste boundary; `defer/reject` for autolink plugin policy | `../slate-v2/playwright/integration/examples/inlines.test.ts`, future link/autolink plugin owner | Source-read complete. Added inlines browser proof that pasting a single URL at a collapsed Slate selection creates one safe inline link, moves the caret outside the link, and keeps follow-up typing outside the link. Broad URL/email parser matrices, delimiter tokenization, invalid URL grammar, unlink/relink UI, unlinked-autolink preservation, emoji shortcode destruction, styling/font rows, toolbar setup, exact DOM/theme output, raw mobile, collaboration, table-model, and issue claims stay deferred or rejected under future link/autolink plugin owners. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs` | `applied` for accepted dynamic text-token editing rows; `defer/reject` for hashtag plugin policy | `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`, `../slate-v2/site/examples/ts/highlighted-text.tsx` | Source-read complete. Existing highlighted-text rows already covered dynamic hashtag-style decoration, Space splitting, Delete/Backspace boundaries, transient-prefix navigation, decorated range copy/cut, and decorated-text IME/editing. Added browser proof that deleting the delimiter between `#hello` and `world` expands the decorated token, restoring the delimiter shrinks it back, and deleting the leading `#` drops the decoration while keeping the caret stable. Lexical's hashtag plugin grammar, invalid-match matrix, markdown import/export shell, format inheritance styling, exact DOM/theme output, raw mobile, collaboration, table-model, and issue claims stay deferred or rejected. |
| `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs` | `defer` | future HR/block-void owner | Source-read complete. Slate v2 has block void/image/embed proof but no HR owner in this checkout, so do not invent one under inline boundary work. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs` | `covered` for raw dynamic text-token editing; `defer/reject` for keyword plugin policy | `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`, future keyword/autocomplete plugin owner | Source-read complete. The portable rows are dynamic decorated text-token editing, delimiter merge/split updates, selection movement around the decorated range, and mark-adjacent editing. Existing highlighted-text proofs cover projected text selection/movement/editing, mark-click typing through projections, decorated IME, copy/cut semantics, hashtag-style delimiter merge/split, and deletion of selected decorated ranges. Lexical's exact `congrats` grammar, bracket/team token policy, keyword styling, product plugin setup, exact DOM/theme output, raw mobile, collaboration, table-model, and issue claims stay deferred or rejected. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs` | `already-applied` for accepted raw rows; `defer` for plugin policy | `../slate-v2/playwright/integration/examples/inlines.test.ts`, `../slate-v2/packages/slate/test/clipboard-contract.ts` | Source-read complete. Boundary typing/copy/paste rows are covered; toolbar conversion, image linking, autolink URL paste, and paste-inside-link splitting are plugin/product policy. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs` | `already-applied` for Slate markable-inline-void behavior; `reject` mutable mention text policy | `../slate-v2/playwright/integration/examples/mentions.test.ts`, `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts` | Source-read complete. Slate proves mention insertion, IME, atomic arrow selection, and inline-void clipboard. Lexical's editable mention text deletion is not Slate's markable-inline-void contract. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs` | `already-applied` for model/query rows; `defer` native shortcut matrix | `../slate-v2/packages/slate/test/query-contract.ts`, future navigation browser owner | Source-read complete. Slate already proves offset/character/word/block positions, `before`/`after`, inline fragmentation, atomic void traversal, non-selectable skipping, and top-level boundary traversal. Browser word-shortcut differences across Chromium/Firefox/WebKit/Windows/macOS are native transport rows and need an explicit keyboard/navigation browser owner before copying. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs` | `already-applied` for accepted selection/table rows; `defer` table model, RTL decorator, and format persistence rows | `../slate-v2/packages/slate/test/delete-contract.ts`, `../slate-v2/playwright/integration/examples/select.test.ts`, `../slate-v2/playwright/integration/examples/tables.test.ts`, `../slate-v2/packages/slate-react/test/selection-runtime-contract.test.ts` | Source-read complete. Existing Slate rows cover no focus-on-load/focus preservation, triple-click block selection, line/unit delete package behavior, inline insertion boundaries, table containment/triple-click/drag containment, and blurred-editor selection preservation policy. Whole-table range expansion, RTL decorator navigation, collapsible/date-time product nodes, and text-format persistence are separate owners. |
| `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs` | `covered` for raw blur persistence; `defer/reject` for always-on display overlay | `../slate-v2/playwright/integration/examples/richtext.test.ts`, future product selection-display owner | Source-read complete. The portable Slate-owned invariant is that model selection survives focus leaving the editor; current richtext browser proof already covers this in `keeps model selection when focus moves outside the editor`. Lexical's fake-selection overlay, highlight-background alignment tolerance, exact DOM/theme output, plain-text skip policy, raw mobile/device, collaboration, table-model, and issue claims stay deferred or rejected as product visualization or future dedicated owners. |
| `../lexical/packages/lexical-playground/__tests__/regression/1258-delete-forward.spec.mjs` | `already-applied` | `../slate-v2/packages/slate/test/transforms/delete/unit-character/first.tsx` | Source-read complete. Portable row is simple forward character delete at line start; existing unit-character fixture covers it. |
| `../lexical/packages/lexical-playground/__tests__/regression/1730-delete-backword.spec.mjs` | `already-applied` | `../slate-v2/packages/slate/test/transforms/delete/unit-character/multiple-reverse.tsx` | Source-read complete. Portable row is simple backward character delete at line end; existing reverse unit-character fixture covers it. |
| `../lexical/packages/lexical-playground/__tests__/regression/6974-delete-character-backward.spec.mjs` | `already-applied` | `../slate-v2/packages/slate/test/transforms/delete/point/inline-void-reverse.tsx` | Source-read complete. Existing point delete fixture already merges a following block into a prior block ending with an inline void. |
| `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs` | `already-applied` | `../slate-v2/packages/slate/test/text-units-contract.ts` | Covered by explicit Unicode text-unit distances plus forward/backward `unit: "character"` deletion rows. |
| `../lexical/packages/lexical-playground/__tests__/regression/7246-delete-character-backward-list.spec.mjs` | `already-applied` | `../slate-v2/packages/slate/test/delete-contract.ts` | Added package contract that Backspace at a following paragraph start merges into the previous list item. No browser claim. |
| `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs` | `already-applied` for generic block-void delete; `reject` Lexical NodeSelection UI policy | `../slate-v2/packages/slate/test/transforms/delete/voids-false/block-after-multiple-reverse.tsx`, `../slate-v2/packages/slate/src/transforms-text/delete-text.ts` | Added collapsed backward delete proof/fix so adjacent top-level block voids delete one at a time. HR styling and Lexical node-selection classes stay out. |
| `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx` | `already-applied` for selected rebase row; `refactor-existing` for block/style transforms | `../slate-v2/packages/slate/test/selection-rebase-contract.ts`, `../slate-v2/packages/slate/test/range-ref-contract.ts`, block transform owners | Source-read complete. Added package proof that selection rebases to a previous inline when the selected leaf is removed. Block-selection movement, `$setBlocksType`, CSS patching, and table block transforms stay out of this slice. |
| `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts` | `already-applied` for selected rebase/fragment rows; `refactor-existing` for style helpers | `../slate-v2/packages/slate/test/selection-rebase-contract.ts`, `../slate-v2/packages/slate/test/clipboard-contract.ts`, future mark/style owner | Source-read complete. Insert/extract/fragment behavior maps to current clipboard contracts; selected node-removal rebase is now locked in `selection-rebase-contract.ts`. Lexical CSS style cache and helper API details are not generic Slate core behavior. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts` | `already-applied` for inline insertion, select-all/extract, and point-order rows; `defer` token/segmented text-mode rows | `../slate-v2/packages/slate/test/query-contract.ts`, `../slate-v2/packages/slate/test/clipboard-contract.ts`, `../slate-v2/playwright/integration/examples/inlines.test.ts` | Source-read complete. Slate owners already cover inline-boundary insertion, selected fragment extraction, full-document replacement, range/point traversal, and inline boundary paste. Lexical token/segmented text modes, decorator text content, and DOM import format reset are Lexical-specific or require a separate Slate mark/style owner. |
| `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts` | `already-applied` for traversal/order rows; `already-applied` plus strengthened delete proof for destructive range rows; `reject` Lexical caret class internals and token/segmented modes | `../slate-v2/packages/slate/test/query-contract.ts`, `../slate-v2/packages/slate/test/delete-contract.ts`, `../slate-v2/packages/slate/test/operations-contract.ts`, `../slate-v2/packages/slate/test/transforms-contract.ts`, `../slate-v2/packages/slate/test/text-units-contract.ts` | Source-read complete. Slate already proves point/path ordering, common ancestor/path behavior, before/after/positions traversal, inline/void/non-selectable boundaries, raw split operations, and text-unit movement. Added compact package proof that expanded range deletion trims both sibling-leaf edges and cross-block edges before collapsing at the anchor. Lexical caret object construction, node-key mechanics, decorator payloads, and token/segmented text modes stay out. |

### Tables

| Source | Status | Slate owner | Next decision |
| --- | --- | --- | --- |
| `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs` | `defer` | `../slate-v2/playwright/integration/examples/tables.test.ts`, future table model owner | Current containment rows are applied; whole-table/range/merge/rowspan rows need table-model decision. |
| `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs` | `defer` | future table navigation/model owner | Left-arrow table selection is useful, but this non-table execution lane explicitly does not claim table-navigation parity. Reopen under a table navigation/model plan only. |
| `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts` | `defer` | future table model owner | Reject Lexical node shape; keep only raw table-cell model invariants if accepted. |
| `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts` | `reject` | none | Extension/plugin wiring. |
| `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx` | `defer` | raw-device table owner | Needs real device/touch proof, not desktop viewport. |
| `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx` | `defer` | future table model owner | Table node shape is Lexical-specific; only model invariants survive. |
| `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTablePlugin.test.tsx` | `reject` | none | Plugin wiring. |
| `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableRowNode.test.ts` | `defer` | future table model owner | Same table model boundary. |
| `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx` | `defer` | future table model owner | Full table selection model; do not claim #2558 from containment proof. |
| `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts` | `defer` | future table model owner | Utility invariants only after table model is accepted. |

### Mixed Portable Or Product-Adjacent Rows

| Source | Status | Slate owner | Next decision |
| --- | --- | --- | --- |
| `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs` | `reject` | none | Product plugin. Reopen only if a raw inline insertion invariant is split out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs` | `reject` | none | Product policy. |
| `../lexical/packages/lexical-playground/__tests__/e2e/ColumnLayoutBackspaceAtEnd.spec.mjs` | `defer` | table/layout model owner | Column layout is product/table-like; needs accepted raw model first. |
| `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs` | `reject` | none | Product node/plugin behavior. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs` | `reject` | none | Product transform/plugin; emoji text-unit rows are covered elsewhere. |
| `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs` | `reject` | none | Product node/plugin behavior. |
| `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs` | `reject` | none | Product constraint policy. |
| `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs` | `reject` for bracket special-text transform; `covered` for literal bracket typing | existing plaintext/richtext text insertion owners | Source-read complete. Bracket-triggered span replacement, bracket stripping, empty theme span output, and `shouldAllowHighlightingWithBrackets` are Lexical Playground product transform/theme policy. The disabled-option row is plain literal text insertion and is already covered by Slate text-entry/input owners. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs` | `reject` | none | Product shell; no raw Slate target. |

#### Lexical Playground SpecialTexts Row-Level Source Read

Source: `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs`.

| Source row | Decision | Slate owner | Reason |
| --- | --- | --- | --- |
| Single `[MLH Fellowship]` becomes one `.PlaygroundEditorTheme__specialText` span with brackets stripped | `reject` | none | Product text-transform and theme DOM. Slate should not copy Lexical Playground's bracket-highlighting plugin. |
| Two bracketed special texts produce two themed spans with an empty text span between | `reject` | none | Product transform output shape, not portable editor behavior. |
| Disabled bracket highlighting keeps literal `[MLH Fellowship]` text | `covered` | existing plaintext/richtext text insertion owners | Plain bracket typing is ordinary text insertion; no missing Slate owner found. |

### Portable Editor Behavior And Regressions

| Source | Status | Slate owner | Next decision |
| --- | --- | --- | --- |
| `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs` | `defer` | drag/drop owner if accepted | Drag product behavior needs a raw drag/drop owner before porting. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs` | `applied` for selected image Backspace; `already-applied` for image movement/selection and HTML image import; `defer/reject` product image flows | `../slate-v2/playwright/integration/examples/images.test.ts`, `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/packages/slate/test/query-contract.ts` | Source-read complete. Added browser proof that Backspace deletes a clicked selected image void. Existing image browser rows cover movement into/out of image voids, vertical movement, shifted selection into images, selected-image Enter, and visual spacer behavior. Existing paste-html rows cover Lexical image HTML with optional captions. Toolbar/upload, dimensions, drag/drop product policy, multi-node NodeSelection replacement, caption editor internals, raw mobile, collaboration, table-model, and issue claims stay out. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs` | `applied` for empty placeholder value/selection; `already-applied` for line-break DOM shape; `reject` product placeholder copy variants | `../slate-v2/playwright/integration/examples/placeholder.test.ts`, `../slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx` | Source-read complete. Added browser proof that a focused empty placeholder editor shows the placeholder, keeps empty model text, and selects `[0,0]` offset `0`. Existing rendered-DOM contract covers the empty-block line-break placeholder. Lexical rich/plain/collab placeholder copy is product shell text, not core editor law. |
| `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs` | `already-applied` for code-block Tab and literal-tab paste; `defer/reject` for rich paragraph Tab+IME and native start-of-line movement | `../slate-v2/playwright/integration/examples/code-highlighting.test.ts`, `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`, `../slate-v2/playwright/integration/examples/paste-html.test.ts`, future keyboard/IME/indent/text-boundary owners | Source-read complete. Existing code-highlighting browser proof owns Tab inside code lines. Existing clipboard and paste-html rows own literal tab preservation from plain text and Google Docs `Apple-tab-span` HTML. Lexical Playground's paragraph indent plus IME row, TabNode DOM output, and Ctrl/Meta+Arrow movement after typed Tab stay deferred or rejected until explicit keyboard/IME/paragraph-indent/text-boundary owners accept them. |
| `../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs` | `applied` | `../slate-v2/packages/slate-history/test/history-contract.ts` | Source-read complete. Strengthened the existing redo-invalidation stack-law row so a new edit after undo is also undoable, matching the Lexical regression invariant without importing Playground browser setup. |
| `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs` | `applied` | `../slate-v2/packages/slate/test/delete-contract.ts`, `../slate-v2/packages/slate/src/transforms-text/delete-text.ts` | Source-read complete. Added package proof for deleting a full selection whose visible content starts with an inline link and a partial selection that starts at an inline link. The delete transform now removes fully-selected inline ancestors when the expanded range crosses outside the inline, instead of leaving empty inline shells or invalid start points. |
| `../lexical/packages/lexical-playground/__tests__/regression/1113-link-newline-at-end.spec.mjs` | `applied` | `../slate-v2/playwright/integration/examples/inlines.test.ts`, `../slate-v2/site/examples/ts/inlines.tsx` | Source-read complete. Added browser proof that Enter after a typed URL wrapped as an inline link moves the selection outside the link and keeps follow-up text out of the link. Fixed the inlines example so collapsed link insertion moves one offset out of the inserted inline, avoiding an empty duplicate link on the next paragraph. |
| `../lexical/packages/lexical-playground/__tests__/regression/1384-insert-nodes.spec.mjs` | `applied` | `../slate-v2/packages/slate/test/clipboard-contract.ts`, `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`, `../slate-v2/playwright/integration/examples/code-highlighting.test.ts` | Source-read complete. Despite the filename, the portable row is code-block clipboard insertion: a copied nested code-line fragment pasted inside an active code line must merge into that code line instead of inserting a sibling or top-level code block. Added package and browser proof; `insertFragment` now fits a single nested text-block child from the same structural container into the active nested text block. Lexical Playground setup, exact gutter/theme output, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs` | `applied` | `../slate-v2/site/examples/ts/highlighted-text.tsx`, `../slate-v2/playwright/integration/examples/highlighted-text.test.ts` | Source-read complete. The accepted row maps to dynamic decorated text-token editing, not mark or inline-void behavior. Added hashtag-style projection proof for Space splitting a token, Delete at a trailing-space boundary, and Backspace from the plain tail back into the token. Lexical Playground setup, hashtag plugin product policy, exact DOM/theme output, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/regression/230-navigation-around-hashtags.spec.mjs` | `applied` | `../slate-v2/playwright/integration/examples/highlighted-text.test.ts` | Source-read complete. The accepted row maps to dynamic decorated text-token navigation after transient plain prefix insertion/deletion. Added browser proof that after deleting a prefix before `#foo`, ArrowRight moves the collapsed selection into the decorated token at offset `1` through the model-owned movement path. Lexical Playground hashtag plugin setup, exact DOM/theme output, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs` | `applied` | `../slate-v2/packages/slate/test/clipboard-contract.ts`, `../slate-v2/playwright/integration/examples/inlines.test.ts` | Source-read complete. The accepted rows are rich paste/replacement of selected plain text immediately before and immediately after an inline link. Added core fragment proofs for both inline-adjacent replacement directions and browser proof that rich HTML paste replaces selected adjacent text without expanding or swallowing the neighboring link. Lexical Playground link toolbar setup, exact DOM/theme output, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/regression/379-backspace-with-mentions.spec.mjs` | `applied` | `../slate-v2/playwright/integration/examples/mentions.test.ts` | Source-read complete. Added browser proof that splitting immediately before a leading inline mention and pressing Backspace at that line boundary preserves both mention atoms and restores the boundary selection. Lexical Playground typeahead setup, mention styling, exact DOM/theme output, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs` | `applied` | `../slate-v2/packages/slate-dom/src/utils/hotkeys.ts`, `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`, `../slate-v2/packages/slate-react/src/editable/mutation-controller.ts`, `../slate-v2/playwright/integration/examples/richtext.test.ts` | Source-read complete. Added a Mac `Ctrl+O` open-line hotkey and a dedicated model-owned `open-line` insert-break variant that inserts an empty paragraph before the current block and keeps selection there instead of moving into following text. Added browser proof for `foo` / `bar` that asserts `['foo', '', 'bar']`, selection at the empty line, and kernel command metadata. Lexical rich/plain shell, OS labels, exact DOM/theme output, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/regression/429-swapping-emoji.spec.mjs` | `applied` | `../slate-v2/playwright/integration/examples/richtext.test.ts` | Source-read complete. Added browser proof that Enter at the start of a plain Unicode emoji line opens an empty block before it, keeps selection at the emoji-line start, and Backspace rejoins without corrupting emoji text or selection. Lexical emoji substitution UI, exact emoji span/theme DOM, flaky tag, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/regression/4872-full-row-span-cell-merge.spec.mjs` | `defer` | future table model owner | Rowspan/merge table model. |
| `../lexical/packages/lexical-playground/__tests__/regression/4876-unmerge-cell.spec.mjs` | `defer` | future table model owner | Unmerge cell table model. |
| `../lexical/packages/lexical-playground/__tests__/regression/5251-paste-into-inline-element.spec.mjs` | `applied` | `../slate-v2/packages/slate/test/clipboard-contract.ts`, `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`, `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`, `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`, `../slate-v2/playwright/integration/examples/inlines.test.ts` | Source-read complete. The accepted row is selected inline-link text replacement by a rich clipboard payload: pasted content must stay outside the surviving link tail. Added package proof for rich fragment insertion, DOM clipboard fallback proof for HTML-with-plain-text payloads, and browser proof on the inlines example. `insertFragment` now handles selected one-level inline text with a single replacement operation, and DOM plain-text fallback routes expanded same-inline selections through fragment insertion instead of inheriting the inline. Lexical Playground link toolbar setup, exact DOM/theme output, browser clipboard quirks beyond DataTransfer fallback, raw mobile, collaboration, table-model, and issue rows stay out. |
| `../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs` | `applied` | `../slate-v2/playwright/integration/examples/dom-coverage-boundaries.test.ts` | Source-read complete. Added browser proof that a native drag selection from a materialized list item to a non-editable boundary placeholder imports to a valid Slate range without page errors. This preserves the portable crash guard without importing Lexical Playground drag helpers, horizontal-rule product shell, exact DOM/theme output, raw mobile/device, collaboration, table-model, or issue claims. |
| `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs` | `defer` | future table model owner | Column header / merged cells table model. |
| `../lexical/packages/lexical-playground/__tests__/regression/7354-firefox-decorator-paste.spec.mjs` | `already-applied` | plaintext/editable-void browser owners | Firefox decorator/native paste class covered by selected apply lane. |
| `../lexical/packages/lexical-playground/__tests__/regression/7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs` | `applied` | `../slate-v2/playwright/integration/examples/editable-voids.test.ts`, `../slate-v2/site/examples/ts/richtext.tsx`, `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`, `../slate-v2/packages/slate-react/src/editable/selection-controller.ts` | Source-read complete. The portable row is rich clipboard insertion inside a nested editable island plus restoring the parent editor afterward, not Lexical `SELECTION_INSERT_CLIPBOARD_NODES_COMMAND`. Added editable-void browser proof that rich HTML paste inside the nested rich-text editor preserves bold text, stays out of the parent value, preserves the parent selection, and still lets the parent editor type afterward. RichText now owns a narrow HTML paste capability that reuses the shared deserializer while normalizing to supported rich-text blocks and marks. Selection import now rejects beforeinput/selectionchange ranges whose endpoints cross from the parent editor into a nested editor. Lexical image caption UI, Playground command harness, exact DOM/theme output, raw mobile/device, collaboration, table-model, and issue claims stay out. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx` | `already-applied` for empty inline DOM line-break behavior; `covered` for read/update, normalization, command, move, and state rows; `reject/defer` for the rest | `../slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`, core editor contracts | Added empty-inline DOM proof that a non-empty block does not render a visual line break inside an empty inline element. Existing read/update, transaction, normalization, operations, command, and snapshot contracts cover accepted model behavior. Lexical editor API shape, node-key maps, listener/mutation registration, update tags as Lexical internals, decorator rendering, root mounting, DOM reconciliation, and product-shell rows stay out or remain separate runtime owners. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts` | `already-applied` for removed runtime-id purge; `covered` for read/snapshot immutability; `reject` for Lexical JSON/node-map internals | `../slate-v2/packages/slate/test/snapshot-contract.ts`, read/update/headless contracts | Source-read complete. Strengthened remove-node snapshot proof so removed block and text runtime IDs disappear from both current `idToPath` and `pathToId`. Existing snapshot immutability and read/update owners cover accepted state-boundary behavior. Lexical `EditorState` constructor, frozen node map identity, JSON schema, node keys, and parser/editor-context API rows stay out. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts` | `reject` | none | Source-read complete. Despite the filename, this file only tests Lexical DOM class-name helpers (`addClassNamesToElement` / `removeClassNamesFromElement`) for empty, multiple, and whitespace-separated class strings. That is generic DOM utility behavior, not portable editor behavior for Slate v2. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts` | `reject` | none | Extension core API is Lexical architecture. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts` | `already-applied` for ancestry/sibling/common-ancestor query rows; `covered` for text content, empty-block normalization, and structural mutation rows; `reject/defer` for the rest | `../slate-v2/packages/slate/test/query-contract.ts`, normalization/operation/transform owners | Added compact query proof for ancestors, reverse ancestors, sibling path order, common ancestors, previous/next paths, and parent/ancestor predicates. Existing owners cover text content, empty-block normalization, selected removal/rebase, text split/merge, and move/insert/replace transforms. Lexical class API, node keys, clone/config/JSON, live-node read throws, DOM output, token/segmented/directionless text modes, and `selectNext` helper shape stay out or route to later keyboard/selection owners. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts` | `defer` | extension/state namespace owner if accepted | Node-state is Lexical-specific unless mapped to Slate extension state. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx` | `already-applied` for selection edge normalization; `reject/defer` for decorator and element-point internals | `../slate-v2/packages/slate/test/query-contract.ts` | Source-read complete. The portable row is not tree repair: Lexical `$normalizeSelection` maps element-backed endpoints to text endpoints. Added query proof that element paths, nested element paths, and backward ranges resolve to stable text points through `Editor.range`, `Editor.edges`, and `Editor.point`. Lexical decorator endpoint semantics and element-point API shape stay out or route to a future decorator/void/browser selection owner. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts` | `reject` | none | Lexical reconciliation internals. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalSerialization.test.ts` | `already-applied` for raw value JSON round-trip; `reject` for Lexical schema/parser internals | `../slate-v2/packages/slate/test/state-tx-public-api-contract.ts` | Source-read complete. Added compact public-state proof that rich raw document values round-trip through JSON and rehydrate as `initialValue` without runtime index metadata. Existing operation serialization fixtures cover operation JSON. Lexical editor-state JSON schema, node keys, parser API shape, and code/list/table node metadata stay out. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts` | `defer` | commit metadata/update tag owner if accepted | Possible Slate commit metadata pressure, but not a direct test port. |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts` | `already-applied` for generic shortcut matching; `covered` for query/runtime/commit rows; `reject/defer` for the rest | `../slate-v2/packages/slate-dom/test/hotkeys.ts`, core query/state/commit and React/browser owners | Source-read complete. Added generic `isHotkey` proof for semantic letter keys, uppercase keys, ASCII remapped layouts, and non-English physical-key fallback. Existing Hotkeys, query, runtime-id, state/read/update, commit metadata, focus/autoscroll, and browser selection owners cover the accepted rows. Lexical microtask helpers, random keys, token/segmented modes, node-key maps, cached type maps, node replacement/copy class APIs, listener order, and generic DOM utilities stay out or route to later dedicated owners. |
| `../lexical/packages/lexical/src/__tests__/unit/mergeRegister.test.ts` | `reject` | none | Listener registration utility, not editor behavior. |
| `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts` | `already-applied` | `../slate-v2/packages/slate/test/query-contract.ts` | Added package contract for sibling order, descendant depth-first paths, and lowest leaf/element range traversal; rejected Lexical caret helper API shape. |
| `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx` | `already-applied` for query/text traversal rows; `covered` or `reject/defer` for the rest | `../slate-v2/packages/slate/test/query-contract.ts`, operations/normalization owners | Added nested text-leaf and text-content query proof. Splice/selection rows route through existing operation/selection owners; DOM slot, indexPath, node lifecycle, and Lexical JSON schema rows stay out. |
| `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx` | `defer` | memory/retention owner if accepted | Only port if tied to Slate retained refs/history memory proof. |
| `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts` | `already-applied` for accepted linebreak/newline behavior; `reject` for Lexical node API rows | `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/packages/slate-react/test/primitives-contract.tsx`, insert-break/input owners | Source-read complete. Slate has no LineBreakNode equivalent: Lexical type/schema/update/type-guard rows stay out. Accepted behavior is already covered by Quip `<br>` paste preserving newline text, line-break placeholder DOM proof, structural insert-break contracts, and Android newline-to-soft-break handling. |
| `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts` | `already-applied` for paragraph alignment import; `covered` for split/merge; `reject` for Lexical node API rows | `../slate-v2/playwright/integration/examples/paste-html.test.ts`, `../slate-v2/site/examples/ts/paste-html-import.ts`, insert-break/transform contracts | Added paste-html browser proof for valid paragraph alignment import: legacy `align`, CSS `text-align` precedence, and invalid align rejection. Existing insert-break/transform contracts cover split/merge shape; Lexical constructor/schema/DOM class/factory/type-guard rows stay out. |
| `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts` | `already-applied` for selected top-level child removal; `covered` for root normalization/string rows; `reject` for Lexical root API/cached-text rows | `../slate-v2/packages/slate/test/selection-rebase-contract.ts`, `query-contract.ts`, `normalization-contract.ts`, `snapshot-contract.ts` | Added package proof that removing a selected top-level block rebases to the next surviving block, and that removing the selected only block clears selection because Slate has no root selection point. Existing root normalization/top-level cleanup and `Editor.string` contracts cover Slate root behavior; Lexical constructor/schema/clone/DOM helper/root type guard/cached-text/decorator rows stay out. |
| `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx` | `already-applied` for text split/merge selection rebase; `covered` for text content/format/import rows; `reject` for Lexical text node API/rendering rows | `../slate-v2/packages/slate/test/operations-contract.ts`, `text-units-contract.ts`, `normalization-contract.ts`, `editor-methods-contract.ts`, `playwright/integration/examples/paste-html.test.ts` | Added package proof that raw text `split_node` rebases expanded selections across split branches and raw text `merge_node` rebases selection into the surviving branch. Existing owners cover text-unit deletion, adjacent compatible text normalization, mark add/remove/toggle, and rich HTML mark import. Lexical JSON schema, node-key, mode/detail/style internals, DOM create/update/export rendering policy, node-state, and composition-key internals stay out. |

#### Lexical Playground Placeholder Row-Level Source Read

Source: `../lexical/packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs`.

| Source row | Decision | Slate owner | Reason |
| --- | --- | --- | --- |
| Empty editor displays placeholder while document HTML stays one empty paragraph | `applied` / `already-applied` | `../slate-v2/playwright/integration/examples/placeholder.test.ts`, `../slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx` | Browser proof now locks visible placeholder with empty model text and focused start selection. Package rendered-DOM proof owns the empty block's one line-break placeholder. |
| Focused empty editor selection is `[0]` offset `0` in Lexical | `applied` | `../slate-v2/playwright/integration/examples/placeholder.test.ts` | Slate equivalent is `[0, 0]` offset `0` because Slate addresses the leaf text node under the empty paragraph. |
| Rich/plain/collab placeholder copy differs by playground mode | `reject` | none | Product shell text, not portable editor behavior. |

#### Lexical Playground Images Row-Level Source Read

Source: `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs`.

| Source row | Decision | Slate owner | Reason |
| --- | --- | --- | --- |
| Keyboard deletion of a clicked selected image | `applied` | `../slate-v2/playwright/integration/examples/images.test.ts` | Browser proof now clicks the image void, confirms model selection at `[1, 0]`, presses Backspace, and verifies the image count drops. |
| Arrow movement into/out of images, vertical movement, shifted selection into images | `already-applied` | `../slate-v2/playwright/integration/examples/images.test.ts`, `../slate-v2/packages/slate/test/query-contract.ts` | Current image browser rows and core void position rows already cover atomic image selection/navigation. |
| Lexical image HTML import with optional caption | `already-applied` | `../slate-v2/playwright/integration/examples/paste-html.test.ts` | Covered by the `ImageHTML.test.ts` slice: no-caption image and plain-text figcaption import. |
| URL/upload dialogs, image dimensions, drag/drop, caption editor UI, multi-node NodeSelection replacement | `defer/reject` | future explicit owners only | Product image workflow, renderer sizing policy, drag/drop, and Lexical NodeSelection behavior are not direct Slate core coverage. |

#### Lexical Playground Tab Row-Level Source Read

Source: `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs`.

| Source row | Decision | Slate owner | Reason |
| --- | --- | --- | --- |
| Tab inside a code block after markdown code-fence creation | `already-applied` | `../slate-v2/playwright/integration/examples/code-highlighting.test.ts` | Current code-highlighting browser proof already locks Tab inside a code line inserting configured whitespace and advancing the caret. The Lexical row's exact TabNode DOM/token class output is not a Slate claim. |
| Literal tab preservation from plain text and Google Docs HTML | `already-applied` | `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`, `../slate-v2/playwright/integration/examples/paste-html.test.ts` | The earlier LexicalTabNode slice already added plain-text tab/newline fallback proof and Google Docs `Apple-tab-span` browser proof. |
| Paragraph Tab followed by Chromium CDP IME composition | `defer/reject` | future keyboard/IME/paragraph-indent owner | This combines Lexical Playground paragraph indent policy, a TabNode text representation, Chromium-only CDP composition, and IME behavior. It is valuable source context, but not a clean raw Slate row until an explicit paragraph-indent plus IME owner accepts it. |
| Ctrl/Meta+ArrowLeft after typed Tab returns to start of line | `defer` | future text-boundary or keyboard owner | Browser-native line movement around a typed tab is worth a later boundary proof only if Slate accepts keyboard insertion of literal tabs as editor-owned behavior. This slice should not smuggle that policy through TabNode parity. |

#### Lexical Playground Regression 1055 Fast Typing Undo Row-Level Source Read

Source: `../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs`.

| Source row | Decision | Slate owner | Reason |
| --- | --- | --- | --- |
| Type `hello`, undo to empty, type `hello` again, undo to empty again | `applied` | `../slate-v2/packages/slate-history/test/history-contract.ts` | The portable invariant is stack law: after undo, the next user edit must start a fresh undoable batch and clear redo. The existing Slate history row already proved redo invalidation; it now also undoes the follow-up edit back to the pre-edit state. |
| Lexical Playground HTML theme output and browser helper setup | `reject` | none | The paragraph `<br />` DOM and helper-driven browser setup are Lexical Playground harness details. Slate coverage belongs in the history contract unless a browser history-hotkey owner is missing. |

#### Lexical Playground Regression 1083 Backspace With Element At Front Row-Level Source Read

Source: `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs`.

| Source row | Decision | Slate owner | Reason |
| --- | --- | --- | --- |
| Select all when the visible paragraph starts with a link, press Backspace, leave an empty paragraph | `applied` | `../slate-v2/packages/slate/test/delete-contract.ts`, `../slate-v2/packages/slate/src/transforms-text/delete-text.ts` | Slate normalizes an empty spacer before leading inline content, so the proof selects from that spacer through the trailing text. The delete transform now removes the fully-selected inline link and normalizes to one empty text leaf. |
| Select `HelloWorld` where `Hello` is an inline link after preceding text, press Backspace, preserve preceding `Say` | `applied` | `../slate-v2/packages/slate/test/delete-contract.ts`, `../slate-v2/packages/slate/src/transforms-text/delete-text.ts` | The transform now treats a fully-selected inline ancestor as a removable node only when the selection crosses outside that inline. This prevents empty inline shells from surviving expanded deletes while preserving existing inside-inline deletion behavior. |
| Lexical toolbar link creation, exact theme DOM, browser helper setup | `reject` | none | Product shell and harness details are not portable Slate behavior. |

### Collaboration

| Source | Status | Slate owner | Next decision |
| --- | --- | --- | --- |
| `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs` | `defer` | `../slate-v2/packages/slate/test/collab-history-runtime-contract.ts`, future slate-yjs browser owner | Current substrate is covered; browser yjs parity waits for a real owner. |

## Nonportable Accounting

| Bucket | Count | Processing |
| --- | ---: | --- |
| `product-shell` | 33 | `plate-owned` when the row describes reusable Plate plugin/product behavior; otherwise `reject` unless a later pass splits a raw invariant out of a product file. |
| `harness` | 12 | `reject` as direct behavior; reuse techniques only. |
| `skip` | 89 | `reject` with original harvest reasons preserved in `inventory.md`. |

## Priority Apply Queue

1. Delete-character and adjacent delete regressions selected for this phase are applied or covered: simple forward/backward character rows, inline-void block join, list merge, and adjacent block-void delete. Lexical #7163 is applied.
2. Clipboard HTML source rows selected for this phase are applied. Remaining link paste-into-existing rows are later inline-paste work; table custom widths, merge grids, rowspan/colspan, empty rows, and table-cell block normalization stay deferred.
3. DOM mutation repair row from `Mutations.spec.mjs` is applied for accepted Slate owners: browser text mutation/selection traces plus package structural repair policy. No desktop structural repair or raw Android device claim.
4. Focus/autoscroll browser rows are applied for accepted raw Slate behavior: outside-focus model selection and caret-visible root/parent scrolling while typing.
5. Inline paste/mention/link/HR boundary rows are processed for this pass:
   link boundary copy/paste rows applied, mention raw Slate behavior already
   covered, HR deferred to a future HR/block-void owner, and link-plugin policy
   rows are Plate-owned unless a raw invariant is split out.
6. Navigation, Selection, LexicalSelection, and LexicalCaret source-read rows are applied or classified. The LexicalCaret pass strengthened delete contracts for portable destructive range edges and rejected Lexical caret-object internals.
7. `docs-traversals.test.ts` is applied in the Slate query contract for accepted package traversal behavior. No browser, raw mobile, collaboration, table-model, or issue claim.
8. `LexicalElementNode.test.tsx` is applied/classified for this pass: query/text traversal proof added, existing operation/selection/normalization owners cover the rest of the accepted behavior, and DOM slot/node lifecycle/schema rows stay out.
9. `LexicalLineBreakNode.test.ts` is source-read and classified: accepted linebreak/newline behavior is already applied by existing browser/React/input owners, while Lexical node class/schema/type-guard rows stay out.
10. `LexicalParagraphNode.test.ts` is applied/classified: paragraph alignment import is now covered by paste-html browser proof and importer/rendering support; split/merge routes to existing owners; Lexical node class/schema rows stay out.
11. `LexicalRootNode.test.ts` is applied/classified for this pass: selected top-level child removal proof added, root normalization/string behavior routes to existing owners, and Lexical root class/cached-text internals stay out.
12. `LexicalTextNode.test.tsx` is applied/classified for this pass: split/merge selection rebase proof added, text content/format/import rows route to existing owners, and Lexical text node API/rendering rows stay out.
13. `LexicalTabNode.test.tsx` and rich-text TabNode rows are applied/classified for this pass: plain-text tabs/newlines and Google Docs `Apple-tab-span` paste are now covered; TabNode class/schema/command API rows stay out; indent and adjacent literal-tab selection rows are deferred to their own owners.
14. `LexicalEditor.test.tsx` is applied/classified for this pass: empty-inline DOM line-break proof added, existing Slate owners cover accepted read/update, transaction, normalization, command, move, and state behavior, and Lexical editor API/listener/decorator/root-mounting internals stay out.
15. `LexicalEditorState.test.ts` is applied/classified for this pass: removed runtime IDs are now explicitly purged from current snapshot indexes, accepted state-boundary rows route to existing owners, and Lexical node-map/JSON/editor-context API rows stay out.
16. `LexicalElementHelpers.test.ts` is rejected after source-read: it only tests DOM class-name helper utilities, not editor element/query behavior.
17. `LexicalNode.test.ts` is applied/classified for this pass: ancestry/sibling/common-ancestor query proof added, existing owners cover accepted text/normalization/mutation behavior, and Lexical class/node-key/config/DOM/helper rows stay out.
18. `LexicalNormalization.test.tsx` is applied/classified for this pass: selection edge normalization proof added to the query contract, and Lexical decorator/element-point internals stay out.
19. `LexicalSerialization.test.ts` is applied/classified for this pass: raw document value JSON round-trip proof added, while Lexical editor-state JSON schema/parser/node-key rows stay out.
20. `LexicalUtils.test.ts` is applied/classified for this pass: generic shortcut matching proof added, accepted query/runtime/commit/scroll rows route to existing owners, and Lexical utility/node-class internals stay out.
21. `LexicalUtilsInsertNodeToNearestRoot.test.tsx` is applied/classified for this pass: highest-block insertion proof added, existing insertNodes fixtures cover direct paragraph/root rows, and Lexical command/node-key/decorator/shadow-root internals stay out.
22. `LexicalUtilsSplitNode.test.tsx` is applied/classified for this pass: root split rejection proof added, existing splitNodes/operation fixtures cover direct split rows, and Lexical helper/API/HTML/list specifics stay out.
23. `LexicalCodeNodeTabs.test.ts` from `lexical-code-shiki` and `lexical-code` is applied/classified for this pass: Slate code-highlighting Tab browser proof added, while Lexical indent/outdent command matrix, Shiki/theme policy, and backward-selection command semantics stay out.
24. `LexicalCodeNode.test.ts` is applied/classified for this pass: Slate code-highlighting multi-line Tab and Shift+Tab proof added, while Lexical node class/DOM/export, language metadata, tokenizer/highlighter transform, Alt+Arrow line shifting, Home/End visual-caret, command dispatch, and node-key rows stay out or wait for separate accepted owners.
25. `LexicalHistory.test.tsx` is applied/classified for this pass: redo-stack clearing, selected block property undo/redo, and node-property history capture proof added; Lexical command/CAN flags and shared nested editor history stay out.
26. `LexicalHtml.test.ts` is source-read/classified for this pass: selected-fragment clipboard export and paragraph alignment import are covered by current owners; standalone HTML serializer and custom node export APIs stay rejected/deferred until a generic Slate HTML serializer owner exists.
27. `lexical-list/src/__tests__/unit/utils.test.ts` is source-read/applied for this pass: list depth, top-list ancestry, and terminal item behavior are now locked as public path/query behavior; Lexical helper API shape stays out.
28. `231-empty-text-nodes.spec.mjs` is source-read/applied for this pass: repeated delete through token-like marked text now collapses to a canonical empty block; hashtag/plugin/CSS/collab rows stay out.
29. `3433-merge-markdown-lists.spec.mjs` is source-read/applied for this pass: markdown-created adjacent bulleted lists now merge in the markdown-shortcuts example; Playground/CSS/plain-text/collab rows stay out.
30. `defer` table model rows until the table selection model decision is explicit.
31. `LexicalHeadingNode.test.ts` is source-read/applied for this pass: browser proof now covers heading middle split, heading-end paragraph insertion, and empty-heading paragraph insertion; Lexical class/DOM/tag API rows stay out.
32. `LexicalQuoteNode.test.ts` is source-read/applied for this pass: browser proof now covers empty blockquote Enter creating a paragraph after the quote; Lexical class/DOM/theme API rows stay out.
33. `$sliceSelectedTextNodeContent.test.ts` is source-read/applied for this pass: selected text fragment slicing now covers partial unmarked and bold leaves plus source immutability; Lexical helper API internals stay out.
34. `LexicalListItemNode.test.ts` is source-read/applied for this pass: non-empty list-item split is locked in the snapshot contract; Lexical class/DOM rows stay out, and replace/remove/indent/numbering rows stay deferred to explicit list owners.
35. `LexicalListNode.test.ts` is source-read/applied for this pass: numbered-list wrapper formatting is locked in the snapshot contract; Lexical class/DOM/subclass/checklist/value rows stay out or deferred.
36. `formatList.test.ts` is source-read/classified for this pass: root list formatting and non-empty continuation route to existing Slate owners; empty-item exit/split, whitespace-only exit, decorator rows, table-cell insertion, subclass preservation, indent/outdent helper APIs, and ordered-list metadata are Plate-owned list policy unless a raw invariant is split out.
37. `registerListStrictIndentTransform.test.ts` is source-read/classified for this pass: compact malformed nested-list import is already represented by the paste-html browser corpus; exact strict indentation normalization, serializer output, and transform registration are Plate-owned list/serializer policy.
38. `LexicalMarkdown.test.ts` is source-read/classified for this pass: current Slate browser examples cover quote/list/heading markdown shortcuts, while broad markdown import/export, normalization, nested fences, hard breaks, whitespace, list-marker/checklist metadata, MDX/custom transformer rows, and code-fence Enter shortcuts are Plate-owned markdown package rows.
39. `MarkdownTransformers.test.ts` is source-read/classified for this pass: markdown link parsing, greedy-match prevention, formatted-prefix preservation, and no-nested-link transform behavior are Plate-owned markdown-link plugin/serializer rows; current raw inline-link boundary and clipboard owners remain separate.
40. `ClearFormatting.spec.mjs` is source-read/applied for this pass: richtext now has a clear-formatting command and browser proof for selected mark removal, block alignment reset, semantic blockquote preservation, and cross-paragraph partial clearing. Link/mention/hashtag, indent/outdent, theme markup, raw mobile, collaboration, table-model, and issue rows stay out.
41. `CodeBlock.spec.mjs` is source-read/applied for this pass: code-highlighting now has browser proof for selected paragraph-to-code-block conversion and code-line output. Existing code-highlighting rows cover Enter and Tab behavior. Markdown code fences, language parser matrix, auto-indent-on-newline, line movement, visual navigation, raw mobile, collaboration, table-model, and issue rows stay out.
42. `ElementFormat.spec.mjs` is source-read/applied for this pass: richtext now proves fresh empty paragraph center alignment and explicitly targets the collapsed alignment block. Link+indent exact behavior stays deferred to future link/block-format plus indent owners; product shell rows stay rejected.
43. `HeadingsBackspaceAtStart.spec.mjs` is source-read/applied for this pass: richtext now proves Backspace at the start of the first heading is a no-op preserving heading text, element type, and collapsed selection.
44. `HeadingsEnterAtEnd.spec.mjs` is source-read/classified for this pass: existing richtext browser proof already covers Enter at the end of a heading creating a paragraph after the heading.
45. `HeadingsEnterInMiddle.spec.mjs` is source-read/classified for this pass: existing richtext browser proof already covers Enter in the middle of a heading splitting it into two headings.
46. `Indentation.spec.mjs` is source-read/classified for this pass: code-line Tab/Shift+Tab and basic list outdent are already owned; paragraph/table/list max-depth indent and negative-indent policy stay deferred to explicit indent/list/table owners; toolbar/theme rows stay rejected.
47. `List.spec.mjs` is source-read/classified for this pass: toolbar list toggle/conversion is now applied in richtext browser proof; existing snapshot/browser owners cover basic list formatting; checklist, indentation depth, list-exit/collapse, ordered metadata, markdown-start, format-menu split, and autolink/list are Plate-owned list policy rows. Raw mobile, collaboration, table-model, and theme DOM rows stay deferred or rejected.
48. `Markdown.spec.mjs` is source-read/applied for this pass: numeric ordered-list shortcut with start number is now applied in the markdown-shortcuts browser/example owner; import/export, inline transformers, decorator imports, code-formatted exclusion, link-transform selection, list-marker export, and HR/code-fence shortcuts are Plate-owned markdown/plugin rows. Raw mobile, collaboration, table-model, and theme DOM rows stay deferred or rejected.
49. `TextFormatting.spec.mjs` is source-read/applied for this pass: mark hotkey insertion/toggle-off is now locked with package and richtext browser proof; `tx.marks.toggle` default/inherited mark clearing is fixed. Font-size/family, capitalization, strikethrough, decorator formatting, toolbar active-state CSS, raw mobile, collaboration, table-model, and theme DOM rows stay deferred or rejected.
50. `CodeBlock.test.ts` is source-read/applied for this pass: paste-html now imports representative code-source HTML from `<pre>`, whitespace-preserving editor `<div>`s, and GitHub code tables as one code block without source gutters. Source-token styling, title inference, sub/sup typography, raw mobile, collaboration, table-model, and issue rows stay deferred or rejected.
51. `LexicalEditorListener.test.ts` is source-read/classified for this pass: current Slate subscriber and commit-listener owners already cover the accepted unsubscribe/source-routing behavior; root/editable listener callback cleanup rows stay deferred or rejected as Lexical API/root-shell policy.
52. `LexicalListPlugin.test.tsx` is source-read/applied for this pass: richtext now proves empty paragraph toolbar list toggle into and out of one list item; list indent/outdent and #7036 list-policy rows stay deferred/rejected to future explicit list owners.
53. `HTMLCopyAndPaste.spec.mjs` is source-read/applied for this pass: paste-html now proves multiline HTML paragraphs with extra raw newlines normalize to four paragraphs with inline `<b>` / `<i>` formatting preserved, and the code-source corpus includes `<code>` with `<br>` line breaks. HR insertion/splitting rows stay deferred to a future HR/block-void plus block-fragment owner.
54. `ListsHTMLCopyAndPaste.spec.mjs` is source-read/classified for this pass: basic list HTML import, nested `ul` variants, and nested `<div>` list-item boundaries are already applied in the paste-html browser corpus; structural post-fragment selection is covered by clipboard contracts. Checklist/private attributes, toolbar indent/outdent, and HR-in-list splitting stay rejected or deferred to explicit future owners.
55. `ListsCopyAndPaste.spec.mjs` is source-read/applied for this pass: package clipboard proof covers copying a partial list item plus following paragraph into an empty editor, inserting the same fragment into an empty list item by splitting the surrounding list, inserting a copied list into selected paragraph text without swallowing surrounding text, inserting two paragraphs into the middle of a list item by keeping the first paragraph as list item text and promoting the tail paragraph, and inserting two paragraphs at the end of a list as one list item plus following block. Exact Lexical DOM classes, `value` attributes, native clipboard transport, browser/OS flake tags, raw mobile, collaboration, table-model, and issue claims stay out of this package row.
56. `ImageHTML.test.ts` is source-read/applied for this pass: paste-html now proves Lexical image HTML export shapes with no caption and with plain-text figcaption. The importer unwraps paragraph wrappers that only contain block elements so a block image is not nested under a paragraph. Caption text imports as a following paragraph. Lexical serializer API, exact `alt`/`height`/`width` attributes, caption editor internals, native clipboard transport, raw mobile, collaboration, table-model, and export claims stay out.
57. `HTMLCopyAndPaste.test.ts` is source-read/applied for this pass: paste-html now proves core HTML block shapes from plain text, malformed paragraphs, generic `div` boundaries, nested spans/divs, nested span in `div`, and nested `div` in span. The importer treats generic `div` as a block-boundary fragment while preserving list-item `div` handling. Strong paste mark inheritance and iOS prediction fallback are already covered. Checklist rows stay deferred/rejected to a future checklist/list-plugin owner.
58. `CopyAndPaste.spec.mjs` is source-read/applied for this pass: DOM clipboard now proves multi-paragraph fragments pasted into an empty block quote keep the first pasted text block in the target quote and promote the tail paragraph. Current owners already cover multi-block copy/paste, full-document replacement, inline link fragments, multiline plain-text splitting, font-size HTML, and collapsed-copy/cut clipboard preservation. Heading source-wrapper paste, hashtag/product spans, decorator embeds, exact plaintext rendering, native transport flake tags, raw mobile, collaboration, and table-model rows stay out or deferred.
59. `Events.spec.mjs` is source-read/applied for this pass: plaintext browser proof now covers Mac-style beforeinput substitutions for autocapitalization and double-space period replacement after emoji. Runtime now flushes queued native text before the next model-owned beforeinput, text input uses provided replacement target ranges, and expanded `insertText` target ranges are honored even when model selection is preferred. Product shell/theme/OS harness details stay out.
60. `Keyboard.spec.mjs` is source-read/applied for this pass: Slate React now owns `insertTranspose` as a model-owned beforeinput command, with package and plaintext browser proof that repeated adjacent character transpose turns `abc` into `bca` and leaves selection after the swapped pair. Lexical Playground setup, browser/OS flake tags, raw mobile, collaboration, table-model, and issue rows stay out.
61. `KeyboardShortcuts.spec.mjs` is source-read/applied for this pass: richtext now proves paragraph/heading block shortcuts, delivered alignment shortcut handling, and clear-formatting shortcut behavior through browser events; code-highlighting now proves selected paragraph-to-code-block conversion by shortcut. Existing owners cover mark hotkeys, toolbar list conversion, clear-formatting semantics, and code-line editing. Heading three, checklist, product typography, font-size controls, paragraph/list/table indent shortcuts, active-state DOM, raw mobile, collaboration, table-model, and issue rows stay deferred or rejected.
62. `TextEntry.spec.mjs` is source-read/applied for this pass: markdown-shortcuts now proves heading-start Enter creates a paragraph before the heading, and richtext now proves native Enter splits between plain and bold text into separate paragraphs while preserving bold text and selection. Basic typing/replacement/delete rows are covered by existing plaintext/richtext/browser stress owners; soft-break/newline-node behavior stays deferred to an explicit soft-break owner.
63. `SpecialTexts.spec.mjs` is source-read/classified for this pass: bracket special-text highlighting is rejected as product transform/theme policy, and disabled-option literal bracket typing is covered by existing text insertion owners. No Slate code/test edit.
64. `Placeholder.spec.mjs` is source-read/applied for this pass: placeholder browser proof now covers visible placeholder plus empty model text and focused start selection; existing rendered-DOM contracts own the empty-block line-break shape; Lexical rich/plain/collab placeholder copy stays rejected as product shell text.
65. `Images.spec.mjs` is source-read/applied for this pass: image browser proof now covers Backspace deleting a clicked selected image void; existing image/paste/query owners cover movement, shifted selection, and Lexical image HTML import; toolbar/upload/dimensions/drag/drop/caption/multi-node NodeSelection rows stay deferred or rejected.
66. `Tab.spec.mjs` is source-read/classified for this pass: existing code-highlighting, clipboard-boundary, and paste-html rows cover the accepted code/literal-tab behavior; paragraph Tab+IME, TabNode DOM output, and Ctrl/Meta+Arrow movement after typed Tab stay deferred or rejected to future explicit owners. No Slate code/test edit.
67. `1055-fast-typing-undo.spec.mjs` is source-read/applied for this pass: the history contract now proves a new edit after undo clears redo and remains undoable itself. Lexical Playground HTML/setup stays rejected.
68. `1083-backspace-with-element-at-front.spec.mjs` is source-read/applied for this pass: delete-contract now covers full and partial expanded deletes that start with a selected inline link, and delete-text removes fully-selected inline ancestors only when the expanded range crosses outside the inline. Lexical toolbar/theme setup stays rejected.
69. `1113-link-newline-at-end.spec.mjs` is source-read/applied for this pass: inlines browser proof now covers Enter after a typed URL link, and collapsed link insertion moves one offset out of the inserted inline so the next block does not inherit an empty duplicate link. Lexical Playground setup, exact DOM/theme output, raw mobile, collaboration, table-model, and issue rows stay out.
70. `1384-insert-nodes.spec.mjs` is source-read/applied for this pass: the accepted row is nested code-block clipboard insertion, not generic Lexical insert-nodes API behavior. `insertFragment` now merges a single nested text-block child from a same-type structural container into the active nested text block, with package proof and code-highlighting browser proof. Lexical Playground setup, exact gutter/theme output, raw mobile, collaboration, table-model, and issue rows stay out.
71. `221-editing-hashtags.spec.mjs` is source-read/applied for this pass: highlighted-text now proves dynamic hashtag-style decoration over normal editable text through Space split, Delete boundary, and Backspace boundary rows. The setup uses model-owned insertion to avoid conflating the row with a separate full-document projected-delete bug. Lexical Playground setup, hashtag product plugin, exact DOM/theme output, raw mobile, collaboration, table-model, and issue rows stay out.
72. `230-navigation-around-hashtags.spec.mjs` is source-read/applied for this pass: highlighted-text now proves ArrowRight can move into a dynamic hashtag-style decoration after transient prefix text is inserted and deleted. The row is desktop browser navigation proof only; Lexical Playground hashtag plugin setup, exact DOM/theme output, raw mobile, collaboration, table-model, and issue rows stay out.
73. `3136-insert-nodes-adjacent-to-inline.spec.mjs` is source-read/applied for this pass: clipboard-contract now proves fragment replacement of selected plain text immediately before and after an inline link, and inlines browser proof covers rich HTML paste replacing adjacent text without expanding or swallowing the link. Lexical Playground link toolbar setup, exact DOM/theme output, raw mobile, collaboration, table-model, and issue rows stay out.
74. `379-backspace-with-mentions.spec.mjs` is source-read/applied for this pass: mentions browser proof now covers Backspace removing a line boundary before an inline mention while preserving both mention atoms and restoring the boundary selection. Lexical Playground typeahead setup, mention styling, exact DOM/theme output, raw mobile, collaboration, table-model, and issue rows stay out.
75. `399-open-line.spec.mjs` is source-read/applied for this pass: Slate now owns Mac `Ctrl+O` as a distinct model-owned open-line command, with richtext browser proof that it opens an empty block before following text and leaves selection on that empty line. The first proof went red with no inserted line, and the first implementation went red by moving/duplicating through split-block semantics; the final direct insert owner passed focused browser proof, hotkey proof, slate-react kernel contract proof, and `../slate-v2` `bun check`. A full richtext Chromium sweep exposed a deterministic unrelated IME mark expectation mismatch in `commits IME composition through an active mark before a formatted sibling`; focused 399 proof remains green.
76. `429-swapping-emoji.spec.mjs` is source-read/applied for this pass: richtext browser proof now covers Enter at the start of a plain Unicode emoji line opening an empty block before it, preserving selection at the emoji-line start, and Backspace rejoining without text or selection corruption. The accepted row is Unicode emoji-line Enter/Backspace behavior, not Lexical Playground emoji substitution UI, exact emoji span/theme DOM, flaky tagging, raw mobile, collaboration, table-model, or issue behavior.
77. `5251-paste-into-inline-element.spec.mjs` is source-read/applied for this pass: clipboard-contract now proves rich fragment insertion over selected inline-link text keeps pasted text/marks outside the surviving link tail; DOM clipboard fallback now routes selected same-inline text replacement through fragment insertion; inlines browser proof covers HTML clipboard payload text replacement outside the link. Lexical Playground link toolbar setup, exact DOM/theme output, raw mobile, collaboration, table-model, and issue rows stay out.
78. `5583-select-list-followed-by-element-node.spec.mjs` is source-read/applied for this pass: dom-coverage browser proof now covers native drag selection from a list item to a boundary placeholder, asserting no page errors and a valid imported model range. Lexical Playground drag helpers, HR product shell, exact DOM/theme output, raw mobile/device, collaboration, table-model, and issue claims stay out.
79. `7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs` is source-read/applied for this pass: editable-voids now proves rich HTML paste inside a nested rich-text editor preserves bold formatting, does not leak into the parent value, preserves parent selection, and keeps the parent editor usable after nested editing. RichText now has a narrow supported-mark/block HTML paste capability, and selection import rejects parent-to-nested DOM ranges before they can overwrite parent content. Lexical image caption UI, command API, exact DOM/theme output, raw mobile/device, collaboration, table-model, and issue claims stay out.
80. `AutoLinks.spec.mjs` is source-read/applied for this pass: inlines browser proof now covers single-URL paste creating a safe inline link while follow-up typing stays outside the link. Lexical's broad autolink parser/tokenizer matrix, email detection, invalid URL grammar, unlink/relink UI, unlinked autolink state, emoji shortcode rows, styling/font rows, and toolbar shell are Plate-owned link/autolink rows. Exact DOM/theme output, raw mobile, collaboration, table-model, and issue claims stay deferred or rejected.
81. `Hashtags.spec.mjs` is source-read/applied for this pass: highlighted-text now proves deleting a hashtag delimiter expands the decorated token, restoring the delimiter shrinks it, and deleting the leading `#` removes the decoration with stable caret placement. Existing highlighted-text rows already covered Space split, Delete/Backspace boundaries, transient-prefix navigation, copy/cut, and decorated-text IME/editing. Lexical's hashtag plugin grammar, invalid-match matrix, markdown import/export shell, and format inheritance styling are Plate-owned hashtag/markdown rows. Exact DOM/theme output, raw mobile, collaboration, table-model, and issue claims stay deferred or rejected.
82. `Keywords.spec.mjs` is source-read/covered for this pass: current highlighted-text rows already prove projected text selection/movement/editing, mark-click typing through projections, decorated IME, copy/cut semantics, hashtag-style delimiter merge/split, and selected decorated-range deletion. Lexical's exact `congrats` grammar, bracket/team token policy, keyword styling, and product plugin setup are Plate-owned keyword/autocomplete rows. Exact DOM/theme output, raw mobile, collaboration, table-model, and issue claims stay deferred or rejected.
83. `SelectionAlwaysOnDisplay.spec.mjs` is source-read/covered for this pass: the raw invariant is blurred-editor model-selection persistence, already covered by richtext browser proof. Lexical's always-on fake-selection overlay and highlight alignment policy are Plate-owned product visualization rows. Exact DOM/theme output, plain-text skip policy, raw mobile/device, collaboration, table-model, and issue claims stay deferred or rejected.
84. `defer` raw mobile rows until real device/Appium proof exists.
85. `defer` collaboration browser rows until a slate-yjs/browser owner exists.

## Verification Gates For Future Apply Slices

```bash
cd /Users/zbeyens/git/slate-v2
bun test ./packages/slate/test/text-units-contract.ts
bun test ./packages/slate-dom/test/clipboard-boundary.ts
bun test ./packages/slate-history/test/history-contract.ts
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/paste-html.test.ts --project=chromium
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/tables.test.ts --project=chromium
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts --project=chromium -g '<accepted-family>'
bun check
```

Raw device rows need:

```bash
cd /Users/zbeyens/git/slate-v2
SLATE_BROWSER_RAW_MOBILE_REQUIRED=1 bun test:mobile-device-proof:raw
```
