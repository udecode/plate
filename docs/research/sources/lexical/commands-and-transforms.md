# Lexical: commands and transforms

## Code blocks

- **Code-block Tab tests.** Lexical tests code indentation in `lexical-code`'s `LexicalCodeNode.test.ts` and in a Tab matrix, `LexicalCodeNodeTabs.test.ts`, that runs Tab and Shift+Tab through `KEY_TAB_COMMAND`, `INDENT_CONTENT_COMMAND` and `OUTDENT_CONTENT_COMMAND` over forward and backward selections. At `facebook/lexical@dd5c41b1` that matrix lives in `lexical-code-prism` and `lexical-code-shiki`; the `lexical-code` copy the ledger lists was removed by Lexical commit c4083d589 on 2026-05-02. `LexicalCodeNode.test.ts` also covers line shifting with Alt+Arrow ('code blocks can shift lines'), Home/End moves in right-to-left code lines, language metadata, tokenizer transforms and node class rows (`facebook/lexical@dd5c41b1:packages/lexical-code/src/__tests__/unit/LexicalCodeNode.test.ts:177-607`). The portable rule is that Tab and Shift+Tab indent or outdent every selected code line, which Plate law already states (`EDIT-CB-TAB-001`, `EDIT-CB-STAB-001`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:80-82`. Limit: the rows were listed, not rerun.

- **CodeBlock e2e.** `CodeBlock.spec.mjs` covers:
  - creating a code block from markdown, also around existing text;
  - converting several paragraphs, part of several paragraphs, or one line between line breaks;
  - switching the highlight language from the toolbar;
  - keeping indentation on new lines;
  - Tab after selecting a line with Shift+Down, and indenting or outdenting several lines;
  - moving lines with Option+Arrow;
  - keeping the selection and typing inside the block's edges;
  - Cmd/Ctrl+Left and Right;
  - `diff` and `diff-javascript` fences.

  Plate law already keeps indentation on Enter (`EDIT-CB-ENTER-001`) and indents selected lines (`EDIT-CB-TAB-001`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:531-544`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Enter in headings and quotes

- **Enter in a heading.** `HeadingNode.insertNewAfter` returns a heading when the caret splits the middle of a heading. It returns a paragraph when the caret is at the end or the heading is empty (`facebook/lexical@dd5c41b1:packages/lexical-rich-text/src/__tests__/unit/LexicalHeadingNode.test.ts:118-188`). The playground e2e files `HeadingsEnterAtEnd.spec.mjs` and `HeadingsEnterInMiddle.spec.mjs` assert the same. Plate law differs for the middle split: `EDIT-H-ENTER-001` makes the tail a paragraph. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:344-347`, `:589`, `:604`.

- **Enter in an empty quote.** `QuoteNode.insertNewAfter` on an empty quote keeps the quote and adds an empty paragraph after it (`facebook/lexical@dd5c41b1:packages/lexical-rich-text/src/__tests__/unit/LexicalQuoteNode.test.ts:70-87`). A Lexical quote is a text block that renders `<blockquote><br></blockquote>` when empty. Plate's blockquote is a container, and `EDIT-BQ-ENTER-EMPTY-001` instead lifts the empty line out of the quote. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:362-363`.

## Lists

- **ListItemNode tests.** Besides class and DOM rows, `LexicalListItemNode.test.ts` covers:
  - Enter splitting a non-empty item inside the same list;
  - replacing the first, last, middle or only item with a paragraph, which splits the list;
  - removing an item next to nested, non-nested and deeply nested siblings, which repairs or merges the nested lists;
  - `setIndent` with fractional values, and marker style inheritance;
  - splitting an ordered list while resetting or keeping its numbering.

  The replace, remove, indent and numbering rows are list-plugin policy. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:395-400`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row topics only, not rerun.

- **ListNode tests.** `LexicalListNode.test.ts` checks that `ListNode.append` and `splice` coerce list items, lists, paragraphs, inline nodes and text nodes into list items. It also checks that checklist roles are cleaned up and nested checklist attributes cleared, and that a list-item value transform keeps ordered `start` numbers. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:415-419`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row topics only, not rerun.

- **formatList tests.** `formatList.test.ts` covers three helpers:
  - `$insertList`, run on an empty root, an existing root child, an empty table cell (a shadow root), empty items switched from bullet to number, and an element-anchored selection after a paragraph that contains a line break;
  - `$handleListInsertParagraph`, which exits the list from an empty or whitespace-only last item, continues it from a non-empty item or a decorator, and splits it into list, paragraph and list from an empty middle item;
  - `$handleIndent` and `$handleOutdent`, which keep subclassed list nodes.

  Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:437-445`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row topics only, not rerun.

- **List e2e.** `List.spec.mjs` covers:
  - creating a list from the toolbar, toggling it off, and switching between bullet and number;
  - wrapping several blocks, and replacing a quote with a list;
  - a partial copy from a list into a paragraph;
  - Backspace and Enter outdent, exiting from an empty item, collapsing at the start, and removing a break in a nested list;
  - nested indentation, maximum depth and ordered `start` metadata;
  - markdown with an ordered start number, and heading markdown left unprocessed inside a list;
  - checklist focus, toggling and keyboard navigation;
  - the format menu turning list items into Normal paragraphs;
  - a new indented item that keeps bold and an autolink inside a collapsed item.

  Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:641-650`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row families only, not rerun.

## Block formatting

- **Element format.** `ElementFormat.spec.mjs` center-aligns a fresh empty paragraph and expects the collapsed caret to stay in it. It also indents and aligns a paragraph while the caret sits inside a link. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:558-560`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun; the dropdown and theme-class rows are product shell.

## Backspace at block start

- **Backspace at the start of a heading.** `HeadingsBackspaceAtStart.spec.mjs` expects Backspace at the start of a heading with no previous sibling to do nothing: the heading keeps its text and type (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/Headings/HeadingsBackspaceAtStart.spec.mjs:22`). Plate law differs: `EDIT-H-BS-START-001` turns the heading into a paragraph. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:574-576`.

## Indentation

- **Indentation e2e.** `Indentation.spec.mjs` indents and outdents mixed content: paragraphs, code, lists and paragraphs in table cells. It caps paragraph indent at a maximum depth, and caps list depth for empty items, items with text, and nested lists. Regression #7410 prevents a negative indent after importing HTML padding and outdenting repeatedly. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:621-627`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.

