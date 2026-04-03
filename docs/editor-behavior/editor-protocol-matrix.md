# Editor Protocol Matrix for Plate

This is the exhaustive scenario matrix for editor behavior.

It is intentionally different from the other docs in this directory:

- [markdown-editing-spec.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-editing-spec.md)
  is the readable law
- [markdown-parity-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-parity-matrix.md)
  is the family-level release gate
- this file is the scenario-complete protocol backlog

If someone asks, "Do we cover every key, boundary, selection shape, and
container interaction?", this is the file that should answer that.

For current in-scope families, the rows are filled. Future releases may still
add deferred families or entirely new scenario classes.

## Purpose

Use this file to:

- enumerate exhaustive protocol scenarios
- map each scenario to the authority model from
  [markdown-standards.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-standards.md)
- connect scenarios to readable law in
  [markdown-editing-spec.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-editing-spec.md)
- connect scenarios to coverage in
  [markdown-parity-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-parity-matrix.md)

Do not use this file as:

- the readable spec
- the release gate
- a place to inherit stale assumptions from old repos

## Relationship To Other Files

| File | Job |
| --- | --- |
| [markdown-standards.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-standards.md) | methodology and authority model |
| [markdown-editing-spec.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-editing-spec.md) | normative family-level law |
| [markdown-parity-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-parity-matrix.md) | release-gate coverage by family |
| `editor-protocol-matrix.md` | exhaustive scenario matrix |

## Source Of Authority

This file must follow the authority stack in
[markdown-standards.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-standards.md).

That means each family should name:

1. `Syntax / Serialization Ref`
2. `Primary UX Ref`
3. `Secondary Ref`
4. `Fallback Needed?`

Do not cite stale `editor-protocol` GitHub issues as authority.

If an older issue happens to describe a useful scenario, port the scenario into
this file in Plate's current vocabulary and then drop the link.

## Row Schema

Each scenario row should eventually answer:

| Column | Meaning |
| --- | --- |
| `Family` | markdown-native, markdown extension, block-editor-native, styling/layout, collaboration |
| `Entity` | paragraph, table cell, link, mention, media, etc. |
| `Context` | root, quote, list, table, column, closed container, open container, adjacent to atom, etc. |
| `Selection` | collapsed, expanded-inline, expanded-multiblock, backward, cell-range, node-selected |
| `Caret / Edge` | start, middle, end, before atom, after atom, first visual line, last visual line |
| `Input` | `↵`, `⌫`, `⌦`, `⇥`, `⇤`, arrows, `⇧+arrow`, `⌘+A`, copy, paste, click, drag |
| `Expected` | split, reset, lift, unwrap, select container, delete atom, keep native, no-op, etc. |
| `Authority` | syntax ref + primary/secondary UX refs |
| `Spec ID` | canonical ID from the readable spec when one exists |
| `Evidence` | current tests or implementation seams |
| `Status` | one of the statuses below |

## Status Meaning

- `seeded`
  family is listed, but scenarios are not expanded yet
- `specified`
  scenario has a chosen rule in the readable spec
- `tested`
  scenario is backed by one or more real tests
- `partial`
  some parts exist, but the scenario still needs refinement
- `deferred`
  scenario or family is intentionally deferred to a later release

## Interaction Classes Still Outside The Current Content-Editing Matrix

These are real editor-protocol dimensions, but they are not part of the current
content-editing completion claim yet.

They live in the deferred integration red suite at
`apps/www/src/__tests__/package-integration/__deferred__/`.

Run them explicitly with `pnpm test:deferred`.

| Interaction Class | Primary Authority | Secondary Ref | Current State |
| --- | --- | --- | --- |
| Clipboard variants | Google Docs for document fidelity, Typora for markdown text expectations | Milkdown, current package integration seams | deferred |
| Mouse drag / mouse selection | Google Docs for document selection, Notion for block drag semantics | Milkdown, current DnD and selection seams | deferred |
| Platform shortcuts | strongest product authority for the owning surface | current hotkey and selection seams | deferred |
| IME / composition | platform text-editing norms with product-specific owner behavior | current atom/code/table seams | deferred |

## Protocol Families

These are the families that need scenario-complete coverage.

| Family | Syntax / Serialization Ref | Primary UX Ref | Secondary Ref | Fallback Needed? | Current State |
| --- | --- | --- | --- | --- | --- |
| Markdown-native structural keys | CommonMark | Typora | Milkdown | only when refs are silent or incompatible | tested |
| Markdown extensions | GFM / GitHub Docs for GFM-only constructs / LaTeX-style math / local MDX contracts | Typora for markdown-feel, Google Docs for table-feel | Milkdown, Notion for table blocks | sometimes | tested |
| Block-editor-native elements | local serialized shape | Notion | Milkdown | sometimes | tested except deferred toggle |
| Styling / layout | local serialized shape + HTML/CSS expectations | Google Docs | Notion | sometimes | tested |
| Collaboration / editor-only | local serialized shape or editor-only contract | Google Docs | Notion | sometimes | deferred |

## Protocol Rows

These are the first real protocol rows. They are grouped by family and should be
extended until every in-scope feature family is scenario-complete.

### Markdown-Native Structural Keys

