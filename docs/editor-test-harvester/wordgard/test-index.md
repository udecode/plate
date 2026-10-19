# Wordgard Test-Name Index

Source checkout: `../wordgard` at
`b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54`.

This is the complete source-declared `it(...)` call-site index for the current
test tree. Dynamic factories keep their source expression and line; the behavior
matrix expands those families. Harness-only files are recorded explicitly.

## `generate.ts` — harness — 0 call sites

- N/A: harness-only; no `it(...)` declarations.

## `schema.ts` — harness — 0 call sites

- N/A: harness-only; no `it(...)` declarations.

## `tempview.ts` — harness — 0 call sites

- N/A: harness-only; no `it(...)` declarations.

## `test-cellselection.ts` — portable-mixed — 30 call sites

- L86: `"Can select two adjacent cells"`
- L89: `"Can select two adjacent cells in reverse"`
- L92: `"Can select three adjacent cells"`
- L95: `"Can select two cells vertically"`
- L98: `"Can select two cells vertically in reverse"`
- L101: `"Can select a single cell"`
- L104: `"Can select a single cell in reverse"`
- L107: `"Can select a square of cells"`
- L110: `"Can select a square of cells in reverse"`
- L113: `"Can handle merged cells"`
- L116: `"grows to cover a colspan"`
- L119: `"grows to cover a rowspan"`
- L123: `"leaves selections inside a cell alone"`
- L126: `"converts selections crossing cell boundaries"`
- L129: `"preserves selection direction"`
- L132: `"can handle selections starting between cells"`
- L135: `"can handle cursor selection between cells"`
- L138: `"allows a cursor at the end of a cell"`
- L141: `"moves out of a table at the start"`
- L144: `"moves out of a table at the end"`
- L147: `"moves out of two tables"`
- L152: `"can move forward"`
- L155: `"can move backward"`
- L158: `"can move up"`
- L161: `"can move down"`
- L164: `"moves the head"`
- L167: `"moves the head when inverted"`
- L170: `"extends to a rectangle"`
- L173: `"extend when hitting a colspan node"`
- L176: `"extend when hitting a rowspan node"`

## `test-change.ts` — portable — 69 call sites

- L29: `"can apply inline insertions"`
- L33: `"can apply inline deletions"`
- L37: `"can apply inline replacements"`
- L41: `"can apply multiple inline replacements"`
- L45: `"can apply multiple inline replacements provided in inverted order"`
- L49: `"can split a node"`
- L53: `"can join a node"`
- L57: `"can wrap a node"`
- L61: `"can unwrap a node"`
- L65: `"can add marks"`
- L69: `"joins marked text when appropriate"`
- L73: `"can remove marks"`
- L77: `"can add multiple marks"`
- L82: `"can remove multiple marks"`
- L86: `"only adds marks where appropriate"`
- L90: `"can change node marks"`
- L94: `"complains on a mismatched length"`
- L103: `"won't create empty block-child nodes"`
- L113: `"won't add children in invalid positions"`
- L120: `"ignores marks on nodes that don't support them"`
- L128: `"can handle overlapping conflicting changes"`
- L138: `"inserts required nodes"`
- L144: `"adds wrapper nodes"`
- L150: `"exits wrapper nodes when possible"`
- L162: `"discards extra close tokens"`
- L167: `"can chance the depth of existing content"`
- L173: `"uses slice context for fitting"`
- L180: `"preserves the type of partially-deleted nodes"`
- L186: `"expands deletions to cover opening tokens"`
- L192: `"expands deletions to cover multiple opening tokens"`
- L198: `"expands deletions covering an entire block-content node"`
- L204: `"expands deletions asymetrically covering an entire block-content node"`
- L212: `"doesn't expand deletions covering a full textblock"`
- L218: `"expands replacements to use defining context"`
- L225: `"doesn't expand when not covering or closing the entire node"`
- L232: `"expands placement into an empty textblock"`
- L239: `"properly closes fitted nodes"`
- L246: `"wraps text at the top level in a textblock"`
- L254: `"moves block insertions out of textblocks"`
- L280: `\`correctly composes ${order.join("/")}\``
- L309: `"keeps the effect of changes stable when composed"`
- L328: `"can apply modifications to content inserted by earlier patches"`
- L337: `"can handle insertions in replaced content"`
- L343: `"is associative"`
- L362: `"converges when mapping pairs of changes"`
- L406: `"converges when mapping triplets of changes"`
- L413: `"orders local mark modifications correctly"`
- L423: `"orders mark-adding modifications correctly"`
- L432: `"handles overwritten open tokens"`
- L439: `"doesn't leak surplus opening nodes"`
- L445: `"doesn't leak surplus closing nodes"`
- L459: `"can invert insertions"`
- L463: `"can invert deletions"`
- L467: `"can invert replacements"`
- L471: `"can invert adding a mark"`
- L475: `"can invert removing a mark"`
- L479: `"can invert replacing a mark with another version"`
- L483: `"can invert changing a mark"`
- L487: `"can invert sequences of random changes"`
- L515: `"can map over a deletion"`
- L523: `"can map over an insertion"`
- L531: `"can map over a replacement"`
- L541: `"maps properly after another change"`
- L555: `"handles insertion"`
- L557: `"handles deletion"`
- L559: `"handles adding a mark"`
- L561: `"handles removing a mark"`
- L564: `"handles removing a mark with parameter"`
- L567: `"can serialize random changes"`

