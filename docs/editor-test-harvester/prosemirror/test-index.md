# ProseMirror test-name index

Source boundary: all 19 package repositories declared by the ProseMirror meta launcher.

Extraction: TypeScript AST walk of string-literal `describe`, `it`, and `test` calls.

Total source files: 47

Total extracted names: 1369

## ../prosemirror/model/test/test-content.ts

Commit: `bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97`  
Category: portable-mixed  
Behavior rows: PM-01  
Names: 65

- 34: describe — ContentMatch
- 35: describe — matchType
- 36: it — accepts empty content for the empty expr
- 37: it — doesn't accept content in the empty expr
- 39: it — matches nothing to an asterisk
- 40: it — matches one element to an asterisk
- 41: it — matches multiple elements to an asterisk
- 42: it — only matches appropriate elements to an asterisk
- 44: it — matches group members to a group
- 45: it — doesn't match non-members to a group
- 46: it — matches an element to a choice expression
- 47: it — doesn't match unmentioned elements to a choice expr
- 49: it — matches a simple sequence
- 50: it — fails when a sequence is too long
- 51: it — fails when a sequence is too short
- 52: it — fails when a sequence starts incorrectly
- 54: it — accepts a sequence asterisk matching zero elements
- 55: it — accepts a sequence asterisk matching multiple elts
- 56: it — accepts a sequence plus matching one element
- 57: it — accepts a sequence plus matching multiple elts
- 58: it — fails when a sequence plus has no elements
- 59: it — fails when a sequence plus misses its start
- 61: it — accepts an optional element being present
- 62: it — accepts an optional element being missing
- 63: it — fails when an optional element is present twice
- 65: it — accepts a nested repeat
- 67: it — fails on extra input after a nested repeat
- 70: it — accepts a matching count
- 71: it — rejects a count that comes up short
- 72: it — rejects a count that has too many elements
- 73: it — accepts a count on the lower bound
- 74: it — accepts a count on the upper bound
- 75: it — accepts a count between the bounds
- 76: it — rejects a sequence with too few elements
- 77: it — rejects a sequence with too many elements
- 79: it — rejects a sequence with a bad element after it
- 80: it — accepts a sequence with a matching element after it
- 81: it — accepts an open range
- 82: it — accepts an open range matching many
- 83: it — rejects an open range with too few elements
- 86: describe — fillBefore
- 87: it — returns the empty fragment when things match
- 90: it — adds a node when necessary
- 93: it — accepts an asterisk across the bound
- 95: it — accepts an asterisk only on the left
- 97: it — accepts an asterisk only on the right
- 99: it — accepts an asterisk with no elements
- 101: it — accepts a plus across the bound
- 103: it — adds an element for a content-less plus
- 105: it — fails for a mismatched plus
- 107: it — accepts asterisk with content on both sides
- 109: it — accepts asterisk with no content after
- 111: it — accepts plus with content on both sides
- 113: it — accepts plus with no content after
- 115: it — adds elements to match a count
- 117: it — fails when there are too many elements
- 119: it — adds elements for two counted groups
- 121: it — doesn't include optional elements
- 123: it — completes a sequence
- 127: it — accepts plus across two bounds
- 131: it — fills a plus from empty input
- 135: it — completes a count
- 139: it — fails on non-matching elements
- 142: it — completes a plus across two bounds
- 145: it — refuses to complete an overflown count across two bounds

## ../prosemirror/model/test/test-diff.ts

Commit: `bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97`  
Category: portable-mixed  
Behavior rows: PM-05  
Names: 21

- 5: describe — Fragment
- 6: describe — findDiffStart
- 11: it — returns null for identical nodes
- 15: it — notices when one node is longer
- 19: it — notices when one node is shorter
- 23: it — notices differing marks
- 27: it — stops at longer text
- 31: it — stops at a different character
- 35: it — stops at a different node type
- 39: it — works when the difference is at the start
- 43: it — notices a different attribute
- 48: describe — findDiffEnd
- 54: it — returns null when there is no difference
- 58: it — notices when the second doc is longer
- 62: it — notices when the second doc is shorter
- 66: it — notices different styles
- 70: it — spots longer text
- 74: it — spots different text
- 78: it — notices different nodes
- 82: it — notices a difference at the end
- 86: it — handles a similar start

## ../prosemirror/model/test/test-dom.ts

Commit: `bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97`  
Category: portable  
Behavior rows: PM-03, PM-11  
Names: 106

- 15: describe — DOMParser
- 16: describe — parse
- 34: it — can represent simple node
- 38: it — can represent a line break
- 42: it — can represent an image
- 46: it — joins styles
- 50: it — can represent links
- 54: it — can represent and unordered list
- 58: it — can represent an ordered list
- 62: it — can represent a blockquote
- 66: it — can represent a nested blockquote
- 70: it — can represent headings
- 74: it — can represent inline code
- 78: it — can represent a code block
- 82: it — supports leaf nodes in marks
- 86: it — doesn't collapse non-breaking spaces
- 90: it — can parse marks on block nodes
- 103: it — parses unique, non-exclusive, same-typed marks
- 128: it — serializes non-spanning marks correctly
- 138: test — a
- 142: it — serializes an element and an attribute with XML namespace
- 174: it — can recover a list item
- 178: it — wraps a list item in a list
- 182: it — can turn divs into paragraphs
- 186: it — interprets <i> and <b> as emphasis and strong
- 190: it — wraps stray text in a paragraph
- 194: it — ignores an extra wrapping <div>
- 198: it — ignores meaningless whitespace
- 202: it — removes whitespace after a hard break
- 206: it — converts br nodes to newlines when they would otherwise be ignored
- 210: it — finds a valid place for invalid content
- 214: it — moves nodes up when they don't fit the current context
- 218: it — doesn't ignore whitespace-only text nodes
- 222: it — can handle stray tab characters
- 226: it — normalizes random spaces
- 230: it — can parse an empty code block
- 234: it — preserves trailing space in a code block
- 238: it — normalizes newlines when preserving whitespace
- 242: it — ignores <script> tags
- 246: it — can handle a head/body input structure
- 250: it — only applies a mark once
- 254: it — interprets font-style: italic as em
- 258: it — interprets font-weight: bold as strong
- 262: it — allows clearing of pending marks
- 266: it — allo clearing of active marks
- 271: it — ignores unknown inline tags
- 275: it — can add marks specified before their parent node is opened
- 279: it — keeps applying a mark for the all of the node's content
- 283: it — doesn't ignore whitespace-only nodes in preserveWhitespace full mode
- 286: it — closes block with inline content on seeing block-level children
- 290: it — can move a block node out of a paragraph
- 306: it — accepts the topNode option
- 311: it — accepts the topMatch option
- 315: it — accepts from and to options
- 319: it — accepts the preserveWhitespace option
- 332: it — can parse an open slice
- 335: it — will accept weird siblings
- 338: it — will open all the way to the inner nodes
- 341: it — accepts content open to the left
- 344: it — accepts content open to the right
- 347: it — will create textblocks for block nodes
- 350: it — can parse marks at the start of defaulted textblocks
- 354: it — will not apply invalid marks to nodes
- 357: it — will apply pending marks from parents to all children
- 360: it — can parse nested mark with same type
- 364: it — drops block-level whitespace
- 367: it — keeps whitespace in inline elements
- 370: it — can parse nested mark with same type but different attrs
- 419: it — can temporary shadow a mark with another configuration of the same type
- 455: it — can find a position at the start of a paragraph
- 459: it — can find a position at the end of a paragraph
- 463: it — can find a position inside text
- 467: it — can find a position inside an ignored node
- 471: it — can find a position between nodes
- 475: it — can find a position at the start of the document
- 479: it — can find a position at the end of the document
- 485: it — uses a custom top node when parsing
- 494: it — recognizes context restrictions
- 499: it — accepts group names in contexts
- 504: it — understands nested context restrictions
- 510: it — understands double slashes in context restrictions
- 516: it — understands pipes in context restrictions
- 522: it — uses the passed context
- 530: it — uses the passed context when parsing a slice
- 537: it — can close parent nodes from a rule
- 543: it — supports non-consuming node rules
- 549: it — supports non-consuming style rules
- 555: it — doesn't get confused by nested mark tags
- 559: it — ignores styles on skipped nodes
- 570: it — preserves whitespace in <pre> elements
- 580: it — preserves whitespace in nodes styled with white-space
- 585: it — inserts line break replacements
- 596: describe — schemaRules
- 597: it — defaults to schema order
- 608: it — understands priority
- 627: it — includes nodes when namespace is correct
- 634: it — excludes nodes when namespace is wrong
- 641: it — excludes nodes when namespace is absent
- 650: it — excludes nodes when namespace is wrong and xhtml
- 657: it — excludes nodes when namespace is wrong and empty
- 664: it — includes nodes when namespace is correct and empty
- 673: describe — DOMSerializer
- 676: it — can omit a mark
- 681: it — doesn't split other marks for omitted marks
- 686: it — can render marks with complex structure
- 695: it — refuses to use values from attributes as DOM specs