| Family | Entity | Context | Selection | Caret / Edge | Input | Expected | Authority | Spec ID | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| markdown-native | paragraph | root | collapsed | middle | `↵` | split paragraph into two blocks | CommonMark + Typora / Milkdown | `EDIT-P-ENTER-001` | `withBreakRules.spec.tsx` | `tested` |
| markdown-native | paragraph | root | collapsed | empty block | `↵` | keep generic root split behavior | CommonMark + Typora / Milkdown | `EDIT-P-ENTER-EMPTY-001` | `withBreakRules.spec.tsx` | `tested` |
| markdown-native | paragraph | root | collapsed | block start, non-empty | `⌫` | merge with previous block when valid | Typora / Milkdown | `EDIT-P-BS-START-001` | `withMergeRules.spec.tsx` | `tested` |
| markdown-native | paragraph | root | collapsed | empty block | `⌫` | merge into previous block | Typora / Milkdown | `EDIT-P-BS-START-EMPTY-001` | `withMergeRules.spec.tsx` | `tested` |
| markdown-native | paragraph | root | collapsed | block start | `⇥` | indent paragraph | Typora / Milkdown | `EDIT-P-TAB-001` | `withIndent.spec.tsx` | `tested` |
| markdown-native | paragraph | root | collapsed | indented paragraph | `⇤` | outdent paragraph | Typora / Milkdown | `EDIT-P-STAB-001` | `withIndent.spec.tsx` | `tested` |
| markdown-native | paragraph | root | expanded-inline | same block | `↵` | replace the selection with one paragraph split result | CommonMark + Typora / Milkdown | `EDIT-SEL-ENTER-001` | `withBreakRules.spec.tsx` | `tested` |
| markdown-native | paragraph | root | expanded-inline | same block | `⌫` | delete the selected text in place and keep the paragraph wrapper | Typora / Milkdown | `EDIT-SEL-BS-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | paragraph | root | expanded-inline | same block | `⌦` | delete the selected text in place and keep the paragraph wrapper | Typora / Milkdown | `EDIT-SEL-BS-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | paragraph | root | expanded-multiblock | mixed blocks | `↵` | replace the selection with one paragraph split result without orphaning surrounding structure | Typora / Milkdown | `EDIT-SEL-ENTER-001` | `withBreakRules.spec.tsx` | `tested` |
| markdown-native | paragraph | root | expanded-multiblock | mixed blocks | `⌫` | remove the selection without corrupting surrounding structure | Typora / Milkdown | `EDIT-SEL-BS-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | paragraph | root | backward expanded-multiblock | mixed blocks | `⌫` | use the same structural cleanup as forward expanded delete | Typora / Milkdown | `EDIT-SEL-BS-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | heading | root | collapsed | middle | `↵` | split heading, reset new block to paragraph | Typora / Milkdown | `EDIT-H-ENTER-001` | `withBreakRules.spec.tsx` | `tested` |
| markdown-native | heading | root | collapsed | end | `↵` | insert paragraph after heading | Typora / Milkdown | `EDIT-H-ENTER-END-001` | `withBreakRules.spec.tsx` | `tested` |
| markdown-native | heading | root | collapsed | block start | `⌫` | reset heading to paragraph | Typora / Milkdown | `EDIT-H-BS-START-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | heading | root | collapsed | empty heading | `⌫` | reset empty heading to empty paragraph | Typora / Milkdown | `EDIT-H-BS-START-EMPTY-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | heading | root | expanded-inline | same heading | `↵` | replace the selection and reset the trailing block to paragraph | Typora / Milkdown | `EDIT-H-ENTER-001` | `withBreakRules.spec.tsx` | `tested` |
| markdown-native | heading | root | expanded-inline | same heading | `⌫` | delete the selection in place and keep the heading type | Typora / Milkdown | `—` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | heading | root | expanded-multiblock | heading into paragraph | `⌫` | remove the selection and keep the surviving heading boundary coherent | Typora / Milkdown | `EDIT-SEL-BS-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | list item | list | collapsed | middle | `↵` | split item | CommonMark + Typora / Milkdown | `EDIT-LIST-ENTER-001` | `withList.spec.tsx` | `tested` |
| markdown-native | list item | list | collapsed | empty nested item | `↵` | outdent one level | Typora / Milkdown | `EDIT-LIST-ENTER-EMPTY-001` | `withList.spec.tsx` | `tested` |
| markdown-native | list item | list | collapsed | empty root item | `↵` | exit list to paragraph | Typora / Milkdown | `EDIT-LIST-ENTER-EMPTY-ROOT-001` | `withList.spec.tsx` | `tested` |
| markdown-native | list item | list | collapsed | block start | `⌫` | remove one list layer | Typora / Milkdown | `EDIT-LIST-BS-START-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | list item | list | collapsed | nested item | `⇥` | indent one list level | Typora / Milkdown | `EDIT-LIST-TAB-001` | `withList.spec.tsx` | `tested` |
| markdown-native | list item | list | collapsed | nested item | `⇤` | outdent one list level | Typora / Milkdown | `EDIT-LIST-STAB-001` | `withList.spec.tsx` | `tested` |
| markdown-native | blockquote | quote | collapsed | middle | `↵` | split quoted block | CommonMark + Typora / Milkdown | `EDIT-BQ-ENTER-001` | `withBreakRules.spec.tsx` | `tested` |
| markdown-native | blockquote | quote | collapsed | empty top-level quoted block | `↵` | exit one quote level | Typora / Milkdown | `EDIT-BQ-ENTER-EMPTY-001` | `withBreakRules.spec.tsx` | `tested` |
| markdown-native | blockquote | nested quote | collapsed | empty quoted block | `↵` | exit one quote level only | Typora / Milkdown | `EDIT-BQ-ENTER-EMPTY-NESTED-001` | `withBreakRules.spec.tsx` | `tested` |
| markdown-native | blockquote | nested quote | collapsed | middle | `↵` | split the current inner quoted block and keep both blocks inside the same inner quote | CommonMark + Typora / Milkdown | `EDIT-BQ-ENTER-001` | `withBreakRules.spec.tsx` | `tested` |
| markdown-native | blockquote | quote | collapsed | block start | `⌫` | lift one quote level | Typora / Milkdown | `EDIT-BQ-BS-START-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | blockquote | quote | collapsed | empty non-first block | `⌫` | delete in place inside quote before lifting | Typora / Milkdown | `EDIT-BQ-BS-START-EMPTY-NONFIRST-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | blockquote | nested quote | collapsed | first block start | `⌫` | lift one inner quote level and keep outer quote intact | Typora / Milkdown | `EDIT-BQ-BS-START-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | blockquote | nested quote | collapsed | empty non-first block | `⌫` | delete in place inside the same inner quote before lifting | Typora / Milkdown | `EDIT-BQ-BS-START-EMPTY-NONFIRST-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | blockquote | quote with nested list | collapsed | quoted list item at block start | `⌫` | remove the list layer before the quote layer | Typora / Milkdown | `EDIT-LIST-BS-START-001` | `withDeleteRules.spec.tsx` | `tested` |
| markdown-native | blockquote | quote | collapsed | quoted paragraph | `⇤` | lift one quote level after indent is exhausted | Typora / Milkdown | `EDIT-BQ-STAB-001` | `withIndent.spec.tsx` | `tested` |
| markdown-native | blockquote | quote | collapsed | quoted paragraph | `⇥` | keep tab editor-owned via indent | Typora / Milkdown | `EDIT-BQ-TAB-001` | `withIndent.spec.tsx` | `tested` |
| markdown-native | blockquote | nested quote | expanded-multiblock | mixed inner quote blocks | `⇤` | outdent all selected quoted blocks one quote level after stronger owners | Typora / Milkdown | `EDIT-SEL-STAB-001` | `withIndent.spec.tsx` | `tested` |
| markdown-native | link | paragraph | collapsed | before link end | `insert text` | extend link when affinity comes from linked side | CommonMark + Typora / Milkdown | `EDIT-AFF-LINK-001` | `AffinityPlugin.spec.tsx` | `tested` |
| markdown-native | link | paragraph | collapsed | before link start | `insert text` | keep text outside link when affinity comes from plain side | CommonMark + Typora / Milkdown | `EDIT-AFF-LINK-001` | `AffinityPlugin.spec.tsx` | `tested` |
| markdown-native | hard mark | paragraph | collapsed | mark boundary | `insert text` | hard boundary for inline code / kbd | Typora / Milkdown | `EDIT-AFF-HARD-001` | `AffinityPlugin.spec.tsx` | `tested` |
| markdown-native | code block | code block | collapsed | middle | `↵` | insert code line break inside block | CommonMark + Typora / Milkdown | `EDIT-CB-ENTER-001` | `withCodeBlock.spec.tsx` | `tested` |
| markdown-native | code block | code block | expanded-inline | one code line | `↵` | replace the selection with a code-local line split | CommonMark + Typora / Milkdown | `EDIT-CB-ENTER-001` | `withCodeBlock.spec.tsx` | `tested` |
| markdown-native | code block | code block | collapsed | first non-empty line start | `⌫` | keep deletion local to the code line instead of unwrapping | Typora / Milkdown | `EDIT-CB-BS-START-001` | `withCodeBlock.spec.tsx` | `tested` |
| markdown-native | code block | code block | collapsed | empty non-first line start | `⌫` | merge the empty line into the previous code line and keep the code block | Typora / Milkdown | `EDIT-CB-BS-START-001` | `withCodeBlock.spec.tsx` | `tested` |
| markdown-native | code block | code block | collapsed | empty block | `⌫` | unwrap to paragraph | Typora / Milkdown | `EDIT-CB-BS-START-EMPTY-001` | `withCodeBlock.spec.tsx` | `tested` |
| markdown-native | code block | code block | expanded-multiline | many lines | `⇥` | indent every selected code line | Typora / Milkdown | `EDIT-CB-TAB-001` | `withCodeBlock.spec.tsx` | `tested` |
| markdown-native | code block | code block | expanded-multiline | many lines | `⇤` | outdent every selected code line | Typora / Milkdown | `EDIT-CB-STAB-001` | `withCodeBlock.spec.tsx` | `tested` |
| markdown-native | code block | code block | inside block | any | `⌘+A` | expand the selection to the whole code block | Typora / Milkdown | `—` | `withCodeBlock.spec.tsx` | `tested` |
| markdown-native | hard line break | paragraph | collapsed | inline | `serialize` | preserve explicit hard break | CommonMark + Typora / Milkdown | `EDIT-HARD-*` | `commonmarkSurface.spec.ts` | `tested` |
| markdown-native | hard line break | blockquote | collapsed | inline | `serialize` | preserve quoted hard break and trailing break semantics | CommonMark + Typora / Milkdown | `EDIT-HARD-*` | `commonmarkSurface.spec.ts` | `tested` |