## Keyboard shortcuts

- **Shortcuts live in the playground, not core.** Lexical's block and text-format shortcuts are defined by the playground's `ShortcutsPlugin` (`facebook/lexical@dd5c41b1:packages/lexical-playground/src/plugins/ShortcutsPlugin/shortcuts.ts:57-205`). They cover paragraph and heading formats; bullet, numbered and check lists; code and quote; lowercase, uppercase and capitalize; strikethrough, subscript and superscript; indent and outdent; four alignments; code-block insertion; font size; clear formatting; link; and comment. `KeyboardShortcuts.spec.mjs` exercises them, including digit-based list bindings (`mod+shift+7/8/9`) and paragraph indent on `mod+[` and `mod+]`. A port keeps the behavior and treats the key bindings as a product keymap. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:746-755`. Limit: the binding list comes from the source file, not a test run.

## Delete

- **Lexical's delete regressions cluster at block and leaf edges.** Nine playground regression files, each named after its issue under `facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/`, pin delete and line-boundary behavior:
  - forward delete at a line start (#1258) and backward delete at a line end (#1730);
  - deleting by grapheme cluster rather than code unit (#7163);
  - Backspace that merges a block into a previous block ending with an inline decorator (#6974, `6974-delete-character-backward.spec.mjs:26`) or into the last item of a list (#7246, `7246-delete-character-backward-list.spec.mjs:26`);
  - Backspace after a horizontal rule, once with a RangeSelection and once with a NodeSelection (#7319, `7319-delete-character-backward-nodeselection.spec.mjs:24-62`);
  - Backspace at a line boundary just before a leading mention, which rejoins the lines and keeps both mentions (#379, `379-backspace-with-mentions.spec.mjs:22`);
  - Enter before a line that starts with an emoji, then Backspace, which rejoins it without corrupting the emoji (#429, `429-swapping-emoji.spec.mjs:21`);
  - an expanded delete that starts at an inline link (#1083).

  Apart from the plain line-edge and grapheme rows, each case deletes or merges at a block or leaf edge next to something that is not plain text: an inline decorator, a list item, a horizontal rule, a mention, an emoji or a link. Plate notes hold the rule #1083 produced ('An expanded delete removes a selected inline only when the range crosses out of it', `docs/research/sources/plate-notes/selection-and-editing.md`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:809-814`, `:868`, `:874`, `:876`. Limit: not rerun; #1258, #1730, #7163 and #1083 were read only through the ledger.