## ../prosemirror/model/test/test-mark.ts

Commit: `bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97`  
Category: portable-mixed  
Behavior rows: PM-04  
Names: 46

- 23: describe — Mark
- 24: describe — sameSet
- 25: it — returns true for two empty sets
- 27: it — returns true for simple identical sets
- 30: it — returns false for different sets
- 33: it — returns false when set size differs
- 36: it — recognizes identical links in set
- 39: it — recognizes different links in set
- 43: describe — eq
- 44: it — considers identical links to be the same
- 47: it — considers different links to differ
- 50: it — considers links with different titles to differ
- 54: describe — addToSet
- 55: it — can add to the empty set
- 58: it — is a no-op when the added thing is in set
- 61: it — adds marks with lower rank before others
- 64: it — adds marks with higher rank after others
- 67: it — replaces different marks with new attributes
- 71: it — does nothing when adding an existing link
- 75: it — puts code marks at the end
- 79: it — puts marks with middle rank in the middle
- 82: it — allows nonexclusive instances of marks with the same type
- 85: it — doesn't duplicate identical instances of nonexclusive marks
- 88: it — clears all others when adding a globally-excluding mark
- 91: it — does not allow adding another mark to a globally-excluding mark
- 94: it — does overwrite a globally-excluding mark when adding another instance
- 97: it — doesn't add anything when another mark excludes the added mark
- 100: it — remove excluded marks when adding a mark
- 104: describe — removeFromSet
- 105: it — is a no-op for the empty set
- 108: it — can remove the last mark from a set
- 111: it — is a no-op when the mark isn't in the set
- 114: it — can remove a mark with attributes
- 117: it — doesn't remove a mark when its attrs differ
- 122: describe — ResolvedPos.marks
- 127: it — recognizes a mark exists inside marked text
- 130: it — recognizes a mark doesn't exist in non-marked text
- 133: it — considers a mark active after the mark
- 136: it — considers a mark inactive before the mark
- 139: it — considers a mark active at the start of the textblock
- 142: it — notices that attributes differ
- 157: it — omits non-inclusive marks at end of mark
- 160: it — includes non-inclusive marks inside a text node
- 163: it — omits non-inclusive marks at the end of a line
- 166: it — includes non-inclusive marks between two marked nodes
- 169: it — excludes non-inclusive marks at a point where mark attrs change

## ../prosemirror/model/test/test-node.ts

Commit: `bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97`  
Category: portable-mixed  
Behavior rows: PM-01, PM-03  
Names: 51

- 19: describe — Node
- 20: describe — toString
- 21: it — nests
- 26: it — shows inline children
- 31: it — shows marks
- 37: describe — cut
- 42: it — extracts a full block
- 46: it — cuts text
- 50: it — cuts deeply
- 54: it — works from the left
- 58: it — works to the right
- 62: it — preserves marks
- 67: describe — between
- 81: it — iterates over text
- 85: it — descends multiple levels
- 89: it — iterates over inline nodes
- 94: describe — textBetween
- 95: it — works when passing a custom function as leafText
- 104: it — works with leafText
- 114: it — should ignore leafText when passing a custom leafText
- 124: it — adds block separator around empty paragraphs
- 128: it — adds block separator around leaf nodes
- 132: it — doesn't add block separator around non-rendered leaf nodes
- 137: describe — textContent
- 138: it — works on a whole doc
- 142: it — works on a text node
- 146: it — works on a nested element
- 152: describe — check
- 153: it — notices invalid content
- 158: it — notices marks in wrong places
- 163: it — notices incorrect sets of marks
- 168: it — notices wrong attribute types
- 174: describe — from
- 179: it — wraps a single node
- 182: it — wraps an array
- 185: it — preserves a fragment
- 188: it — accepts null
- 191: it — joins adjacent text
- 195: describe — toJSON
- 200: it — can serialize a simple node
- 202: it — can serialize marks
- 204: it — can serialize inline leaf nodes
- 206: it — can serialize block leaf nodes
- 208: it — can serialize nested nodes
- 211: describe — toString
- 212: it — should have the default toString method [text]
- 213: it — should have the default toString method [br]
- 215: it — should be able to redefine it from NodeSpec by specifying toDebugString method
- 218: it — should be respected by Fragment
- 228: describe — leafText
- 229: it — should custom the textContent of a leaf node

## ../prosemirror/model/test/test-replace.ts

Commit: `bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97`  
Category: portable  
Behavior rows: PM-01, PM-02  
Names: 24

- 5: describe — Node
- 6: describe — replace
- 12: it — joins on delete
- 15: it — merges matching blocks
- 18: it — merges when adding text
- 23: it — can insert text
- 28: it — doesn't merge non-matching blocks
- 33: it — can merge a nested node
- 38: it — can replace within a block
- 43: it — can insert a lopsided slice
- 48: it — can insert a deep, lopsided slice
- 53: it — can merge multiple levels
- 58: it — can merge multiple levels while inserting
- 63: it — can insert a split
- 68: it — can insert a deep split
- 73: it — can add a split one level up
- 78: it — keeps the node type of the left node
- 83: it — keeps the node type even when empty
- 93: it — doesn't allow the left side to be too deep
- 98: it — doesn't allow a depth mismatch
- 103: it — rejects a bad fit
- 108: it — rejects unjoinable content
- 113: it — rejects an unjoinable delete
- 118: it — check content validity

## ../prosemirror/model/test/test-resolve.ts

Commit: `bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97`  
Category: portable-mixed  
Behavior rows: PM-06, PM-13  
Names: 4

- 10: describe — Node
- 11: describe — resolve
- 12: it — should reflect the document structure
- 49: it — has a working posAtIndex method

## ../prosemirror/model/test/test-slice.ts

Commit: `bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97`  
Category: portable  
Behavior rows: PM-02  
Names: 22

- 5: describe — Node
- 6: describe — slice
- 14: it — can cut half a paragraph
- 17: it — can cut to the end of a pragraph
- 20: it — leaves off extra content
- 23: it — preserves styles
- 26: it — can cut multiple blocks
- 29: it — can cut to a top-level position
- 32: it — can cut to a deep position
- 36: it — can cut everything after a position
- 39: it — can cut from the start of a textblock
- 42: it — leaves off extra content before
- 45: it — preserves styles after cut
- 49: it — preserves styles started after cut
- 53: it — can cut from a top-level position
- 56: it — can cut from a deep position
- 60: it — can cut part of a text node
- 63: it — can cut across paragraphs
- 66: it — can cut part of marked text
- 70: it — can cut across different depths
- 74: it — can cut between deeply nested nodes
- 78: it — can include parents

## ../prosemirror/transform/test/test-mapping.ts

Commit: `8fecfa62dc8c816ef3ddd54427e6585418720f63`  
Category: portable  
Behavior rows: PM-05, PM-06  
Names: 11

- 31: describe — Mapping
- 32: it — can map through a single insertion
- 36: it — can map through a single deletion
- 40: it — can map through a single replace
- 44: it — can map through a mirrorred delete-insert
- 48: it — cap map through a mirrorred insert-delete
- 52: it — can map through an delete-insert with an insert in between
- 56: it — assigns the correct deleted flags when deletions happen before
- 64: it — assigns the correct deleted flags when deletions happen after
- 72: it — assigns the correct deleted flags when deletions happen across
- 79: it — assigns the correct deleted flags when deletions happen around

## ../prosemirror/transform/test/test-replace_step.ts

Commit: `8fecfa62dc8c816ef3ddd54427e6585418720f63`  
Category: portable  
Behavior rows: PM-05, PM-08  
Names: 3

- 6: describe — ReplaceAroundStep.map
- 15: it — doesn't break wrap steps on insertions
- 21: it — doesn't overwrite content inserted at start of unwrap step

## ../prosemirror/transform/test/test-step.ts

Commit: `8fecfa62dc8c816ef3ddd54427e6585418720f63`  
Category: portable  
Behavior rows: PM-05, PM-07  
Names: 21

