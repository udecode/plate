# ProseMirror Test Name Index

Source: `../prosemirror`

Extraction regex: `\b(describe|it|test)\s*\(\s*(["'\`])([^"'\`]+)\2`

Total source files: 32
Total extracted names: 848

## ../prosemirror/collab/test/test-collab.ts

Category: portable  
Behavior rows: PM-08  
Names: 11

- 82: describe - collab
- 83: it - converges for simple changes
- 92: it - converges for multiple local changes
- 104: it - converges with three peers
- 115: it - converges with three peers with multiple steps
- 128: it - supports undo
- 140: it - supports redo
- 152: it - supports deep undo
- 182: it - support undo with clashing events
- 199: it - handles conflicting steps
- 211: it - can undo simultaneous typing

## ../prosemirror/collab/test/test-rebase.ts

Category: portable  
Behavior rows: PM-06, PM-08  
Names: 13

- 64: describe - rebaseSteps
- 65: it - supports concurrent typing
- 72: it - support multiple concurrently typed chars
- 79: it - supports three concurrent typers
- 87: it - handles wrapping of changed blocks
- 94: it - handles insertions in deleted content
- 101: it - allows deleting the same content twice
- 115: it - supports typing concurrently with marking
- 136: it - deletes inserts in replaced context
- 144: it - maps through inserts
- 151: it - handle concurrent removal of blocks
- 158: it - discards edits in removed blocks
- 165: it - preserves double block inserts

## ../prosemirror/history/test/test-history.ts

Category: portable  
Behavior rows: PM-07  
Names: 24

- 30: describe - history
- 31: it - enables undo
- 40: it - enables redo
- 50: it - tracks multiple levels of history
- 68: it - starts a new event when newGroupDelay elapses
- 80: it - starts a new event for non-adjacent changes
- 128: it - can handle complex editing sequences
- 132: it - can handle complex editing sequences with compression
- 136: it - supports overlapping edits
- 161: it - supports overlapping unsynced deletes
- 172: it - can go back and forth through history multiple times
- 190: it - supports non-tracked changes next to tracked changes
- 199: it - can go back and forth through history when preserving items
- 221: it - restores selection on undo
- 235: it - rebases selection on undo
- 246: it - handles change overwriting in item-preserving mode
- 258: it - supports querying for the undo and redo depth
- 274: it - all functions gracefully handle EditorStates without history
- 282: it - truncates history
- 291: it - supports transactions with multiple steps
- 308: it - combines appended transactions in the event started by the base transaction
- 321: it - includes transactions appended to undo in the redo history
- 351: it - supports rebasing
- 402: it - properly maps selection when rebasing

## ../prosemirror/model/test/test-content.ts

Category: portable-mixed  
Behavior rows: PM-01  
Names: 61

- 34: describe - ContentMatch
- 35: describe - matchType
- 36: it - accepts empty content for the empty expr
- 39: it - matches nothing to an asterisk
- 40: it - matches one element to an asterisk
- 41: it - matches multiple elements to an asterisk
- 42: it - only matches appropriate elements to an asterisk
- 44: it - matches group members to a group
- 46: it - matches an element to a choice expression
- 49: it - matches a simple sequence
- 50: it - fails when a sequence is too long
- 51: it - fails when a sequence is too short
- 52: it - fails when a sequence starts incorrectly
- 54: it - accepts a sequence asterisk matching zero elements
- 55: it - accepts a sequence asterisk matching multiple elts
- 56: it - accepts a sequence plus matching one element
- 57: it - accepts a sequence plus matching multiple elts
- 58: it - fails when a sequence plus has no elements
- 59: it - fails when a sequence plus misses its start
- 61: it - accepts an optional element being present
- 62: it - accepts an optional element being missing
- 63: it - fails when an optional element is present twice
- 65: it - accepts a nested repeat
- 67: it - fails on extra input after a nested repeat
- 70: it - accepts a matching count
- 71: it - rejects a count that comes up short
- 72: it - rejects a count that has too many elements
- 73: it - accepts a count on the lower bound
- 74: it - accepts a count on the upper bound
- 75: it - accepts a count between the bounds
- 76: it - rejects a sequence with too few elements
- 77: it - rejects a sequence with too many elements
- 79: it - rejects a sequence with a bad element after it
- 80: it - accepts a sequence with a matching element after it
- 81: it - accepts an open range
- 82: it - accepts an open range matching many
- 83: it - rejects an open range with too few elements
- 86: describe - fillBefore
- 87: it - returns the empty fragment when things match
- 90: it - adds a node when necessary
- 93: it - accepts an asterisk across the bound
- 95: it - accepts an asterisk only on the left
- 97: it - accepts an asterisk only on the right
- 99: it - accepts an asterisk with no elements
- 101: it - accepts a plus across the bound
- 103: it - adds an element for a content-less plus
- 105: it - fails for a mismatched plus
- 107: it - accepts asterisk with content on both sides
- 109: it - accepts asterisk with no content after
- 111: it - accepts plus with content on both sides
- 113: it - accepts plus with no content after
- 115: it - adds elements to match a count
- 117: it - fails when there are too many elements
- 119: it - adds elements for two counted groups
- 123: it - completes a sequence
- 127: it - accepts plus across two bounds
- 131: it - fills a plus from empty input
- 135: it - completes a count
- 139: it - fails on non-matching elements
- 142: it - completes a plus across two bounds
- 145: it - refuses to complete an overflown count across two bounds