## `test-collab.ts` — portable-mixed — 17 call sites

- L115: `"converges for simple changes"`
- L124: `"converges for multiple local changes"`
- L136: `"converges with three peers"`
- L147: `"converges with three peers with multiple steps"`
- L160: `"supports undo"`
- L172: `"supports redo"`
- L184: `"supports deep undo"`
- L214: `"support undo with clashing events"`
- L230: `"can distribute mark changes"`
- L236: `"handles conflicting steps"`
- L248: `"can undo simultaneous typing"`
- L263: `"allows you to set the initial version"`
- L267: `"client ids survive reconfiguration"`
- L274: `"supports shared effects"`
- L320: `"holds up on random input"`
- L343: `"can handle corrections kicking in for merged steps"`
- L355: `"can apply corrections eagerly"`

## `test-commands.ts` — portable-mixed — 161 call sites

- L131: `"can lift a paragraph out of a quote"`
- L135: `"can leave sibling nodes in parent"`
- L139: `"can lift out of multiple parents"`
- L143: `"can lift out of multiple parents and leave siblings"`
- L147: `"can close asymmetric parents"`
- L151: `"returns false when unable to lift"`
- L155: `"only goes up to the next parent that fits"`
- L159: `"preserves marks on nodes it splits"`
- L163: `"can drop marks on nodes it splits"`
- L167: `"can lift blocks with an inline node"`
- L175: `"inserts a line break node in a regular paragraph"`
- L179: `"adds a line break when in a code block"`
- L183: `"can overwrite text"`
- L187: `"applies marks"`
- L191: `"uses a newline when no line break characters allowed"`
- L195: `"doesn't create a newline when the selection crosses out of the block"`
- L201: `"can split a paragraph"`
- L205: `"can split when selection spans paragraphs"`
- L209: `"can split when selection ends at a higher depth"`
- L213: `"can split when selection ends at a lower depth"`
- L217: `"keeps tag when splitting in the middle"`
- L221: `"picks the default block when splitting at the end"`
- L225: `"resets the origin block when splitting at the start"`
- L229: `"preserves marks"`
- L233: `"drops marks when appropriate"`
- L237: `"can split inline nodes around the cursor"`
- L245: `"inserts a paragraph node"`
- L249: `"can create wrapper nodes"`
- L253: `"can overwrite a selection"`
- L259: `"can delete an inline selection"`
- L263: `"can join two paragraphs"`
- L267: `"can delete across blocks"`
- L271: `"can delete leaving a block"`
- L275: `"keeps the start block type"`
- L279: `"expands the deleted range"`
- L283: `"can join two lists"`
- L289: `"can join two paragraphs"`
- L293: `"can join when the start is deeper than the end"`
- L297: `"can join when the start is much deeper than the end"`
- L301: `"can drop extra tokens after the end"`
- L305: `"can join when the end is deeper than the start"`
- L309: `"can join when the end is much deeper than the start"`
- L313: `"does nothing when not at the start of a textblock"`
- L317: `"drops the type of the first block if it's empty"`
- L321: `"joins parent nodes after"`
- L325: `"drops nodes not supported by the new parent"`
- L329: `"can join from inside an inline node"`
- L335: `"joins list items"`
- L339: `"doesn't join when not at the start of the item"`
- L344: `"doesn't try to join the first item"`
- L348: `"doesn't join non-list items"`
- L354: `"can join two paragraphs"`
- L358: `"can join when the start is deeper than the end"`
- L362: `"can join when the start is much deeper than the end"`
- L366: `"can drop extra tokens after the end"`
- L370: `"can join when the end is deeper than the start"`
- L374: `"can join when the end is much deeper than the start"`
- L378: `"does nothing when not at the end of a textblock"`
- L382: `"drops the type of the first block if it's empty"`
- L386: `"joins parent nodes after"`
- L390: `"drops nodes not supported by the new parent"`
- L394: `"can join from the end of an inline node"`
- L398: `"can pull a block out of a multi-block list item"`
- L405: `"can delete a letter"`
- L409: `"can delete a composite letter"`
- L413: `"can delete an image"`
- L417: `"can delete a horizontal rule"`
- L421: `"can delete a horizontal rule from inside the next node"`
- L425: `"can delete a horizontal rule inside a wrapping node"`
- L429: `"won't clear wrappers with extra content"`
- L433: `"will not clear the document"`
- L437: `"can delete an empty inline plot"`
- L443: `"can delete a word"`
- L447: `"includes whitespace after a word"`
- L451: `"can delete single-character words"`
- L455: `"can delete groups of punctuation"`
- L459: `"stops on punctuation in a word"`
- L465: `"can delete a letter"`
- L469: `"can delete a letter in the middle of a text node"`
- L473: `"can delete a composite letter"`
- L477: `"can delete an image"`
- L481: `"can delete a horizontal rule"`
- L485: `"can delete a horizontal rule from inside the next node"`
- L489: `"can delete a horizontal rule inside a wrapping node"`
- L493: `"won't clear wrappers with extra content"`
- L497: `"will not clear the document"`
- L501: `"can delete an empty inline plot"`
- L507: `"can delete a word"`
- L511: `"includes whitespace before a word"`
- L515: `"can delete single-character words"`
- L519: `"can delete groups of punctuation"`
- L523: `"stops on punctuation in a word"`
- L529: `"can change the type of a paragraph"`
- L533: `"can change the type of two paragraphs"`
- L537: `"can change the type of two paragraphs at different depth"`
- L541: `"returns false at the top level"`
- L546: `"returns false when the node is already of that type"`
- L550: `"works on multiple selections"`
- L556: `"clears disallowed content"`
- L560: `"preserves marks when appropriate"`
- L564: `"drops marks when appropriate"`
- L570: `"can wrap a paragraph in a blockquote"`
- L574: `"can wrap two paragraphs in a blockquote"`
- L578: `"can wrap three paragraphs in a blockquote"`
- L582: `"can content inside a blockquote"`
- L586: `"will expand to cover a partially selected node"`
- L590: `"will create required wrapper nodes"`
- L595: `"will pick the innermost valid depth"`
- L599: `"will join to adjacent auto-join node"`
- L606: `"can unwrap a quote"`
- L610: `"can unwrap multiple children from a quote"`
- L614: `"can partially unwrap quote with content left at end"`
- L618: `"can partially unwrap quote with content left at start"`
- L622: `"can partially unwrap quote with content left at both sides"`
- L626: `"can unwrap a list"`
- L630: `"can partially unwrap a list"`
- L634: `"can partially unwrap nested content at start"`
- L639: `"can partially unwrap nested content at end"`
- L644: `"can unwrap children from multiple parents"`
- L649: `"returns null at the top level"`
- L653: `"can unwrap textblock list items"`
- L666: `"will auto-join unwrapped nodes"`
- L676: `"can add a list to a single block"`
- L680: `"can add a list to two blocks"`
- L684: `"can remove a list"`
- L688: `"can remove only some items from a list"`
- L694: `"adds lists when it can"`
- L698: `"joins newly created lists to those above and below"`
- L704: `"joins changed lists to those above and below"`
- L710: `"can change a list's type"`
- L714: `"can change the type of two adjacent lists"`
- L718: `"can change a list's type and wrap items before and after"`
- L722: `"can handle multiple cursors in a single block"`
- L726: `"can unwrap a wrapper block"`
- L730: `"can unwrap a nested item"`
- L734: `"can wrap a nested item"`
- L738: `"can unwrap an item with multiple children"`
- L768: `"can wrap lists"`
- L772: `"can unwrap lists"`
- L776: `"can add a list to two blocks"`
- L780: `"can remove only some items from a list"`
- L786: `"adds lists when it can"`
- L790: `"joins newly created lists to those above and below"`
- L796: `"joins changed lists to those above and below"`
- L802: `"can change a list's type"`
- L806: `"can change the type of two adjacent lists"`
- L810: `"can change a list's type and wrap items before and after"`
- L814: `"can handle multiple cursors in a single block"`
- L823: `"can add emphasis to a selection"`
- L827: `"can remove emphasis from a selection"`
- L831: `"adds emphasis to a mixed-mark selection"`
- L835: `"stacks added marks with others"`
- L839: `"adds selection marks"`
- L843: `"adds selection marks to existing set"`
- L847: `"removes selection marks"`
- L851: `"replaces marks of the same type"`
- L855: `"doesn't add the same mark on multiple levels"`
- L859: `"can add a mark inside an inline node"`
- L863: `"can add a mark to an inline node that partially has it"`
- L869: `"will not add to both a parent and a child"`
- L873: `"will not remove a mark from inside an inline element that supports it"`