- 17: describe — Step
- 18: describe — merge
- 34: it — merges typing changes
- 36: it — merges inverse typing
- 38: it — doesn't merge separated typing
- 40: it — doesn't merge inverted separated typing
- 42: it — merges adjacent backspaces
- 44: it — merges adjacent deletes
- 46: it — doesn't merge separate backspaces
- 48: it — merges backspace and type
- 50: it — merges longer adjacent inserts
- 52: it — merges inverted longer inserts
- 54: it — merges longer deletes
- 56: it — merges inverted longer deletes
- 58: it — merges overwrites
- 60: it — merges adding adjacent styles
- 62: it — merges adding overlapping styles
- 64: it — doesn't merge separate styles
- 66: it — merges removing adjacent styles
- 68: it — merges removing overlapping styles
- 70: it — doesn't merge removing separate styles

## ../prosemirror/transform/test/test-structure.ts

Commit: `8fecfa62dc8c816ef3ddd54427e6585418720f63`  
Category: portable  
Behavior rows: PM-01, PM-05  
Names: 43

- 50: describe — canSplit
- 58: it — can't at start
- 59: it — can't in head
- 60: it — can by making head a para
- 61: it — can't on top level
- 62: it — can in regular para
- 63: it — can't at start of section
- 64: it — can't in section head
- 65: it — can if also splitting the section
- 66: it — can if making the remaining head a para
- 67: it — can't after the section head
- 68: it — can in the first section para
- 69: it — can't in the figure caption
- 70: it — can't if it also splits the figure
- 71: it — can't after the figure caption
- 72: it — can in the first para in a quote
- 73: it — can if it also splits the quote
- 74: it — can't at the end of the document
- 76: it — doesn't return true when the split-off content doesn't fit in the given node type
- 88: describe — liftTarget
- 96: it — can't at the start of the doc
- 97: it — can't in the heading
- 98: it — can't in a subsection para
- 99: it — can't in a figure caption
- 100: it — can from a quote
- 101: it — can't in a section head
- 103: it — notices unliftable content after or before
- 120: describe — findWrapping
- 128: it — can wrap the whole doc in a section
- 129: it — can't wrap a head before a para in a section
- 130: it — can wrap a top paragraph in a quote
- 131: it — can't wrap a section head in a quote
- 132: it — can wrap a figure in a quote
- 133: it — can't wrap a head in a figure
- 136: describe — Transform
- 137: describe — replace
- 146: it — automatically adds a heading to a section
- 151: it — suppresses impossible inputs
- 156: it — adds necessary nodes to the left
- 161: it — adds a caption to a figure
- 166: it — adds an image to a figure
- 171: it — can join figures
- 176: it — adds necessary nodes to a parent node

## ../prosemirror/transform/test/test-trans.ts

Commit: `8fecfa62dc8c816ef3ddd54427e6585418720f63`  
Category: portable  
Behavior rows: PM-01, PM-02, PM-04, PM-05  
Names: 189

- 18: describe — Transform
- 19: describe — addMark
- 24: it — should add a mark
- 29: it — should only add a mark once
- 34: it — should join overlapping marks
- 39: it — should overwrite marks with different attributes
- 44: it — can add a mark in a nested node
- 49: it — can add a mark across blocks
- 54: it — does not remove non-excluded marks of the same type
- 65: it — can remove multiple excluded marks
- 80: describe — removeMark
- 85: it — can cut a gap
- 90: it — doesn't do anything when there's no mark
- 95: it — can remove marks from nested nodes
- 100: it — can remove a link
- 105: it — doesn't remove a non-matching link
- 110: it — can remove across blocks
- 115: it — can remove everything
- 120: it — can remove more than one mark of the same type from a block
- 133: describe — insert
- 138: it — can insert a break
- 143: it — can insert an empty paragraph at the top
- 148: it — can insert two block nodes
- 154: it — can insert at the end of a blockquote
- 159: it — can insert at the start of a blockquote
- 164: it — will wrap a node with the suitable parent
- 170: describe — delete
- 175: it — can delete a word
- 179: it — preserves content constraints
- 183: it — preserves positions after the range
- 187: it — doesn't join incompatible nodes
- 191: it — doesn't join when marks are incompatible
- 206: describe — join
- 211: it — can join blocks
- 215: it — can join compatible blocks
- 219: it — can join nested blocks
- 223: it — can join lists
- 227: it — can join list items
- 231: it — can join textblocks
- 235: it — converts newlines to line breaks
- 239: it — converts line breaks to newlines
- 244: describe — split
- 253: it — can split a textblock
- 257: it — correctly maps positions
- 261: it — can split two deep
- 266: it — can split three deep
- 271: it — can split at end
- 275: it — can split at start
- 279: it — can split inside a list item
- 283: it — can split a list item
- 288: it — respects the type param
- 293: it — preserves content constraints before
- 296: it — preserves content constraints after
- 300: describe — lift
- 306: it — can lift a block out of the middle of its parent
- 310: it — can lift a block from the start of its parent
- 314: it — can lift a block from the end of its parent
- 318: it — can lift a single child
- 322: it — can lift multiple blocks
- 326: it — finds a valid range from a lopsided selection
- 330: it — can lift from a nested node
- 334: it — can lift from a list
- 338: it — can lift from the end of a list
- 343: describe — wrap
- 349: it — can wrap in a blockquote
- 354: it — can wrap two paragraphs
- 359: it — can wrap in a list
- 364: it — can wrap in a nested list
- 369: it — includes half-covered parent nodes
- 375: describe — setBlockType
- 382: it — can change a single textblock
- 387: it — can change multiple blocks
- 392: it — can change a wrapped block
- 397: it — clears markup when necessary
- 402: it — removes non-allowed nodes
- 407: it — removes newlines in non-code
- 412: it — only clears markup when needed
- 417: it — works after another step
- 424: it — skips nodes that can't be changed due to constraints
- 429: it — converts newlines to linebreak replacements when appropriate
- 439: it — converts linebreak replacements to newlines when appropriate
- 450: it — can base attributes on previous attributes
- 456: describe — setNodeMarkup
- 461: it — can change a textblock
- 466: it — can change an inline node
- 472: describe — replace
- 479: it — can delete text
- 484: it — can join blocks
- 489: it — can delete right-leaning lopsided regions
- 494: it — can delete left-leaning lopsided regions
- 499: it — can overwrite text
- 504: it — can insert text
- 509: it — can add a textblock
- 514: it — can insert while joining textblocks
- 519: it — will match open list items
- 524: it — merges blocks across deleted content
- 529: it — can merge text down from nested nodes
- 534: it — can merge text up into nested nodes
- 539: it — will join multiple levels when possible
- 544: it — can replace a piece of text
- 549: it — respects open empty nodes at the edges
- 554: it — can completely overwrite a paragraph
- 559: it — joins marks
- 564: it — can replace text with a break
- 569: it — can join different blocks
- 574: it — can restore a list parent
- 579: it — can restore a list parent and join text after it
- 584: it — can insert into an empty block
- 589: it — doesn't change the nesting of blocks after the selection
- 594: it — can close a parent node
- 599: it — accepts lopsided regions
- 604: it — can close nested parent nodes
- 609: it — will close open nodes to the right
- 614: it — can delete the whole document
- 619: it — preserves an empty parent to the left
- 624: it — drops an empty parent to the right
- 629: it — drops an empty node at the start of the slice
- 634: it — drops an empty node at the end of the slice
- 639: it — does nothing when given an unfittable slice
- 644: it — doesn't drop content when things only fit at the top level
- 649: it — preserves openEnd when top isn't placed
- 654: it — will auto-close a list item when it fits in a list
- 659: it — finds the proper openEnd value when unwrapping a deep slice
- 670: it — preserves marks on block nodes
- 679: it — preserves marks on open slice block nodes
- 701: it — can unwrap a paragraph when replacing into a strict schema
- 707: it — can unwrap a body after a placed node
- 713: it — can wrap a paragraph in a body, even when it's not the first node
- 719: it — can split a fragment and place its children in different parents
- 725: it — will insert filler nodes before a node when necessary
- 731: it — doesn't fail when moving text would solve an unsatisfied content constraint
- 746: it — doesn't fail when pasting a half-open slice with a title and a code block into an empty title
- 761: it — doesn't fail when pasting a half-open slice with a heading and a code block into an empty title
- 776: it — can handle replacing in nodes with fixed content
- 794: it — keeps isolating nodes together
- 817: describe — replaceRange
- 824: it — replaces inline content
- 827: it — replaces an empty paragraph with a heading
- 830: it — replaces a fully selected paragraph with a heading
- 833: it — recreates a list when overwriting a paragraph
- 836: it — drops context when it doesn't fit
- 839: it — can replace a node when endpoints are in different children
- 844: it — keeps defining context when inserting at the start of a textblock
- 849: it — keeps defining context when it doesn't matches the parent markup
- 887: it — drops defining context when it matches the parent structure
- 892: it — drops defining context when it matches the parent structure in a nested context
- 897: it — drops defining context when it matches the parent structure in a deep nested context
- 902: it — closes open nodes at the start
- 908: describe — replaceRangeWith
- 913: it — can insert an inline node
- 916: it — can replace content with an inline node
- 919: it — can replace a block node with an inline node
- 922: it — can replace a block node with a block node
- 925: it — can insert a block quote in the middle of text
- 928: it — can replace empty parents with a block node
- 931: it — can move an inserted block forward out of parent nodes
- 934: it — can move an inserted block backward out of parent nodes
- 938: describe — deleteRange
- 943: it — deletes the given range
- 946: it — deletes empty parent nodes
- 950: it — doesn't delete parent nodes that can be empty
- 953: it — is okay with deleting empty ranges
- 956: it — will delete a whole covered node even if selection ends are in different nodes
- 959: it — leaves wrapping textblock when deleting all text in it
- 962: it — expands to cover the whole parent node
- 966: it — expands to cover the whole document
- 970: it — doesn't expand beyond same-depth textblocks
- 974: it — deletes the open token when deleting from start to past end of block
- 978: it — doesn't delete the open token when the range end is at end of its own block
- 982: it — doesn't break text-joining by inappropriate expansion
- 986: it — will delete entire blocks when deleting from the start of one textblock to another
- 991: describe — addNodeMark
- 996: it — adds a mark
- 999: it — doesn't duplicate a mark
- 1002: it — replaces a mark
- 1006: describe — removeNodeMark
- 1011: it — removes a mark
- 1014: it — doesn't do anything when there is no mark
- 1017: it — can remove a mark from multiple marks
- 1020: it — can remove multiple instances of a mark type
- 1033: describe — setNodeAttribute
- 1038: it — sets an attribute
- 1042: describe — setDocAttribute
- 1056: it — sets an attribute
- 1060: describe — changedRange
- 1066: it — returns null when there are no changes
- 1073: it — returns a range when something changed
- 1078: it — can handle multiple steps that affect each other's position
- 1083: it — properly adjusts for deletions before an earlier step