### Tables

| Family | Entity | Context | Selection | Caret / Edge | Input | Expected | Authority | Spec ID | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| markdown-extension | table cell | table | collapsed | inside cell | `↵` | keep Enter inside the same cell | GFM + Google Docs / Notion | `EDIT-TABLE-ENTER-001` | `withTable.spec.tsx` | `tested` |
| markdown-extension | table cell | table | collapsed | cell start | `⌫` | keep backspace inside current cell | GFM + Google Docs / Notion | `EDIT-TABLE-BS-START-001` | `withTable.spec.tsx` | `tested` |
| markdown-extension | table cell | table | collapsed | current cell | `⇥` | move to next cell | Google Docs / Notion | `EDIT-TABLE-TAB-001` | `withTable.spec.tsx` | `tested` |
| markdown-extension | table cell | table | collapsed | current cell | `⇤` | move to previous cell | Google Docs / Notion | `EDIT-TABLE-STAB-001` | `withTable.spec.tsx` | `tested` |
| markdown-extension | table cell | table | collapsed | last visual line | `↓` | move to cell below | Google Docs / Notion | `EDIT-TABLE-ARROWDOWN-MULTIBLOCK-001` | `withTable.spec.tsx` | `tested` |
| markdown-extension | table cell | table | collapsed | first visual line | `↑` | move to cell above | Google Docs / Notion | `EDIT-TABLE-ARROWUP-MULTIBLOCK-001` | `withTable.spec.tsx` | `tested` |
| markdown-extension | table | table | expanded-outward | anchor in cell, focus after table | drag select | clamp focus to the end of the table instead of extending native selection past it | Google Docs / Notion | `—` | `withApplyTable.spec.tsx` | `tested` |
| markdown-extension | table | table | backward expanded-outward | anchor after table, focus in cell | drag select | clamp backward focus to the point before the table | Google Docs / Notion | `—` | `withApplyTable.spec.tsx` | `tested` |
| markdown-extension | table | table | cell-range | n/a | copy | copy selected cells as a subtable | Google Docs / Notion | `—` | `withGetFragmentTable.spec.tsx` | `tested` |
| markdown-extension | table | table | many cells selected | n/a | paste / insert blocks | replace or expand selected cells according to table rules | Google Docs / Notion | `—` | `withInsertFragmentTable.spec.tsx` | `tested` |
| markdown-extension | table | table | collapsed in cell | n/a | first `⌘+A` | select the whole table when the caret is inside it | Google Docs / Notion | `—` | `withTable.spec.tsx` | `tested` |
| markdown-extension | table | table | cell-range | n/a | `⇧+arrow` | expand selection across cells | Google Docs / Notion | `—` | `onKeyDownTable.spec.tsx`, `withTableCellSelection.spec.tsx` | `tested` |
| markdown-extension | table | table | cell-range | n/a | `addMark` | apply the mark to every selected text node across cells | Google Docs / Notion | `—` | `withTableCellSelection.spec.tsx` | `tested` |
| markdown-extension | table | table | cell-range | n/a | `removeMark` | remove only the requested mark across selected cells | Google Docs / Notion | `—` | `withTableCellSelection.spec.tsx` | `tested` |
| markdown-extension | table | table | cell-range | n/a | `marks()` | return only marks shared by every selected text node | Google Docs / Notion | `—` | `withTableCellSelection.spec.tsx` | `tested` |
| markdown-extension | table | adjacent block after table | collapsed | block start | `⌫` | move selection toward the adjacent table instead of deleting through a cell boundary | Google Docs / Notion | `—` | `withDeleteTable.spec.tsx` | `tested` |
| markdown-extension | table | table | cell-range | n/a | `deleteFragment` | clear selected cell contents while keeping the table shape intact | Google Docs / Notion | `—` | `withDeleteTable.spec.tsx` | `tested` |
| markdown-extension | table | table | node-selected table | n/a | second `⌘+A` | escalate from table selection to document selection | Google Docs / Notion | `—` | `withTable.spec.tsx` | `tested` |
| markdown-extension | table row | table | collapsed in row | current row | insert row after | insert a row with empty cells after the current row and move selection into it when requested | Google Docs / Notion | `EDIT-TABLE-ROW-INSERT-001` | `insertTableRow.spec.tsx` | `tested` |
| markdown-extension | table row | table | collapsed in row | current row | insert row before | insert a row with empty cells before the current row and move selection into it when requested | Google Docs / Notion | `EDIT-TABLE-ROW-INSERT-002` | `insertTableRow.spec.tsx` | `tested` |
| markdown-extension | table column | table | collapsed in column | current column | insert column after | insert a column with empty cells after the current column and move selection into it when requested | Google Docs / Notion | `EDIT-TABLE-COL-INSERT-001` | `insertTableColumn.spec.tsx` | `tested` |
| markdown-extension | table column | table | collapsed in column | current column | insert column before | insert a column with empty cells before the current column and move selection into it when requested | Google Docs / Notion | `EDIT-TABLE-COL-INSERT-002` | `insertTableColumn.spec.tsx` | `tested` |
| markdown-extension | table row | merged table | collapsed / expanded | current row | delete row | remove the current row and repair row spans instead of corrupting the merged table | Google Docs / Notion | `EDIT-TABLE-ROW-DELETE-001` | `transforms/deleteRow.spec.tsx`, `merge/deleteRow.spec.tsx`, `merge/deleteRowWhenExpanded.spec.ts` | `tested` |
| markdown-extension | table column | merged table | collapsed / expanded | current column | delete column | remove the current column and repair col spans instead of corrupting the merged table | Google Docs / Notion | `EDIT-TABLE-COL-DELETE-001` | `transforms/deleteColumn.spec.tsx`, `merge/deleteColumn.spec.tsx` | `tested` |