## `test-correction.ts` — portable — 6 call sites

- L10: `"is notified of child list changes"`
- L24: `"is notified of content changes"`
- L36: `"is notified of property changes"`
- L48: `"can apply corrections"`
- L64: `"can apply multiple corrections from a single source"`
- L76: `"can apply a correction to a start doc"`

## `test-facet.ts` — portable — 25 call sites

- L16: `"allows querying of facets"`
- L22: `"includes sub-extenders"`
- L28: `"only includes duplicated extensions once"`
- L34: `"returns an empty array for absent facet"`
- L39: `"sorts extensions by priority"`
- L47: `"lets sub-extensions inherit their parent's priority"`
- L53: `"supports dynamic facet inputs"`
- L58: `"only recomputes a facet value when necessary"`
- L65: `"can handle dependencies on facets that aren't present in the state"`
- L71: `"can specify a dependency on the document"`
- L81: `"can specify a dependency on the selection"`
- L93: `"can specify a dependency on the schema"`
- L103: `"derives dependencies of computed facets"`
- L116: `"only tracks direct, not transitive dependencies"`
- L130: `"can provide multiple values at once"`
- L137: `"works with a static combined facet"`
- L143: `"works with a dynamic combined facet"`
- L151: `"survives reconfiguration"`
- L158: `"survives unrelated reconfiguration even without deep-compare"`
- L167: `"preserves static facets across reconfiguration"`
- L173: `"creates newly added fields when reconfiguring"`
- L191: `"applies effects from reconfiguring transaction to new fields"`
- L209: `"errors on cyclic dependencies"`
- L214: `"updates facets computed from static values on reconfigure"`
- L221: `"preserves dynamic facet values when dependencies stay the same"`