## ../prosemirror/model/test/test-diff.ts

Category: portable-mixed  
Behavior rows: PM-05  
Names: 21

- 5: describe - Fragment
- 6: describe - findDiffStart
- 11: it - returns null for identical nodes
- 15: it - notices when one node is longer
- 19: it - notices when one node is shorter
- 23: it - notices differing marks
- 27: it - stops at longer text
- 31: it - stops at a different character
- 35: it - stops at a different node type
- 39: it - works when the difference is at the start
- 43: it - notices a different attribute
- 48: describe - findDiffEnd
- 54: it - returns null when there is no difference
- 58: it - notices when the second doc is longer
- 62: it - notices when the second doc is shorter
- 66: it - notices different styles
- 70: it - spots longer text
- 74: it - spots different text
- 78: it - notices different nodes
- 82: it - notices a difference at the end
- 86: it - handles a similar start

## ../prosemirror/model/test/test-dom.ts

Category: portable  
Behavior rows: PM-03, PM-11  
Names: 99

- 15: describe - DOMParser
- 16: describe - parse
- 34: it - can represent simple node
- 38: it - can represent a line break
- 42: it - can represent an image
- 46: it - joins styles
- 50: it - can represent links
- 54: it - can represent and unordered list
- 58: it - can represent an ordered list
- 62: it - can represent a blockquote
- 66: it - can represent a nested blockquote
- 70: it - can represent headings
- 74: it - can represent inline code
- 78: it - can represent a code block
- 82: it - supports leaf nodes in marks
- 90: it - can parse marks on block nodes
- 103: it - parses unique, non-exclusive, same-typed marks
- 128: it - serializes non-spanning marks correctly
- 138: test - a
- 142: it - serializes an element and an attribute with XML namespace
- 174: it - can recover a list item
- 178: it - wraps a list item in a list
- 182: it - can turn divs into paragraphs
- 186: it - interprets <i> and <b> as emphasis and strong
- 190: it - wraps stray text in a paragraph
- 194: it - ignores an extra wrapping <div>
- 198: it - ignores meaningless whitespace
- 202: it - removes whitespace after a hard break
- 206: it - converts br nodes to newlines when they would otherwise be ignored
- 210: it - finds a valid place for invalid content
- 222: it - can handle stray tab characters
- 226: it - normalizes random spaces
- 230: it - can parse an empty code block
- 234: it - preserves trailing space in a code block
- 238: it - normalizes newlines when preserving whitespace
- 242: it - ignores <script> tags
- 246: it - can handle a head/body input structure
- 250: it - only applies a mark once
- 254: it - interprets font-style: italic as em
- 258: it - interprets font-weight: bold as strong
- 262: it - allows clearing of pending marks
- 266: it - allo clearing of active marks
- 271: it - ignores unknown inline tags
- 275: it - can add marks specified before their parent node is opened
- 286: it - closes block with inline content on seeing block-level children
- 290: it - can move a block node out of a paragraph
- 306: it - accepts the topNode option
- 311: it - accepts the topMatch option
- 315: it - accepts from and to options
- 319: it - accepts the preserveWhitespace option
- 332: it - can parse an open slice
- 335: it - will accept weird siblings
- 338: it - will open all the way to the inner nodes
- 341: it - accepts content open to the left
- 344: it - accepts content open to the right
- 347: it - will create textblocks for block nodes
- 350: it - can parse marks at the start of defaulted textblocks
- 354: it - will not apply invalid marks to nodes
- 357: it - will apply pending marks from parents to all children
- 360: it - can parse nested mark with same type
- 364: it - drops block-level whitespace
- 367: it - keeps whitespace in inline elements
- 370: it - can parse nested mark with same type but different attrs
- 419: it - can temporary shadow a mark with another configuration of the same type
- 455: it - can find a position at the start of a paragraph
- 459: it - can find a position at the end of a paragraph
- 463: it - can find a position inside text
- 467: it - can find a position inside an ignored node
- 471: it - can find a position between nodes
- 475: it - can find a position at the start of the document
- 479: it - can find a position at the end of the document
- 485: it - uses a custom top node when parsing
- 494: it - recognizes context restrictions
- 499: it - accepts group names in contexts
- 504: it - understands nested context restrictions
- 510: it - understands double slashes in context restrictions
- 516: it - understands pipes in context restrictions
- 522: it - uses the passed context
- 530: it - uses the passed context when parsing a slice
- 537: it - can close parent nodes from a rule
- 543: it - supports non-consuming node rules
- 549: it - supports non-consuming style rules
- 559: it - ignores styles on skipped nodes
- 570: it - preserves whitespace in <pre> elements
- 580: it - preserves whitespace in nodes styled with white-space
- 585: it - inserts line break replacements
- 596: describe - schemaRules
- 597: it - defaults to schema order
- 608: it - understands priority
- 627: it - includes nodes when namespace is correct
- 634: it - excludes nodes when namespace is wrong
- 641: it - excludes nodes when namespace is absent
- 650: it - excludes nodes when namespace is wrong and xhtml
- 657: it - excludes nodes when namespace is wrong and empty
- 664: it - includes nodes when namespace is correct and empty
- 673: describe - DOMSerializer
- 676: it - can omit a mark
- 686: it - can render marks with complex structure
- 695: it - refuses to use values from attributes as DOM specs