### Other Markdown Extensions

| Family | Entity | Context | Selection | Caret / Edge | Input | Expected | Authority | Spec ID | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| markdown-extension | task list item | list | round-trip | checked / unchecked | serialize / deserialize | preserve todo checked state through markdown package surfaces | GFM + Typora / Milkdown | `EDIT-TASK-*` | `taskList.spec.ts`, `deserializeMdList.spec.tsx`, `listToMdastTree.spec.ts` | `tested` |
| markdown-extension | task list item | list | collapsed | item end | `↵` | insert a new todo line with the same checked-state formatting | Typora / Milkdown | `EDIT-LIST-ENTER-001` | `withInsertBreakList.spec.tsx` | `tested` |
| markdown-extension | task list item | list | expanded-inline | inside item | `↵` | follow the normal list split path while preserving todo metadata | Typora / Milkdown | `EDIT-LIST-ENTER-001` | `withInsertBreakList.spec.tsx` | `tested` |
| markdown-extension | strikethrough | paragraph | round-trip | inline mark | serialize / deserialize | preserve `~~strike~~` as a markdown mark | GFM + Typora / Milkdown | `—` | `commonmarkSurface.spec.ts`, `serializeInlineMd.spec.ts`, `BaseMarkPlugins.spec.ts` | `tested` |
| markdown-extension | inline math | paragraph | collapsed / expanded | insertion point | insert inline equation | insert an inline void equation and use selected text as the default expression | remark-math + Typora / Milkdown | `EDIT-MATH-INLINE-INSERT-001` | `insertInlineEquation.spec.ts`, `BaseInlineEquationPlugin.spec.ts` | `tested` |
| markdown-extension | inline math | inline equation input | collapsed | input left / right edge | `ArrowLeft` / `ArrowRight` | hand control back to the editor at text edges | Typora / Milkdown | `EDIT-MATH-INLINE-ARROW-001` | `useEquationInput.spec.tsx` | `tested` |
| markdown-extension | block math | root | collapsed | insertion point | insert equation | insert a void block equation at the requested path | remark-math + Typora / Milkdown | `EDIT-MATH-BLOCK-INSERT-001` | `insertEquation.spec.ts`, `BaseEquationPlugin.spec.ts` | `tested` |
| markdown-extension | block math | next block | collapsed | block start after equation | `⌫` | move selection onto the equation instead of deleting through it | Typora / Milkdown | `EDIT-MATH-BLOCK-BS-START-001` | `BaseEquationPlugin.spec.ts` | `tested` |
| markdown-extension | autolink literal | paragraph | collapsed | end of URL candidate | type space / `↵` | finalize the URL as a link using the current autolink heuristics and serialize plain URL links back to bare URL markdown | GFM / GitHub Docs + Typora / Milkdown | `EDIT-AFF-LINK-001` | `withLink.spec.tsx`, `gfmSurface.spec.ts` | `tested` |
| markdown-extension | footnote definition | markdown deserializer | collapsed | n/a | deserialize | preserve the current fallback by converting definitions into plain paragraphs with the label on the first block | GFM / GitHub Docs | `EDIT-FOOTNOTE-*` | `gfmSurface.spec.ts`, `apps/www/src/__tests__/package-integration/markdown-rich/defaultRule.spec.ts`, `defaultRules.ts` | `tested` |
| markdown-extension | footnote reference | markdown deserializer | collapsed | n/a | deserialize | preserve the current fallback by converting references into literal `[^id]` text until a real footnote model exists | GFM / GitHub Docs | `EDIT-FOOTNOTE-*` | `gfmSurface.spec.ts`, `defaultRules.ts` | `tested` |
| markdown-native | image | paragraph | round-trip | width / height present on node | serialize | keep plain markdown limited to alt, src, and optional title; width and height remain HTML/MDX-only | CommonMark + Typora / Milkdown | `EDIT-IMG-*` | `commonmarkSurface.spec.ts`, `defaultRules.spec.ts` | `tested` |