## ../prosemirror/transform/test/trans.ts

Commit: `8fecfa62dc8c816ef3ddd54427e6585418720f63`  
Category: harness  
Behavior rows: PM-15  
Names: 0

- No named test calls; support/harness file.

## ../prosemirror/state/test/state.ts

Commit: `57d4a96286ca972125a18a56ecd6d2b00927de30`  
Category: harness  
Behavior rows: PM-15  
Names: 0

- No named test calls; support/harness file.

## ../prosemirror/state/test/test-selection.ts

Commit: `57d4a96286ca972125a18a56ecd6d2b00927de30`  
Category: portable  
Behavior rows: PM-06  
Names: 23

- 7: describe — Selection
- 8: it — should follow changes
- 21: it — should move after inserted content
- 29: it — moves after an inserted leaf node
- 41: it — allows typing over a leaf node
- 50: it — allows deleting a selected block
- 69: it — preserves the marks of a deleted selection
- 75: it — doesn't preserve non-inclusive marks of a deleted selection
- 81: it — doesn't preserve marks when deleting a selection at the end of a block
- 87: it — drops non-inclusive marks at the end of a deleted span when appropriate
- 93: it — keeps non-inclusive marks when still inside them
- 99: it — preserves marks when typing over marked text
- 107: it — allows deleting a leaf
- 118: it — properly handles deleting the selection
- 134: it — can replace inline selections
- 151: it — can replace a block selection
- 163: it — puts the cursor after the inserted text when inserting a list item
- 171: describe — TextSelection.between
- 172: it — uses arguments when possible
- 179: it — will adjust when necessary
- 185: it — uses bias when adjusting
- 193: it — will fall back to a node selection
- 199: it — will collapse towards the other argument

## ../prosemirror/state/test/test-state.ts

Commit: `57d4a96286ca972125a18a56ecd6d2b00927de30`  
Category: portable-mixed  
Behavior rows: PM-14  
Names: 16

- 27: describe — State
- 28: it — creates a default doc
- 33: it — creates a default selection
- 39: it — applies transform transactions
- 47: it — supports plugin fields
- 54: it — can be serialized to JSON
- 76: it — supports specifying and persisting storedMarks
- 83: it — supports reconfiguration
- 95: it — allows plugins to filter transactions
- 105: it — allows plugins to append transactions
- 112: it — stores a reference to a root transaction for appended transactions
- 121: it — supports JSON.stringify toJSON arguments
- 127: describe — Plugin
- 128: it — calls prop functions bound to the plugin
- 132: it — can be found by key
- 138: it — generates new keys

## ../prosemirror/view/test/view.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: harness  
Behavior rows: PM-15  
Names: 0

- No named test calls; support/harness file.

## ../prosemirror/view/test/webtest-clipboard.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: portable  
Behavior rows: PM-02, PM-11  
Names: 14

- 9: describe — Clipboard interface
- 10: it — copies only the node for a node selection
- 18: it — includes context for text selections
- 28: it — preserves open nodes
- 37: it — uses clipboardTextSerializer when given
- 44: it — can read external HTML
- 50: it — will sanely clean up top-level nodes in HTML
- 60: it — only drops trailing br nodes in block parents
- 66: it — will call transformPastedHTML
- 72: it — will call transformPastedText
- 78: it — allows text parsing to be overridden with clipboardTextParser
- 84: it — preserves attributes
- 104: it — adds necessary wrappers for parsing
- 117: it — can parse content wrapped in comments

## ../prosemirror/view/test/webtest-composition.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: portable  
Behavior rows: PM-10  
Names: 22

- 87: describe — EditorView composition
- 88: it — supports composition in an empty block
- 97: it — supports composition at end of block
- 106: it — supports composition at end of block in a new node
- 114: it — supports composition at start of block in a new node
- 125: it — supports composition inside existing text
- 135: it — can deal with Android-style newline-after-composition
- 149: it — handles replacement of existing words
- 158: it — handles composition inside marks
- 167: it — handles composition in a mark that has multiple children
- 176: it — supports composition in a cursor wrapper
- 186: it — handles composition in a multi-child mark with a cursor wrapper
- 197: it — doesn't get interrupted by changes in decorations
- 205: it — works inside highlighted text
- 214: it — can handle compositions spanning multiple nodes
- 227: it — doesn't overwrite widgets next to the composition
- 238: it — cancels composition when a change fully overlaps with it
- 246: it — cancels composition when a change partially overlaps with it
- 254: it — cancels composition when a change happens inside of it
- 262: it — doesn't cancel composition when a change happens elsewhere
- 272: it — handles compositions rapidly following each other
- 294: it — can handle cross-paragraph compositions

## ../prosemirror/view/test/webtest-decoration.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: portable  
Behavior rows: PM-12  
Names: 53

- 58: describe — DecorationSet
- 59: it — builds up a matching tree
- 64: it — does not build nodes when there are no decorations
- 69: it — puts decorations between children in local
- 74: it — puts decorations spanning children in local
- 79: it — puts node decorations in the parent node
- 84: it — drops empty inline decorations
- 89: describe — find
- 90: it — finds all when no arguments are given
- 95: it — finds only those within the given range
- 100: it — finds decorations at the edge of the range
- 105: it — returns the correct offset for deeply nested decorations
- 110: it — can filter by predicate
- 116: describe — map
- 117: it — supports basic mapping
- 125: it — drops deleted decorations
- 130: it — can map node decorations
- 135: it — can map inside node decorations
- 140: it — removes partially overwritten node decorations
- 145: it — removes exactly overwritten node decorations
- 151: it — isn't inclusive by default
- 157: it — understands unclusiveLeft
- 163: it — understands unclusiveRight
- 169: it — preserves subtrees not touched by mapping
- 178: it — rebuilds when a node is joined
- 185: it — rebuilds when a node is split
- 190: it — correctly rebuilds a deep structure
- 198: it — calls onRemove when dropping decorations
- 209: it — respects the side option on widgets
- 217: it — doesn't doubly map decorations nested in multiple nodes
- 224: it — rebuilds subtrees correctly at an offset
- 231: it — properly maps decorations after deleted siblings
- 239: it — can map the content of nodes that moved in the same transaction
- 248: it — can handle nodes moving up multiple levels
- 259: it — maps inline decorations through ranges with > 3 elements
- 326: it — correctly offsets a deep structure
- 351: it — doesn't get confused by composite changes
- 360: describe — add
- 361: it — can add a local decoration
- 366: it — can add a decoration in a new child
- 371: it — can add a decoration to an existing child
- 376: it — can add a decoration beyond an existing child
- 381: it — can add multiple decorations
- 388: describe — remove
- 389: it — can delete a decoration
- 394: it — can delete multiple decorations
- 401: it — ignores decorations that don't exist
- 405: it — compares by both position and type when removing
- 412: describe — removeOverlap
- 413: it — returns the original array when there is no overlap
- 418: it — splits a partially overlapping decoration
- 423: it — splits a decoration that spans multiple widgets
- 428: it — correctly splits overlapping inline decorations