## `test-history.ts` — portable — 37 call sites

- L42: `"allows to undo a change"`
- L49: `"allows to undo nearby changes in one change"`
- L58: `"allows to redo a change"`
- L66: `"allows to redo nearby changes in one change"`
- L75: `"tracks multiple levels of history"`
- L93: `"starts a new event when newGroupDelay elapses"`
- L105: `"supports a custom join predicate"`
- L122: `"allows changes that aren't part of the history"`
- L131: `"can handle multiple levels with changes that aren't part of history"`
- L150: `"allows adding multiple non-history changes to one level"`
- L162: `"allows adding new changes to an event that was mapped"`
- L170: `"doesn't get confused by an undo not adding any redo item"`
- L178: `"can handle complex editing sequences"`
- L194: `"supports overlapping edits"`
- L205: `"supports overlapping edits that aren't collapsed"`
- L217: `"supports overlapping unsynced deletes"`
- L227: `"can go back and forth through history multiple times"`
- L242: `"supports non-tracked changes next to tracked changes"`
- L251: `"can go back and forth through history when preserving items"`
- L269: `"restores selection on undo"`
- L285: `"restores the selection before the first change in an item"`
- L294: `"rebases selection on undo"`
- L304: `"can handle random events without crashing"`
- L323: `"supports querying for the undo and redo depth"`
- L339: `"all functions gracefully handle EditorStates without history"`
- L347: `"truncates history"`
- L354: `"isolates transactions when asked to"`
- L365: `"can group events around a non-history transaction"`
- L374: `"properly maps selections through non-history changes"`
- L386: `"properly maps selections in deeper events"`
- L395: `"restores selection on redo"`
- L406: `"can handle extenders adding changes"`
- L430: `"includes inverted effects in the history"`
- L506: `"can map effects"`
- L541: `"can restore comments lost through deletion"`
- L554: `"survives serialization"`
- L571: `"resolves before serializing"`

