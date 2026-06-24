# Lexical Portable Test-Name Index

source report: [report.md](./report.md)
target: `../lexical`
generated_at: 2026-05-08
last_consolidated_at: 2026-05-09
consolidation: portable runnable file count still 137; extracted line count still 1996; no missing or stale index files.

Indexed runnable portable and portable-mixed files: 137.
Extracted test/describe/it lines: 1996.
Files with zero extracted names: 0.

The extractor records literal, dynamic, and multiline titles by line pointer. Dynamic rows still need local reading before an apply pass, but they are no longer hidden behind a file-name-only route.

## `../lexical/packages/lexical-code-shiki/src/__tests__/unit/LexicalCodeNodeTabs.test.ts`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:47` describe: LexicalCodeNode tests
- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:49` describe: Tabs
- `../lexical/packages/lexical-code-shiki/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:96` test: testing ${scenario[2]}: ${scenario[0]} => ${scenario[1]} (${direction})

## `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:60` describe: LexicalCodeNode tests
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:62` test: CodeNode.constructor
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:73` test: CodeNode.createDOM()
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:90` test: CodeNode.updateDOM()
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:111` test: CodeNode.exportJSON() should return and object conforming to the expected schema
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:133` test: CodeNode.insertNewAfter()
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:167` test: $createCodeNode()
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:179` test: can tab with collapsed selection
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:215` test: can tab with non-collapsed selection
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:239` test: can indent/outdent one line by forward selecting all line (with tabs)
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:279` test: can indent/outdent one line by backward selecting all line (with tabs)
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:319` test: can indent/outdent with collapsed selection at start of line (with tabs)
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:357` test: can indent/outdent multiline (with tabs)
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:391` test: can indent at the start of the second line
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:409` test: can indent when selection has a CodeNode element (with indent)
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:435` test: can outdent at arbitrary points in the line (with tabs)
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:459` test: code blocks can shift lines (with tab)
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:479` test: code blocks can shift multiple lines (with tab)
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:513` describe: arrows
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:514` describe: rtl code lines
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:537` test: MOVE_TO_END moves caret to visual right
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:559` test: MOVE_TO_START moves caret to visual left
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:1006` describe: initial editor state before transforms
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:1007` test: can be registered after initial editor state (regression #7014)

## `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNodeTabs.test.ts`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:34` describe: LexicalCodeNode tests
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:36` describe: Tabs
- `../lexical/packages/lexical-code/src/__tests__/unit/LexicalCodeNodeTabs.test.ts:83` test: testing ${scenario[2]}: ${scenario[0]} => ${scenario[1]} (${direction})

## `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:205` describe: LexicalHistory tests
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:248` test: LexicalHistory after clearing
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:284` test: LexicalHistory.Redo after Quote Node
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:352` test: LexicalHistory in sequence: change, undo, redo, undo, change
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:437` test: undoStack selection points to the same editor
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:481` test: Changes to TextNode leaf are detected properly #6409
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:541` describe: SharedHistoryExtension
- `../lexical/packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:542` test: can create a parent editor

## `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:25` describe: HTML
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:42` test: [Lexical -> HTML]: ${name}
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:64` test: [Lexical -> HTML]: Use provided selection
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:111` test: [Lexical -> HTML]: Default selection (undefined) should serialize entire editor state
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:156` test: dynamic or multiline title
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:186` test: If alignment is set on the paragraph, it should take precedence over its parent block alignment
- `../lexical/packages/lexical-html/src/__tests__/unit/LexicalHtml.test.ts:216` test: It should output correctly nodes whose export is DocumentFragment

## `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:44` describe: LexicalListItemNode tests
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:46` test: ListItemNode.constructor
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:60` test: ListItemNode.createDOM()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:85` describe: ListItemNode.updateDOM()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:86` test: base
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:119` test: nested list
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:158` describe: ListItemNode.replace()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:206` test: another list item node
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:239` test: first list item with a non list item node
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:294` test: last list item with a non list item node
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:323` test: middle list item with a non list item node
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:354` test: the only list item with a non list item node
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:397` describe: ListItemNode.remove()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:401` test: siblings are not nested
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:469` test: the previous sibling is nested
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:549` test: the next sibling is nested
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:629` test: both siblings are nested
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:718` test: the previous sibling is nested deeper than the next sibling
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:828` test: the next sibling is nested deeper than the previous sibling
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:939` test: both siblings are deeply nested
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1063` describe: ListItemNode.insertNewAfter(): non-empty list items
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1111` test: first list item
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1142` test: last list item
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1173` test: middle list item
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1204` test: the only list item
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1251` test: $createListItemNode()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1265` test: $isListItemNode()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1275` describe: ListItemNode.setIndent()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1296` it: indents and outdents list item
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1356` it: handles fractional indent values
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1369` test: Can serialize a node that is not attached
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1388` test: ListItemNode marker style inheritance on indent
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1415` test: Default: Splitting a list resets numbering to 1 (Backward Compatibility)
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListItemNode.test.ts:1455` test: Option Enabled: Splitting a list preserves numbering (Smart Behavior)

## `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:54` describe: LexicalListNode tests
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:56` test: ListNode.constructor
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:70` test: ListNode.getTag()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:83` test: ListNode.createDOM()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:108` test: ListNode.createDOM() correctly applies classes to a nested ListNode
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:189` test: ListNode.updateDOM()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:214` test: ListNode.append() should properly transform a ListItemNode
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:231` test: ListNode.append() should properly transform a ListNode
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:253` test: ListNode.append() should properly transform a ParagraphNode
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:269` test: ListNode.append() should wrap an InlineNode in a ListItemNode without converting it to TextNode
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:308` test: ListNode.splice() should wrap multiple non-ListItem nodes in individual ListItem nodes
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:341` test: Should update list children when switching from checklist to bullet
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:367` test: Should clear checklist attributes when nesting lists
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:425` test: $createListNode()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:439` test: $isListNode()
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:449` test: $createListNode() with tag name (backward compatibility)
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:462` describe: LexicalListNode subclassing tests ($config)
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:494` describe: ListNode as-is
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:497` test: applies transform
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:513` describe: ListNodeConfig (no replacement)
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:516` test: applies transform
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:532` describe: ListNodeSubclass (no replacement)
- `../lexical/packages/lexical-list/src/__tests__/unit/LexicalListNode.test.ts:535` test: applies transform

## `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts:23` describe: ListExtension
- `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts:36` it: Creates the list
- `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts:47` describe: CheckListExtension
- `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts:61` it: Preserves numbering when configured via extension
- `../lexical/packages/lexical-list/src/__tests__/unit/ListExtension.test.ts:118` it: Creates the list

## `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:82` describe: insertList
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:84` test: inserting with empty root selection
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:106` test: inserting in root selection with existing child
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:131` test: inserting with empty shadow root selection
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:160` test: formatting empty list items
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:187` test: preserves element-anchored selection when converting paragraph with linebreak to list
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:233` describe: $handleListInsertParagraph
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:235` test: exits list when list item is completely empty
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:262` test: exits list when list item contains only whitespace
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:291` test: extends list when list item contains non-whitespace content
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:317` test: extends list when list item contains a decorator node
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:343` test: splits list when the empty element is not the last one
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:386` describe: $handleIndent
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:389` test: creates a new nested sublist
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:422` describe: $handleOutdent
- `../lexical/packages/lexical-list/src/__tests__/unit/formatList.test.ts:424` test: removes the nested list and replaces list item

## `../lexical/packages/lexical-list/src/__tests__/unit/registerListStrictIndentTransform.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-list/src/__tests__/unit/registerListStrictIndentTransform.test.ts:19` describe: Lexical List StrictIndentTransform tests
- `../lexical/packages/lexical-list/src/__tests__/unit/registerListStrictIndentTransform.test.ts:26` test: applyStrictListIndentation

## `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:15` describe: Lexical List Utils tests
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:17` test: getListDepth should return the 1-based depth of a list with one levels
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:35` test: getListDepth should return the 1-based depth of a list with two levels
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:68` test: getListDepth should return the 1-based depth of a list with five levels
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:113` test: getTopListNode should return the top list node when the list is a direct child of the RootNode
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:144` test: getTopListNode should return the top list node when the list is not a direct child of the RootNode
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:176` test: getTopListNode should return the top list node when the list item is deeply nested.
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:214` test: isLastItemInList should return true if the listItem is the last in a nested list.
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:249` test: isLastItemInList should return true if the listItem is the last in a non-nested list.
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:275` test: isLastItemInList should return false if the listItem is not the last in a nested list.
- `../lexical/packages/lexical-list/src/__tests__/unit/utils.test.ts:310` test: isLastItemInList should return true if the listItem is not the last in a non-nested list.

## `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:257` describe: Markdown
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:818` it: dynamic or multiline title
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:866` it: dynamic or multiline title
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:916` it: dynamic or multiline title
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:950` it: should not remove leading node and transform if replace returns false
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:997` it: should remove leading node and execute transform if replace does not return false
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1044` it: can round-trip nested fenced code blocks (4 backticks wrapping 3 backticks)
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1080` it: can round-trip deeply nested fenced code blocks (5 backticks wrapping 4 backticks)
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1117` it: computes fence dynamically when code block content contains backticks
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1145` describe: list marker
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1146` it: should remember marker used on import
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1168` it: should not use [ as a marker for an implicit check list
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1192` it: should remember the marker for checkbox with an explicit marker
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1217` it: should remember marker used on export
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1245` describe: Enter key triggers
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1246` it: dynamic or multiline title
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1286` it: dynamic or multiline title
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1326` it: should not transform on Enter when replace returns false
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1381` describe: normalizeMarkdown - shouldMergeAdjacentLines = true
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1382` it: should combine lines separated by a single \n unless they are in a codeblock
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1446` it: tables
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1455` it: merges adjacent plain text lines with a single space
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1461` it: merges while trimming the next line and inserting a single space
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1467` it: does not merge across HTML-like tags (opening, content, closing, after)
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1476` it: does not merge the fence line with the first line after a code block
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1482` it: trims hard-break trailing spaces when merging adjacent lines
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1488` it: treats whitespace-only lines as empty separators (no merge across them)
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1498` it: mdx start tag followed by content, than closing tag preceded by content
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1507` describe: normalizeMarkdown - shouldMergeAdjacentLines = false
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1508` it: should not combine lines separated by a single \n
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1575` it: tables
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1584` it: preserves trailing whitespace on content lines
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1589` it: collapses whitespace-only lines to empty (paragraph separator)
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1594` it: preserves leading whitespace on content lines
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1600` describe: markdown hard line break import
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1601` it: preserves hard line break when shouldPreserveNewLines is true
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1641` it: preserves backslash hard line break when shouldPreserveNewLines is true
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1682` describe: markdown whitespace import (default mode)
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1696` it: preserves trailing whitespace on a standalone paragraph line (default mode)
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1722` it: preserves leading whitespace on a standalone paragraph line (default mode)
- `../lexical/packages/lexical-markdown/src/__tests__/unit/LexicalMarkdown.test.ts:1747` it: handles two-space hard line break in default mode (adjacent lines merged into LineBreak)

## `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:52` describe: LINK
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:53` test: text before a markdown link is preserved
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:68` test: formatted text before a markdown link is preserved
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:90` test: LINK is not too greedy if there is a preceding match that was not processed
- `../lexical/packages/lexical-markdown/src/__tests__/unit/MarkdownTransformers.test.ts:123` test: markdown link should not be created inside another link.

## `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs`

category: portable-mixed
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:29` describe: Auto Links
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:32` test: Can convert url-like text into links
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:33` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:63` test: Can convert url-like text into links for email
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:67` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:92` test: Can destruct links if add non-spacing text in front or right after it
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:96` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:156` test: Can create link when pasting text with urls
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:160` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:191` test: Can create link for email when pasting text with urls
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:195` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:225` test: Does not create redundant auto-link
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:226` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:263` test: Can create links when pasting text with multiple autolinks in a row separated by non-alphanumeric characters, but not whitespaces
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:267` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:300` test: Handles multiple autolinks in a row
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:301` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:337` test: Handles autolink following an invalid autolink
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:341` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:360` test: Handles autolink following an invalid autolink to email
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:364` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:391` test: Can convert url-like text with formatting into links
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:395` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:440` test: Can convert url-like text with styles into links
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:444` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:491` test: Can convert URL into an autolink
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:542` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:543` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:567` test: Can convert URL into an email autolink
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:583` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:584` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:607` test: Can not convert bad URLs into links
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:639` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:655` test: Can not convert bad URLs into email links
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:678` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:694` test: Can unlink the autolink and then make it link again
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:698` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:755` test: Unlinked autolink is preserved when adding punctuation before or after it
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:759` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:842` test: Adding an invalid character will destruct an unlinked autolink
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:846` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:896` test: Adding an emoji inside an unlinked autolink will destruct it
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:900` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:955` test: Pressing Enter inside an AutoLinkNode does not insert extra paragraph
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs:959` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:17` test: Auto scroll while typing
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:66` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:69` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:27` test: Autocomplete
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:31` test: Can autocomplete a word
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:79` test: Can autocomplete in the same format as the original text
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:83` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:161` test: Undo does not cause an exception
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:166` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Autocomplete.spec.mjs:168` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:24` test: displays overflow on text
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:25` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:82` test: handles auto link nodes
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:83` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:124` test: displays overflow on token nodes
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:130` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:160` test: can type new lines inside overflow
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:165` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:215` test: can delete text in front and overflow is recomputed
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:220` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:287` test: can delete text in front and overflow is recomputed (token nodes)
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:291` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:332` test: can overflow in lists
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:333` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:353` test: can delete an overflowed paragraph
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:358` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:393` test: handles accented characters
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:394` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:426` test: handles graphemes
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:427` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:444` test: CharacterLimit
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:445` test: UTF-16
- `../lexical/packages/lexical-playground/__tests__/e2e/CharacterLimit.spec.mjs:453` test: UTF-8

## `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:34` test: Clear All Formatting
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:36` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:39` test: Can clear BIU formatting
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:60` test: Should preserve the default styling of links and quoted text
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:107` test: Should preserve the default styling of hashtags and mentions
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:188` test: Can clear left/center/right alignment when BIU formatting already applied
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:210` test: Can clear left/center/right alignment when BIU formatting not applied
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:231` test: Can clear when only indent/outdent alignment is applied
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:252` test: Can clear indent/outdent alignment when other formatting options like BIU or left/right/center align are also applied
- `../lexical/packages/lexical-playground/__tests__/e2e/ClearFormatting.spec.mjs:279` test: Should clear formatting of selected text which spans over 1 paragraph

## `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:34` test: CodeBlock
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:36` test: Can create code block with markdown
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:108` test: Can create code block with markdown and wrap existing text
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:173` test: Can select multiple paragraphs and convert to code block
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:177` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:234` test: Can select partial paragraphs and convert to code block
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:238` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:300` test: Can select a line within line breaks and convert to code block
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:304` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:351` test: Can switch highlighting language in a toolbar
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:423` test: Can maintain indent when creating new lines
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:428` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:515` test: Can indent text via tab when selecting the line with Shift+Down
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:520` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:603` test: Can (un)indent multiple lines at once
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:608` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:924` test: Can move around lines with option+arrow keys
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:928` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:1111` test: prevents selection and typing outside code block boundaries
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:1115` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:1267` test: When pressing CMD/Ctrl + Left, CMD/Ctrl + Right, the cursor should go to the start of the code
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:1271` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:1350` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CodeBlock.spec.mjs:1410` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs`

category: portable
family: collaboration-remote / history-undo-redo
target: packages/plite/test/collab-history-runtime-contract.ts; future slate-yjs browser lane

- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:33` test: Collaboration
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:36` test: Undo with collaboration on
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:42` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:220` test: Remove dangling text from YJS when there is no preceding text node
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:226` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:295` test: Merge dangling text into preceding text node
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:301` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:387` test: Undo/redo where text node is split by formatting change
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:393` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:512` test: Undo/redo where text node is split by inline element node
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:518` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:644` test: $handleNormalizationMergeConflicts handles nodes that have been reparented
- `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:648` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/ColumnLayoutBackspaceAtEnd.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/ColumnLayoutBackspaceAtEnd.spec.mjs:17` test: Layout - removes layout completely when both columns are empty and backspace is pressed at the first layout item
- `../lexical/packages/lexical-playground/__tests__/e2e/ColumnLayoutBackspaceAtEnd.spec.mjs:22` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs`

category: portable
family: ime-composition / history-undo-redo
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; packages/browser/src/playwright/ime.ts; packages/plite-history/test

- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:33` test: Composition
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:35` test: Handles Hiragana characters
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:88` test: Handles Arabic characters with diacritics
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:173` test: IME
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:174` test: Can type Hiragana via IME
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:176` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:258` test: Can type Hiragana via IME between line breaks
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:263` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:371` test: Can type Hiragana via IME into a new bold format
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:377` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:445` test: Can type Hiragana via IME between emojis
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:449` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:636` test: Can type Hiragana via IME at the end of a mention
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:641` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:746` test: Can type Hiragana via IME part way through a mention
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:751` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:852` test: Typing after mention with IME should not break it
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:858` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:920` test: Can type Hiragana via IME with hashtags
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:926` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:1078` test: Can type, delete and cancel Hiragana via IME
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:1083` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:1211` test: Floating toolbar should not be displayed when using IME
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:1217` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:1276` test: Typeahead menu should not close during IME composition
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:1281` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:1325` test: Can replace multiple formatted text nodes with IME composition (Korean)
- `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:1331` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:22` test: HTML CopyAndPaste
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:25` test: Copy + paste multi line html with extra newlines
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:30` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:53` test: Copy + paste a code block with BR
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:54` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:135` test: Copy + paste a paragraph element between horizontal rules
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:140` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:199` test: Paste top level element in the middle of paragraph
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs:204` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:26` test: HTML Image CopyAndPaste
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:31` test: Copy + paste HTML of a figure with img and figcaption
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:37` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:134` test: Copy + paste an image
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:135` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:172` test: Copy + paste + undo multiple image
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:177` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:34` test: HTML Links CopyAndPaste
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:37` test: Copy + paste an anchor element
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:38` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:99` test: Copy + paste in front of or after a link
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:103` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:130` test: Copy + paste link by selecting its (partial) content
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:134` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:166` test: Copy + paste empty link #3193
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:167` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:213` test: Paste a link into text
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:214` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:247` test: Paste text into a link
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:248` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:284` test: Paste formatted text into a link
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:285` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:326` test: Paste a link into a link
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:327` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:366` test: Paste multiple blocks into a link
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/LinksHTMLCopyAndPaste.spec.mjs:367` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:21` test: HTML Lists CopyAndPaste
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:24` test: Copy + paste a list element
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:25` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:93` test: Copy + paste a Lexical nested list
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:94` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:129` test: Copy + paste (Nested List - directly nested ul)
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:133` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:217` test: Copy + paste (Nested List - li with non-list content plus ul child)
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:221` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:299` test: Copy + paste a checklist
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:300` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:372` test: Paste top level element in the middle of list
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:377` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:425` test: Copy + paste a nested divs in a list
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs:426` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:19` test: HTML Tables CopyAndPaste
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:24` test: Copy + paste (Table - Google Docs)
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:29` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:31` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:95` test: Copy + paste (Table - Google Docs with custom widths)
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:100` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:161` test: Copy + paste (Table - Quip)
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:162` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:233` test: Copy + paste (Table - Google Sheets)
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:234` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:306` test: Copy + paste - Merge Grids
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:307` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:308` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:434` test: Copy + paste nested block and inline html in a table
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:439` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:441` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:534` test: Copy + paste table with merged cells and unequal number of cells in rows
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:539` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:691` test: Copy + paste table with empty row
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:696` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:17` test: HTML CopyAndPaste
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:20` test: Copy + paste html with BIU formatting
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:21` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:70` test: Copy + paste html with highlight formatting
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TextFormatHTMLCopyAndPaste.spec.mjs:74` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:23` test: ContextMenuCopyAndPaste
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:29` test: Basic copy-paste #6231
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:30` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:56` test: Rich text Copy and Paste with different Font Size
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ContextMenuCopyAndPaste.spec.mjs:62` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:33` test: CopyAndPaste
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:35` test: Basic copy + paste
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:222` test: Copy and paste heading
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:228` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:229` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:230` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:278` test: Copy and paste between sections
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:743` test: Copy and paste an inline element into a leaf node
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:747` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:796` test: Copy + paste multi-line plain text into rich text produces separate paragraphs
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:800` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:819` test: Pasting a decorator node on a blank line inserts before the line
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:826` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:875` test: Copy and paste paragraph into quote
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:876` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:905` test: Process font-size from content copied from Google Docs/MS Word
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:909` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:933` test: test font-size in pt and px both are processed correctly
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:937` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:965` test: Cut then copy empty selection preserves clipboard

## `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:30` test: Lists CopyAndPaste
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:33` test: Copy and paste of partial list items into an empty editor
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:37` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:139` test: Copy and paste of partial list items into the list
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:143` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:280` test: Copy list items and paste back into list
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:285` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:399` test: Copy list items and paste into list
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:404` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:405` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:533` test: Copy and paste of list items and paste back into list on an existing item
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:538` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:663` test: Copy and paste two paragraphs into list on an existing item
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:667` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:766` test: Copy and paste two paragraphs at the end of a list
- `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs:770` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:20` test: DateTime
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:23` test: can insert a DateTime node via the Insert dropdown
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:27` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:62` test: Datetime should be inserted into the link
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:66` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:114` test: Datetime should apply the current selection format
- `../lexical/packages/lexical-playground/__tests__/e2e/DateTime.spec.mjs:118` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:18` test: DraggableBlock
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:21` test: Paragraph one can be successfully dragged below paragraph two
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:27` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:28` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:29` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:70` test: Dragging a paragraph to the end of itself does not change the content
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:76` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:77` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:78` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:112` test: Drag a paragraph to the bottom of its previous paragraph and nothing happens
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:118` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:119` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:120` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:154` test: Dragging the first paragraph to an empty space in the middle of the editor works correctly
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:160` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:161` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/DraggableBlock.spec.mjs:162` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs:20` test: Element format
- `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs:22` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs:26` test: Can indent/align paragraph when caret is within link
- `../lexical/packages/lexical-playground/__tests__/e2e/ElementFormat.spec.mjs:59` test: Can center align an empty paragraph

## `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs:24` test: Emoticons
- `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs:26` test: Can handle a single emoticon
- `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs:107` test: Can enter multiple emoticons
- `../lexical/packages/lexical-playground/__tests__/e2e/Emoticons.spec.mjs:573` test: Can handle single emoticon replaced with text

## `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs:60` test: EquationNode
- `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs:62` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs:68` test: inline EquationNode is wrapped in a paragraph
- `../lexical/packages/lexical-playground/__tests__/e2e/EquationNode.spec.mjs:86` test: block EquationNode is a child of the root

## `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs:18` test: Events
- `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs:21` test: Autocapitalization (MacOS specific)
- `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs:96` test: Add period with double-space after emoji (MacOS specific) #3953

## `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:23` test: Extensions
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:25` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:47` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:128` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:183` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:189` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:190` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:237` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:274` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:18` test: Focus
- `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:20` test: can tab out of the editor
- `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:23` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:34` test: selection remains internally when clicking outside the editor
- `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:38` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:28` test: Hashtags
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:30` test: Can handle a single hashtag
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:90` test: Can handle adjacent hashtags
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:195` test: Can insert many hashtags mixed with text and delete them all correctly
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:269` test: Hashtag inherits format
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:270` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:290` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:329` test: Should not break while skipping invalid hashtags #5703
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:365` test: Can handle hashtags following multiple invalid hashtags
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:420` test: Should not break when pasting multiple matches
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:424` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:444` test: Should not break while importing and exporting multiple matches
- `../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs:448` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsBackspaceAtStart.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsBackspaceAtStart.spec.mjs:19` test: Headings - stays as a heading when you backspace at the start of a heading with no previous sibling nodes present
- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsBackspaceAtStart.spec.mjs:24` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterAtEnd.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterAtEnd.spec.mjs:18` test: Headings - changes to a paragraph when you press enter at the end of a heading
- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterAtEnd.spec.mjs:23` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterInMiddle.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterInMiddle.spec.mjs:23` test: Headings - stays as a heading when you press enter in the middle of a heading
- `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterInMiddle.spec.mjs:28` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:35` test: HorizontalRule
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:37` test: Can create a horizontal rule and move selection around it
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:41` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:158` test: Will add a horizontal rule at the end of a current TextNode and move selection to the new ParagraphNode.
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:162` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:210` test: Will add a horizontal rule and split a TextNode across 2 paragraphs if the caret is in the middle of the TextNode, moving selection to the start of the new ParagraphNode.
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:214` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:272` test: Will add a horizontal rule and split a TextNode across 2 ListItemNode if the caret is in the middle of the TextNode, moving selection to the start of the new ParagraphNode
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:276` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:341` test: Will add a horizontal rule and split a TextNode across 2 ListItemNode if the caret is in an empty ListItemNode, moving selection to the start of the new ListItemNode (#6849)
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:345` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:399` test: Can copy and paste a horizontal rule
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:400` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:489` test: Can delete empty paragraph after a horizontal rule without deleting the horizontal rule
- `../lexical/packages/lexical-playground/__tests__/e2e/HorizontalRule.spec.mjs:495` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:35` test: Images
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:37` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:40` test: Can create a decorator and move selection around it
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:45` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:219` test: Can add images and delete them correctly
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:223` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:391` test: Can add images by arbitrary URL
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:396` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:442` test: Can be dragged and dropped correctly when the image is clicked
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:448` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:449` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:450` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:535` test: Cannot be dragged without being clicked
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:539` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:577` test: Select image, then select text - EditorState.\_selection updates with mousedown #2901
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:584` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:585` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:615` test: Node selection: can select multiple image nodes and replace them with a new image
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:620` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:725` test: Can resolve selection correctly when the image is clicked and dragged right
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:731` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:770` test: Verifies image dimensions are properly calculated for both SVG and JPG formats
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:775` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:820` test: Dimensionless SVG renders with a visible bounding box instead of collapsing
- `../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs:825` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:41` test: Identation
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:46` test: Can create content and indent and outdent it all
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:53` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:461` test: Can only indent paragraph until the max depth
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:465` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:479` test: Can only indent until the max depth when list is empty
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:483` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:591` test: Can only indent until the max depth when list has content
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:595` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:704` test: Can only indent until the max depth a list with nested lists
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:708` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:1007` test: Cannot have negative indents (#7410)
- `../lexical/packages/lexical-playground/__tests__/e2e/Indentation.spec.mjs:1008` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Keyboard.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Keyboard.spec.mjs:21` test: Keyboard shortcuts
- `../lexical/packages/lexical-playground/__tests__/e2e/Keyboard.spec.mjs:26` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Keyboard.spec.mjs:32` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:179` test: Keyboard shortcuts
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:181` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:186` test: Can use ${format} format with the shortcut
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:211` test: Can use ${alignment} with the shortcut
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:229` test: Can use ${style} with the shortcut
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:246` test: Can increase and decrease font size with the shortcuts
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:264` test: Can clear formatting with the shortcut
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:312` test: Can toggle Insert Code Block with the shortcut
- `../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs:335` test: Can indent and outdent with the shortcuts

## `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs`

category: portable-mixed
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:24` test: Keywords
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:26` test: Can create a decorator and move selection around it
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:190` test: Can type congrats[Team]!
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:217` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:223` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:354` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs:358` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:39` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:42` describe: Links
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:44` test: Can convert a text node into a link
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:127` test: Can convert multi-formatted text into a link (backward)
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:244` test: Can convert multi-formatted text into a link (forward)
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:361` test: Can create a link in a list and insert a paragraph at the start
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:410` test: Can create a link with some text after, insert paragraph, then backspace, it should merge correctly
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:495` test: Can backspace across a link and it deletes text, not the whole link
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:551` test: Can create a link then replace it with plain text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:590` test: Can create a link then replace it with plain text #2
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:616` test: Can create a link then partly replace it with plain text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:649` test: Inserting text either side of links
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:673` test: Inserting text before links
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:674` test: Start-of-paragraph links
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:721` test: Can insert text before a start-of-paragraph link, via typing
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:727` test: Can insert text before a start-of-paragraph link, via pasting plain text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:734` test: Can insert text before a start-of-paragraph link, via pasting HTML
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:741` test: Can insert text before a start-of-paragraph link, via pasting Lexical text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:748` test: Mid-paragraph links
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:795` test: Can insert text before a mid-paragraph link, via typing
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:801` test: Can insert text before a mid-paragraph link, via pasting plain text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:807` test: Can insert text before a mid-paragraph link, via pasting HTML
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:813` test: Can insert text before a mid-paragraph link, via pasting Lexical text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:820` test: End-of-paragraph links
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:865` test: Can insert text before an end-of-paragraph link, via typing
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:871` test: Can insert text before an end-of-paragraph link, via pasting plain text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:878` test: Can insert text before an end-of-paragraph link, via pasting HTML
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:885` test: Can insert text before an end-of-paragraph link, via pasting Lexical text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:893` test: Inserting text after links
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:894` test: Start-of-paragraph links
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:940` test: Can insert text after a start-of-paragraph link, via typing
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:946` test: Can insert text after a start-of-paragraph link, via pasting plain text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:953` test: Can insert text after a start-of-paragraph link, via pasting HTML
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:960` test: Can insert text after a start-of-paragraph link, via pasting Lexical text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:967` test: Mid-paragraph links
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1014` test: Can insert text after a mid-paragraph link, via typing
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1020` test: Can insert text after a mid-paragraph link, via pasting plain text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1027` test: Can insert text after a mid-paragraph link, via pasting HTML
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1034` test: Can insert text after a mid-paragraph link, via pasting Lexical text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1041` test: End-of-paragraph links
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1087` test: Can insert text after an end-of-paragraph link, via typing
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1093` test: Can insert text after an end-of-paragraph link, via pasting plain text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1100` test: Can insert text after an end-of-paragraph link, via pasting HTML
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1107` test: Can insert text after an end-of-paragraph link, via pasting Lexical text
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1116` test: Can convert multi-formatted text into a link and then modify text after
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1241` test: It can insert text inside a link after a formatted text node
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1326` test: It can insert text inside a link before a formatted text node
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1414` test: Can edit link with collapsed selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1454` test: Can type text before and after
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1506` test: Can delete text up to a link and then add text after
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1570` test: Can convert part of a text node into a link with forwards selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1662` test: Can convert part of a text node into a link with backwards selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1766` test: Can convert part of a text node into a link and change block type
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1814` test: Can create multiline links
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1850` test: Can handle pressing Enter inside a Link
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1888` test: Can handle pressing Enter inside a Link containing multiple TextNodes
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1931` test: Can handle pressing Enter at the beginning of a Link
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1965` test: Can handle pressing Enter at the end of a Link
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1969` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:1999` test: Can add, edit and remove links on images
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:2005` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:2150` test: Can add, edit and remove links on multiple selected images
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:2156` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:2406` test: Link attributes
- `../lexical/packages/lexical-playground/__tests__/e2e/Links.spec.mjs:2411` test: Can add attributes with paste

## `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:75` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:78` test: Checklist focus option
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:79` test: (shouldDisableFocusOnClickChecklist: true) Keeps focus outside the editor when clicking a checklist item
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:83` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:120` test: (shouldDisableFocusOnClickChecklist: false) Moves focus into the editor/listItem when clicking a checklist item
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:124` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:169` describe: Nested List
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:172` test: Can create a list and partially copy some content out of it
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:224` test: Should outdent if indented when the backspace key is pressed
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:316` test: Should outdent if indented when the backspace key is pressed only at the front
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:367` test: Should retain selection style when exiting list
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:447` test: Can indent/outdent multiple list nodes in a list with multiple levels of indentation
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:671` test: Can indent a list with a list item in between nested lists
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:719` test: Can create a list and then toggle it back to original state.
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:923` test: Can toggle format for multi-line list of each type without losing indentation state.
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1242` test: Can create a list containing inline blocks and then toggle it back to original state.
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1329` test: Can create multiple bullet lists and then toggle off the list.
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1446` test: Can create an unordered list and convert it to an ordered list
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1487` test: Can create a single item unordered list with text and convert it to an ordered list
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1523` test: Can create a multi-line unordered list and convert it to an ordered list
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1614` test: Can create a multi-line unordered list and convert it to an ordered list when no nodes are in the selection
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1698` test: Can create an indented multi-line unordered list and convert it to an ordered list
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:1831` test: Can create an indented multi-line unordered list and convert individual lists in the nested structure to a numbered list.
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2117` test: Should merge selected nodes into existing list siblings of the same type when formatting to a list
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2194` test: Should NOT merge selected nodes into existing list siblings of a different type when formatting to a list
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2270` test: Should create list with start number markdown
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2301` test: Should not process paragraph markdown inside list.
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2318` test: Un-indents list empty list items when the user presses enter
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2371` test: Converts a List with one ListItem to a Paragraph when Normal is selected in the format menu
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2400` test: Converts the last ListItem in a List with multiple ListItem to a Paragraph when Normal is selected in the format menu
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2439` test: Converts the middle ListItem in a List with multiple ListItem to a Paragraph when Normal is selected in the format menu
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2489` test: Can create check list, toggle it to bullet-list and back
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2617` test: can navigate and check/uncheck with keyboard
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2683` test: replaces existing element node
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2707` test: remove list breaks when selection in empty nested list item
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2739` test: remove list breaks when selection in empty nested list item 2
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2789` test: new list item should preserve format from previous list item even after new list item is indented
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2827` test: collapseAtStart for trivial bullet list
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2848` test: collapseAtStart for bullet list with text
- `../lexical/packages/lexical-playground/__tests__/e2e/List.spec.mjs:2873` test: collapseAtStart for bullet list with text inside autolink

## `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:55` describe: Markdown
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:219` test: Should create stylized (e.g. BIUS) text from plain text using a markdown shortcut e.g. ${markdownText}
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:224` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:250` test: Should create stylized (e.g. BIUS) text from already stylized text using a markdown shortcut e.g. ${markdownText}
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:255` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:308` test: Should test markdown with the (${markdownText}) trigger. Should include undo and redo.
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:313` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:333` test: Should test importing markdown (${markdownText}) trigger.
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:338` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:380` describe: Markdown
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:382` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:654` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:678` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:690` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:698` test: can undo/redo nested transformations
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:763` test: can convert already styled text (overlapping ranges)
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:810` test: can convert markdown text into rich text
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:839` test: can type text with markdown
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:845` test: intraword text format
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:871` test: can export text format next to a newline
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:907` test: can import single decorator node (#2604)
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:909` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:941` test: can import several text match transformers in a same line (#5385)
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:945` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:1007` test: does not use code-formatted text in text format transformers (#7349)
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:1028` test: can adjust selection after text match transformer
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:1055` test: keep list marker on its own items
- `../lexical/packages/lexical-playground/__tests__/e2e/Markdown.spec.mjs:1069` test: keep list marker on its own items with copy/paste

## `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:24` test: MaxLength
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:29` test: can restrict the text to specified length
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:56` test: can restrict pasted text to specified length
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:73` test: can restrict emojis on boundaries
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:125` test: paste with empty paragraph in between #3773
- `../lexical/packages/lexical-playground/__tests__/e2e/MaxLength.spec.mjs:142` test: paste with empty paragraph at end #3773

## `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:29` test: Mentions
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:32` test: Can enter the Luke Skywalker mention
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:105` test: Can enter and delete part of the Luke Skywalker mention
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:200` test: Can enter and backspace part of the Luke Skywalker mention in the middle
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:276` test: Can enter and delete part of the Luke Skywalker mention in the middle
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:352` test: Can enter and backspace part of the Luke Skywalker mention
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:524` test: Can enter multiple Luke Skywalker mentions and then delete them from start
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:858` test: Can enter a mention then delete it and partially remove text after
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:940` test: Pasting over a mention does not lead to crash
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:992` test: Sets correct attributes on typeahead menu container
- `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:996` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs:51` test: Mutations
- `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs:53` test: Text mutation observers also manage the selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs:156` test: Can restore the DOM to the editor state state

## `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:44` test: Keyboard Navigation
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:47` test: can type several paragraphs
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:66` test: can move to the beginning of the current line, then back to the end of the current line
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:105` test: can move to the top of the editor
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:116` test: can move one word to the right
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:153` test: can move to the beginning of the previous word
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:198` test: can move to the bottom of the editor
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:219` test: can move to the beginning of the current paragraph
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:242` test: can move to the top of the editor, then to the bottom of the current paragraph
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:260` test: can navigate through the plain text word by word
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:474` test: can navigate through the formatted text word by word
- `../lexical/packages/lexical-playground/__tests__/e2e/Navigation.spec.mjs:795` test: can navigate through the text with emoji word by word

## `../lexical/packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs:20` test: Placeholder
- `../lexical/packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs:22` test: Displays a placeholder when no content is present

## `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:59` describe: Selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:63` test: does not focus the editor on load
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:84` test: keeps single active selection for nested editors
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:90` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:139` test: can wrap post-linebreak nodes into new element
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:143` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:171` test: can delete text by line backwards with CMD+delete
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:175` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:210` test: can delete text by line forwards with opt+CMD+delete
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:214` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:258` test: can delete text by line forwards with control+K
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:268` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:312` test: can delete line which ends with element backwards with CMD+delete
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:316` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:351` test: can delete line which starts with element forwards with opt+CMD+delete
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:355` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:511` test: can delete line by collapse
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:512` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:532` test: Can insert inline element within text and put selection after it
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:536` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:552` test: Can delete at boundary #4221
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:553` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:590` test: Can select all with node selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:591` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:606` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:611` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:649` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:654` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:697` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:698` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:737` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:738` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:780` test: Can delete block elements
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:781` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:836` test: Can delete sibling elements forward
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:842` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:860` test: Can adjust triple click selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:865` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:891` test: Can adjust triple click selection with
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:896` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:933` test: Select all from Node selection #4658
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:935` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:952` test: Select all (DecoratorNode at start) #4670
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:957` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:976` test: Can use block controls on selections including decorator nodes #5371
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:981` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1008` test: Select previous with RTL (DecoratorNode) #7685
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1013` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1035` test: Select next with RTL (DecoratorNode) #7685
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1040` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1063` test: Move left from DecoratorNode in RTL #7771
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1068` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1096` test: Move right from DecoratorNode in RTL #7771
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1101` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1128` test: Move right from last node in RTL #7775
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1133` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1145` test: Move left from last node in RTL #7775
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1151` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1152` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1170` test: Can delete table node present at the end #5543
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1176` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1193` test: Triple-clicking last cell in table should not select entire document
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1199` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1248` test: Selecting table cell then dragging to outside of table should select entire table
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1254` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1295` test: Can persist the text format from the paragraph
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1299` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1338` test: toggle format at the start of paragraph to a different format persists the format
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1342` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1379` test: formatting is persisted after deleting all nodes from the paragraph node
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1383` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1410` test: Can persist the text style (color) from the paragraph
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1414` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1449` test: shift+arrowdown into a table selects the whole table
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1455` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1456` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1471` test: shift+arrowup into a table selects the whole table
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1477` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1478` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1493` test: shift+arrowdown into a table, when the table is the last node, selects the whole table
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1497` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1515` test: shift+arrowup into a table, when the table is the first node, selects the whole table
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1519` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1537` test: shift+arrowdown into a table, when the table is the only node, selects the whole table
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1541` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1566` test: shift+arrowup into a table, when the table is the only node, selects the whole table
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1572` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1597` test: shift+arrowdown into a table does not select element after
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1603` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1622` test: shift+arrowup into a table does not select element before
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1628` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1646` test: programatic update on blurred editor does not kill selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1651` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs`

category: portable-mixed
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs:20` test: SelectionAlwaysOnDisplay
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs:24` test: retain selection works
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs:25` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs:62` test: retain selection works with reverse selection
- `../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs:67` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs:18` test: Special Text
- `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs:27` test: should handle a single special text
- `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs:45` test: should handle multiple special texts
- `../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs:69` test: should not work when the option to use brackets for highlighting is disabled

## `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:20` test: Tab
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:22` test: can tab + IME
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:27` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:94` test: can tab inside code block #4399
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:95` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:124` test: can go to start of line after a tab character
- `../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs:128` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs`

category: portable
family: tables-grid / selection-dom-mapping
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:92` describe: Tables
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:93` test: Can a table be inserted from the toolbar
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:98` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:137` test: Can type inside of table cell
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:142` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:185` test: Can exit the first cell of a table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:190` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:231` test: Can exit the last cell of a table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:236` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:276` test: Can exit the first cell of a nested table into the parent table cell
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:281` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:304` test: Can exit the last cell of a nested table into the parent table cell
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:309` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:334` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:340` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:441` test: Can type text after a table that is the last node
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:447` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:499` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:505` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:593` test: Can enter a table from a paragraph underneath via the left arrow key
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:598` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:621` describe: Can navigate table with keyboard
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:622` test: Can navigate cells horizontally
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:627` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:721` test: Can navigate cells vertically
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:726` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:756` test: Should not navigate cells when typeahead menu is open and focused
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:761` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:795` test: Can select cells using Table selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:801` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:857` test: Can select cells using Table selection via keyboard
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:863` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:941` test: Can style text using Table selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:947` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1008` test: Can style on empty table cells and paragraphs with no text
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1013` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1071` test: Align selection style for table cells
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1076` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1143` test: Can copy + paste (internal) using Table selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1149` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1238` test: Can clear text using Table selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1244` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1303` test: Range Selection is corrected when it contains a partial Table.
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1308` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1344` test: Select All when document contains tables adds custom table styles.
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1349` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1399` test: Can delete all with node selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1404` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1423` test: Can delete all with range selection anchored in table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1428` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1464` test: Horizontal rule inside cell
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1465` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1500` test: Table selection: can select multiple cells and insert a decorator
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1506` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1564` test: Table selection: can backspace lines, backspacing empty cell does not destroy it #3278
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1569` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1642` test: Can remove new lines in a collapsible section inside of a table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1648` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1747` test: Resize merged cells width (1)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1753` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1757` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1834` test: Resize merged cells width (2)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1840` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1918` test: Resize merged cells height
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1924` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:1925` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2013` test: Merge/unmerge cells (1)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2014` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2105` test: Merge/unmerge cells (2)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2106` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2241` test: Merge/unmerge with already merged cells
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2247` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2556` test: Merged cell tab navigation forward
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2561` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2562` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2702` test: Merged cell tab navigation reverse
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2707` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2708` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2850` test: Merge with content
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2851` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2939` test: Select multiple merged cells (selection expands to a rectangle)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:2945` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3077` test: Merge multiple merged cells and then unmerge
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3083` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3222` test: Insert row above (with conflicting merged cell)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3227` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3290` test: Insert column before (with conflicting merged cell)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3295` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3356` test: Insert column before (with selected cell with rowspan > 1)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3361` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3416` test: Insert column before (with 1+ selected cells in a row)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3421` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3493` test: Delete rows (with conflicting merged cell)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3499` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3561` test: Delete selected rows (with merged cell overflowing selection from top and bottom)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3566` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3752` test: Delete selected rows (with merged cell overflowing selection from the top)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3757` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3947` test: Delete selected rows (with merged cell overflowing selection from the bottom)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:3952` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4142` test: Delete columns (with conflicting merged cell)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4147` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4208` test: Delete columns backward
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4214` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4263` test: Delete columns forward at end of table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4268` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4316` test: Deselect when click outside #3785 #4138
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4321` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4345` test: Background color to cell
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4346` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4382` test: Cell merge feature disabled
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4383` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4479` test: Cell background color feature disabled
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4484` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4521` test: Add column header after merging cells #4378
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4526` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4622` test: Can align text using Table selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4628` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4702` test: Paste and insert new lines after unmerging cells
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4707` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4875` test: Can delete table row when previous cell is a merged cell
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:4880` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5100` test: Can delete table row when siblings are merged cell
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5105` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5318` test: Can insert multiple rows above the selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5324` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5325` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5521` test: Can insert multiple rows below the selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5527` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5528` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5723` test: with context menu
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5725` test: Can select cells using Table selection and cut them with the context menu
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5732` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5735` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5841` test: Cannot insert nested tables
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5842` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5889` test: Cannot paste tables inside table cells
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5894` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5948` test: Can paste tables inside table cells (with hasNestedTables)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:5953` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6031` test: Can paste and autofit tables inside table cells (with hasNestedTables, hasFitNestedTables)
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6036` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6037` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6128` test: Click and drag to create selection in Firefox #7245
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6133` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6522` test: Resize row with merged cells spanning multiple rows
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6528` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6529` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6619` test: Table action menu is hidden when cell overflows
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6627` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6628` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6665` test: Can expand table to fit content when pasting table into table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6670` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6904` test: Can paste table containing merged cells into table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:6909` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7127` test: Can paste table into table while having table selection
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7132` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7227` test: Can delete table when fully selected with merged cells
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7232` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7233` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7273` test: Ctrl+A selects all cells in table with merged cells when table is only content
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7279` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7333` test: Drag-select column in 2x2 table selects all cells in that column
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7338` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7514` test: Can clear table selection in table by selecting cell in another table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7519` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7573` test: Table selection is properly cleared when clicking and dragging a cell in the same table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7578` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7638` test: shift-selection tests
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7639` test: Range-select from above table into it selects the entire table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7644` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7676` test: Range-select from below table into it selects the entire table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7681` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7711` test: Range-select from inside table to text above it selects the entire table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7716` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7747` test: Range-select from inside table to text below it selects the entire table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7752` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7782` test: nested table shift-selection tests
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7800` test: Range-select from above nested table into it selects the entire table, but not the outer table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7806` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7807` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7808` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7837` test: Range-select from below nested table into it selects the entire table, but not the outer table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7843` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7844` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7867` test: Range-select from inside nested table to text above it selects the entire table, but not the outer table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7873` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7874` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7875` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7901` test: Range-select from inside nested table to text below it selects the entire table, but not the outer table
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7907` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7908` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Tables.spec.mjs:7909` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs`

category: portable
family: beforeinput-input / browser-engine
target: packages/plite-react/test/model-input-strategy-contract.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:27` test: TextEntry
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:29` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:49` test: Can insert text and replace it
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:50` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:69` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:73` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:113` test: Can insert a paragraph between two text nodes
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:117` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:146` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:174` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:202` test: Paragraphed text entry and selection
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:273` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:301` test: Can type characters, and select and replace a part
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:353` test: Can select and delete a word
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:395` test: First paragraph backspace handling
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:476` test: Mix of paragraphs and break points
- `../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs:600` test: Empty paragraph and new line node selection

## `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:37` describe: TextFormatting
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:39` test: Can create bold text using the shortcut
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:43` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:93` test: Can create italic text using the shortcut
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:97` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:147` test: Can select text and boldify it with the shortcut
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:151` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:203` test: Should not format the text in the subsequent paragraph after a triple click selection event.
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:207` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:245` test: Can select text and italicify it with the shortcut
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:249` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:301` test: Can select text and underline+strikethrough
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:305` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:424` test: Can select text and change it to ${format}
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:428` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:500` test: Pressing ${key} resets ${format} format
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:504` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:532` test: Can select text and increase the font-size
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:536` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:571` test: Can select text with different size and increase the font-size relatively
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:575` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:596` test: Can select text and decrease the font-size
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:600` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:635` test: Can select text with different size and decrease the font-size relatively
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:639` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:660` test: Can select text and change the font-size and font-family
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:664` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:749` test: Can select text and update font size by entering the value
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:753` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:790` test: Can select text with different size and update font size by entering the value
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:794` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:817` test: Can select multiple text parts and format them with shortcuts
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:822` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:996` test: Can insert range of formatted text and select part and replace with character
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1000` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1093` test: Regression #2439: can format backwards when at first text node boundary
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1097` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1144` test: The active state of the button in the toolbar should to be displayed correctly
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1148` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1182` test: Regression #2523: can toggle format when selecting a TextNode edge followed by a non TextNode;
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1186` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1240` test: Multiline selection format ignores new lines
- `../lexical/packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs:1245` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs`

category: portable-mixed
family: mixed portable invariant
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:33` test: Toolbar
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:43` test: Insert image caption + table
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:50` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:271` test: Center align image
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:273` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:351` test: When we select three textNodes with different formatting at the same time, the selection formatting should show no formatting at all
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:356` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:373` test: Selecting empty paragraphs has empty selection format
- `../lexical/packages/lexical-playground/__tests__/e2e/Toolbar.spec.mjs:378` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs:18` test: Regression test #1055
- `../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs:20` test: Adds new editor state into undo stack right after undo was done
- `../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs:24` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs:23` test: Regression test #1083
- `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs:25` test: Backspace with ElementNode at the front of the paragraph
- `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs:29` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs:66` test: Backspace with ElementNode at the front of the selection
- `../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs:70` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/1113-link-newline-at-end.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/1113-link-newline-at-end.spec.mjs:18` test: Regression test #1113
- `../lexical/packages/lexical-playground/__tests__/regression/1113-link-newline-at-end.spec.mjs:20` test: Selects new line when inserting a new line at the end of a link
- `../lexical/packages/lexical-playground/__tests__/regression/1113-link-newline-at-end.spec.mjs:24` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/1258-delete-forward.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/1258-delete-forward.spec.mjs:22` test: Regression test #1258
- `../lexical/packages/lexical-playground/__tests__/regression/1258-delete-forward.spec.mjs:24` test: Can delete forward with keyboard

## `../lexical/packages/lexical-playground/__tests__/regression/1384-insert-nodes.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/1384-insert-nodes.spec.mjs:21` test: Regression test #1384
- `../lexical/packages/lexical-playground/__tests__/regression/1384-insert-nodes.spec.mjs:23` test: Properly pastes in code blocks
- `../lexical/packages/lexical-playground/__tests__/regression/1384-insert-nodes.spec.mjs:28` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/1730-delete-backword.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/1730-delete-backword.spec.mjs:19` test: Regression test #1730
- `../lexical/packages/lexical-playground/__tests__/regression/1730-delete-backword.spec.mjs:21` test: Can delete backward with keyboard

## `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs:20` test: Regression test #221
- `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs:22` test: Can handle space in hashtag
- `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs:64` test: Can handle delete in hashtag
- `../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs:106` test: Can handle backspace into hashtag

## `../lexical/packages/lexical-playground/__tests__/regression/230-navigation-around-hashtags.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/230-navigation-around-hashtags.spec.mjs:20` test: Regression test #230
- `../lexical/packages/lexical-playground/__tests__/regression/230-navigation-around-hashtags.spec.mjs:22` test: Is able to right arrow before hashtag after inserting text node

## `../lexical/packages/lexical-playground/__tests__/regression/231-empty-text-nodes.spec.mjs`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/231-empty-text-nodes.spec.mjs:24` test: Regression test #231
- `../lexical/packages/lexical-playground/__tests__/regression/231-empty-text-nodes.spec.mjs:26` test: Does not generate segment error when editing empty text nodes

## `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:24` test: Regression test #3136
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:26` test: Correctly pastes rich content when the selection is followed by an inline element
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:30` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:47` it: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:67` test: Correctly pastes rich content when the selection is preceded by an inline element
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:71` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs:89` it: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs:17` test: Regression test #3433
- `../lexical/packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs:19` test: can merge markdown lists created immediately before existing lists
- `../lexical/packages/lexical-playground/__tests__/regression/3433-merge-markdown-lists.spec.mjs:23` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/379-backspace-with-mentions.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/379-backspace-with-mentions.spec.mjs:20` test: Regression test #379
- `../lexical/packages/lexical-playground/__tests__/regression/379-backspace-with-mentions.spec.mjs:22` test: Is able to correctly handle backspace press at the line boundary

## `../lexical/packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs:20` test: Regression test #399
- `../lexical/packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs:22` test: Supports Ctrl-O as an open line command

## `../lexical/packages/lexical-playground/__tests__/regression/429-swapping-emoji.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/429-swapping-emoji.spec.mjs:19` test: Regression test #429
- `../lexical/packages/lexical-playground/__tests__/regression/429-swapping-emoji.spec.mjs:21` test: Can add new lines before the line with emoji

## `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs:22` test: Regression test #4661
- `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs:26` test: inserting 2 columns before inserts before selection
- `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs:31` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs:98` test: inserting 2 columns after inserts after selection
- `../lexical/packages/lexical-playground/__tests__/regression/4661-insert-column-selection.spec.mjs:103` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/4697-repeated-table-selection.spec.mjs`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/4697-repeated-table-selection.spec.mjs:19` test: Regression test #4697
- `../lexical/packages/lexical-playground/__tests__/regression/4697-repeated-table-selection.spec.mjs:21` test: repeated table selection results in table selection
- `../lexical/packages/lexical-playground/__tests__/regression/4697-repeated-table-selection.spec.mjs:27` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/4872-full-row-span-cell-merge.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/4872-full-row-span-cell-merge.spec.mjs:19` test: Regression test #4872
- `../lexical/packages/lexical-playground/__tests__/regression/4872-full-row-span-cell-merge.spec.mjs:21` test: merging two full rows does not break table selection
- `../lexical/packages/lexical-playground/__tests__/regression/4872-full-row-span-cell-merge.spec.mjs:27` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/4876-unmerge-cell.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/4876-unmerge-cell.spec.mjs:21` test: Regression test #4876
- `../lexical/packages/lexical-playground/__tests__/regression/4876-unmerge-cell.spec.mjs:23` test: unmerging cells should add cells to correct rows
- `../lexical/packages/lexical-playground/__tests__/regression/4876-unmerge-cell.spec.mjs:28` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/5251-paste-into-inline-element.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/5251-paste-into-inline-element.spec.mjs:29` test: Regression test #5251
- `../lexical/packages/lexical-playground/__tests__/regression/5251-paste-into-inline-element.spec.mjs:31` test: Correctly pastes rich content inside an inline element
- `../lexical/packages/lexical-playground/__tests__/regression/5251-paste-into-inline-element.spec.mjs:35` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs:25` test: Regression test #5251
- `../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs:27` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs:31` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs`

category: portable
family: tables-grid / selection-dom-mapping
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:22` test: Regression test #6870
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:24` test: left arrow moves selection around decorators near tables
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:29` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:30` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:66` test: left arrow expands selection around decorators near tables
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:71` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/6870-table-left-arrow-selection.spec.mjs:72` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/6974-delete-character-backward.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/6974-delete-character-backward.spec.mjs:21` test: Regression tests for #6974
- `../lexical/packages/lexical-playground/__tests__/regression/6974-delete-character-backward.spec.mjs:26` test: deleteCharacter merges children from adjacent blocks even if the previous leaf is an inline decorator
- `../lexical/packages/lexical-playground/__tests__/regression/6974-delete-character-backward.spec.mjs:31` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs:21` test: Grapheme deleteCharacter
- `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs:133` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs:135` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/7246-delete-character-backward-list.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/7246-delete-character-backward-list.spec.mjs:21` test: Regression tests for #7246
- `../lexical/packages/lexical-playground/__tests__/regression/7246-delete-character-backward-list.spec.mjs:26` test: deleteCharacter merges children from block adjacent to ListNode
- `../lexical/packages/lexical-playground/__tests__/regression/7246-delete-character-backward-list.spec.mjs:31` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs:22` test: Regression test #7266
- `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs:25` test: toggling column header with merged column cells should only apply column header to the selected column
- `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs:30` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs:136` test: toggling row header with merged row cells should only apply row header to the selected row
- `../lexical/packages/lexical-playground/__tests__/regression/7266-column-header-merged-cells.spec.mjs:141` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs:19` test: Regression tests for #7319
- `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs:24` test: deleteCharacter after hr with RangeSelection
- `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs:29` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs:62` test: deleteCharacter after hr with NodeSelection
- `../lexical/packages/lexical-playground/__tests__/regression/7319-delete-character-backward-nodeselection.spec.mjs:67` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/7354-firefox-decorator-paste.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/7354-firefox-decorator-paste.spec.mjs:23` test: HTML CopyAndPaste
- `../lexical/packages/lexical-playground/__tests__/regression/7354-firefox-decorator-paste.spec.mjs:26` test: Copy + paste multi line html with extra newlines
- `../lexical/packages/lexical-playground/__tests__/regression/7354-firefox-decorator-paste.spec.mjs:31` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-playground/__tests__/regression/7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs:34` test: Regression #7635
- `../lexical/packages/lexical-playground/__tests__/regression/7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs:39` test: Paste into image caption
- `../lexical/packages/lexical-playground/__tests__/regression/7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs:40` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs`

category: portable
family: ime-composition / history-undo-redo
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; packages/browser/src/playwright/ime.ts; packages/plite-history/test

- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:36` test: Regression #8153
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:39` test: Can delete all text selected with Cmd+A after IME composition end on Safari
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:45` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:46` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:47` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:73` test: Can delete multi-paragraph selection with Shift+ArrowUp after IME composition end on Safari
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:79` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:80` test: dynamic or multiline title
- `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:81` test: dynamic or multiline title

## `../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts`

category: portable-mixed
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts:26` describe: ImageNode HTML serialization
- `../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts:27` describe: ImageNode export
- `../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts:28` it: with no caption
- `../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts:54` it: with plain text caption

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:38` describe: LexicalHeadingNode tests
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:40` test: HeadingNode.constructor
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:51` test: HeadingNode.createDOM()
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:75` test: HeadingNode.updateDOM()
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:101` test: HeadingNode.insertNewAfter() empty
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:123` test: HeadingNode.insertNewAfter() middle
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:147` test: HeadingNode.insertNewAfter() end
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:173` test: HeadingNode.setTag()
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:200` test: $createHeadingNode()
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:211` test: $isHeadingNode()
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:219` test: creates a h2 with text and can insert a new paragraph after

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:21` describe: LexicalQuoteNode tests
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:23` test: QuoteNode.constructor
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:33` test: QuoteNode.createDOM()
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:49` test: QuoteNode.updateDOM()
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:66` test: QuoteNode.insertNewAfter()
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:87` test: $createQuoteNode()

## `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalTabNode.test.ts`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalTabNode.test.ts:23` describe: LexicalTabNode tests
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalTabNode.test.ts:25` test: INSERT_TAB_COMMAND applies selection format and style to TabNode
- `../lexical/packages/lexical-rich-text/src/__tests__/unit/LexicalTabNode.test.ts:58` test: format preserved when typing between tabs inserted in bold text

## `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:21` describe: $sliceSelectedTextNodeContent
- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:55` describe: clone
- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:56` test: does not clone with full selection (both nodes)
- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:72` test: clones only with partial selection (last node)
- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:95` test: clones only with partial selection (first node)
- `../lexical/packages/lexical-selection/src/__tests__/unit/$sliceSelectedTextNodeContent.test.ts:116` test: can slice a node from both sides

## `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:125` describe: LexicalSelection tests
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:228` test: Expect initial output to be a block with no text.
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:234` test: Bold format preserved when typing between consecutive line breaks
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:294` test: dynamic or multiline title
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1295` test: dynamic or multiline title
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1309` test: insert text one selected node element selection
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1333` test: getNodes resolves nested block nodes
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1355` describe: Block selection moves when new nodes are inserted
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1958` describe: Selection correctly resolves to a sibling ElementNode when a node is removed
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1959` test: dynamic or multiline title
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1988` describe: Selection correctly resolves to a sibling ElementNode when a selected node child is removed
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:1989` test: dynamic or multiline title
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2023` describe: Selection correctly resolves to a sibling ElementNode that has multiple children with the correct offset when a node is removed
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2024` test: dynamic or multiline title
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2075` test: isBackward
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2119` describe: Decorator text content for selection
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2200` it: dynamic or multiline title
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2234` describe: insertParagraph
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2235` test: three text nodes at offset 0 on third node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2280` test: four text nodes at offset 0 on third node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2328` it: adjust offset for inline elements text formatting
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2373` describe: Node.replace
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2428` test: dynamic or multiline title
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2447` describe: Testing that $getStyleObjectFromRawCSS handles unformatted css text
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2448` test: dynamic or multiline title
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2503` describe: Testing that getStyleObjectFromRawCSS handles values with colons
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2504` test: dynamic or multiline title
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2559` describe: $patchStyle
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2560` it: should patch the style with the new style object
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2610` it: should patch the style with property function
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2666` describe: $setBlocksType
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2667` test: Collapsed selection in text
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2706` test: Collapsed selection in element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2741` test: Two elements, same top-element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2780` test: Two empty elements, same top-element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2821` test: Two elements, same top-element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2860` test: Collapsed in element inside top-element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2904` test: Collapsed in text inside top-element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:2948` test: Full editor selection with a mix of top-elements
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3012` test: Paragraph with links to heading with links
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3060` test: Nested list
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelection.test.tsx:3103` test: Nested list with listItem twice indented from its parent

## `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:90` describe: LexicalSelectionHelpers tests
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:91` describe: Collapsed
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:92` test: Can handle a text point
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:267` test: Has correct text point after removal after merge
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:348` test: Has correct text point after removal after merge (2)
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:424` test: Has correct text point adjust to element point after removal of a single empty text node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:485` test: Has correct element point after removal of an empty text node in a group #1
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:551` test: Has correct element point after removal of an empty text node in a group #2
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:627` test: Has correct text point after removal of an empty text node in a group #3
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:703` test: Can handle an element point on empty element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:840` test: Can handle a start element point
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:993` test: Can handle an end element point
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1146` test: Has correct element point after merge from middle
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1217` test: Has correct element point after merge from end
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1289` describe: Simple range
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1290` test: Can handle multiple text points
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1467` test: Can handle multiple element points
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1624` test: Can handle a mix of text and element points
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1794` describe: can insert non-element nodes correctly
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1795` describe: with an empty paragraph node selected
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1796` test: a single text node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1835` test: two text nodes
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1876` test: link insertion without parent element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1921` test: a single heading node with a child text node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1965` describe: with a paragraph node selected on some existing text
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:1966` test: a single text node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2007` test: two text nodes
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2052` test: a single heading node with a child text node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2099` test: a paragraph with a child text and a child italic text and a child text
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2171` describe: with a fully-selected text node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2172` test: a single text node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2214` describe: with a fully-selected text node followed by an inline element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2215` test: a single text node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2261` describe: with a fully-selected text node preceded by an inline element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2262` test: a single text node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2308` test: can insert a linebreak node before an inline element node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2333` describe: can insert block element nodes correctly
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2334` describe: with a fully-selected text node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2335` test: a paragraph node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2380` describe: with a fully-selected text node followed by an inline element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2381` test: a paragraph node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2430` describe: with a fully-selected text node preceded by an inline element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2431` test: a paragraph node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2480` test: Can insert link into empty paragraph
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2499` test: Can insert link into empty paragraph (2)
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2519` test: Can insert an ElementNode after ShadowRoot
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2541` describe: extract
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2542` test: Should return the selected node when collapsed on a TextNode
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2578` describe: insertNodes
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2583` it: can insert element next to top level decorator node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2614` it: can insert when previous selection was null
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2643` it: can insert when before empty text node
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2663` it: last node is LineBreakNode
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2691` describe: $patchStyleText
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2692` test: can patch a selection anchored to the end of a TextNode before an inline element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2748` test: can patch a selection anchored to the end of a TextNode at the end of a paragraph
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2798` test: can patch a selection that ends on an element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2851` test: can patch a reversed selection that ends on an element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2904` test: can patch a selection that starts and ends on an element
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2946` test: can clear a style
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:2984` test: can toggle a style on a collapsed selection
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:3033` test: updates cached styles when setting on a collapsed selection
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:3082` test: $getSelectionStyleValueForProperty returns consistent value regardless of selection direction
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:3141` test: $getSelectionStyleValueForProperty ignores nodes with zero characters selected at boundaries
- `../lexical/packages/lexical-selection/src/__tests__/unit/LexicalSelectionHelpers.test.ts:3232` test: preserve backward selection when changing style of 2 different text nodes

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts`

category: portable
family: tables-grid / selection-dom-mapping
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:32` describe: LexicalTableCellNode tests
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:34` test: TableCellNode.constructor
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:48` test: TableCellNode.createDOM()
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:103` test: TableCellNode.importDOM
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:255` test: dynamic or multiline title
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:270` test: dynamic or multiline title
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:285` test: DOM Conversion: <th> without scope defaults to ROW header
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:304` test: DOM Conversion: <th> in first row without scope becomes ROW header
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:324` test: DOM Conversion: <th> in first column of non-first row becomes COLUMN header
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableCellNode.test.ts:350` test: DOM Conversion: <th> in thead without scope becomes ROW header

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts`

category: portable
family: tables-grid / selection-dom-mapping
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:51` describe: TableExtension
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:67` it: Creates a table with INSERT_TABLE_COMMAND
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:101` it: Prevents nested tables by default
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:141` it: Allows nested tables when hasNestedTables is true
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:184` describe: $insertGeneratedNodes
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:185` test: SELECTION_INSERT_CLIPBOARD_NODES_COMMAND handler prevents pasting whole table into cells by default
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:236` test: SELECTION_INSERT_CLIPBOARD_NODES_COMMAND handler allows pasting whole table into a single cell when hasNestedTables is true
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:292` test: SELECTION_INSERT_CLIPBOARD_NODES_COMMAND handler allows extending table when hasNestedTables is true
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:365` describe: colWidths
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:366` it: removes colWidths if it is an empty array
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:388` it: uses the last column width if the column count is greater than the number of column widths
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:410` it: shortens the colWidths if the column count is less than the number of column widths
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:433` describe: SELECT_ALL_COMMAND
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:434` it: Selects all cells in table without merged cells when table is only content
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:519` it: Selects all cells in table with merged cells when table is only content
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:618` it: Does not intercept SELECT_ALL_COMMAND when cursor is outside table
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableExtension.test.ts:656` it: Does not intercept SELECT_ALL_COMMAND when there is paragraph after table

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx`

category: portable
family: tables-grid / selection-dom-mapping
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:53` describe: LexicalTableMobileSelection
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:108` test: mouse click should set anchor cell for selection (existing behavior)
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:137` test: touch tap on single cell should not create table selection
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:164` test: touch tap between different cells should not create table selection
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:201` test: touch drag (with isSelecting=true) should still create table selection
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:241` test: mixed pointer types should be handled correctly
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:272` test: mouse leaving browser window during selection should stop selection

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx`

category: portable
family: tables-grid / selection-dom-mapping
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:105` describe: LexicalTableNode tests
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:107` describe: hasHorizontalScroll={${hasHorizontalScroll}}
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:140` test: TableNode.constructor
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:152` test: TableNode.createDOM()
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:169` test: TableNode.createDOM() and updateDOM() style
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:278` test: TableNode.exportDOM() with range selection
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:349` test: TableNode.exportDOM() with partial table selection
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:405` test: Copy table from an external source
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:456` test: Copy table with caption/tbody/thead/tfoot from an external source
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:600` test: Copy table with caption from an external source
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:770` test: Copy table from an external source like gdoc with formatting
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:835` test: Cut table in the middle of a range selection
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:865` test: Cut table as last node in range selection
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:893` test: Cut table as first node in range selection
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:921` test: Cut table is whole selection, should remove it
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:962` test: Cut subsection of table cells, should just clear contents
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1067` test: Table plain text output validation
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1117` test: Toggle row striping ON/OFF
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1182` test: Toggle frozen first column ON/OFF
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1696` test: Change Table-level alignment
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1759` test: Update column widths
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1841` describe: hasHorizontalScroll false -> true
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableNode.test.tsx:1859` test: table is re-rendered when scroll changes

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTablePlugin.test.tsx`

category: portable
family: tables-grid / selection-dom-mapping
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTablePlugin.test.tsx:26` describe: LexicalTablePlugin
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTablePlugin.test.tsx:43` test: INSERT_TABLE_COMMAND inserts a table
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTablePlugin.test.tsx:77` test: INSERT_TABLE_COMMAND inserts a table when the editor is blurred

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableRowNode.test.ts`

category: portable
family: tables-grid / selection-dom-mapping
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableRowNode.test.ts:20` describe: LexicalTableRowNode tests
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableRowNode.test.ts:22` test: TableRowNode.constructor
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableRowNode.test.ts:34` test: TableRowNode.createDOM()

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx`

category: portable
family: tables-grid / selection-dom-mapping
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:34` describe: table selection
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:70` describe: regression #7076
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:71` test: $patchStyleText works on a TableSelection
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:93` test: $patchStyleText applies styles to empty table cells
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:127` describe: regression #7140
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableSelection.test.tsx:128` test: selection points to missing nodes after deleting table rows

## `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts`

category: portable
family: tables-grid / selection-dom-mapping
target: apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts; apps/www/tests/plite-browser/donor/examples/tables.test.ts; packages/plite/test/transforms/insertFragment

- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:58` describe: $moveTableColumn
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:73` test: moves a column forward
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:105` test: moves a column backward
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:137` test: moves a column to the first position
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:169` test: moves a column to the last position
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:201` test: is a no-op when origin equals target
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:233` test: is a no-op when origin is out of bounds
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:265` test: is a no-op when target is out of bounds
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:297` test: is a no-op when origin is negative
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:329` test: reorders colWidths when present
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:360` test: does not modify table with merged cells
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:425` test: swaps adjacent columns
- `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableUtils.test.ts:458` test: preserves table structure after move

## `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsInsertNodeToNearestRoot.test.tsx`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsInsertNodeToNearestRoot.test.tsx:26` describe: LexicalUtils#insertNodeToNearestRoot
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsInsertNodeToNearestRoot.test.tsx:139` it: dynamic or multiline title

## `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsSplitNode.test.tsx`

category: portable
family: core package behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsSplitNode.test.tsx:18` describe: LexicalUtils#splitNode
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsSplitNode.test.tsx:104` it: dynamic or multiline title
- `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsSplitNode.test.tsx:138` it: throws when splitting root

## `../lexical/packages/lexical/src/__tests__/unit/CodeBlock.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical/src/__tests__/unit/CodeBlock.test.ts:23` describe: CodeBlock tests
- `../lexical/packages/lexical/src/__tests__/unit/CodeBlock.test.ts:117` test: Code block html paste: ${testCase.name}

## `../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts:24` describe: HTMLCopyAndPaste tests
- `../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts:110` test: HTML copy paste: ${testCase.name}
- `../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts:135` test: iOS fix: Word predictions should be handled as plain text to maintain selection formatting

## `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:167` describe: LexicalEditor tests
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:244` describe: registerNodeTransform
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:245` it: Calls the RootNode transform last on every update
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:357` describe: read()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:358` it: Can read the editor state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:409` it: runs transforms the editor state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:445` it: can be nested in an update or read
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:481` it: Should create an editor with an initial editor state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:526` it: Should handle nested updates in the correct sequence
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:671` it: nested update after selection update triggers exactly 1 update
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:698` it: update does not call onUpdate callback when no dirty nodes
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:713` it: editor.focus() callback is called
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:728` it: Synchronously runs three transforms, two of them depend on the other
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:775` it: Synchronously runs three transforms, two of them depend on the other (2)
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:841` it: Synchronously runs three transforms, two of them depend on previously merged text content
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:912` it: text transform runs when node is removed
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:943` it: transforms only run on nodes that were explicitly marked as dirty
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:992` it: transforms do not discard unintentional dirtyElements
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1072` describe: transforms on siblings
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1110` it: on remove
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1118` it: on replace
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1127` it: on insertBefore
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1136` it: on insertAfter
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1145` it: on splitText
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1155` it: on append
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1165` it: Detects infinite recursivity on transforms
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1186` it: Should be able to update an editor state without a root element
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1221` it: Should be able to recover from an update error
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1258` it: Should be able to handle a change in root element
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1322` it: dynamic or multiline title
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1349` describe: With node decorators
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1384` it: Should correctly render React component into Lexical node #1
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1428` it: Should correctly render React component into Lexical node #2
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1523` describe: parseEditorState()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1532` it: exportJSON API - parses parsed JSON
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1552` describe: range selection
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1576` it: Parses the nodes of a stringified editor state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1624` it: Parses the text content of the editor state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1634` describe: node selection
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1660` it: Parses the nodes of a stringified editor state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1708` it: Parses the text content of the editor state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1719` describe: $parseSerializedNode()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1720` it: parses serialized nodes
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1744` describe: Node children
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1761` it: moves node to different tree branches
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1816` it: moves node to different tree branches (inverse)
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1851` it: moves node to different tree branches (node appended twice in two different branches)
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1893` it: can subscribe and unsubscribe from commands and the callback is fired
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1921` it: removes the command from the command map when no listener are attached
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1962` it: can register transforms before updates
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:1988` it: textcontent listener
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2049` it: mutation listener
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2146` it: rejects creating an editor with invalid LexicalNode parent class
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2158` it: mutation listener on newly initialized editor
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2166` it: mutation listener with setEditorState
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2226` it: mutation listener set for original node should work with the replaced node
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2323` it: mutation listener should work with the replaced node
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2380` it: multiple update tags
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2402` it: mutation listeners does not trigger when other node types are mutated
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2422` it: mutation listeners with normalization
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2468` it: dynamic or multiline title
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2586` it: editable listener
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2603` it: does not add new listeners while triggering existing
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2690` it: allows using the same listener for multiple node types
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2719` it: calls mutation listener with initial state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2787` it: can use discrete for synchronous updates
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2814` it: can use discrete after a non-discrete update to flush the entire queue
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2841` it: can use discrete after a non-discrete setEditorState to flush the entire queue
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2871` it: can use discrete in a nested update to flush the entire queue
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2898` it: can read in a nested update
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2917` it: does not include linebreak into inline elements
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2934` it: reconciles state without root element
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2945` describe: node replacement
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2946` it: should work correctly
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:2983` it: should fail if node keys are re-used
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3021` it: dynamic or multiline title
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3074` it: dynamic or multiline title
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3123` it: recovers from reconciler failure and trigger proper prev editor state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3161` it: should call importDOM methods only once
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3183` describe: setRootElement
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3184` it: root element count is always positive
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3200` it: should handle root element moving between documents
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3224` describe: html config
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3225` it: should override export output function
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3272` it: should override import conversion function
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3312` describe: selection
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3313` it: updates the DOM selection
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditor.test.tsx:3355` it: does not update the Lexical->DOM selection with skip-dom-selection

## `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:11` describe: LexicalEditor listeners
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:12` describe: registerRootListener
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:13` test: can return a function that is called when unregistered
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:31` test: updates the function on each call
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:47` test: works when the root element changes too
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:80` describe: registerEditableListener
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:81` test: can return a function that is called when unregistered
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:102` test: updates the function on each call
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts:125` test: works when editable state changes

## `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts:23` describe: LexicalEditorState tests
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts:25` test: constructor
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts:34` test: read()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts:107` test: toJSON()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalEditorState.test.ts:123` test: ensure garbage collection works as expected

## `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:15` describe: LexicalElementHelpers tests
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:16` describe: addClassNamesToElement() and removeClassNamesFromElement()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:17` test: basic
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:28` test: empty
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:44` test: multiple
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:55` test: space separated
- `../lexical/packages/lexical/src/__tests__/unit/LexicalElementHelpers.test.ts:67` test: multiple spaces

## `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:18` describe: defineExtension
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:19` it: does not change identity
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:32` it: infers the expected type (base case)
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:37` it: infers the expected type (config inference)
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:42` it: infers the expected type (output inference)
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:54` it: can define an extension without config
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:59` it: infers the correct init type
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:71` describe: declarePeerDependency
- `../lexical/packages/lexical/src/__tests__/unit/LexicalExtensionCore.test.ts:72` it: validates the type argument

## `../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx`

category: portable
family: serialization-parsing / marks-inline
target: packages/plite/test; packages/plite-history/test; apps/www/tests/plite-browser/donor/examples/richtext.test.ts

- `../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx:42` describe: @lexical/list tests
- `../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx:85` test: Toggle an empty list on/off
- `../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx:140` test: Can create a list and indent/outdent it
- `../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx:223` test: $setBlocksType does not cause invalid ListItemNode children - regression #7036

## `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:98` describe: LexicalNode tests
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:122` test: LexicalNode.constructor
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:138` test: LexicalNode.constructor: type change detected
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:151` test: LexicalNode.clone()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:160` test: LexicalNode.afterCloneFrom()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:227` test: LexicalNode.getType()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:236` test: LexicalNode.isAttached()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:253` test: LexicalNode.isSelected()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:278` test: LexicalNode.isSelected(): selected text node
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:296` test: LexicalNode.isSelected(): selected block node range
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:344` test: LexicalNode.isSelected(): with custom range selection
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:375` describe: LexicalNode.isSelected(): with inline decorator node
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:491` test: dynamic or multiline title
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:536` test: LexicalNode.getKey()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:540` test: LexicalNode.getParent()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:556` test: LexicalNode.getParentOrThrow()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:572` test: LexicalNode.getTopLevelElement()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:611` test: LexicalNode.getTopLevelElementOrThrow()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:632` test: LexicalNode.getParents()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:652` test: LexicalNode.getPreviousSibling()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:676` test: LexicalNode.getPreviousSiblings()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:715` test: LexicalNode.getNextSibling()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:736` test: LexicalNode.getNextSiblings()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:764` test: LexicalNode.getCommonAncestor()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:817` test: LexicalNode.isBefore()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:845` test: LexicalNode.isParentOf()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:860` test: LexicalNode.getNodesBetween()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:908` test: LexicalNode.isToken()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:928` test: LexicalNode.isSegmented()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:948` test: LexicalNode.isDirectionless()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:971` test: LexicalNode.getLatest()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:980` test: LexicalNode.getLatest(): garbage collected node
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1002` test: LexicalNode.getTextContent()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1016` test: LexicalNode.getTextContentSize()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1025` test: LexicalNode.createDOM()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1042` test: LexicalNode.updateDOM()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1052` test: LexicalNode.remove()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1078` test: LexicalNode.replace()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1088` test: LexicalNode.replace(): from another parent
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1117` test: LexicalNode.replace(): text
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1134` test: LexicalNode.replace(): token
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1151` test: LexicalNode.replace(): segmented
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1168` test: LexicalNode.replace(): directionless
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1186` test: LexicalNode.replace() within canBeEmpty: false
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1212` test: LexicalNode.insertAfter()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1223` test: LexicalNode.insertAfter(): text
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1240` test: LexicalNode.insertAfter(): token
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1257` test: LexicalNode.insertAfter(): segmented
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1274` test: LexicalNode.insertAfter(): directionless
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1292` test: LexicalNode.insertAfter() move blocks around
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1329` test: LexicalNode.insertAfter() move blocks around #2
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1372` test: LexicalNode.insertBefore()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1383` test: LexicalNode.insertBefore(): from another parent
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1404` test: LexicalNode.insertBefore(): text
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1421` test: LexicalNode.insertBefore(): token
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1438` test: LexicalNode.insertBefore(): segmented
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1455` test: LexicalNode.insertBefore(): directionless
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1472` test: LexicalNode.selectNext()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1488` test: LexicalNode.selectNext(): no next sibling
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1498` test: LexicalNode.selectNext(): non-text node
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1510` describe: LexicalNode.$config()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1511` test: importJSON() with no boilerplate
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1541` test: clone() with no boilerplate
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1622` describe: LexicalNode.$config() without registration
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNode.test.ts:1623` test: static getType() before registration

## `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:117` describe: LexicalNode state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:129` test: state.$set() and state.$get() need to be inside an update
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:148` test: \_\_state is not an enumerable property
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:158` test: getState and setState
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:181` test: import and export state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:201` test: states cannot be registered with the same key string
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:222` test: nodeGetter() and nodeSetter()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:240` test: flat config serialization round-trip
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:269` test: default value should not be exported
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:300` test: getState returns immutable values, setState require an Object literal
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:336` test: setting state shouldn’t affect previous reconciled versions of the node
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:386` describe: nodeStatesAreEquivalent
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:387` test: undefined states are equivalent
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:390` test: merges text nodes with different number of default state values
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:430` test: TextNode merging only with equivalent state
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:493` test: different versions of the same state are not equivalent
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:589` describe: resetOnCopyNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:590` test: state with resetOnCopyNode: true is reset when using $copyNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:610` test: state with resetOnCopyNode: false is preserved when using $copyNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:630` test: state without resetOnCopyNode option is preserved when using $copyNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNodeState.test.ts:649` test: multiple states with different resetOnCopyNode configurations

## `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:24` describe: LexicalNormalization tests
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:26` describe: $normalizeSelection
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:33` test: paragraph to text nodes${reversedStr}
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:61` test: paragraph to text node + element${reversedStr}
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:89` test: paragraph to text node + decorator${reversedStr}
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:117` test: text + text node${reversedStr}
- `../lexical/packages/lexical/src/__tests__/unit/LexicalNormalization.test.tsx:145` test: paragraph to test element to text + text${reversedStr}

## `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:21` describe: LexicalReconciler
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:23` test: Should set direction of root node children to auto if root node has no direction
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:43` test: Should not set direction of root node children if root node has direction
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:64` test: Should allow overriding direction of root node children when root node has no direction
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:96` test: Should allow overriding direction of root node children when root node has direction
- `../lexical/packages/lexical/src/__tests__/unit/LexicalReconciler.test.ts:119` test: Should update root children when root node direction changes

## `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:55` describe: LexicalSelection tests
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:57` describe: Inserting text either side of inline elements
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:124` describe: Inserting text before inline elements
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:125` describe: Start-of-paragraph inline elements
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:153` test: Can insert text before a start-of-paragraph inline element, using insertText
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:160` test: Can insert text before a start-of-paragraph inline element, using insertNodes
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:167` describe: Mid-paragraph inline elements
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:194` test: Can insert text before a mid-paragraph inline element, using insertText
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:200` test: Can insert text before a mid-paragraph inline element, using insertNodes
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:207` describe: End-of-paragraph inline elements
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:234` test: Can insert text before an end-of-paragraph inline element, using insertText
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:240` test: Can insert text before an end-of-paragraph inline element, using insertNodes
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:248` describe: Inserting text after inline elements
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:249` describe: Start-of-paragraph inline elements
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:276` test: Can insert text after a start-of-paragraph inline element, using insertText
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:283` test: Can insert text after a start-of-paragraph inline element, using insertNodes
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:290` describe: Mid-paragraph inline elements
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:317` test: Can insert text after a mid-paragraph inline element, using insertText
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:324` test: Can insert text after a mid-paragraph inline element, using insertNodes
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:331` describe: End-of-paragraph inline elements
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:359` test: Can insert text after an end-of-paragraph inline element, using insertText
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:366` test: Can insert text after an end-of-paragraph inline element, using insertNodes
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:375` describe: insertText()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:376` test: inserts into existing paragraph node when selection is on parent of paragraph
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:395` describe: removeText
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:396` describe: with a leading TextNode and a trailing token TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:415` test: remove all text
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:438` test: remove initial TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:461` test: remove trailing token TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:486` test: remove initial TextNode and partial token TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:511` test: remove partial initial TextNode and partial token TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:539` describe: with a leading token TextNode and a trailing TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:557` test: remove all text
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:580` test: remove trailing TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:605` test: remove leading token TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:628` test: remove partial leading token TextNode and trailing TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:657` test: remove partial token TextNode and partial trailing TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:685` describe: with a leading TextNode and a trailing segmented TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:704` test: remove all text
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:727` test: remove initial TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:750` test: remove trailing segmented TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:775` test: remove initial TextNode and partial segmented TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:802` test: remove partial initial TextNode and partial segmented TextNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:844` describe: Regression tests for #6701
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:845` test: insertNodes fails an invariant when there is no Block ancestor
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:887` describe: getNodes()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:924` describe: $selectAll()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:925` test: with test document
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:952` test: with leading inline decorator
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:984` test: with trailing inline decorator
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1017` test: with leading empty inline element
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1053` test: with trailing empty inline element
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1090` test: after removing empty paragraph
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1124` test: Manual select all without normalization
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1149` test: Manual select all from first text to last empty paragraph
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1174` test: Manual select with focus collapsed between inline decorators
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1209` test: Manual select with focus collapsed after inline decorator
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1245` test: Manual select with focus between inline decorators
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1287` test: select only the paragraph (not normalized)
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1312` test: select around the paragraph (not normalized)
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1341` test: selection collapsed inside an empty element
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1353` test: select an empty ListItemNode (collapsed)
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1373` describe: extract()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1410` test: Manual select all without normalization
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1437` test: Manual select all from first text to last empty paragraph
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1464` test: select partial TextNode extracts paragraph text
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1479` test: select partial TextNode extracts link text
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1492` test: select multiple partial TextNode extracts text
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1509` test: select last offset TextNode as first node removes node
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1534` test: select 0 offset TextNode as last node removes node
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1558` describe: Regression #7081
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1560` test: Firefox selection & paste before linebreak
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1592` describe: Regression #7173
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1594` test: Can insertNodes of multiple blocks with a target of an initial empty block and the entire next block
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1618` describe: Regression #3181
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1620` test: Point.isBefore edge case with mixed TextNode & ElementNode and matching descendants
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1657` describe: Regression #8067
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1659` test: Formatting issue when replacing text with format
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1681` describe: Regression #8098
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1683` test: Do not apply format and style when moving to different node

## `../lexical/packages/lexical/src/__tests__/unit/LexicalSerialization.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalSerialization.test.ts:104` describe: LexicalSerialization tests
- `../lexical/packages/lexical/src/__tests__/unit/LexicalSerialization.test.ts:106` test: serializes and deserializes from JSON

## `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:31` describe: LexicalUpdateTags tests
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:33` test: Built-in update tags work correctly
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:52` test: $addUpdateTag and $hasUpdateTag work correctly
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:62` test: Multiple update tags can be added
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:75` test: Update tags via editor.update() options work
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:88` test: Update tags are cleared after update
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUpdateTags.test.ts:103` test: Update tags affect editor behavior

## `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:44` describe: LexicalUtils tests
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:46` test: scheduleMicroTask(): native
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:62` test: scheduleMicroTask(): promise
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:82` test: emptyFunction()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:88` test: resetRandomKey()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:100` test: generateRandomKey()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:110` test: isArray()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:115` test: isSelectionWithinEditor()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:154` test: getTextDirection()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:187` test: isExactShortcutMatch() matches by event.key for single-letter
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:209` test: isExactShortcutMatch() matches to event.key for ASCII remapped layout (English (US) Dvorak)
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:237` test: isExactShortcutMatch() fallback to event.code for single-letter in event.key via non-English layout
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:259` test: isExactShortcutMatch() matches special keys
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:288` test: isExactShortcutMatch() matches optional keys
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:323` test: isTokenOrSegmented()
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:338` test: $getNodeByKey
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:361` test: $nodesOfType
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:390` describe: $onUpdate
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:391` test: deferred even when there are no dirty nodes
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:421` test: added fn runs after update, original onUpdate, and prior calls to $onUpdate
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:450` test: adding fn throws outside update
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:457` test: getCachedTypeToNodeMap
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:510` test: scrollIntoViewIfNeeded respects scroll-padding on document element
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:550` describe: $applyNodeReplacement
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:589` test: validates replace node configuration
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:615` test: validates replace node type withKlass
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:641` test: validates replace node type change
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:673` test: validates replace node key change
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:700` test: validates replace node configuration withKlass
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:726` test: validates nested replace node configuration
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:756` test: validates nested replace node configuration withKlass
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:789` test: nested replace node configuration works
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:826` describe: $copyNode
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:859` test: does not mark the original as dirty
- `../lexical/packages/lexical/src/__tests__/unit/LexicalUtils.test.ts:887` test: returns a shallow copy

## `../lexical/packages/lexical/src/__tests__/unit/mergeRegister.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/__tests__/unit/mergeRegister.test.ts:11` describe: mergeRegister
- `../lexical/packages/lexical/src/__tests__/unit/mergeRegister.test.ts:12` it: calls all of the clean-up functions
- `../lexical/packages/lexical/src/__tests__/unit/mergeRegister.test.ts:17` it: calls the clean-up functions in reverse order

## `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts`

category: portable
family: selection-dom-mapping / void-atom
target: packages/plite/test; packages/plite-react/test/editable-behavior.test.tsx; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:88` describe: LexicalCaret
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:90` describe: $getChildCaret
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:92` test: direction ${direction}
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:198` describe: $getSiblingCaret
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:200` test: direction ${direction}
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:439` describe: $caretRangeFromSelection
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:440` test: collapsed text point selection
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:499` test: full text node selection (${direction})
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:549` test: single text node non-empty selection
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:598` test: multiple text node non-empty selection (${direction})
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:694` describe: $removeTextFromCaretRange
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:696` describe: ported Headings e2e tests
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:697` test: Pressing return in the middle of a heading creates a new heading below
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:727` describe: ported File e2e tests
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:728` test: $selectAll() with nesting and a trailing decorator
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:758` describe: ported Table e2e tests
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:759` test: Can delete all with range selection anchored in table
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:795` describe: ported LexicalSelection tests
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:796` test: remove partial initial TextNode and partial segmented TextNode
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:857` describe: single block
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:869` test: remove second TextNode when wrapped in a LinkNode that will become empty
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:918` test: remove first TextNode with second in token mode
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:960` test: collapsed text point selection
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1020` describe: full text node internal selection
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1023` test: ${text} node (${direction})
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1098` describe: full text node biased selection
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1108` test: ${text} node (${direction} ${anchorBias} ${focusBias})
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1253` describe: single text node non-empty partial selection
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1258` test: ${direction} ${anchorEdgeOffset}:${-focusEdgeOffset}
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1319` describe: multiple text node selection
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1333` test: ${direction} ${texts[nodeIndexStart]} ${startFn.name} ${texts[nodeIndexEnd]} ${endFn.name}
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1481` describe: multiple blocks
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1495` describe: multiple text node selection
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1509` test: ${direction} ${texts[nodeIndexStart]} ${startFn.name} ${texts[nodeIndexEnd]} ${endFn.name}
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1652` test: remove range between list and nested list
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1694` describe: Ordering
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1732` describe: $comparePointCaretNext
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1733` test: trivial caret checks
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1764` test: TextPointCaret checks single origin
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1822` test: TextPointCaret multiple origin
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1848` describe: $getCommonAncestor
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1849` test: trivial node checks
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1896` test: dynamic or multiline title
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1954` describe: LexicalSelectionHelpers
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1956` describe: with a fully-selected text node preceded by an inline element
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1957` test: a single text node
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1994` describe: $splitAtPointCaretNext
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:1996` test: Does not split a TextNode at the beginning
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:2012` test: Splits a TextNode in the middle
- `../lexical/packages/lexical/src/caret/__tests__/unit/LexicalCaret.test.ts:2031` test: Splits a ParagraphNode

## `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:32` describe: traversals.md
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:34` describe: Traversal Strategies
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:73` describe: Adjacent Caret Traversals
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:74` test: $iterSiblings
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:109` test: root has no siblings
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:119` test: root has paragraph children
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:144` test: iteration does not include the origin
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:161` describe: Depth First Caret Traversals
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:162` describe: $iterCaretsDepthFirst
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:163` test: via generator
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:214` test: via CaretRange
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:249` describe: $iterNodesDepthFirst
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:269` test: includes only wholly included nodes
- `../lexical/packages/lexical/src/caret/__tests__/unit/docs-traversals.test.ts:297` test: full traversal

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:35` describe: LexicalElementNode tests
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:100` describe: exportJSON()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:101` test: should return and object conforming to the expected schema
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:120` test: serializes only the first TextNode style and format
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:163` test: serializes the same way without a root element
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:181` describe: getChildren()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:182` test: no children
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:191` test: some children
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:199` describe: getAllTextNodes()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:200` test: basic
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:209` test: nested
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:240` describe: getFirstChild()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:241` test: basic
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:252` test: empty
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:260` describe: getLastChild()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:261` test: basic
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:272` test: empty
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:280` describe: getTextContent()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:281` test: basic
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:287` test: empty
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:294` test: nested
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:323` describe: getTextContentSize()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:324` test: basic
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:332` test: child node getTextContentSize() can be overridden and is then reflected when calling the same method on parent node
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:344` describe: splice
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:451` it: Plain text: ${testCase.name}
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:594` it: Nested elements: ${testCase.name}
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:657` it: Running transforms for inserted nodes, their previous siblings and new siblings
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:704` describe: getDOMSlot tests
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:755` test: can create wrapper
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:789` test: DOM selection uses getDOMSlot element for element selections
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:812` describe: indexPath
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:813` test: no path
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:817` test: only child
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:823` test: nested child
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalElementNode.test.tsx:831` test: nested child with siblings

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx:25` describe: LexicalGC tests
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx:27` test: RootNode.clear() with a child and subchild
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx:41` test: RootNode.clear() with a child and three subchildren
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx:59` test: RootNode.clear() with a child and three subchildren, subchild ${i} removed first
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalGC.test.tsx:95` test: RootNode.clear() with a complex tree, nodes ${removeKeys.toString()} removed first

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:14` describe: LexicalLineBreakNode tests
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:16` test: LineBreakNode.constructor
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:27` test: LineBreakNode.exportJSON() should return and object conforming to the expected schema
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:44` test: LineBreakNode.createDOM()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:55` test: LineBreakNode.updateDOM()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalLineBreakNode.test.ts:65` test: LineBreakNode.$isLineBreakNode()

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:27` describe: LexicalParagraphNode tests
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:29` test: ParagraphNode.constructor
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:41` test: ParagraphNode.exportJSON() should return and object conforming to the expected schema
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:64` test: ParagraphNode.createDOM()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:82` test: ParagraphNode.updateDOM()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:103` test: ParagraphNode.insertNewAfter()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:128` test: $createParagraphNode()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:141` test: $isParagraphNode()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalParagraphNode.test.ts:151` test: ParagraphNode.importDOM handles both CSS text-align and legacy align attribute

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:30` describe: LexicalRootNode tests
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:61` test: RootNode.constructor
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:71` test: RootNode.exportJSON() should return and object conforming to the expected schema
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:92` test: RootNode.clone()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:99` test: RootNode.createDOM()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:104` test: RootNode.updateDOM()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:109` test: RootNode.isAttached()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:113` test: RootNode.isRootNode()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:117` test: Cached getTextContent with decorators
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:134` test: RootNode.clear() to handle selection update
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:164` test: RootNode is selected when its selected child is removed
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:194` test: RootNode is not selected when all children are removed with no selection
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:216` test: RootNode \_\_cachedText incremental update #8096
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:239` test: RootNode \_\_cachedText
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:292` test: RootNode \_\_cachedText (empty paragraph)
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalRootNode.test.ts:302` test: RootNode \_\_cachedText (inlines)

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx`

category: portable
family: clipboard-paste / browser-engine
target: packages/plite/test/clipboard-contract.ts; packages/plite-dom/test/clipboard-boundary.test.ts; apps/www/tests/plite-browser/donor/examples/paste-html.test.ts; apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:44` describe: LexicalTabNode tests
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:56` test: can paste plain text with tabs and newlines in plain text
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:70` test: can paste plain text with tabs and newlines in rich text
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:85` test: can paste HTML with tabs and new lines #4429
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:104` test: can paste HTML with tabs and new lines (2)
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:122` test: element indents when selection at the start of the block
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:140` test: elements indent when selection spans across multiple blocks
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:175` test: element tabs when selection is not at the start (1)
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:191` test: element tabs when selection is not at the start (2)
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:210` test: element tabs when selection is not at the start (3)
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:229` test: elements tabs when selection is not at the start and overlaps another tab
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:252` test: can type between two (leaf nodes) canInsertBeforeAfter false
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:266` test: can be serialized and deserialized
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:291` describe: TabNode at selection boundaries with normal TextNode sibling (#7602)
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:298` test: dynamic or multiline title

## `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx`

category: portable
family: portable editor behavior
target: packages/plite/test; add focused browser proof only when behavior depends on DOM/runtime transport

- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:74` describe: LexicalTextNode tests
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:133` describe: exportJSON()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:134` test: should return and object conforming to the expected schema
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:156` describe: root.getTextContent()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:157` test: writable nodes
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:185` test: prepend node
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:205` describe: setTextContent()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:206` test: writable nodes
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:232` test: getFormatFlags(${formatFlag})
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:248` test: predicate for ${formatFlag}
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:260` test: toggling for ${formatFlag}
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:284` test: setting subscript clears superscript
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:297` test: setting superscript clears subscript
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:310` test: clearing subscript does not set superscript
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:323` test: clearing superscript does not set subscript
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:336` test: capitalization formats are mutually exclusive
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:362` test: selectPrevious()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:384` test: selectNext()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:409` describe: select()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:454` describe: splitText()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:455` test: convert segmented node into plain text
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:499` test: splitText moves composition key to last node
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:627` test: with detached parent
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:639` test: copies state to all nodes
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:662` test: copies state to all nodes (segmented)
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:680` describe: createDOM()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:792` describe: has parent node
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:813` describe: updateDOM()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:914` describe: exportDOM()
- `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTextNode.test.tsx:965` test: mergeWithSibling