## ../prosemirror/model/test/test-mark.ts

Category: portable-mixed  
Behavior rows: PM-04  
Names: 41

- 23: describe - Mark
- 24: describe - sameSet
- 25: it - returns true for two empty sets
- 27: it - returns true for simple identical sets
- 30: it - returns false for different sets
- 33: it - returns false when set size differs
- 36: it - recognizes identical links in set
- 39: it - recognizes different links in set
- 43: describe - eq
- 44: it - considers identical links to be the same
- 47: it - considers different links to differ
- 50: it - considers links with different titles to differ
- 54: describe - addToSet
- 55: it - can add to the empty set
- 58: it - is a no-op when the added thing is in set
- 61: it - adds marks with lower rank before others
- 64: it - adds marks with higher rank after others
- 67: it - replaces different marks with new attributes
- 71: it - does nothing when adding an existing link
- 75: it - puts code marks at the end
- 79: it - puts marks with middle rank in the middle
- 82: it - allows nonexclusive instances of marks with the same type
- 88: it - clears all others when adding a globally-excluding mark
- 91: it - does not allow adding another mark to a globally-excluding mark
- 94: it - does overwrite a globally-excluding mark when adding another instance
- 100: it - remove excluded marks when adding a mark
- 104: describe - removeFromSet
- 105: it - is a no-op for the empty set
- 108: it - can remove the last mark from a set
- 114: it - can remove a mark with attributes
- 122: describe - ResolvedPos.marks
- 127: it - recognizes a mark exists inside marked text
- 133: it - considers a mark active after the mark
- 136: it - considers a mark inactive before the mark
- 139: it - considers a mark active at the start of the textblock
- 142: it - notices that attributes differ
- 157: it - omits non-inclusive marks at end of mark
- 160: it - includes non-inclusive marks inside a text node
- 163: it - omits non-inclusive marks at the end of a line
- 166: it - includes non-inclusive marks between two marked nodes
- 169: it - excludes non-inclusive marks at a point where mark attrs change

## ../prosemirror/model/test/test-node.ts

Category: portable-mixed  
Behavior rows: PM-01, PM-03  
Names: 50

- 19: describe - Node
- 20: describe - toString
- 21: it - nests
- 26: it - shows inline children
- 31: it - shows marks
- 37: describe - cut
- 42: it - extracts a full block
- 46: it - cuts text
- 50: it - cuts deeply
- 54: it - works from the left
- 58: it - works to the right
- 62: it - preserves marks
- 67: describe - between
- 81: it - iterates over text
- 85: it - descends multiple levels
- 89: it - iterates over inline nodes
- 94: describe - textBetween
- 95: it - works when passing a custom function as leafText
- 104: it - works with leafText
- 114: it - should ignore leafText when passing a custom leafText
- 124: it - adds block separator around empty paragraphs
- 128: it - adds block separator around leaf nodes
- 137: describe - textContent
- 138: it - works on a whole doc
- 142: it - works on a text node
- 146: it - works on a nested element
- 152: describe - check
- 153: it - notices invalid content
- 158: it - notices marks in wrong places
- 163: it - notices incorrect sets of marks
- 168: it - notices wrong attribute types
- 174: describe - from
- 179: it - wraps a single node
- 182: it - wraps an array
- 185: it - preserves a fragment
- 188: it - accepts null
- 191: it - joins adjacent text
- 195: describe - toJSON
- 200: it - can serialize a simple node
- 202: it - can serialize marks
- 204: it - can serialize inline leaf nodes
- 206: it - can serialize block leaf nodes
- 208: it - can serialize nested nodes
- 211: describe - toString
- 212: it - should have the default toString method [text]
- 213: it - should have the default toString method [br]
- 215: it - should be able to redefine it from NodeSpec by specifying toDebugString method
- 218: it - should be respected by Fragment
- 228: describe - leafText
- 229: it - should custom the textContent of a leaf node

## ../prosemirror/model/test/test-replace.ts

Category: portable  
Behavior rows: PM-01, PM-02  
Names: 21

- 5: describe - Node
- 6: describe - replace
- 12: it - joins on delete
- 15: it - merges matching blocks
- 18: it - merges when adding text
- 23: it - can insert text
- 33: it - can merge a nested node
- 38: it - can replace within a block
- 43: it - can insert a lopsided slice
- 48: it - can insert a deep, lopsided slice
- 53: it - can merge multiple levels
- 58: it - can merge multiple levels while inserting
- 63: it - can insert a split
- 68: it - can insert a deep split
- 73: it - can add a split one level up
- 78: it - keeps the node type of the left node
- 83: it - keeps the node type even when empty
- 103: it - rejects a bad fit
- 108: it - rejects unjoinable content
- 113: it - rejects an unjoinable delete
- 118: it - check content validity

## ../prosemirror/model/test/test-resolve.ts