## `test-node.ts` — portable — 24 call sites

- L9: `"nests"`
- L14: `"shows inline children"`
- L19: `"shows marks"`
- L39: `"iterates over text"`
- L43: `"descends multiple levels"`
- L47: `"iterates over inline nodes"`
- L53: `"works with leafText"`
- L59: `"adds block separator around empty paragraphs"`
- L63: `"adds block separator around leaf nodes"`
- L67: `"doesn't duplicate separators for multiple opened blocks"`
- L73: `"doesn't add block separator around non-rendered leaf nodes"`
- L77: `"can take partial content"`
- L81: `"doesn't get confused by leading wrapper blocks"`
- L85: `"works on slices"`
- L91: `"fills params"`
- L96: `"allows child nodes"`
- L100: `"disallows incorrect child nodes"`
- L110: `"can serialize a simple node"`
- L112: `"can serialize marks"`
- L115: `"can serialize inline leaf nodes"`
- L118: `"can serialize block leaf nodes"`
- L121: `"can serialize nested nodes"`
- L124: `"complains about incorrect param types"`
- L130: `"complains about incorrect mark types"`

## `test-pointset.ts` — portable-mixed — 7 call sites

- L29: `"stores points and values"`
- L33: `"corrects order on creation"`
- L38: `"can merge"`
- L43: `"can merge masked"`
- L48: `"can be mapped"`
- L56: `"can be mapped with negative side"`
- L62: `"properly maps ranges at the end of the document"`

## `test-pos.ts` — portable — 5 call sites

- L7: `name`
- L31: `"can walk through a document"`
- L46: `"reports proper node positions"`
- L60: `"caches resolved contexts"`
- L66: `"can represent nodes"`

## `test-prop.ts` — portable-mixed — 22 call sites

- L14: `"considers identical links to be the same"`
- L17: `"considers different links to differ"`
- L34: `"returns true for simple identical sets"`
- L37: `"returns false for different sets"`
- L40: `"returns false when set size differs"`
- L43: `"recognizes identical links in set"`
- L46: `"recognizes different links in set"`
- L51: `"can add to the empty set"`
- L54: `"is a no-op when the added thing is in set"`
- L57: `"adds marks with lower rank before others"`
- L60: `"adds marks with higher rank after others"`
- L63: `"replaces different marks with new params"`
- L67: `"does nothing when adding an existing link"`
- L71: `"puts code marks at the end"`
- L75: `"puts marks with middle rank in the middle"`
- L78: `"combines multi-marks"`
- L81: `"doesn't duplicate identical instances of multi-marks"`
- L86: `"is a no-op for the empty set"`
- L89: `"can remove the last mark from a set"`
- L92: `"is a no-op when the mark isn't in the set"`
- L95: `"can remove a mark with params"`
- L98: `"doesn't remove a mark when its params differ"`

## `test-rangeset.ts` — portable-mixed — 9 call sites

- L28: `"stores ranges and values"`
- L32: `"checks order on creation"`
- L38: `"checks overlap on creation"`
- L44: `"can merge"`
- L49: `"can merge masked"`
- L54: `"checks overlap during merge"`
- L60: `"can be mapped"`
- L68: `"can be mapped inclusively"`
- L76: `"properly maps ranges at the end of the document"`

## `test-schema.ts` — portable — 9 call sites

- L8: `"allow querying of valid content"`
- L13: `"allows querying valid mark target"`
- L18: `"can determine whether plots share content"`
- L23: `"finds default content plot type"`
- L28: `"can match node types to group queries"`
- L38: `"supports overriding mark targets"`
- L49: `"supports overriding plot content"`
- L61: `"checks for tags not in the schema"`
- L70: `"checks for marks not in the schema"`

## `test-selection.ts` — portable — 19 call sites