## ../prosemirror/view/test/webtest-domchange.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: portable  
Behavior rows: PM-09, PM-10  
Names: 44

- 17: describe — DOM change
- 18: it — notices when text is added
- 25: it — notices when text is removed
- 32: it — handles ambiguous changes
- 39: it — respects stored marks
- 47: it — can add a node
- 55: it — can remove a text node
- 63: it — can add a paragraph
- 71: it — supports duplicating a paragraph
- 79: it — support inserting repeated text
- 86: it — detects an enter press
- 98: it — detects an enter press creating a different block
- 110: it — detects a simple backspace press
- 122: it — detects a complex backspace press
- 135: it — doesn't route delete as backspace
- 147: it — correctly adjusts the selection
- 158: it — handles splitting of a textblock
- 170: it — handles a deep split of nodes
- 183: it — can delete the third instance of a character
- 190: it — can read a simple composition
- 197: it — can delete text in markup
- 204: it — recognizes typing inside markup
- 211: it — resolves ambiguous text input
- 219: it — does not repaint a text node when it's typed into
- 230: it — understands text typed into an empty paragraph
- 237: it — doesn't treat a placeholder BR as real content
- 244: it — fixes text changes when input is ignored
- 251: it — fixes structure changes when input is ignored
- 259: it — aborts when an incompatible state is set
- 268: it — recognizes a mark change as such
- 279: it — preserves marks on deletion
- 288: it — works when a node's contentDOM is deleted
- 297: it — doesn't redraw content with marks when typing in front
- 307: it — doesn't redraw content with marks when typing inside mark
- 317: it — maps input to coordsAtPos through pending changes
- 324: it — notices text added to a cursor wrapper at the start of a mark
- 331: it — removes cursor wrapper text when the wrapper otherwise remains valid
- 339: it — doesn't confuse backspace with delete
- 358: it — can disambiguate a multiple-character backspace event
- 377: it — doesn't confuse delete with backspace
- 394: it — doesn't confuse delete with backspace for multi-character deletions
- 411: it — creates a correct step for an ambiguous selection-deletion
- 430: it — creates a step that covers the entire selection for partially-matching replacement
- 455: it — doesn't create steps in the middle of surrogate pairs

## ../prosemirror/view/test/webtest-draw-decoration.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: portable  
Behavior rows: PM-12  
Names: 48

- 43: describe — Decoration drawing
- 44: it — draws inline decorations
- 52: it — draws wrapping decorations
- 59: it — draws node decorations
- 68: it — can update multi-level wrapping decorations
- 79: it — draws overlapping inline decorations
- 91: it — draws multiple widgets
- 101: it — orders widgets by their side option
- 109: it — draws a widget in an empty node
- 115: it — draws widgets on node boundaries
- 121: it — draws decorations from multiple plugins
- 127: it — calls widget destroy methods
- 142: it — draws inline decorations spanning multiple parents
- 153: it — draws inline decorations across empty paragraphs
- 162: it — can handle inline decorations ending at the start or end of a node
- 168: it — can draw decorations with multiple classes
- 175: it — supports overlapping inline decorations
- 188: it — doesn't redraw when irrelevant decorations change
- 197: it — doesn't redraw when irrelevant content changes
- 206: it — can add a widget on a node boundary
- 213: it — can remove a widget on a node boundary
- 221: it — can remove the class from a text node
- 230: it — can remove the class from part of a text node
- 240: it — can remove the class for part of a text node
- 250: it — draws a widget added in the middle of a text node
- 256: it — can update a text node around a widget
- 263: it — can update a text node with an inline decoration
- 272: it — correctly redraws a partially decorated node when a widget is added
- 282: it — correctly redraws when skipping split text node
- 289: it — drops removed node decorations from the view
- 297: it — can update a node's attributes without replacing the node
- 308: it — can add and remove CSS custom properties from a node
- 317: it — updates decorated nodes even if a widget is added before them
- 324: it — doesn't redraw nodes when a widget before them is replaced
- 333: it — can add and remove inline style
- 344: it — passes decorations to a node view
- 365: it — draws the specified marks around a widget
- 373: it — draws widgets inside the marks for their side
- 387: it — draws decorations inside node views
- 396: it — can delay widget drawing to render time
- 411: it — supports widgets querying their own position
- 426: it — doesn't redraw widgets with matching keys
- 439: it — doesn't redraw widgets with identical specs
- 452: it — doesn't get confused by split text nodes
- 475: it — only draws inline decorations on the innermost level
- 487: it — can handle inline decorations ending on inline node boundaries
- 496: it — can handle nodeName decoration overlapping with classes
- 506: it — can handle combining decorations from parent editors in child editors

## ../prosemirror/view/test/webtest-draw.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: portable-mixed  
Behavior rows: PM-12, PM-14  
Names: 19

- 7: describe — EditorView draw
- 8: it — updates the DOM
- 14: it — doesn't redraw nodes after changes
- 21: it — doesn't redraw nodes before changes
- 28: it — doesn't redraw nodes between changes
- 37: it — doesn't redraw siblings of a split node
- 46: it — doesn't redraw siblings of a joined node
- 55: it — doesn't redraw after a big deletion
- 62: it — adds classes from the attributes prop
- 72: it — adds style from the attributes prop
- 79: it — can set other attributes
- 88: it — can't set the contenteditable attribute
- 93: it — understands the editable prop
- 100: it — doesn't redraw following paragraphs when a paragraph is split
- 107: it — doesn't greedily match nodes that have another match
- 114: it — creates and destroys plugin views
- 129: it — redraws changed node views
- 139: it — doesn't get confused by merged nodes
- 145: it — doesn't redraw too much when marks are present

## ../prosemirror/view/test/webtest-endOfTextblock.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: portable  
Behavior rows: PM-13  
Names: 16

- 7: describe — EditorView.endOfTextblock
- 8: it — works at the left side of a textblock
- 16: it — works at the right side of a textblock
- 24: it — works in the middle of a textblock
- 32: it — works at the start of the document
- 40: it — works at the end of the document
- 48: it — works for vertical motion in a one-line block
- 54: it — works for vertical motion at the end of a wrapped block
- 60: it — works for vertical motion at the start of a wrapped block
- 66: it — works for virtual motion when in a mark
- 82: it — works at the start of an RTL block
- 91: it — works at the end of an RTL block
- 100: it — works inside an RTL block
- 109: it — works in a bidirectional block
- 116: it — works in a cursor wrapper
- 122: it — works after a widget

## ../prosemirror/view/test/webtest-markview.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: portable-mixed  
Behavior rows: PM-12, PM-14  
Names: 5

- 6: describe — markViews prop
- 7: it — can replace a mark's representation
- 13: it — can provide a contentDOM property
- 29: it — has its ignoreMutation method called
- 50: it — has its destroy method called

## ../prosemirror/view/test/webtest-nodeview.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: portable-mixed  
Behavior rows: PM-12, PM-14  
Names: 12

- 7: describe — nodeViews prop
- 8: it — can replace a node's representation
- 14: it — can override drawing of a node's content
- 28: it — can register its own update method
- 43: it — allows decoration updates for node views with an update method
- 63: it — can provide a contentDOM property
- 77: it — has its ignoreMutation method called
- 103: it — has its destroy method called
- 113: it — can query its own position
- 127: it — has access to outer decorations
- 161: it — provides access to inner decorations in the constructor
- 178: it — provides access to inner decorations in the update method