Category: portable-mixed  
Behavior rows: PM-06, PM-13  
Names: 4

- 10: describe - Node
- 11: describe - resolve
- 12: it - should reflect the document structure
- 49: it - has a working posAtIndex method

## ../prosemirror/model/test/test-slice.ts

Category: portable  
Behavior rows: PM-02  
Names: 22

- 5: describe - Node
- 6: describe - slice
- 14: it - can cut half a paragraph
- 17: it - can cut to the end of a pragraph
- 20: it - leaves off extra content
- 23: it - preserves styles
- 26: it - can cut multiple blocks
- 29: it - can cut to a top-level position
- 32: it - can cut to a deep position
- 36: it - can cut everything after a position
- 39: it - can cut from the start of a textblock
- 42: it - leaves off extra content before
- 45: it - preserves styles after cut
- 49: it - preserves styles started after cut
- 53: it - can cut from a top-level position
- 56: it - can cut from a deep position
- 60: it - can cut part of a text node
- 63: it - can cut across paragraphs
- 66: it - can cut part of marked text
- 70: it - can cut across different depths
- 74: it - can cut between deeply nested nodes
- 78: it - can include parents

## ../prosemirror/state/test/state.ts

Category: harness  
Behavior rows: PM-15  
Names: 0

- No named test rows; support helper file.

## ../prosemirror/state/test/test-selection.ts

Category: portable  
Behavior rows: PM-06  
Names: 21

- 7: describe - Selection
- 8: it - should follow changes
- 21: it - should move after inserted content
- 29: it - moves after an inserted leaf node
- 41: it - allows typing over a leaf node
- 50: it - allows deleting a selected block
- 69: it - preserves the marks of a deleted selection
- 87: it - drops non-inclusive marks at the end of a deleted span when appropriate
- 93: it - keeps non-inclusive marks when still inside them
- 99: it - preserves marks when typing over marked text
- 107: it - allows deleting a leaf
- 118: it - properly handles deleting the selection
- 134: it - can replace inline selections
- 151: it - can replace a block selection
- 163: it - puts the cursor after the inserted text when inserting a list item
- 171: describe - TextSelection.between
- 172: it - uses arguments when possible
- 179: it - will adjust when necessary
- 185: it - uses bias when adjusting
- 193: it - will fall back to a node selection
- 199: it - will collapse towards the other argument

## ../prosemirror/state/test/test-state.ts

Category: portable-mixed  
Behavior rows: PM-14  
Plate-owned residual: plugin fields, prop functions, filter/append transactions, plugin keys, and reconfiguration policy belong in Plate plugin middleware/lifecycle docs or tests. Raw Plite keeps only transaction metadata and public commit behavior.
Names: 16

- 27: describe - State
- 28: it - creates a default doc
- 33: it - creates a default selection
- 39: it - applies transform transactions
- 47: it - supports plugin fields
- 54: it - can be serialized to JSON
- 76: it - supports specifying and persisting storedMarks
- 83: it - supports reconfiguration
- 95: it - allows plugins to filter transactions
- 105: it - allows plugins to append transactions
- 112: it - stores a reference to a root transaction for appended transactions
- 121: it - supports JSON.stringify toJSON arguments
- 127: describe - Plugin
- 128: it - calls prop functions bound to the plugin
- 132: it - can be found by key
- 138: it - generates new keys

## ../prosemirror/transform/test/test-mapping.ts

Category: portable  
Behavior rows: PM-05, PM-06  
Names: 11

- 31: describe - Mapping
- 32: it - can map through a single insertion
- 36: it - can map through a single deletion
- 40: it - can map through a single replace
- 44: it - can map through a mirrorred delete-insert
- 48: it - cap map through a mirrorred insert-delete
- 52: it - can map through an delete-insert with an insert in between
- 56: it - assigns the correct deleted flags when deletions happen before
- 64: it - assigns the correct deleted flags when deletions happen after
- 72: it - assigns the correct deleted flags when deletions happen across
- 79: it - assigns the correct deleted flags when deletions happen around

## ../prosemirror/transform/test/test-replace_step.ts

Category: portable  
Behavior rows: PM-05, PM-08  
Names: 1

- 6: describe - ReplaceAroundStep.map

## ../prosemirror/transform/test/test-step.ts

Category: portable  
Behavior rows: PM-05, PM-07  
Names: 16

- 17: describe - Step
- 18: describe - merge
- 34: it - merges typing changes
- 36: it - merges inverse typing
- 42: it - merges adjacent backspaces
- 44: it - merges adjacent deletes
- 48: it - merges backspace and type
- 50: it - merges longer adjacent inserts
- 52: it - merges inverted longer inserts
- 54: it - merges longer deletes
- 56: it - merges inverted longer deletes
- 58: it - merges overwrites
- 60: it - merges adding adjacent styles
- 62: it - merges adding overlapping styles
- 66: it - merges removing adjacent styles
- 68: it - merges removing overlapping styles

## ../prosemirror/transform/test/test-structure.ts

Category: portable  
Behavior rows: PM-01, PM-05  
Names: 24