- L71: `"finds inline positions"`
- L74: `"allows positions between block leaves"`
- L77: `"doesn't include positions next to textblocks"`
- L80: `"returns the bottom-most position between blocks"`
- L83: `"stops at isolating nodes"`
- L86: `"allows positions between block atoms"`
- L89: `"creates positions around whitespace-preserving nodes"`
- L92: `"handles inline nodes"`
- L95: `"skips whole glyphs"`
- L98: `"creates positions inside inline plots"`
- L101: `"exits text nodes"`
- L105: `"enters tables"`
- L111: `"moves LTR through " + JSON.stringify(text)`
- L114: `"moves RTL through " + JSON.stringify(text)`
- L169: `"will skip out of a surrogate pair"`
- L175: `"will move to the bottom of a block separation"`
- L181: `"will not exit a cursor-inside inline plot"`
- L192: `name`
- L222: `name`

## `test-state.ts` — portable — 13 call sites

- L8: `"can be initialized"`
- L18: `"can update a state"`
- L30: `"merges changes from multiple specs"`
- L38: `"can combine more than two changes"`
- L47: `"can combine sequential changes"`
- L55: `"can have multiple sequential changes"`
- L64: `"can handle regular changes after sequential changes"`
- L73: `"maps selection forward for sibling changes"`
- L81: `"maps selection forward in sibling changes"`
- L89: `"maps selection across sequential change"`
- L98: `"doesn't map selection from a sequential change"`
- L109: `"maps effects for sibling changes"`
- L117: `"maps effects for sequential changes"`

## `test-table-commands.ts` — plate-owned — 33 call sites

- L46: `"can turn a cell into a header cell"`
- L49: `"can turn a header into a regular cell"`
- L52: `"will set to header cells when selection is mixed"`
- L60: `"does nothing when not in a table"`
- L63: `"can add a row after"`
- L67: `"can add a row before"`
- L71: `"will pick the position below the selection"`
- L75: `"extends cells with a row span"`
- L83: `"deletes the row with the cursor"`
- L87: `"can delete the first row"`
- L91: `"can delete the last row"`
- L95: `"can delete multiple rows"`
- L99: `"adjusts rowspans for cells extending into the rows"`
- L106: `"can delete an entire table"`
- L114: `"can add a column after"`
- L118: `"can add a column before"`
- L122: `"extends cells with a col span"`
- L130: `"does nothing outside of a table"`
- L133: `"deletes the column with the cursor"`
- L137: `"can delete the first column"`
- L141: `"can delete the last column"`
- L145: `"can delete multiple columns"`
- L149: `"adjusts colspans for cells extending into the columns"`
- L161: `"can delete an entire table"`
- L169: `"refuses to merge a single cell"`
- L172: `"can merge a row"`
- L176: `"can merge a column"`
- L180: `"can merge a rectangle"`
- L188: `"won't merge a broken rectangle"`
- L196: `"does nothing on regular cells"`
- L199: `"can split a column span"`
- L203: `"can split a row span"`
- L207: `"can split a rectangle"`

## `test-table-correction.ts` — plate-owned — 6 call sites

- L22: `"adds cells to rows that are too short"`
- L26: `"prefers to add cells to the start of the first row"`
- L30: `"notices when the missing cells aren't at the end of the row"`
- L34: `"notices rowspans sticking out"`
- L38: `"fixes span collisions"`
- L42: `"adds missing cells in the middle"`

## `test-table-paste.ts` — plate-owned — 13 call sites

- L35: `"allows regular pastes inside cells through"`
- L40: `"repeats regular pastes across a cell selection"`
- L45: `"expands the pasted range for cell content"`
- L50: `"can grow a table horizontally"`
- L55: `"can grow a table vertically"`
- L60: `"recognizes opened cells as table content"`
- L65: `"recognizes a full table as table content"`
- L70: `"can split merged cells on the left selection border"`
- L79: `"can split merged cells on the right selection border"`
- L88: `"can split merged cells on vertical selection borders"`
- L97: `"can split cells on the selection border"`
- L115: `"can clip content to the selection size"`
- L120: `"can fill out non-rectangular input"`

## `webtest-commands.ts` — portable — 2 call sites

- L28: `"clears an entire paragraph"`
- L32: `"doesn't clear past wrap points"`

## `webtest-composition.ts` — portable — 12 call sites