## ../prosemirror/view/test/webtest-selection.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: portable  
Behavior rows: PM-06, PM-13  
Names: 21

- 63: describe — EditorView
- 64: it — can read the DOM selection
- 91: it — syncs the DOM selection with the editor selection
- 112: it — returns sensible screen coordinates
- 135: it — returns proper coordinates in code blocks
- 151: it — produces sensible screen coordinates in corner cases
- 166: it — doesn't return zero-height rectangles after leaves
- 172: it — produces horizontal rectangles for positions between blocks
- 191: it — produces sensible screen coordinates around line breaks
- 215: it — can find coordinates on node boundaries
- 226: it — finds proper coordinates in RTL text
- 238: it — can go back and forth between screen coordsa and document positions
- 247: it — returns correct screen coordinates for wrapped lines
- 259: it — makes arrow motion go through selectable inline nodes
- 273: it — makes arrow motion go through selectable block nodes
- 282: it — supports arrow motion through adjacent blocks
- 295: it — support horizontal motion through blocks
- 311: it — allows moving directly from an inline node to a block node
- 321: it — updates the selection even if the DOM parameters look unchanged
- 335: it — sets selection even if Selection.extend throws DOMException
- 351: it — doesn't put the cursor after BR hack nodes

## ../prosemirror/view/test/webtest-view.ts

Commit: `c752c6ef7225199f73cb433dd3179e7d69b840d8`  
Category: portable-mixed  
Behavior rows: PM-13, PM-14  
Names: 11

- 10: describe — EditorView
- 11: it — can mount an existing node
- 24: it — reflects the current state in .props
- 31: it — can update props with setProp
- 43: it — can update with a state using a different schema
- 50: it — calls handleScrollToSelection when appropriate
- 61: it — can be queried for the DOM position at a doc position
- 74: it — can bias DOM position queries to enter nodes
- 94: it — can be queried for a node's DOM representation
- 101: it — can map DOM positions to doc positions
- 110: it — binds this to itself in dispatchTransaction prop

## ../prosemirror-keymap/test/test-keymap.ts

Commit: `d60e2447d63374d7612121675e9e7fa9ccfb2eb0`  
Category: portable-mixed  
Behavior rows: PM-16  
Names: 7

- 20: describe — keymap
- 21: it — calls the correct handler
- 28: it — distinguishes between modifiers
- 39: it — passes the state, dispatch, and view
- 48: it — tries both shifted key and base with shift modifier
- 56: it — tries keyCode when modifier active
- 62: it — tries keyCode for non-ASCII characters

## ../prosemirror/history/test/test-history.ts

Commit: `768b74205ad59919ed54d75e197312964ddcf3c2`  
Category: portable  
Behavior rows: PM-07  
Names: 29

- 30: describe — history
- 31: it — enables undo
- 40: it — enables redo
- 50: it — tracks multiple levels of history
- 68: it — starts a new event when newGroupDelay elapses
- 80: it — starts a new event for non-adjacent changes
- 87: it — doesn't get confused by non-replacement steps when checking adjacency
- 94: it — allows changes that aren't part of the history
- 103: it — doesn't get confused by an undo not adding any redo item
- 128: it — can handle complex editing sequences
- 132: it — can handle complex editing sequences with compression
- 136: it — supports overlapping edits
- 148: it — supports overlapping edits that aren't collapsed
- 161: it — supports overlapping unsynced deletes
- 172: it — can go back and forth through history multiple times
- 190: it — supports non-tracked changes next to tracked changes
- 199: it — can go back and forth through history when preserving items
- 221: it — restores selection on undo
- 235: it — rebases selection on undo
- 246: it — handles change overwriting in item-preserving mode
- 258: it — supports querying for the undo and redo depth
- 274: it — all functions gracefully handle EditorStates without history
- 282: it — truncates history
- 291: it — supports transactions with multiple steps
- 308: it — combines appended transactions in the event started by the base transaction
- 321: it — includes transactions appended to undo in the redo history
- 338: it — doesn't close the history on appended transactions
- 351: it — supports rebasing
- 402: it — properly maps selection when rebasing

## ../prosemirror/collab/test/test-collab.ts

Commit: `19ad580996ba404d81cd51968c547665b5948e5c`  
Category: portable  
Behavior rows: PM-08  
Names: 11

- 82: describe — collab
- 83: it — converges for simple changes
- 92: it — converges for multiple local changes
- 104: it — converges with three peers
- 115: it — converges with three peers with multiple steps
- 128: it — supports undo
- 140: it — supports redo
- 152: it — supports deep undo
- 182: it — support undo with clashing events
- 199: it — handles conflicting steps
- 211: it — can undo simultaneous typing

## ../prosemirror/collab/test/test-rebase.ts

Commit: `19ad580996ba404d81cd51968c547665b5948e5c`  
Category: portable  
Behavior rows: PM-06, PM-08  
Names: 16

- 64: describe — rebaseSteps
- 65: it — supports concurrent typing
- 72: it — support multiple concurrently typed chars
- 79: it — supports three concurrent typers
- 87: it — handles wrapping of changed blocks
- 94: it — handles insertions in deleted content
- 101: it — allows deleting the same content twice
- 108: it — isn't confused by joining a block that's being edited
- 115: it — supports typing concurrently with marking
- 122: it — doesn't unmark marks added concurrently
- 129: it — doesn't mark concurrently unmarked text
- 136: it — deletes inserts in replaced context
- 144: it — maps through inserts
- 151: it — handle concurrent removal of blocks
- 158: it — discards edits in removed blocks
- 165: it — preserves double block inserts

## ../prosemirror-commands/test/test-commands.ts

Commit: `52a84a842774fadec3b167bcdbd56085ec6c85df`  
Category: portable  
Behavior rows: PM-17  
Names: 154