### Block-Editor-Native Elements

| Family | Entity | Context | Selection | Caret / Edge | Input | Expected | Authority | Spec ID | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| block-editor-native | callout | callout | collapsed | non-empty content | `↵` | insert soft break inside callout | local callout contract informed by Notion / Milkdown | `EDIT-CALLOUT-ENTER-001` | `withBreakRules.spec.tsx` | `tested` |
| block-editor-native | callout | callout | collapsed | empty block | `↵` | reset to paragraph | local callout contract informed by Notion / Milkdown | `EDIT-CALLOUT-ENTER-EMPTY-001` | `withBreakRules.spec.tsx` | `tested` |
| block-editor-native | callout | callout | collapsed | block start | `⌫` | reset to paragraph | local callout contract informed by Notion / Milkdown | `EDIT-CALLOUT-BS-START-001` | `withDeleteRules.spec.tsx` | `tested` |
| block-editor-native | mention | paragraph | collapsed | block end insertion | insert mention | insert mention atom and optional trailing space | local mention contract informed by Notion / Milkdown | `EDIT-MENTION-INSERT-END-001` | `getMentionOnSelectItem.spec.tsx` | `tested` |
| block-editor-native | mention | paragraph | collapsed | mid-block insertion | insert mention | insert mention atom without trailing space | local mention contract informed by Notion / Milkdown | `EDIT-MENTION-INSERT-MID-001` | `getMentionOnSelectItem.spec.tsx` | `tested` |
| block-editor-native | mention | paragraph | collapsed | after mention | `⌫` | delete whole mention atom | local mention contract informed by Notion / Milkdown | `EDIT-MENTION-BS-START-001` | `BaseMentionPlugin.spec.tsx` | `tested` |
| block-editor-native | mention | paragraph | collapsed | before mention | `⌦` | delete whole mention atom | local mention contract informed by Notion / Milkdown | `EDIT-MENTION-DEL-END-001` | `BaseMentionPlugin.spec.tsx` | `tested` |
| block-editor-native | mention | paragraph | collapsed | before mention | `→` | move into the mention child so the inline void stays keyboard-accessible | local mention contract informed by Notion / Milkdown | `—` | `BaseMentionPlugin.spec.tsx` | `tested` |
| block-editor-native | mention | paragraph | collapsed | after mention | `←` | move into the mention child so the inline void stays keyboard-accessible | local mention contract informed by Notion / Milkdown | `—` | `BaseMentionPlugin.spec.tsx` | `tested` |
| block-editor-native | date | paragraph | collapsed | insertion | insert date | insert date atom plus trailing space | local date contract informed by Notion / Google Docs | `EDIT-DATE-INSERT-001` | `insertDate.spec.tsx` | `tested` |
| block-editor-native | date | paragraph | collapsed | after date | `⌫` | delete whole date atom | local date contract informed by Notion / Google Docs | `EDIT-DATE-BS-START-001` | `BaseDatePlugin.spec.tsx` | `tested` |
| block-editor-native | date | paragraph | collapsed | before date | `⌦` | delete whole date atom | local date contract informed by Notion / Google Docs | `EDIT-DATE-DEL-END-001` | `BaseDatePlugin.spec.tsx` | `tested` |
| block-editor-native | date | paragraph | collapsed | before date | `→` | move into the date child so the inline void stays keyboard-accessible | local date contract informed by Notion / Google Docs | `—` | `BaseDatePlugin.spec.tsx`, `isPointNextToNode.spec.tsx` | `tested` |
| block-editor-native | date | paragraph | collapsed | after date | `←` | move into the date child so the inline void stays keyboard-accessible | local date contract informed by Notion / Google Docs | `—` | `BaseDatePlugin.spec.tsx`, `isPointNextToNode.spec.tsx` | `tested` |
| block-editor-native | toc | root | collapsed | insertion | insert toc | insert atomic TOC block | local TOC contract informed by Notion conventions | `EDIT-TOC-INSERT-001` | `insertToc.spec.ts` | `tested` |
| block-editor-native | toc | toc block | node-selected / collapsed | selected TOC | `⌦` | delete TOC block | local TOC contract informed by Notion conventions | `EDIT-TOC-DEL-SELECTED-001` | `BaseTocPlugin.spec.ts` | `tested` |
| block-editor-native | toc | next block | collapsed | start of next block | `⌫` | move selection onto TOC instead of deleting through it | local TOC contract informed by Notion conventions | `EDIT-TOC-BS-NEXT-001` | `BaseTocPlugin.spec.ts` | `tested` |
| block-editor-native | toc | next block | collapsed | start of next block | `↑` | move selection onto the TOC instead of entering its empty child | local TOC contract informed by Notion conventions | `—` | `BaseTocPlugin.spec.ts` | `tested` |
| block-editor-native | toc | toc block | node-selected | selected TOC | `↵` | keep the TOC atomic instead of creating text inside it | local TOC contract informed by Notion conventions | `—` | `BaseTocPlugin.spec.ts` | `tested` |
| block-editor-native | toc | toc block | node-selected | selected TOC | `⇥` | move focus onward or fall through, never tab into TOC text | local TOC contract informed by Notion conventions | `—` | `BaseTocPlugin.spec.ts` | `tested` |
| block-editor-native | columns | paragraph | collapsed | toggle action | toggle columns | wrap content into first column and create empty siblings | local column contract informed by Notion layout behavior | `EDIT-COLUMN-TOGGLE-001` | `toggleColumnGroup.spec.tsx` | `tested` |
| block-editor-native | columns | column group | collapsed | set columns | update layout | preserve content and redistribute widths | local column contract informed by Notion layout behavior | `EDIT-COLUMN-SET-001` | `setColumns.spec.tsx` | `tested` |
| block-editor-native | columns | column | inside column | selection in text | first `⌘+A` | select the containing column | local column contract informed by Notion layout behavior | `—` | `withColumn.spec.ts` | `tested` |
| block-editor-native | columns | column group | column already selected | second `⌘+A` | select the parent column group | local column contract informed by Notion layout behavior | `—` | `withColumn.spec.ts` | `tested` |
| block-editor-native | columns | paragraph inside column | collapsed | middle | `↵` | split inside the same column and keep the column group intact | local column contract informed by Notion layout behavior | `—` | `withColumn.spec.ts` | `tested` |
| block-editor-native | columns | paragraph inside column | collapsed | block start | `⌫` | respect the contained block owner before any column-group unwrap | local column contract informed by Notion layout behavior | `—` | `withColumn.spec.ts` | `tested` |
| block-editor-native | columns | paragraph inside column | collapsed | any | `⇥` | defer to the stronger local owner; columns are not a direct tab owner | local column contract informed by Notion layout behavior | `—` | `withColumn.spec.ts` | `tested` |
| block-editor-native | media | paragraph | collapsed | insert media | toolbar / URL insert | insert image or media embed according to chosen type | local media contract informed by Notion / Docs | `—` | `insertMedia.spec.ts` | `tested` |
| block-editor-native | media void block | next block | collapsed | block start after media | `⌫` | move selection onto the media node instead of deleting through it | local media contract informed by Notion / Docs | `EDIT-MEDIA-*` | `BaseMediaPluginContracts.spec.ts` | `tested` |
| block-editor-native | media | markdown / mdx | round-trip | file/audio/video/embed | serialize / deserialize | preserve media node shape and MDX attributes | local media contract informed by Notion / Docs | `EDIT-MEDIA-*` | `mediaSurface.spec.ts`, `parseAttributes.spec.ts` | `tested` |
| block-editor-native | caption | media host | collapsed | move down from host | `↓` | move focus into caption | local caption contract informed by Notion / Docs | `EDIT-CAPTION-*` | `withCaption.spec.tsx` | `tested` |
| block-editor-native | caption | media host | collapsed | move down from disallowed block | `↓` | fall through, do not claim movement | local caption contract informed by Notion / Docs | `EDIT-CAPTION-*` | `withCaption.spec.tsx` | `tested` |
| block-editor-native | toggle | toggle | any | any | any | deferred to rewrite | Notion / Milkdown | `EDIT-TOGGLE-*` | family matrix only | `deferred` |
| block-editor-native | code drawing | editor | any | any | any | deferred from this major instead of freezing a shallow policy that is not release-critical | Notion-like board tools / local package contract | `EDIT-DRAWING-*` | `insertCodeDrawing.spec.ts`, `BaseCodeDrawingPlugin.spec.ts` | `deferred` |
| block-editor-native | excalidraw | editor | any | any | any | deferred from this major instead of freezing a shallow policy that is not release-critical | Notion-like board tools / local package contract | `EDIT-DRAWING-*` | `insertExcalidraw.spec.ts`, `BaseExcalidrawPlugin.spec.ts` | `deferred` |