- L96: `"supports composition inside existing text"`
- L102: `"supports composition on an empty line"`
- L111: `"supports composition at end of block in existing node"`
- L117: `"supports composition at end of block in a new node"`
- L123: `"supports composition at start of block in a new node"`
- L132: `"supports composition at start of line"`
- L138: `"handles replacement of existing words"`
- L144: `"can compose inside a wrapping mark"`
- L151: `"can compose at the end of a wrapping mark"`
- L158: `"can compose at the start of a wrapping mark"`
- L165: `"handles composition in a wrapper that has multiple children"`
- L171: `"supports composition in a cursor wrapper"`

## `webtest-content.ts` — portable-mixed — 76 call sites

- L54: `"can draw a simple document"`
- L58: `"can draw basic structure"`
- L63: `"can draw marks on text"`
- L68: `"can draw marks with a preferred target"`
- L84: `"can draw nodes with structure representation"`
- L88: `"can draw nodes with complicated structure"`
- L108: `"can draw marks on nodes"`
- L113: `"can update for a text change"`
- L118: `"can update for a tag change"`
- L123: `"can make multiple changes"`
- L128: `"can update text marks"`
- L135: `"can update node marks"`
- L142: `"can draw spanning marks"`
- L147: `"can join spanning marks in updates"`
- L152: `"preserves DOM nodes with changed wrappers marks"`
- L159: `"properly syncs replacements inside wrappers"`
- L165: `"preserves DOM nodes with changed attribute marks"`
- L172: `"preserves mark wrapper nodes"`
- L179: `"adds breaks for empty textblocks and those ending in breaks"`
- L184: `"fixes textblock breaks on changes"`
- L190: `"keeps parent nodes when updating their content"`
- L197: `"reuses text nodes when changing their start"`
- L205: `"reuses text nodes when changing their end"`
- L213: `"reuses text nodes when changing their middle"`
- L221: `"can handle adding a mark to part of a textblock"`
- L226: `"can handle a change moving content up"`
- L233: `"can handle a change moving content down"`
- L240: `"handles insertion of text before a mark"`
- L245: `"can handle random changes"`
- L262: `"can draw widgets around nodes"`
- L268: `"can reuse widgets when replacing next to them"`
- L278: `"can reuse widgets when updating across them"`
- L291: `"updates tag widgets at the end of a changed plot"`
- L309: `"doesn't break spanning wrappers on widgets"`
- L315: `"keeps structure entirely the same on a no-change update"`
- L326: `"can draw widgets from a point set"`
- L334: `"can update widgets from a point set"`
- L344: `"can update widgets in place"`
- L354: `"orders widgets by side"`
- L361: `"can redraw widgets at the end of the document"`
- L378: `"doesn't duplicate widgets on section boundaries"`
- L389: `"can decorate tags"`
- L396: `"updates wrappers when they change"`
- L407: `"can handle changes from range and point decorations in a single transactions"`
- L418: `"can add attributes to tags"`
- L422: `"can remove attributes from tags"`
- L429: `"preserves DOM nodes when adding attributes"`
- L436: `"doesn't drop point decorations directly after a change"`
- L450: `"can take wrappers from spans"`
- L456: `"can take attributes from spans"`
- L462: `"notices changes to spans that start before a preserved section"`
- L471: `"can override a specific leaf node's shape"`
- L477: `"can override a specific non-leaf node's shape"`
- L483: `"can give a plot with atomic shape"`
- L489: `"can dynamically redraw a plot as an atom"`
- L497: `"can dynamically redraw an atom plot as a regular plot"`
- L505: `"can add attributes to a specific node"`
- L511: `"won't try to add attributes to a text node"`
- L516: `"doesn't leave stale decorations on complex changes"`
- L530: `"can add wrapping structure to a specific node"`
- L536: `"can handle a change modifying the depth of a plot's wrapper"`
- L544: `"can replace the shape of a node type"`
- L549: `"properly handles insertions at the start and end of wrapping structure"`
- L558: `"can handle changes inside atomic plots"`
- L566: `"can handle deletion inside an atomic plot"`
- L573: `"can handle changes covering parts of atomic plots"`
- L579: `"can handle changes covering parts of wrapped atomic plots"`
- L588: `"can handle changes covering the start of atomic plots"`
- L594: `"supports selectors for wrapper decorations"`
- L601: `"can reuse DOM structure when adding a shape wrapper"`
- L610: `"makes isAtom aware of tag shapes"`
- L616: `"can override shapes by tag"`
- L621: `"makes by-point shapes override by-tag ones"`
- L630: `"properly updates when tag shapes change"`
- L638: `"properly updates when positional shapes change"`
- L648: `"supports dynamic shapes"`