- 37: describe — joinBackward
- 38: it — can join paragraphs
- 41: it — can join out of a nested node
- 45: it — moves a block into an adjacent wrapper
- 49: it — moves a block into an adjacent wrapper from another wrapper
- 53: it — joins the wrapper to a subsequent one if applicable
- 57: it — moves a block into a list item
- 61: it — joins lists
- 65: it — joins list items
- 69: it — lifts out of a list at the start
- 72: it — joins lists before and after
- 76: it — deletes leaf nodes before
- 79: it — lifts before it deletes
- 82: it — does nothing at start of doc
- 85: it — can join single-textblock-child nodes
- 103: it — doesn't return true on empty blocks that can't be deleted
- 106: it — doesn't join surrounding nodes of different types
- 111: describe — joinTextblockBackward
- 112: it — can join paragraphs
- 115: it — can join if second block is wrapped
- 118: it — can join if first block is wrapped
- 121: it — does nothing at start of doc
- 124: it — can join if inside a nested block
- 130: describe — selectNodeBackward
- 131: it — selects the node before the cut
- 135: it — does nothing when not at the start of the textblock
- 139: describe — deleteSelection
- 140: it — deletes part of a text node
- 143: it — can delete across blocks
- 146: it — deletes node selections
- 149: it — moves selection after deleted node
- 153: it — moves selection before deleted node at end
- 158: describe — joinForward
- 159: it — joins two textblocks
- 162: it — keeps type of second node when first is empty
- 165: it — clears nodes from joined node that wouldn't be allowed in target node
- 168: it — does nothing at the end of the document
- 171: it — deletes a leaf node after the current block
- 174: it — pulls the next block into the current list item
- 178: it — joins two blocks inside of a list item
- 182: it — pulls the next block into a blockquote
- 186: it — joins two blockquotes
- 190: it — pulls the next block outside of a wrapping blockquote
- 194: it — joins two lists
- 198: it — does nothing in a nested node at the end of the document
- 202: it — deletes a leaf node at the end of the document
- 206: it — moves before it deletes a leaf node
- 210: it — does nothing when it can't join
- 215: describe — joinTextblockForward
- 216: it — can join paragraphs
- 219: it — can join if second block is wrapped
- 222: it — can join if first block is wrapped
- 225: it — does nothing at end of doc
- 229: describe — selectNodeForward
- 230: it — selects the next node
- 234: it — does nothing at end of document
- 238: describe — joinUp
- 239: it — joins identical parent blocks
- 243: it — does nothing in the first block
- 246: it — joins lists
- 250: it — joins list items
- 254: it — doesn't look at ancestors when a block is selected
- 257: it — can join selected block nodes
- 262: describe — joinDown
- 263: it — joins parent blocks
- 267: it — doesn't join with the block before
- 270: it — joins lists
- 274: it — joins list items
- 278: it — doesn't look at parent nodes of a selected node
- 281: it — can join selected nodes
- 286: describe — lift
- 287: it — lifts out of a parent block
- 290: it — splits the parent block when necessary
- 294: it — can lift out of a list
- 297: it — does nothing for a top-level block
- 300: it — lifts out of the innermost parent
- 304: it — can lift a node selection
- 308: it — lifts out of a nested list
- 313: describe — wrapIn
- 316: it — can wrap a paragraph
- 319: it — wraps multiple pragraphs
- 323: it — wraps an already wrapped node
- 327: it — can wrap a node selection
- 332: describe — splitBlock
- 333: it — splits a paragraph at the end
- 336: it — split a pragraph in the middle
- 339: it — splits a paragraph from a heading
- 342: it — splits a heading in two when in the middle
- 345: it — deletes selected content
- 348: it — splits a parent block when a node is selected
- 352: it — doesn't split the parent block when at the start
- 355: it — splits off a normal paragraph when splitting at the start of a textblock
- 377: it — splits a paragraph from a heading when a double heading isn't allowed
- 384: it — won't try to reset the type of an empty leftover when the schema forbids it
- 391: it — can split an inline node
- 402: it — prefers textblocks
- 417: describe — splitBlockAs
- 418: it — splits to the appropriate type
- 422: it — passes an end-of-block flag
- 428: describe — splitBlockKeepMarks
- 429: it — keeps marks when used after marked text
- 435: it — preserves the stored marks
- 443: describe — liftEmptyBlock
- 444: it — splits the parent block when there are sibling before
- 448: it — lifts the last child out of its parent
- 452: it — lifts an only child
- 456: it — does not violate schema constraints
- 459: it — lifts out of a list
- 464: describe — createParagraphNear
- 465: it — creates a paragraph before a selected node at the start of the doc
- 468: it — creates a paragraph after a lone selected node
- 471: it — creates a paragraph after selected nodes not at the start of the doc
- 475: describe — setBlockType
- 480: it — can change the type of a paragraph
- 483: it — can change the type of a code block
- 486: it — can make a heading into a paragraph
- 489: it — preserves marks
- 492: it — acts on node selections
- 495: it — can make a block a code block
- 498: it — clears marks when necessary
- 501: it — acts on multiple blocks when possible
- 505: it — returns false when all textblocks in the selection are already this type
- 508: it — returns false when the selected blocks can't be changed
- 512: describe — selectParentNode
- 513: it — selects the whole textblock
- 517: it — goes one level up when on a block
- 521: it — goes further up
- 525: it — stops at the top level
- 530: describe — autoJoin
- 531: it — joins lists when deleting a paragraph between them
- 536: it — doesn't join lists when deleting an item inside of them
- 541: it — joins lists when wrapping a paragraph after them in a list
- 546: it — joins lists when wrapping a paragraph between them in a list
- 551: it — joins lists when lifting a list between them
- 557: describe — toggleMark
- 561: it — can add a mark
- 566: it — can stack marks
- 571: it — can remove marks
- 576: it — can toggle pending marks
- 586: it — skips whitespace at selection ends when adding marks
- 591: it — doesn't skip whitespace-only selections
- 596: it — includes whitespace when asked
- 601: it — can add marks with remove-when-present off
- 608: it — can remove marks with remove-when-present off
- 613: it — can remove marks with trailing space when remove-when-present is off
- 633: it — enters inline atoms by default
- 640: it — doesn't enter inline atoms to add a mark when told not to
- 647: it — can apply styles inside inline atoms
- 654: it — can add a mark even if already active inside an inline atom
- 661: it — doesn't enter inline atoms to remove a mark when told not to
- 669: describe — selectTextblockStart and selectTextblockEnd
- 670: it — can move the cursor when the selection is empty
- 678: it — can move the cursor when the selection is not empty
- 686: it — can move the cursor when the selection crosses multiple text blocks

## ../prosemirror-gapcursor/test/test-gapcursor.ts

Commit: `2ea9ca9d7aadc3a9ce8ac279f4ff869d0320a216`  
Category: portable-mixed  
Behavior rows: PM-18  
Names: 5

- 21: describe — GapCursor.valid
- 22: it — allows a gap cursor at the start and end of a document when adjacent to an atom block
- 29: it — disallows a gap cursor at the start and end of a document when adjacent to a textblock
- 36: it — allows a gap cursor at the start and end of a block when adjacent to an atom block
- 49: it — allows a gap cursor in an empty block

## ../prosemirror-schema-list/test/test-commands.ts

Commit: `d5515fe14169373c3f4ae73d2a82c13b50c6486e`  
Category: portable-mixed  
Behavior rows: PM-19  
Names: 33

- 24: describe — wrapInList
- 28: it — can wrap a paragraph
- 31: it — can wrap a nested paragraph
- 34: it — can wrap multiple paragraphs
- 38: it — doesn't wrap the first paragraph in a list item
- 41: it — doesn't wrap the first para in a different type of list item
- 44: it — does wrap the second paragraph in a list item
- 47: it — joins with the list item above when wrapping its first paragraph
- 51: it — only splits items where valid
- 56: describe — splitListItem
- 59: it — has no effect outside of a list
- 62: it — has no effect on the top level
- 65: it — can split a list item
- 68: it — can split a list item at the end
- 71: it — deletes selected content
- 75: it — splits when lifting from a nested list
- 79: it — can lift from a continued nested list item
- 83: it — correctly lifts an entirely empty sublist
- 88: describe — liftListItem
- 91: it — can lift from a nested list
- 95: it — can lift two items from a nested list
- 99: it — can lift two items from a nested three-item list
- 103: it — can lift an item out of a list
- 107: it — can lift two items out of a list
- 111: it — can lift three items from the middle of a list
- 115: it — can lift the first item from a list
- 119: it — can lift the last item from a list
- 123: it — joins adjacent lists when lifting an item with subitems
- 127: it — only joins adjacent lists when lifting if their types match
- 132: describe — sinkListItem
- 135: it — can wrap a simple item in a list
- 139: it — won't wrap the first item in a sublist
- 142: it — will move an item's content into the item above

## ../prosemirror-markdown/test/build.ts

Commit: `221ec60e26bc72005cacdbfc4f0ee43fda143489`  
Category: harness  
Behavior rows: PM-15, PM-20  
Names: 0

- No named test calls; support/harness file.

## ../prosemirror-markdown/test/test-custom-parser.ts

Commit: `221ec60e26bc72005cacdbfc4f0ee43fda143489`  
Category: portable-mixed  
Behavior rows: PM-20  
Names: 3

- 23: describe — custom markdown parser
- 24: it — ignores a blockquote
- 28: it — converts softbreaks to hard_break nodes

## ../prosemirror-markdown/test/test-parse.ts

Commit: `221ec60e26bc72005cacdbfc4f0ee43fda143489`  
Category: portable  
Behavior rows: PM-20  
Names: 61

- 22: describe — markdown
- 23: it — parses a paragraph
- 27: it — parses headings
- 31: it — parses a blockquote
- 38: it — parses a bullet list
- 42: it — parses an ordered list
- 46: it — preserves ordered list start number
- 50: it — can parse a heading in a list
- 54: it — parses a code block
- 58: it — parses an intended code block
- 62: it — parses a fenced code block with info string
- 66: it — parses inline marks
- 70: it — parses overlapping inline marks
- 74: it — parses links inside strong text
- 78: it — parses emphasis inside links
- 82: it — parses code mark inside strong text
- 86: it — parses code mark containing backticks
- 90: it — parses code mark containing only whitespace
- 94: it — parses hard breaks
- 99: it — parses links
- 103: it — parses urls
- 107: it — correctly serializes relative urls
- 112: it — can handle link titles
- 117: it — doesn't escape underscores in link
- 122: it — parses emphasized urls
- 126: it — parses an image
- 130: it — parses a line break
- 134: it — parses a horizontal rule
- 138: it — ignores HTML tags
- 142: it — doesn't accidentally generate list markup
- 146: it — doesn't fail with line break inside inline mark
- 149: it — drops trailing hard breaks
- 152: it — expels enclosing whitespace from inside emphasis
- 156: it — expels whitespace from emphasis with a nested mark
- 160: it — properly expels whitespace before a hard break
- 164: it — doesn't crash when a block ends in a hard break
- 167: it — drops nodes when all whitespace is expelled from them
- 171: it — preserves list tightness
- 176: it — doesn't put a code block after a list item inside the list item
- 180: it — doesn't escape characters in code
- 183: it — doesn't escape underscores between word characters
- 186: it — doesn't escape strips of underscores between word characters
- 189: it — escapes underscores at word boundaries
- 192: it — escapes underscores surrounded by non-word characters
- 195: it — ensure no escapes in url
- 200: it — ensure no escapes in autolinks
- 205: it — escape ! in front of links
- 209: it — escape of URL in links and images
- 217: it — escapes extra characters from options
- 224: it — escapes list markers inside lists
- 228: it — does not escape list markers in the middle of paragraphs
- 233: it — does not escape list markers without space after them
- 238: it — escapes ATX heading markers with space after them
- 242: it — escapes ATX heading markers followed by the end of line
- 246: it — does not escape ATX heading markers without space after them
- 250: it — does not escape ATX heading markers consisting of more than 6 in a sequence
- 254: it — keeps Unicode space after ATX heading markers when escaping
- 258: it — doesn't escape block-start characters in header
- 261: it — doesn't escape +++
- 266: it — code block fence adjusts to content
- 270: it — parses a code block ends with empty line