- 50: describe - canSplit
- 60: it - can by making head a para
- 62: it - can in regular para
- 65: it - can if also splitting the section
- 66: it - can if making the remaining head a para
- 68: it - can in the first section para
- 72: it - can in the first para in a quote
- 73: it - can if it also splits the quote
- 88: describe - liftTarget
- 100: it - can from a quote
- 103: it - notices unliftable content after or before
- 120: describe - findWrapping
- 128: it - can wrap the whole doc in a section
- 130: it - can wrap a top paragraph in a quote
- 132: it - can wrap a figure in a quote
- 136: describe - Transform
- 137: describe - replace
- 146: it - automatically adds a heading to a section
- 151: it - suppresses impossible inputs
- 156: it - adds necessary nodes to the left
- 161: it - adds a caption to a figure
- 166: it - adds an image to a figure
- 171: it - can join figures
- 176: it - adds necessary nodes to a parent node

## ../prosemirror/transform/test/test-trans.ts

Category: portable  
Behavior rows: PM-01, PM-02, PM-04, PM-05  
Names: 168

- 18: describe - Transform
- 19: describe - addMark
- 24: it - should add a mark
- 29: it - should only add a mark once
- 34: it - should join overlapping marks
- 39: it - should overwrite marks with different attributes
- 44: it - can add a mark in a nested node
- 49: it - can add a mark across blocks
- 54: it - does not remove non-excluded marks of the same type
- 65: it - can remove multiple excluded marks
- 80: describe - removeMark
- 85: it - can cut a gap
- 95: it - can remove marks from nested nodes
- 100: it - can remove a link
- 110: it - can remove across blocks
- 115: it - can remove everything
- 120: it - can remove more than one mark of the same type from a block
- 133: describe - insert
- 138: it - can insert a break
- 143: it - can insert an empty paragraph at the top
- 148: it - can insert two block nodes
- 154: it - can insert at the end of a blockquote
- 159: it - can insert at the start of a blockquote
- 164: it - will wrap a node with the suitable parent
- 170: describe - delete
- 175: it - can delete a word
- 179: it - preserves content constraints
- 183: it - preserves positions after the range
- 206: describe - join
- 211: it - can join blocks
- 215: it - can join compatible blocks
- 219: it - can join nested blocks
- 223: it - can join lists
- 227: it - can join list items
- 231: it - can join textblocks
- 235: it - converts newlines to line breaks
- 239: it - converts line breaks to newlines
- 244: describe - split
- 253: it - can split a textblock
- 257: it - correctly maps positions
- 261: it - can split two deep
- 266: it - can split three deep
- 271: it - can split at end
- 275: it - can split at start
- 279: it - can split inside a list item
- 283: it - can split a list item
- 288: it - respects the type param
- 293: it - preserves content constraints before
- 296: it - preserves content constraints after
- 300: describe - lift
- 306: it - can lift a block out of the middle of its parent
- 310: it - can lift a block from the start of its parent
- 314: it - can lift a block from the end of its parent
- 318: it - can lift a single child
- 322: it - can lift multiple blocks
- 326: it - finds a valid range from a lopsided selection
- 330: it - can lift from a nested node
- 334: it - can lift from a list
- 338: it - can lift from the end of a list
- 343: describe - wrap
- 349: it - can wrap in a blockquote
- 354: it - can wrap two paragraphs
- 359: it - can wrap in a list
- 364: it - can wrap in a nested list
- 369: it - includes half-covered parent nodes
- 375: describe - setBlockType
- 382: it - can change a single textblock
- 387: it - can change multiple blocks
- 392: it - can change a wrapped block
- 397: it - clears markup when necessary
- 402: it - removes non-allowed nodes
- 407: it - removes newlines in non-code
- 412: it - only clears markup when needed
- 417: it - works after another step
- 429: it - converts newlines to linebreak replacements when appropriate
- 439: it - converts linebreak replacements to newlines when appropriate
- 450: it - can base attributes on previous attributes
- 456: describe - setNodeMarkup
- 461: it - can change a textblock
- 466: it - can change an inline node
- 472: describe - replace
- 479: it - can delete text
- 484: it - can join blocks
- 489: it - can delete right-leaning lopsided regions
- 494: it - can delete left-leaning lopsided regions
- 499: it - can overwrite text
- 504: it - can insert text
- 509: it - can add a textblock
- 514: it - can insert while joining textblocks
- 519: it - will match open list items
- 524: it - merges blocks across deleted content
- 529: it - can merge text down from nested nodes
- 534: it - can merge text up into nested nodes
- 539: it - will join multiple levels when possible
- 544: it - can replace a piece of text
- 549: it - respects open empty nodes at the edges
- 554: it - can completely overwrite a paragraph
- 559: it - joins marks
- 564: it - can replace text with a break
- 569: it - can join different blocks
- 574: it - can restore a list parent
- 579: it - can restore a list parent and join text after it
- 584: it - can insert into an empty block
- 594: it - can close a parent node
- 599: it - accepts lopsided regions
- 604: it - can close nested parent nodes
- 609: it - will close open nodes to the right
- 614: it - can delete the whole document
- 619: it - preserves an empty parent to the left
- 624: it - drops an empty parent to the right
- 629: it - drops an empty node at the start of the slice
- 634: it - drops an empty node at the end of the slice
- 639: it - does nothing when given an unfittable slice
- 654: it - will auto-close a list item when it fits in a list
- 659: it - finds the proper openEnd value when unwrapping a deep slice
- 670: it - preserves marks on block nodes
- 679: it - preserves marks on open slice block nodes
- 701: it - can unwrap a paragraph when replacing into a strict schema
- 707: it - can unwrap a body after a placed node
- 719: it - can split a fragment and place its children in different parents
- 725: it - will insert filler nodes before a node when necessary
- 776: it - can handle replacing in nodes with fixed content
- 794: it - keeps isolating nodes together
- 817: describe - replaceRange
- 824: it - replaces inline content
- 827: it - replaces an empty paragraph with a heading
- 830: it - replaces a fully selected paragraph with a heading
- 833: it - recreates a list when overwriting a paragraph
- 839: it - can replace a node when endpoints are in different children
- 844: it - keeps defining context when inserting at the start of a textblock
- 887: it - drops defining context when it matches the parent structure
- 892: it - drops defining context when it matches the parent structure in a nested context
- 897: it - drops defining context when it matches the parent structure in a deep nested context
- 902: it - closes open nodes at the start
- 908: describe - replaceRangeWith
- 913: it - can insert an inline node
- 916: it - can replace content with an inline node
- 919: it - can replace a block node with an inline node
- 922: it - can replace a block node with a block node
- 925: it - can insert a block quote in the middle of text
- 928: it - can replace empty parents with a block node
- 931: it - can move an inserted block forward out of parent nodes
- 934: it - can move an inserted block backward out of parent nodes
- 938: describe - deleteRange
- 943: it - deletes the given range
- 946: it - deletes empty parent nodes
- 953: it - is okay with deleting empty ranges
- 956: it - will delete a whole covered node even if selection ends are in different nodes
- 959: it - leaves wrapping textblock when deleting all text in it
- 962: it - expands to cover the whole parent node
- 966: it - expands to cover the whole document
- 974: it - deletes the open token when deleting from start to past end of block
- 986: it - will delete entire blocks when deleting from the start of one textblock to another
- 991: describe - addNodeMark
- 996: it - adds a mark
- 1002: it - replaces a mark
- 1006: describe - removeNodeMark
- 1011: it - removes a mark
- 1017: it - can remove a mark from multiple marks
- 1020: it - can remove multiple instances of a mark type
- 1033: describe - setNodeAttribute
- 1038: it - sets an attribute
- 1042: describe - setDocAttribute
- 1056: it - sets an attribute
- 1060: describe - changedRange
- 1066: it - returns null when there are no changes
- 1073: it - returns a range when something changed
- 1083: it - properly adjusts for deletions before an earlier step