## `webtest-coords.ts` — portable — 15 call sites

- L19: `"finds reasonable coordinates for simple text"`
- L29: `"properly assigns a side to positions"`
- L44: `"assigns positions below text to the end"`
- L52: `"assigns position below wrapped text to end"`
- L62: `"works around hard breaks"`
- L72: `"works in block atoms"`
- L84: `"can handle different text height"`
- L95: `"works in right-to-left context"`
- L102: `"works around line breaks"`
- L125: `"can move between paragraphs"`
- L135: `"can move within a paragraph"`
- L148: `"preserves a goal column"`
- L156: `"can move across atom blocks"`
- L162: `"can enter nested blocks"`
- L177: `"can move through rows in a table"`

## `webtest-dom-changes.ts` — portable — 7 call sites

- L52: `"can combine stacked changes"`
- L66: `"properly corrects for changes in earlier nodes"`
- L76: `"properly corrects for changes in adjacent nodes"`
- L85: `"integrates non-DOM changes"`
- L95: `"can handle DOM changes being interpreted differently"`
- L107: `"works for newly created text nodes"`
- L117: `"survives random input"`

## `webtest-editor.ts` — portable — 9 call sites

- L12: `"calls update on plugins"`
- L35: `"allows content attributes to be changed through extensions"`
- L40: `"allows editor attributes to be changed through extensions"`
- L45: `"repairs changes to text nodes"`
- L52: `"repairs modified attributes"`
- L59: `"disallows dispatches from plugin update"`
- L71: `"automatically flushes on DOM access"`
- L79: `"applies transaction appenders"`
- L87: `"calls connect/disconnect on widgets"`

## `webtest-resolve-dom.ts` — portable — 11 call sites

- L23: `"resolves into text nodes when biased"`
- L31: `"resolves simple positions"`
- L51: `"resolves properly between widgets"`
- L64: `"picks the correct side on mark boundaries"`
- L76: `"picks the right side of widgets on wrapper boundaries"`
- L94: `"does not resolve into inner point structure"`
- L102: `"does go into inner content wrappers"`
- L116: `"can handle node structure inside content wrappers"`
- L138: `"locates basic positions"`
- L160: `"works in nodes with multiple wrappers"`
- L176: `"handles inline plot buffers correctly"`

## `webtest-serialize.ts` — portable-mixed — 38 call sites

- L32: `"can serialize simple nodes"`
- L36: `"can serialize tag parameters"`
- L40: `"can serialize spanning marks"`
- L44: `"can serialize attribute marks"`
- L53: `"can serialize style marks"`
- L63: `"can serialize targeted marks"`
- L76: `"can serialize marks that add multiple attributes"`
- L84: `"serializes heading levels"`
- L88: `"serializes line breaks in whitespace-preserving nodes"`
- L95: `"can serialize a simple slice"`
- L99: `"can serialize an open slice"`
- L103: `"can serialize a slice with deeper open sides"`
- L108: `"can mark open nodes"`
- L114: `"can include extra context"`
- L128: `"can parse simple content"`
- L132: `"can parse nested nodes"`
- L137: `"can parse nodes with params"`
- L142: `"can parse marks"`
- L147: `"will add wrapper nodes"`
- L152: `"parses line breaks in code blocks as break nodes"`
- L156: `"preserves whitespace in code blocks"`
- L161: `"collapses whitespace"`
- L166: `"can disable whitespace collapsing"`
- L171: `"parses heading levels"`
- L177: `"ignores non-content tags"`
- L182: `"parses style properties"`
- L187: `"clears marks via style properties"`
- L192: `"can parse marks with pass-through attributes"`
- L197: `"joins text nodes"`
- L201: `"uses parse rule precedence"`
- L209: `"can parse different image types"`
- L230: `"can parse a simple slice"`
- L234: `"can parse text at the top level"`
- L238: `"doesn't trim text at the top level"`
- L242: `"opens nested nodes"`
- L246: `"doesn't open leaf nodes"`
- L255: `"can query the DOM for open structure"`
- L260: `"creates a block parent when seeing multiple unmatched block elements"`

## Accounting

- Files indexed: 29/29
- Runnable files indexed: 26/26
- Declared `it(...)` call sites: 675
- Unresolved files: 0