## ../prosemirror-test-builder/test/test-marks.ts

Commit: `a76003ea1ed08993d4e523ad990bf39058b0cbe3`  
Category: harness  
Behavior rows: PM-23  
Names: 3

- 30: describe — Multiple marks
- 31: it — deduplicates identical marks
- 39: it — marks of same type but different attributes are distinct

## ../prosemirror-changeset/test/test-changed-range.ts

Commit: `e215757276357b64cf74f536552f3a5ef292fa1a`  
Category: portable-mixed  
Behavior rows: PM-21  
Names: 5

- 20: describe — ChangeSet.changedRange
- 21: it — returns null for identical sets
- 30: it — returns only the changed range in simple cases
- 35: it — expands to cover updated spans
- 44: it — detects changes in deletions

## ../prosemirror-changeset/test/test-changes.ts

Commit: `e215757276357b64cf74f536552f3a5ef292fa1a`  
Category: portable-mixed  
Behavior rows: PM-21  
Names: 34

- 8: describe — ChangeSet
- 9: it — finds a single insertion
- 12: it — finds a single deletion
- 15: it — identifies a replacement
- 19: it — merges adjacent canceling edits
- 24: it — doesn't crash when cancelling edits are followed by others
- 29: it — stops handling an inserted span after collapsing it
- 33: it — partially merges insert at start
- 37: it — partially merges insert at end
- 41: it — partially merges delete at start
- 45: it — partially merges delete at end
- 49: it — finds multiple insertions
- 53: it — finds multiple deletions
- 57: it — identifies a deletion between insertions
- 61: it — can add a deletion in a new addStep call
- 66: it — merges delete/insert from different addStep calls
- 71: it — revert a deletion by inserting the character again
- 77: it — insert character before changed character
- 83: it — partially merges delete/insert from different addStep calls
- 88: it — merges insert/delete from different addStep calls
- 93: it — partially merges insert/delete from different addStep calls
- 98: it — maps deletions forward
- 103: it — can incrementally undo then redo
- 109: it — can map through complicated changesets
- 114: it — computes a proper diff of the changes
- 118: it — handles re-adding content step by step
- 125: it — doesn't get confused by split deletions
- 130: it — doesn't get confused by multiply split deletions
- 138: it — won't lose the order of overlapping changes
- 145: it — properly maps deleted positions
- 152: it — fuzz issue 1
- 160: it — fuzz issue 2
- 170: it — fuzz issue 3
- 183: it — correctly handles steps with multiple map entries

## ../prosemirror-changeset/test/test-diff.ts

Commit: `e215757276357b64cf74f536552f3a5ef292fa1a`  
Category: portable-mixed  
Behavior rows: PM-21  
Names: 15

- 7: describe — computeDiff
- 16: it — returns an empty diff for identical documents
- 19: it — finds single-letter changes
- 23: it — finds simple structure changes
- 27: it — finds multiple changes
- 31: it — ignores single-letter unchanged parts
- 34: it — ignores matching substrings in longer diffs
- 38: it — finds deletions
- 42: it — ignores marks
- 45: it — ignores marks in diffing
- 49: it — ignores attributes
- 52: it — finds huge deletions
- 58: it — finds huge insertions
- 64: it — can handle ambiguous diffs
- 67: it — sees the difference between different closing tokens

## ../prosemirror-changeset/test/test-merge.ts

Commit: `e215757276357b64cf74f536552f3a5ef292fa1a`  
Category: portable-mixed  
Behavior rows: PM-21  
Names: 11

- 4: describe — mergeChanges
- 5: it — can merge simple insertions
- 9: it — can merge simple deletions
- 13: it — can merge insertion before deletion
- 17: it — can merge insertion after deletion
- 21: it — can merge deletion before insertion
- 25: it — can merge deletion after insertion
- 29: it — can merge deletion of insertion
- 33: it — can merge insertion after replace
- 37: it — can merge insertion before replace
- 41: it — can merge replace after insert

## ../prosemirror-changeset/test/test-simplify.ts

Commit: `e215757276357b64cf74f536552f3a5ef292fa1a`  
Category: portable-mixed  
Behavior rows: PM-21  
Names: 16

- 6: describe — simplifyChanges
- 7: it — doesn't change insertion-only changes
- 10: it — doesn't change deletion-only changes
- 13: it — doesn't change single-letter-replacements
- 16: it — does expand multiple-letter replacements
- 19: it — does combine changes within the same word
- 22: it — expands changes to cover full words
- 25: it — doesn't expand across non-word text
- 28: it — doesn't expand replacements across bracket characters
- 31: it — treats leaf nodes as non-words
- 34: it — treats node boundaries as non-words
- 37: it — can merge stretches of changes
- 40: it — handles realistic word updates
- 43: it — works when after significant content
- 47: it — joins changes that grow together when simplifying
- 51: it — properly fills in metadata

## ../prosemirror-search/test/test-query.ts

Commit: `ff1148a339bb7daa9d7b02dff9614b9d7123f552`  
Category: portable-mixed  
Behavior rows: PM-22  
Names: 13

- 36: describe — SearchQuery
- 37: it — can match plain strings
- 41: it — skips overlapping matches
- 45: it — goes through multiple textblocks
- 49: it — matches across mark boundaries
- 53: it — can match case-insensitive strings
- 57: it — can match literally
- 61: it — can match by word
- 65: it — doesn't match non-words by word
- 69: it — can match regular expressions
- 73: it — can match case-insensitive regular expressions
- 77: it — can match regular expressions through multiple textblocks
- 81: it — can match regular expressions by word

## ../prosemirror-search/test/test-search.ts

Commit: `ff1148a339bb7daa9d7b02dff9614b9d7123f552`  
Category: portable-mixed  
Behavior rows: PM-22  
Names: 43

- 46: describe — search
- 47: describe — findNext
- 48: it — can find the next match
- 51: it — can find the next match from selection
- 54: it — wraps around at end of document
- 57: it — doesn't wrap around in no-wrap mode
- 60: it — can search a limited range
- 63: it — wraps within the given range
- 66: it — can match in nested structure
- 71: describe — findPrev
- 72: it — can find the previous match
- 75: it — wraps around at start of document
- 78: it — doesn't wrap around in no-wrap mode
- 81: it — can search a limited range
- 84: it — wraps within the given range
- 87: it — can match in nested structure
- 92: describe — replaceNext
- 93: it — moves to a match when not already on one
- 96: it — can replace the current match
- 99: it — moves selection to the next match
- 102: it — wraps around the end of the document
- 105: it — doesn't wrap with wrapping disabled
- 108: it — can replace within a limited range
- 112: it — can reuse parts of the match
- 116: it — can reuse matched leaf nodes
- 120: it — can replace in nested structure
- 126: it — doesn't replace reused content
- 134: it — can handle multiple references to groups
- 138: it — replaces non-matched groups with nothing
- 142: it — supports matches in string replacements
- 178: describe — replaceCurrent
- 179: it — does nothing when not at a match
- 182: it — selects the replacement
- 185: it — replaces delimiters with regexp
- 191: it — replaces inside non-leaf atoms
- 198: it — replaces delimiters with regexp inside non-leaf atoms
- 207: describe — replaceAll
- 208: it — replaces all instances
- 214: it — support using parts of the match
- 220: it — works within a limited range
- 226: it — works on zero-length matches
- 234: describe — filter
- 235: it — lets you replace only emphasized texts
