# Lexical Issue Closure Ledger

status: open
source: `docs/editor-issue-harvester/lexical/full/classified-issues.tsv`

Rule: every relevant issue needs an explicit checkmark. A cluster/matrix row
does not close an issue. Close a relevant issue only by linking and verifying
an exact existing Plite-v2 test, writing and verifying a new Plite-v2 test,
or recording a real defer owner. Under Plite-v2-only scope, Plate rows are
defer-only and must not trigger Plate edits.

## Counts

| Bucket | Count |
| --- | ---: |
| defer | 1055 |
| skip | 962 |
| keep-portable | 724 |
| unclassified | 45 |
| unchecked relevant | 45 |
| metadata review flagged | 184 |

## Closure Counts

| Closure | Count |
| --- | ---: |
| relevant:deferred-with-owner | 1462 |
| irrelevant:invalid-skip | 962 |
| relevant:covered-by-existing-test | 211 |
| relevant:test-written | 106 |
| relevant:needs-test-audit | 45 |

## Next Unchecked Relevant Issues

| Check | Issue | Disposition | Matrix key | Owner | Command | Title |
| --- | ---: | --- | --- | --- | --- | --- |
| [ ] | #8664 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: registerDragonSupport registers too late to block the Dragon Web Extension |
| [ ] | #8670 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: $handleTableSelectionChangeCommand throws invariant #63 on stale table node keys (poisoned tableObservers registry) |
| [ ] | #8677 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Numbered list starting number can't be changed manually |
| [ ] | #8679 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Markdown shortcuts don't fire on Firefox while a Korean IME is active |
| [ ] | #8681 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Feature: Insert the copied image from the browser as a file |
| [ ] | #8685 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Typing after deleting a root-level block decorator inserts a phantom blank paragraph |
| [ ] | #8687 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Equation $ parsing should not bind tighter than code formatting |
| [ ] | #8697 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Dead keys on a new paragraph get removed |
| [ ] | #8700 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: CodeHighlightNode throws an error when calling $generateHtmlFromNodes |
| [ ] | #8707 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Inserting a DecoratorNode into the block cursor inside a shadow root throws an exception |
| [ ] | #8712 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: First issues with named slots |
| [ ] | #8713 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug:  Inserting a DecoratorNode into the block cursor inside an ElementNode throws an exception |
| [ ] | #8718 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Typing after pasting a PageBreak is a no-op in Safari |
| [ ] | #8721 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Performance lag when document import and user keying |
| [ ] | #8722 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: DELETE_LINE_COMMAND on an empty ListItem removes the previous decorator |
| [ ] | #8724 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Paste doesn't properly normalize non-inline nodes when the destination shouldn't contain them |
| [ ] | #8727 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: [lexical-markdown] Wrapping already-formatted text with the matching inline markers removes the formatting |
| [ ] | #8729 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: `DecoratorTextExtension`'s `FORMAT_TEXT_COMMAND` doesn't support format alignment |
| [ ] | #8730 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Backspace does not move the caret to the previous shadow root element |
| [ ] | #8731 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Feature: Lint and agent rules for shadow dom & iframe realm safety |
| [ ] | #8736 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: The block cursor cannot be placed between the decorator and the shadow root |
| [ ] | #8738 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Typed text in Firefox appears outside the block/component |
| [ ] | #8743 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Feature: Scaling Lexical for large documents using chunked multi-editor architecture |
| [ ] | #8745 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Not all selected nodes are removed if a shadow root element is set at the end |
| [ ] | #8749 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: The toolbar is displayed above the TabNode inside the code block |
| [ ] | #8754 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Feature: Suggestion mode for comments |
| [ ] | #8766 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: deleteCharacter() overwrites X11 PRIMARY selection via Selection.modify() |
| [ ] | #8770 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Feature: how to use named slot for pagination header and footer |
| [ ] | #8776 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Feature: Find and Replace |
| [ ] | #8777 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Feature: Spreading pasted text across table cells |
| [ ] | #8785 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | [INVALID_ANNOTATION] on VITE build |
| [ ] | #8804 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Table cell "Background color" picker modal disappears on first click inside the modal |
| [ ] | #8805 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Cannot enter text in editor |
| [ ] | #8812 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Feature: Public row-level header utility (e.g. $setTableRowIsHeader) |
| [ ] | #8814 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Two CMD + A needed to select the entire command |
| [ ] | #8817 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Programmatically moving a Selection does not update the Formatting nor Style |
| [ ] | #8823 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Unable to Render Editor when Using Expo |
| [ ] | #8832 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Cannot copy table content in read-only mode. |
| [ ] | #8834 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Committing an IME composition with a mouse click scrolls the viewport back to the composed text |
| [ ] | #8860 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Website crashes with 'clone method... expecting 0' error" |
| [ ] | #8875 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | This issue lists Renovate updates and detected dependencies. Read the [Dependency Dashboard](https://docs.renovatebot.com/key-concepts/dashboard/) docs to learn more.<br>[View this repository on the Mend.io Web Portal](https://developer.mend.io/github/prosekit/prosemirror-adapter). |
| [ ] | #8880 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Table alignment fails when selecting in non-TL→BR direction |
| [ ] | #8881 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: selection.hasFormat is giving wrong info when clear formatting is clicked from dropdown/button |
| [ ] | #8885 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: SELECTION_CHANGE_COMMAND is triggered after clicking a link in Safari |
| [ ] | #8886 | unclassified | Pending issue-harvester classification | unknown | issue-harvester facebook/lexical --state all --continue | Bug: Selection is leaving beyond the editor from the top block cursor |

Full ledger: `issue-closure-ledger.tsv`.