## ../prosemirror/transform/test/trans.ts

Category: harness  
Behavior rows: PM-15  
Names: 0

- No named test rows; support helper file.

## ../prosemirror/view/test/view.ts

Category: harness  
Behavior rows: PM-15  
Names: 0

- No named test rows; support helper file.

## ../prosemirror/view/test/webtest-clipboard.ts

Category: portable  
Behavior rows: PM-11  
Names: 14

- 9: describe - Clipboard interface
- 10: it - copies only the node for a node selection
- 18: it - includes context for text selections
- 28: it - preserves open nodes
- 37: it - uses clipboardTextSerializer when given
- 44: it - can read external HTML
- 50: it - will sanely clean up top-level nodes in HTML
- 60: it - only drops trailing br nodes in block parents
- 66: it - will call transformPastedHTML
- 72: it - will call transformPastedText
- 78: it - allows text parsing to be overridden with clipboardTextParser
- 84: it - preserves attributes
- 104: it - adds necessary wrappers for parsing
- 117: it - can parse content wrapped in comments

## ../prosemirror/view/test/webtest-composition.ts

Category: portable  
Behavior rows: PM-10  
Names: 19

- 87: describe - EditorView composition
- 88: it - supports composition in an empty block
- 97: it - supports composition at end of block
- 106: it - supports composition at end of block in a new node
- 114: it - supports composition at start of block in a new node
- 125: it - supports composition inside existing text
- 135: it - can deal with Android-style newline-after-composition
- 149: it - handles replacement of existing words
- 158: it - handles composition inside marks
- 167: it - handles composition in a mark that has multiple children
- 176: it - supports composition in a cursor wrapper
- 186: it - handles composition in a multi-child mark with a cursor wrapper
- 205: it - works inside highlighted text
- 214: it - can handle compositions spanning multiple nodes
- 238: it - cancels composition when a change fully overlaps with it
- 246: it - cancels composition when a change partially overlaps with it
- 254: it - cancels composition when a change happens inside of it
- 272: it - handles compositions rapidly following each other
- 294: it - can handle cross-paragraph compositions

## ../prosemirror/view/test/webtest-decoration.ts

Category: portable  
Behavior rows: PM-12  
Names: 49