### Styling / Layout

| Family | Entity | Context | Selection | Caret / Edge | Input | Expected | Authority | Spec ID | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| styling/layout | indent | paragraph / quote | collapsed | any | `⇥` / `⇤` | adjust paragraph indent without stealing stronger owners | Google Docs / Notion | `EDIT-INDENT-*` | `withIndent.spec.tsx`, `setIndent.spec.ts`, `withList.spec.tsx` | `tested` |
| styling/layout | text align | block | block selection | any | set / clear align | set alignment prop or clear to default | local block style contract informed by Google Docs / Notion | `EDIT-ALIGN-*` | `BaseTextAlignPlugin.spec.ts` | `tested` |
| styling/layout | text indent | block | block selection | any | set / clear text indent | set textIndent prop or clear to default | local block style contract informed by Google Docs / Notion | `EDIT-TEXT-INDENT-*` | `BaseTextIndentPlugin.spec.ts` | `tested` |
| styling/layout | line height | block | block selection | any | set / clear line height | set lineHeight prop or clear to default | local style contract informed by Google Docs / Notion | `EDIT-LINE-HEIGHT-*` | `BaseLineHeightPlugin.spec.ts` | `tested` |
| styling/layout | font family | marked text | collapsed / expanded | boundary | add mark | apply `fontFamily` leaf mark | local style contract informed by Google Docs / Notion | `EDIT-STYLE-*` | `BaseFontFamilyPlugin.spec.ts` | `tested` |
| styling/layout | font size | marked text | collapsed / expanded | boundary | add mark | apply `fontSize` leaf mark | local style contract informed by Google Docs / Notion | `EDIT-STYLE-*` | `BaseFontSizePlugin.spec.ts` | `tested` |
| styling/layout | font weight | marked text | collapsed / expanded | boundary | add mark | apply `fontWeight` leaf mark | local style contract informed by Google Docs / Notion | `EDIT-STYLE-*` | `BaseFontWeightPlugin.spec.ts` | `tested` |
| styling/layout | font color | marked text | collapsed / expanded | boundary | add mark | apply `color` leaf mark | local style contract informed by Google Docs / Notion | `EDIT-STYLE-*` | `BaseFontColorPlugin.spec.ts` | `tested` |
| styling/layout | font background | marked text | collapsed / expanded | boundary | add mark | apply `backgroundColor` leaf mark | local style contract informed by Google Docs / Notion | `EDIT-STYLE-*` | `BaseFontBackgroundColorPlugin.spec.ts` | `tested` |