- 58: describe - DecorationSet
- 59: it - builds up a matching tree
- 64: it - does not build nodes when there are no decorations
- 69: it - puts decorations between children in local
- 74: it - puts decorations spanning children in local
- 79: it - puts node decorations in the parent node
- 84: it - drops empty inline decorations
- 89: describe - find
- 90: it - finds all when no arguments are given
- 95: it - finds only those within the given range
- 100: it - finds decorations at the edge of the range
- 105: it - returns the correct offset for deeply nested decorations
- 110: it - can filter by predicate
- 116: describe - map
- 117: it - supports basic mapping
- 125: it - drops deleted decorations
- 130: it - can map node decorations
- 135: it - can map inside node decorations
- 140: it - removes partially overwritten node decorations
- 145: it - removes exactly overwritten node decorations
- 157: it - understands unclusiveLeft
- 163: it - understands unclusiveRight
- 169: it - preserves subtrees not touched by mapping
- 178: it - rebuilds when a node is joined
- 185: it - rebuilds when a node is split
- 190: it - correctly rebuilds a deep structure
- 198: it - calls onRemove when dropping decorations
- 209: it - respects the side option on widgets
- 224: it - rebuilds subtrees correctly at an offset
- 231: it - properly maps decorations after deleted siblings
- 239: it - can map the content of nodes that moved in the same transaction
- 248: it - can handle nodes moving up multiple levels
- 259: it - maps inline decorations through ranges with > 3 elements
- 326: it - correctly offsets a deep structure
- 360: describe - add
- 361: it - can add a local decoration
- 366: it - can add a decoration in a new child
- 371: it - can add a decoration to an existing child
- 376: it - can add a decoration beyond an existing child
- 381: it - can add multiple decorations
- 388: describe - remove
- 389: it - can delete a decoration
- 394: it - can delete multiple decorations
- 405: it - compares by both position and type when removing
- 412: describe - removeOverlap
- 413: it - returns the original array when there is no overlap
- 418: it - splits a partially overlapping decoration
- 423: it - splits a decoration that spans multiple widgets
- 428: it - correctly splits overlapping inline decorations

## ../prosemirror/view/test/webtest-domchange.ts

Category: portable  
Behavior rows: PM-09, PM-10  
Names: 34

- 17: describe - DOM change
- 18: it - notices when text is added
- 25: it - notices when text is removed
- 32: it - handles ambiguous changes
- 39: it - respects stored marks
- 47: it - can add a node
- 55: it - can remove a text node
- 63: it - can add a paragraph
- 71: it - supports duplicating a paragraph
- 79: it - support inserting repeated text
- 86: it - detects an enter press
- 98: it - detects an enter press creating a different block
- 110: it - detects a simple backspace press
- 122: it - detects a complex backspace press
- 147: it - correctly adjusts the selection
- 158: it - handles splitting of a textblock
- 170: it - handles a deep split of nodes
- 183: it - can delete the third instance of a character
- 190: it - can read a simple composition
- 197: it - can delete text in markup
- 204: it - recognizes typing inside markup
- 211: it - resolves ambiguous text input
- 230: it - understands text typed into an empty paragraph
- 244: it - fixes text changes when input is ignored
- 251: it - fixes structure changes when input is ignored
- 259: it - aborts when an incompatible state is set
- 268: it - recognizes a mark change as such
- 279: it - preserves marks on deletion
- 317: it - maps input to coordsAtPos through pending changes
- 324: it - notices text added to a cursor wrapper at the start of a mark
- 331: it - removes cursor wrapper text when the wrapper otherwise remains valid
- 358: it - can disambiguate a multiple-character backspace event
- 411: it - creates a correct step for an ambiguous selection-deletion
- 430: it - creates a step that covers the entire selection for partially-matching replacement

## ../prosemirror/view/test/webtest-draw-decoration.ts

Category: portable  
Behavior rows: PM-12  
Plate-owned residual: multiple plugin decoration composition, widget destroy hooks, and node-view decoration handoff belong in Plate plugin/render lifecycle docs or tests. Raw Plite keeps projection, annotation store, and widget mapping proof.
Names: 41

- 43: describe - Decoration drawing
- 44: it - draws inline decorations
- 52: it - draws wrapping decorations
- 59: it - draws node decorations
- 68: it - can update multi-level wrapping decorations
- 79: it - draws overlapping inline decorations
- 91: it - draws multiple widgets
- 101: it - orders widgets by their side option
- 109: it - draws a widget in an empty node
- 115: it - draws widgets on node boundaries
- 121: it - draws decorations from multiple plugins
- 127: it - calls widget destroy methods
- 142: it - draws inline decorations spanning multiple parents
- 153: it - draws inline decorations across empty paragraphs
- 162: it - can handle inline decorations ending at the start or end of a node
- 168: it - can draw decorations with multiple classes
- 175: it - supports overlapping inline decorations
- 206: it - can add a widget on a node boundary
- 213: it - can remove a widget on a node boundary
- 221: it - can remove the class from a text node
- 230: it - can remove the class from part of a text node
- 240: it - can remove the class for part of a text node
- 250: it - draws a widget added in the middle of a text node
- 256: it - can update a text node around a widget
- 263: it - can update a text node with an inline decoration
- 272: it - correctly redraws a partially decorated node when a widget is added
- 282: it - correctly redraws when skipping split text node
- 289: it - drops removed node decorations from the view
- 308: it - can add and remove CSS custom properties from a node
- 317: it - updates decorated nodes even if a widget is added before them
- 333: it - can add and remove inline style
- 344: it - passes decorations to a node view
- 365: it - draws the specified marks around a widget
- 373: it - draws widgets inside the marks for their side
- 387: it - draws decorations inside node views
- 396: it - can delay widget drawing to render time
- 411: it - supports widgets querying their own position
- 475: it - only draws inline decorations on the innermost level
- 487: it - can handle inline decorations ending on inline node boundaries
- 496: it - can handle nodeName decoration overlapping with classes
- 506: it - can handle combining decorations from parent editors in child editors