### Collaboration / Editor-Only

| Family | Entity | Context | Selection | Caret / Edge | Input | Expected | Authority | Spec ID | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| collaboration | comment | editor-only | any | any | create/remove/overlap | deferred to later release | editor-only contract + Google Docs / Notion | `EDIT-COMMENT-*` | family matrix only | `deferred` |
| collaboration | suggestion | editor-only | any | any | insert/delete/accept/reject | deferred to later release | editor-only contract + Google Docs / Notion | `EDIT-SUGGESTION-*` | family matrix only | `deferred` |
| collaboration | discussion | editor-only | any | any | discussion anchor / block discussion | deferred to later release | editor-only contract + Google Docs / Notion | `EDIT-DISCUSSION-*` | family matrix only | `deferred` |
| collaboration | yjs | editor-only | any | any | cursor / presence / collaboration policy | deferred to later release | editor-only contract + Google Docs / Figma / Notion | `EDIT-COLLAB-*` | family matrix only | `deferred` |

### Link Protocol Backfill

These rows are still part of the markdown-native family, but they are worth
tracking separately because link behavior is much denser than the current law
shows.

| Family | Entity | Context | Selection | Caret / Edge | Input | Expected | Authority | Spec ID | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| markdown-native | link | paragraph | collapsed | plain text | paste URL | insert a link with the pasted URL text | CommonMark + Typora / Milkdown | `EDIT-AFF-LINK-001` | `withLink.spec.tsx` | `tested` |
| markdown-native | link | paragraph | expanded-inline | selected plain text | paste URL | keep selected text as link text by default | CommonMark + Typora / Milkdown | `—` | `withLink.spec.tsx` | `tested` |
| markdown-native | link | paragraph | expanded-inline | selected plain text | paste URL with `keepSelectedTextOnPaste: false` | replace selected text with URL text | CommonMark + Typora / Milkdown | `—` | `withLink.spec.tsx` | `tested` |
| markdown-native | link | paragraph | collapsed | end of URL text | type space | wrap preceding URL as a link | CommonMark + Typora / Milkdown | `—` | `withLink.spec.tsx` | `tested` |
| markdown-native | link | paragraph | collapsed | end of visible URL text | type space with `getUrlHref` | wrap visible text with computed href | CommonMark + Typora / Milkdown | `—` | `withLink.spec.tsx` | `tested` |
| markdown-native | link | paragraph | collapsed | inside existing link | type space | do not wrap again | CommonMark + Typora / Milkdown | `—` | `withLink.spec.tsx` | `tested` |
| markdown-native | link | paragraph | collapsed | end of autolink candidate | `↵` | finalize autolink before creating the next block | CommonMark + Typora / Milkdown | `—` | `withLink.spec.tsx` | `tested` |
| markdown-native | link | paragraph | collapsed | empty link after deletion | normalize | remove empty link wrapper | CommonMark + Typora / Milkdown | `—` | `withLink.spec.tsx` | `tested` |
| markdown-native | link | paragraph | collapsed or expanded | inside/outside link | upsert URL/text | preserve marks, update href/text, or unwrap according to transform intent | CommonMark + Typora / Milkdown | `—` | `upsertLink.spec.tsx`, `unwrapLink.spec.tsx` | `tested` |