## ../prosemirror/view/test/webtest-draw.ts

Category: portable-mixed  
Behavior rows: PM-12, PM-14  
Plate-owned residual: plugin views, attributes prop, editable prop, and app-facing redraw policy belong in Plate React/plugin integration examples. Raw Plite keeps only surface lifecycle and generic DOM redraw/projection pressure.
Names: 8

- 7: describe - EditorView draw
- 8: it - updates the DOM
- 62: it - adds classes from the attributes prop
- 72: it - adds style from the attributes prop
- 79: it - can set other attributes
- 93: it - understands the editable prop
- 114: it - creates and destroys plugin views
- 129: it - redraws changed node views

## ../prosemirror/view/test/webtest-endOfTextblock.ts

Category: portable  
Behavior rows: PM-13  
Names: 16

- 7: describe - EditorView.endOfTextblock
- 8: it - works at the left side of a textblock
- 16: it - works at the right side of a textblock
- 24: it - works in the middle of a textblock
- 32: it - works at the start of the document
- 40: it - works at the end of the document
- 48: it - works for vertical motion in a one-line block
- 54: it - works for vertical motion at the end of a wrapped block
- 60: it - works for vertical motion at the start of a wrapped block
- 66: it - works for virtual motion when in a mark
- 82: it - works at the start of an RTL block
- 91: it - works at the end of an RTL block
- 100: it - works inside an RTL block
- 109: it - works in a bidirectional block
- 116: it - works in a cursor wrapper
- 122: it - works after a widget

## ../prosemirror/view/test/webtest-markview.ts

Category: portable-mixed  
Behavior rows: PM-12, PM-14  
Plate-owned residual: mark-view `contentDOM`, `ignoreMutation`, and `destroy` lifecycle are Plate render/plugin authoring pressure, not raw Plite API.
Names: 4

- 6: describe - markViews prop
- 13: it - can provide a contentDOM property
- 29: it - has its ignoreMutation method called
- 50: it - has its destroy method called

## ../prosemirror/view/test/webtest-nodeview.ts

Category: portable-mixed  
Behavior rows: PM-12, PM-14  
Plate-owned residual: node-view `update`, `contentDOM`, `ignoreMutation`, `destroy`, `getPos`, and inner/outer decoration handoff are Plate render/plugin authoring pressure, not raw Plite API.
Names: 10

- 7: describe - nodeViews prop
- 28: it - can register its own update method
- 43: it - allows decoration updates for node views with an update method
- 63: it - can provide a contentDOM property
- 77: it - has its ignoreMutation method called
- 103: it - has its destroy method called
- 113: it - can query its own position
- 127: it - has access to outer decorations
- 161: it - provides access to inner decorations in the constructor
- 178: it - provides access to inner decorations in the update method

## ../prosemirror/view/test/webtest-selection.ts

Category: portable  
Behavior rows: PM-06, PM-13  
Names: 19

- 63: describe - EditorView
- 64: it - can read the DOM selection
- 91: it - syncs the DOM selection with the editor selection
- 112: it - returns sensible screen coordinates
- 135: it - returns proper coordinates in code blocks
- 151: it - produces sensible screen coordinates in corner cases
- 172: it - produces horizontal rectangles for positions between blocks
- 191: it - produces sensible screen coordinates around line breaks
- 215: it - can find coordinates on node boundaries
- 226: it - finds proper coordinates in RTL text
- 238: it - can go back and forth between screen coordsa and document positions
- 247: it - returns correct screen coordinates for wrapped lines
- 259: it - makes arrow motion go through selectable inline nodes
- 273: it - makes arrow motion go through selectable block nodes
- 282: it - supports arrow motion through adjacent blocks
- 295: it - support horizontal motion through blocks
- 311: it - allows moving directly from an inline node to a block node
- 321: it - updates the selection even if the DOM parameters look unchanged
- 335: it - sets selection even if Selection.extend throws DOMException

## ../prosemirror/view/test/webtest-view.ts

Category: portable-mixed  
Behavior rows: PM-13, PM-14  
Plate-owned residual: prop updates, dispatch binding, and app-facing view lifecycle belong in Plate React/editor integration. Raw Plite keeps DOM position mapping and selection geometry proof.
Names: 10

- 10: describe - EditorView
- 11: it - can mount an existing node
- 24: it - reflects the current state in .props
- 31: it - can update props with setProp
- 43: it - can update with a state using a different schema
- 50: it - calls handleScrollToSelection when appropriate
- 61: it - can be queried for the DOM position at a doc position
- 74: it - can bias DOM position queries to enter nodes
- 101: it - can map DOM positions to doc positions
- 110: it - binds this to itself in dispatchTransaction prop