### Media / Caption Depth Backfill

| Family | Entity | Context | Selection | Caret / Edge | Input | Expected | Authority | Spec ID | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| block-editor-native | media embed | paragraph | collapsed | with selection parent | insert embed | insert embed node at the parent path with `nextBlock` semantics | local media contract informed by Notion / docs | `EDIT-MEDIA-*` | `insertMediaEmbed.spec.ts` | `tested` |
| block-editor-native | media embed | paragraph | no selection | n/a | insert embed | no-op | local media contract informed by Notion / docs | `EDIT-MEDIA-*` | `insertMediaEmbed.spec.ts` | `tested` |
| block-editor-native | image upload | editor | data transfer with image file | n/a | insert data | current default path ignores upload without a configured override | local media contract informed by Notion / docs | `EDIT-MEDIA-*` | `withImageUpload.spec.tsx` | `tested` |
| block-editor-native | image upload | editor | no files | n/a | insert data | fall through to default insert data behavior | local media contract informed by Notion / docs | `EDIT-MEDIA-*` | `withImageUpload.spec.tsx` | `tested` |
| block-editor-native | image upload | editor | non-image file | n/a | insert data | ignore non-image file without changing editor | local media contract informed by Notion / docs | `EDIT-MEDIA-*` | `withImageUpload.spec.tsx` | `tested` |
| block-editor-native | caption | media host | collapsed | arrow-up from caption boundary | `↑` | store focusEndPath when caption has content | local caption contract informed by Notion / Docs | `EDIT-CAPTION-*` | `withCaption.spec.tsx` | `tested` |
| block-editor-native | caption | media host | collapsed | arrow-up from caption boundary | `↑` | skip delayed focus when caption is empty | local caption contract informed by Notion / Docs | `EDIT-CAPTION-*` | `withCaption.spec.tsx` | `tested` |

## Practical Use

- Add exhaustive scenario rows here first.
- Lock the chosen behavior in [markdown-editing-spec.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-editing-spec.md).
- Track family-level sufficiency in [markdown-parity-matrix.md](/Users/zbeyens/git/plate/docs/editor-behavior/markdown-parity-matrix.md).

If a row only exists in the parity matrix, it is not protocol-complete yet.
