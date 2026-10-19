# ProseKit test-name index

target: `../prosekit`
source*commit: `3fbfe7906c3448328e80c1c1333647d08e50907e`
generated: 2026-08-21
extraction: `rg --pcre2 -n --no-heading '(?<![A-Za-z0-9*$])(?:describe|it|test)(?:\\.(?:skip|only|todo|each|skipIf|runIf))_\\s_\\('`
runnable_files: 155
indexed_files: 154
raw_matches: 661

## `../prosekit/packages/basic/src/index.spec.ts`

- L6: `describe('defineBasicExtension', () => {`
- L7: `it('can add nodes and marks', () => {`
- L24: `describe('BasicExtension', () => {`
- L28: `it('can throw TypeScript error for non existing command', () => {`
- L40: `it('can throw TypeScript error for incorrect command arguments', () => {`

## `../prosekit/packages/basic/src/node.spec.ts`

- L6: `describe('Node.js environment', () => {`
- L7: `it('is not a browser environment', () => {`
- L11: `it('is a Node.js environment', () => {`
- L15: `it('can create an editor', () => {`
- L23: `it('can call editor.setContent() with a JSON object', () => {`
- L52: `it('can execute a command', () => {`
- L78: `it('cannot call HTML APIs by default', () => {`
- L86: `it('can call HTML APIs using jsdom', async () => {`
- L102: `it('can call HTML APIs using happy-dom', async () => {`

## `../prosekit/packages/core/src/commands/expand-mark.spec.ts`

- L9: `describe('expandMark', () => {`
- L10: `it('expands a caret inside a mark to the whole run', () => {`
- L17: `it('is a no-op when the position is not inside the mark', () => {`
- L24: `it('stops at a neighbouring mark that differs in attributes', () => {`

## `../prosekit/packages/core/src/commands/insert-default-block.spec.ts`

- L8: `describe('insertDefaultBlock', () => {`
- L18: `it('can insert a default block before the first text block', async () => {`
- L30: `it('can insert a default block between two text blocks', async () => {`
- L42: `it('can insert a default block after the last text block', async () => {`
- L54: `it('can insert a default block after current text block', async () => {`
- L80: `it('can insert a default block after current selection', async () => {`

## `../prosekit/packages/core/src/commands/select-block.spec.ts`

- L7: `describe('selectBlock', () => {`
- L8: `it('should expand the text selection to cover the start of the paragraph', () => {`
- L16: `it('should expand the text selection to cover the end of the paragraph', () => {`
- L24: `it('should expand the text selection to include other marks', () => {`
- L38: `it('should expand the text selection to include multiple blocks', () => {`
- L50: `it('is able to expand the text selection pointing to different depths', () => {`

## `../prosekit/packages/core/src/commands/set-node-attrs-between.spec.ts`

- L7: `describe('setNodeAttrsBetween', () => {`
- L8: `it('should set attributes on multiple nodes in selection range', () => {`
- L31: `it('should set attributes with explicit from/to positions', () => {`
- L60: `it('should return false when no matching nodes in range', () => {`
- L78: `it('should return false when from > to', () => {`
- L93: `it('should handle empty selection (from === to)', () => {`
- L107: `it('should handle partial node overlap', () => {`
- L130: `it('should update only matching node types in mixed content', () => {`
- L154: `it('should handle nested nodes', () => {`

## `../prosekit/packages/core/src/commands/set-node-attrs.spec.ts`

- L7: `describe('setNodeAttrs', () => {`
- L8: `it('should set attributes on a code block node', () => {`
- L26: `it('should set multiple attributes at once', () => {`
- L52: `it('should return false when node type does not match', () => {`
- L66: `it('should set attributes at a specific position', () => {`
- L94: `it('should handle cursor inside a node', () => {`
- L109: `it('should set attrs on wrapping node containing selection', () => {`

## `../prosekit/packages/core/src/commands/toggle-wrap.spec.ts`

- L5: `describe('toggle-wrap', () => {`
- L6: `it('adds the node wrapping the selection', () => {`
- L19: `it('lift the wrapped node', () => {`

## `../prosekit/packages/core/src/commands/unset-block-type.spec.ts`

- L5: `describe('unsetBlockType', () => {`
- L6: `it('can unset a single block', () => {`
- L19: `it('can unset multiple blocks', () => {`

## `../prosekit/packages/core/src/commands/unset-mark.spec.ts`

- L5: `describe('unsetMark', () => {`
- L6: `it('can unset marks', () => {`

## `../prosekit/packages/core/src/editor/action.spec.ts`

- L8: `describe('NodeAction', () => {`
- L11: `it('can apply node', () => {`
- L18: `it('can apply node with attrs', () => {`
- L26: `it('can check node activity', () => {`
- L33: `describe('MarkAction', () => {`
- L36: `it('can apply mark', () => {`
- L43: `it('can apply mark with attrs', () => {`
- L58: `it('can apply multiple marks', () => {`
- L64: `it('can apply the same mark multiple times', () => {`
- L104: `it('can check mark activity', () => {`
- L114: `it('can check mark activity for cross-paragraph selection', () => {`
- L121: `it('should not set isActive to true when only part of the text is marked', () => {`
- L135: `it('should not set isActive to true when multiple empty paragraphs are selected', () => {`

## `../prosekit/packages/core/src/editor/builder.spec.ts`

- L7: `describe('createNodeBuilders', () => {`
- L13: `it('builds a node from a string child', () => {`
- L20: `it('builds a node with attributes', () => {`
- L28: `it('nests node children', () => {`
- L38: `it('flattens array children', () => {`
- L42: `it('fills required content when no children are given', () => {`
- L49: `it('does not expose isActive', () => {`
- L53: `it('exposes a builder for every node in the schema', () => {`
- L57: `it('is typed per node name', () => {`
- L65: `describe('createMarkBuilders', () => {`
- L72: `it('applies a mark to text', () => {`
- L79: `it('applies a mark with attributes', () => {`
- L92: `it('nests mark builders as children', () => {`
- L103: `it('returns an array of nodes', () => {`
- L107: `it('does not expose isActive', () => {`
- L111: `it('is typed per mark name', () => {`
- L116: `describe('create', () => {`
- L117: `it('returns a bare mark without applying it to children', () => {`
- L123: `it('creates a mark with attributes', () => {`
- L129: `it('is typed per mark name', () => {`

## `../prosekit/packages/core/src/editor/editor.spec.ts`

- L10: `describe('createEditor', () => {`
- L11: `it('can mount the editor', () => {`
- L21: `it('can get and update state', () => {`
- L85: `it('can update document and selection', () => {`
- L153: `it('can refuse invalid document', () => {`
- L164: `it('can execute commands', () => {`

## `../prosekit/packages/core/src/editor/union.spec.ts`

- L14: `describe('union', () => {`
- L15: `it('can merge one extension types', () => {`
- L29: `it('can merge an extension array', () => {`
- L57: `it('can merge a nested array', () => {`

## `../prosekit/packages/core/src/extensions/default-state.spec.ts`

- L8: `describe('defineDefaultState', () => {`
- L19: `it('can set the default document', () => {`
- L31: `it('can set the default selection', () => {`

## `../prosekit/packages/core/src/extensions/events/dom-event.spec.ts`

- L8: `describe('defineDOMEventHandler', () => {`
- L9: `it('should register and unregister event handlers dynamically', () => {`

## `../prosekit/packages/core/src/extensions/events/focus.spec.ts`

- L9: `describe('defineFocusChangeHandler', () => {`
- L10: `it('should call the handler when the editor is focused or blurred', () => {`

## `../prosekit/packages/core/src/extensions/keymap-base.spec.ts`

- L11: `describe('Mod-a', () => {`
- L12: `it('can select the block for the first Mod-a press', async () => {`
- L27: `it('can select the entire document if the current textblock is already selected', async () => {`
- L41: `it('can select the entire document if multiple textblocks are already selected', async () => {`
- L55: `it('can select the entire document if the current textblock is empty', async () => {`
- L69: `it('can select the entire document directly if \`preferBlockSelection\` is false', async () => {`

## `../prosekit/packages/core/src/extensions/keymap.spec.ts`

- L12: `describe('keymap', () => {`
- L13: `it('can register and unregister keymap', () => {`
- L50: `it('can skip unnecessary plugin update', () => {`
- L79: `it('respects priority and calls highest priority first', () => {`
- L119: `it('can merge keybindings with different variants', async () => {`

## `../prosekit/packages/core/src/extensions/mark-paste-rule.spec.ts`

- L34: `describe('defineMarkPasteRule', () => {`
- L35: `it('should match simple patterns and create marks', () => {`
- L51: `it('should not match plain text', () => {`
- L62: `it('should skip processing when attrs returns false', () => {`
- L82: `it('should use shouldSkip to skip bold text', () => {`

## `../prosekit/packages/core/src/extensions/mark-spec.spec.ts`

- L10: `describe('defineMarkSpec', () => {`
- L11: `it('can merge mark specs', () => {`
- L62: `describe('defineMarkAttr', () => {`
- L63: `it('can add a new attribute', () => {`

## `../prosekit/packages/core/src/extensions/node-spec.spec.ts`

- L12: `describe('defineNodeSpec', () => {`
- L13: `it('can merge node specs', () => {`
- L65: `it('can reuse schema', () => {`
- L111: `describe('defineNodeAttr', () => {`
- L112: `it('can add a new attribute', () => {`

## `../prosekit/packages/core/src/extensions/paste-rule.spec.ts`

- L41: `describe('paste rule', () => {`
- L42: `it('can transform pasted HTML', () => {`
- L53: `it('can transform pasted text', () => {`
- L64: `it('can order multiple paste rules', () => {`

## `../prosekit/packages/core/src/extensions/plugin.spec.ts`

- L11: `describe('plugin', () => {`
- L12: `it('maintains plugin order in state based on priority', () => {`
- L66: `it('calls handlers in priority order with highest priority first', () => {`

## `../prosekit/packages/core/src/facets/facet-extension.spec.ts`

- L12: `describe('facet extension', () => {`
- L72: `it('can merge payloads', () => {`
- L112: `it('can skip unnecessary update', () => {`

## `../prosekit/packages/core/src/facets/facet-node.spec.ts`

- L17: `test('Root Facet Node', () => {`
- L56: `test('Singleton Root Facet Node', () => {`
- L110: `test('Union Facet Node', () => {`
- L165: `test('Subtract Facet Node', () => {`
- L222: `test('Union Facet Node with Different Facet', () => {`
- L241: `test('Subtract Facet Node with Different Facet', () => {`

## `../prosekit/packages/core/src/facets/facet.spec.ts`

- L44: `test('Root Facet', () => {`
- L59: `test('Child Facet', () => {`

## `../prosekit/packages/core/src/facets/state.spec.ts`

- L10: `describe('state', () => {`
- L11: `it('uses doc from extension with highest priority', () => {`
- L29: `it('uses doc from last extension when all have same priority', () => {`

## `../prosekit/packages/core/src/test/clipboard.spec.ts`

- L10: `it('pastes plain text into the editor', () => {`
- L21: `it('pastes HTML into the editor', () => {`
- L32: `it('pastes files into the editor', async () => {`
- L52: `it('reads back text copied from the editor', async () => {`

## `../prosekit/packages/core/src/test/test-editor.spec.ts`

- L5: `describe('TestEditor', () => {`
- L6: `it('should create nodes and marks', () => {`
- L38: `it('should set text selection', () => {`
- L75: `it('should set node selection', () => {`

## `../prosekit/packages/core/src/test/test-selection.spec.ts`

- L8: `describe('extractSelection', () => {`
- L9: `it('returns a TextSelection when <a> resolves inside inline content', () => {`
- L23: `it('returns a collapsed TextSelection when only <a> is present', () => {`
- L37: `it('supports a reversed selection when <b> precedes <a>', () => {`
- L51: `it('returns a NodeSelection when <a> resolves inside a block parent', () => {`
- L64: `it('returns undefined when the document has no tags', () => {`

## `../prosekit/packages/core/src/types/extension.spec.ts`

- L6: `test('ExtractTyping', () => {`

## `../prosekit/packages/core/src/types/pick-string-literal.spec.ts`

- L6: `test('PickStringLiteral', () => {`

## `../prosekit/packages/core/src/types/pick-sub-type.spec.ts`

- L6: `test('PickSubType', () => {`

## `../prosekit/packages/core/src/types/simplify-deeper.spec.ts`

- L7: `test('SimplifyDeeper', () => {`

## `../prosekit/packages/core/src/types/simplify-union.spec.ts`

- L6: `test('SimplifyUnion', () => {`

## `../prosekit/packages/core/src/utils/array-grouping.spec.ts`

- L5: `test('groupEntries', () => {`

## `../prosekit/packages/core/src/utils/clsx.spec.ts`

- L5: `test('joins class names', () => {`
- L9: `test('filters falsy values', () => {`

## `../prosekit/packages/core/src/utils/combine-event-handlers.spec.ts`

- L5: `test('runs handlers in reverse order and stops on true', () => {`
- L17: `test('returns false when all handlers return false', () => {`

## `../prosekit/packages/core/src/utils/editor-content.spec.ts`

- L8: `test('getEditorSelection', () => {`

## `../prosekit/packages/core/src/utils/find-parent-node.spec.ts`

- L7: `describe('findParentNode', () => {`
- L8: `it('finds parent node with cursor directly inside', () => {`
- L33: `it('can handle the top-level node', () => {`

## `../prosekit/packages/core/src/utils/get-mark-range.spec.ts`

- L9: `test('getMarkRange finds the run touching the position', () => {`
- L22: `test('getMarkRange splits neighbouring marks that differ in attributes', () => {`
- L33: `test('getMarkRange filters by attributes', () => {`
- L42: `test('getMarkRange returns the matched mark', () => {`

## `../prosekit/packages/core/src/utils/is-mark-absent.spec.ts`

- L7: `test('isMarkAbsent', () => {`

## `../prosekit/packages/core/src/utils/is-node-active.spec.ts`

- L8: `describe('isNodeActive', () => {`
- L9: `it('should return true when cursor is in a node of the specified type', () => {`
- L16: `it('should return false when cursor is not in a node of the specified type', () => {`
- L23: `it('should return true when cursor is in a nested node of the specified type', () => {`
- L30: `it('should return true when cursor is in a node with matching attributes', () => {`
- L37: `it('should return false when cursor is in a node with non-matching attributes', () => {`
- L44: `it('should return true when using NodeSelection with matching type', () => {`
- L56: `it('should return true when using NodeSelection with matching type and attributes', () => {`
- L68: `it('should return false when using NodeSelection with non-matching attributes', () => {`
- L80: `it('should work with NodeType instead of string', () => {`
- L87: `it('should return true when node is at any depth in the hierarchy', () => {`
- L96: `it('should return true when attributes is null', () => {`
- L103: `it('should match partial attributes', () => {`

## `../prosekit/packages/core/src/utils/is-subset.spec.ts`

- L5: `test('isSubset', () => {`

## `../prosekit/packages/core/src/utils/maybe-run.spec.ts`

- L5: `test('executes function argument', () => {`
- L11: `test('returns value when not a function', () => {`
- L16: `test('provides precise inference', () => {`
- L24: `test('can prevent unexpected arguments', () => {`

## `../prosekit/packages/core/src/utils/merge-objects.spec.ts`

- L6: `test('merge simple objects', () => {`
- L15: `test('skip undefined values and override', () => {`
- L24: `test('ignore null and undefined inputs', () => {`

## `../prosekit/packages/core/src/utils/object-equal.spec.ts`

- L5: `test('objects with same keys and values are equal', () => {`
- L9: `test('different keys result in inequality', () => {`
- L13: `test('nested objects are compared recursively', () => {`
- L19: `test('nested objects with different values are not equal', () => {`

## `../prosekit/packages/core/src/utils/output-spec.test.ts`

- L6: `describe('insertOutputSpecAttrs', () => {`
- L7: `it('should insert attrs into an array without attributes', () => {`
- L27: `it('should insert attrs into an array with attributes', () => {`
- L48: `it('should insert attrs into an element', () => {`
- L69: `it('should insert attrs into an object ', () => {`

## `../prosekit/packages/core/src/utils/parse.spec.ts`

- L8: `describe('parse', () => {`
- L21: `test('nodeFromElement', () => {`
- L25: `test('nodeFromHTML', () => {`
- L29: `test('elementFromHTML', () => {`
- L33: `test('htmlFromNode', () => {`

## `../prosekit/packages/core/src/utils/remove-undefined-values.spec.ts`

- L5: `test('removeUndefinedValues', () => {`

## `../prosekit/packages/core/src/utils/split-text-by-regex.spec.ts`

- L5: `describe('splitTextByRegex', () => {`
- L6: `it('should return undefined when no matches are found', () => {`
- L11: `it('should split text with single match', () => {`
- L20: `it('should split text with multiple matches', () => {`
- L31: `it('should handle match at the beginning', () => {`
- L39: `it('should handle match at the end', () => {`
- L47: `it('should handle consecutive matches', () => {`
- L59: `it('should handle entire string match', () => {`
- L66: `it('should work with URL regex', () => {`
- L76: `it('should reset regex lastIndex', () => {`
- L88: `it('should return undefined for zero-width matches', () => {`

## `../prosekit/packages/core/src/utils/unicode.spec.ts`

- L5: `test('constant value', () => {`

## `../prosekit/packages/extensions/src/autocomplete/autocomplete.spec.ts`

- L73: `describe('defineAutocomplete', () => {`
- L74: `it('can trigger onEnter', async () => {`
- L93: `it('can trigger onLeave', async () => {`
- L110: `it('can delete the matched text', async () => {`
- L124: `it('can ignore the match by calling \`ignoreMatch\`', async () => {`
- L153: `it('can dismiss the match by deleting the matched text', async () => {`
- L168: `it('can recover the match after dismissing from Backspace', async () => {`
- L187: `it('can recover the match after dismissing from onLeave', async () => {`
- L212: `it('can start a new match after dismissing the previous match', async () => {`
- L241: `it('does not open from a programmatic insert, but opens via triggerAutocomplete', () => {`
- L257: `it('triggerAutocomplete does nothing when no rule matches at the cursor', () => {`
- L266: `it('can dismiss the match by creating a new paragraph', async () => {`
- L284: `it('can keep the match when selecting the text', async () => {`
- L302: `it('can ignore the match by moving the text cursor outside of the match', async () => {`
- L372: `describe('followCursor', () => {`
- L373: `it('extends the match when the cursor moves right over existing text', async () => {`
- L392: `it('shrinks the match when the cursor moves left', async () => {`
- L411: `it('deletes the traversed text together with the match', async () => {`
- L427: `it('closes without a sticky ignore when the cursor moves before the match start', async () => {`
- L448: `it('keeps the sticky dismissal without followCursor', async () => {`
- L463: `it('closes without ignoring when the cursor leaves the textblock', async () => {`
- L481: `it('extends the match on a programmatic cursor move', async () => {`
- L492: `it('keeps the default dismissal for pointer-driven selection', async () => {`
- L507: `it('keeps the match while extending a selection inside it', async () => {`
- L522: `it('closes when the cursor moves more than MAX_MATCH past the match start', async () => {`
- L533: `it('stays ignored after ignoreMatch', async () => {`

## `../prosekit/packages/extensions/src/background-color/background-color-commands.spec.ts`

- L5: `describe('addBackgroundColor', () => {`
- L6: `it('can add background color to text', () => {`
- L21: `it('can override existing background color', () => {`
- L47: `describe('removeBackgroundColor', () => {`
- L48: `it('can remove background color from text', () => {`

## `../prosekit/packages/extensions/src/background-color/background-color-spec.spec.ts`

- L6: `describe('defineBackgroundColorSpec', () => {`
- L7: `it('should render background color as inline span with style attribute', () => {`
- L69: `it('should parse background color from style attribute', () => {`
- L90: `it('should parse background color from data-background-color attribute', () => {`
- L111: `it('should prioritize data-background-color attribute over style attribute', () => {`
- L132: `it('should not parse span with background-color: inherit', () => {`
- L154: `it('should preserve both background-color and text-color marks', () => {`
- L187: `it('should preserve background-color mark when parsing HTML with both marks', () => {`
- L219: `it('should handle background color on partial text selection', () => {`
- L248: `it('should handle multiple adjacent background colors', () => {`

## `../prosekit/packages/extensions/src/blockquote/blockquote-keymap.spec.ts`

- L6: `describe('blockquote keymap', () => {`
- L7: `it('should wrap paragraph into blockquote with shortcut', async () => {`
- L19: `it('should lift blockquote up with shortcut', async () => {`
- L30: `it('should unset blockquote when press backspace at the beginning of blockquote', async () => {`

## `../prosekit/packages/extensions/src/bold/bold-input-rule.spec.ts`

- L6: `describe('defineBoldInputRule', () => {`
- L8: `it('should add bold marks when typing "**"', async () => {`
- L28: `it('should not add bold marks when typing "**" inside a code block', async () => {`
- L38: `it('should not add bold marks when typing "**" inside a code mark', async () => {`

## `../prosekit/packages/extensions/src/code-block/code-block-preview.spec.ts`

- L23: `describe('isCodeBlockPreviewHiddenDecoration', () => {`
- L24: `it('returns true for a decoration with the HIDE_CODE_BLOCK_PREVIEW spec', () => {`
- L29: `it('returns false for a decoration with a different spec', () => {`
- L34: `it('returns false for an inline decoration without spec', () => {`
- L40: `describe('defineCodeBlockPreviewPlugin', () => {`
- L41: `it('adds hide-preview decoration when cursor is inside a code block', () => {`
- L52: `it('does not add decorations when cursor is outside a code block', () => {`
- L64: `it('adds decorations for code blocks overlapped by a non-empty selection', () => {`
- L77: `it('only decorates the code block where the cursor is', () => {`
- L90: `it('returns empty decoration set when document has no code blocks', () => {`
- L101: `it('handles cursor at the start of a code block', () => {`
- L113: `it('handles cursor at the end of a code block', () => {`

## `../prosekit/packages/extensions/src/code-block/code-block-spec.spec.ts`

- L8: `describe('defineCodeBlockSpec', () => {`
- L9: `it('can parse and serialize code blocks', () => {`
- L109: `it('can parse html generated by remark', () => {`
- L143: `it('can generate html that can be parsed by remark', () => {`

## `../prosekit/packages/extensions/src/file/file-paste-handler.spec.ts`

- L37: `describe('file paste handler', () => {`
- L59: `it('should handle file pasting', () => {`
- L66: `it('should handle priority', () => {`
- L73: `it('should handle multiple files', () => {`

## `../prosekit/packages/extensions/src/font-family/font-family-commands.spec.ts`

- L5: `describe('addFontFamily', () => {`
- L6: `it('can add font-family to text', () => {`
- L21: `it('can override existing font-family', () => {`
- L47: `describe('removeFontFamily', () => {`
- L48: `it('can remove font-family from text', () => {`

## `../prosekit/packages/extensions/src/font-family/font-family-spec.spec.ts`

- L6: `describe('defineFontFamilySpec', () => {`
- L7: `it('should render font-family as inline span with style attribute', () => {`
- L48: `it('should parse font-family from style attribute', () => {`
- L69: `it('should parse font-family from data-font-family attribute', () => {`
- L90: `it('should prioritize data-font-family attribute over style attribute', () => {`
- L111: `it('can handle non-span inline elements', () => {`
- L174: `it('should ignore empty attributes', () => {`
- L187: `it('should ignore inherit attributes', () => {`

## `../prosekit/packages/extensions/src/hard-break/hard-break-keymap.spec.ts`

- L7: `describe('defineHardBreakKeymap', () => {`
- L8: `it('should insert hard break', async () => {`
- L25: `it('can continue to type after a hard break', async () => {`

## `../prosekit/packages/extensions/src/heading/heading-keymap.spec.ts`

- L6: `describe('defineHeadingKeymap', () => {`
- L7: `it('should toggle heading', async () => {`
- L26: `it('should unset heading by pressing Backspace', async () => {`
- L38: `it('should unset heading by pressing Backspace around text', async () => {`

## `../prosekit/packages/extensions/src/highlight/highlight-commands.spec.ts`

- L11: `describe('command', () => {`
- L21: `describe('toggleHighlight', () => {`
- L22: `it('can add and remove highlight', () => {`

## `../prosekit/packages/extensions/src/highlight/highlight-input-rule.spec.ts`

- L6: `describe('defineHighlightInputRule', () => {`
- L8: `it('should add highlight marks when typing "=="', async () => {`
- L28: `it('should not add highlight marks when typing "==" inside a code block', async () => {`
- L38: `it('should not add highlight marks when typing "==" inside a code mark', async () => {`

## `../prosekit/packages/extensions/src/horizontal-rule/horizontal-rule-commands.spec.ts`

- L5: `describe('insertHorizontalRule', () => {`
- L8: `it('should insert a horizontal rule in an empty paragraph', () => {`
- L18: `it('should insert a horizontal rule after some text', () => {`
- L28: `it('should insert a horizontal rule before some text', () => {`
- L38: `it('should insert a horizontal rule between some text', () => {`
- L48: `it('should keep the selected text', () => {`

## `../prosekit/packages/extensions/src/horizontal-rule/horizontal-rule-input-rule.spec.ts`

- L7: `describe('defineHorizontalRuleInputRule', () => {`
- L9: `it('should insert when typing "---" in an empty paragraph', async () => {`
- L24: `it('should insert when typing "---"  before some text', async () => {`
- L39: `it('should not insert when typing "---"  after some text', async () => {`
- L49: `it('should not insert inside a code block', async () => {`
- L59: `it('should replace an otherwise-empty bullet list item', async () => {`
- L69: `it('should replace an otherwise-empty ordered list item', async () => {`
- L79: `it('should replace only the list item under the caret', async () => {`
- L89: `it('should keep a list item that still has other content', async () => {`
- L99: `it('should replace a nested list item inside its parent item', async () => {`
- L109: `it('should insert inside when the parent allows a horizontal rule', async () => {`
- L122: `it('should not insert when the parent forbids a horizontal rule', async () => {`

## `../prosekit/packages/extensions/src/horizontal-rule/horizontal-rule-spec.spec.ts`

- L32: `describe('defineHorizontalRuleSpec', () => {`
- L33: `it('persists a node attribute through a DOM round-trip', () => {`
- L49: `it('parses a bare <hr> as a horizontal rule', () => {`

## `../prosekit/packages/extensions/src/image/image-commands/upload-image.spec.ts`

- L12: `describe('uploadImage', () => {`
- L13: `it('should insert image at current selection by default', async () => {`
- L27: `it('should insert image at specified position', async () => {`
- L47: `it('should replace existing image when replace=true', async () => {`
- L74: `it('should not replace existing image when replace=false', async () => {`
- L100: `it('should insert image when replace=true but position has non-image node', async () => {`
- L125: `it('should call onError when upload fails', async () => {`
- L150: `describe('replaceImageURL', () => {`
- L151: `it('should replace single image URL', () => {`
- L165: `it('should replace multiple image URLs', () => {`
- L181: `it('should not replace images with different URLs', () => {`
- L196: `it('should do nothing when no images match', () => {`

## `../prosekit/packages/extensions/src/italic/italic-commands.spec.ts`

- L11: `describe('command', () => {`
- L20: `describe('toggleItalic', () => {`
- L21: `it('can add and remove italic', () => {`

## `../prosekit/packages/extensions/src/italic/italic-input-rule.spec.ts`

- L6: `describe('defineItalicInputRule', () => {`
- L8: `it('should add italic marks when typing "*"', async () => {`

## `../prosekit/packages/extensions/src/link/index.spec.ts`

- L7: `describe('defineLinkCommands', () => {`
- L14: `it('should add a link', () => {`
- L20: `it('should remove a link', () => {`
- L26: `it('should toggle a link', () => {`
- L34: `it('should expand the selection to cover the link', () => {`
- L43: `describe('defineLinkInputRule', () => {`
- L44: `it('should insert a link after pressing Space', async () => {`
- L56: `it('should handle a link before a period', async () => {`
- L73: `describe('defineLinkEnterRule', () => {`
- L74: `it('should insert a link after pressing Enter', async () => {`

## `../prosekit/packages/extensions/src/link/link-paste-rule.spec.ts`

- L6: `describe('defineLinkPasteRule', () => {`
- L9: `it('should convert URLs to links when pasting plain text', () => {`
- L24: `it('should handle multiple URLs in pasted text', () => {`
- L40: `it('should handle URLs without protocol', () => {`
- L55: `it('should not modify text without URLs', () => {`
- L66: `it('should preserve existing marks when adding links', () => {`
- L81: `it('should not convert URLs inside existing links', () => {`
- L94: `it('should not convert URLs inside code blocks', () => {`
- L105: `it('should not convert URLs inside code marks', () => {`
- L116: `it('should handle URLs with paths and query parameters', () => {`
- L130: `it('should handle URLs at the beginning of text', () => {`
- L144: `it('should handle URLs at the end of text', () => {`
- L158: `it('should handle URLs with punctuation after them', () => {`
- L173: `it('should handle URLs inside nested block structures', () => {`

## `../prosekit/packages/extensions/src/link/link-regex.spec.ts`

- L5: `describe('LINK_MARK_RE', () => {`
- L73: `it.each(cases)('should handle %s', (str, expected) => {`

## `../prosekit/packages/extensions/src/list/list-keymap.spec.ts`

- L6: `describe('keymap', () => {`
- L9: `it('can update indentation', async () => {`

## `../prosekit/packages/extensions/src/list/list-types.spec.ts`

- L8: `test('ListAttrs', () => {`

## `../prosekit/packages/extensions/src/list/list.spec.ts`

- L14: `describe('defineList', () => {`
- L15: `it('can add list node', () => {`
- L28: `it('can copy lists as native HTML <li> elements', async () => {`
- L135: `it('can generate html that can be parsed by remark', () => {`

## `../prosekit/packages/extensions/src/mark-rule/mark-rule.spec.ts`

- L11: `describe('defineMarkRule', () => {`
- L59: `it('can match tag', () => {`
- L66: `it('can match link', () => {`
- L75: `it('can match link with anchor', () => {`
- L84: `it('can match email', () => {`
- L93: `it('can match email and tag', () => {`

## `../prosekit/packages/extensions/src/page/page-break-commands.spec.ts`

- L25: `describe('insertPageBreak', () => {`
- L26: `it('should insert a page break in an empty paragraph', () => {`
- L35: `it('should insert a page break after text', () => {`
- L44: `it('should insert a page break before text', () => {`
- L53: `it('should insert a page break between text', () => {`

## `../prosekit/packages/extensions/src/search/search.spec.ts`

- L28: `describe('setSearchQuery', () => {`
- L31: `it('selects the first match at or after the caret', () => {`
- L40: `it('is case-insensitive by default', () => {`
- L49: `it('stays on the current match while the query is refined', () => {`
- L62: `it('collapses the selection when the query stops matching', () => {`
- L78: `it('keeps a manual selection when the query has no match', () => {`
- L89: `it('clears the matches on an empty query without moving the selection', () => {`
- L103: `describe('findNext and findPrev', () => {`
- L106: `it('wraps forward and backward through the matches', () => {`
- L122: `describe('getSearchStatus', () => {`
- L125: `it('reports no active match after the selection moves off one', () => {`
- L135: `describe('defineSearchStatusHandler', () => {`
- L146: `it('reports search status changes', () => {`

## `../prosekit/packages/extensions/src/table/table-commands/delete-cell-selection.spec.ts`

- L7: `describe('deleteCellSelection', () => {`
- L8: `it('can clear the content in the selected table cells', () => {`

## `../prosekit/packages/extensions/src/table/table-commands/exit-table.spec.ts`

- L6: `describe('exitTable', () => {`
- L7: `it('can exist a table', async () => {`

## `../prosekit/packages/extensions/src/table/table-commands/insert-table.spec.ts`

- L5: `describe('insertTable', () => {`
- L6: `it('can insert a table', () => {`
- L21: `it('can insert a table with header', () => {`

## `../prosekit/packages/extensions/src/table/table-commands/move-table-column.spec.ts`

- L24: `describe('moveTableColumn', () => {`
- L25: `describe('on a simple table', () => {`
- L26: `it('should move column right-to-left', () => {`
- L49: `it('should move column left-to-right', () => {`
- L72: `it('should select column after moving with select option', () => {`
- L93: `describe('on a table with merged cells', () => {`
- L94: `it('should move columns merged at first line', () => {`
- L117: `it('should move columns merged at middle line', () => {`
- L140: `it('should move columns merged at last line', () => {`
- L163: `it('should move and keep table headers', () => {`
- L186: `it('should move and keep columns headers', () => {`
- L210: `describe('on a table with merged rows', () => {`
- L211: `it('should move columns', () => {`
- L234: `it('should move columns for multi rows merged', () => {`
- L257: `it('should move columns between two merged rows', () => {`
- L280: `it('should move column between column with merged row and regular columns', () => {`
- L304: `describe('on a complex table with merged cells and rows', () => {`
- L305: `it('keep the merged content columns order', () => {`
- L328: `describe('when the first line all columns are merged', () => {`
- L329: `it('should not move columns', () => {`
- L354: `describe('on a simple table with col header', () => {`
- L355: `it('should move column 0 -> 2', () => {`
- L378: `it('should move column 2 -> 0', () => {`
- L401: `it('should move column 1 -> 2', () => {`
- L425: `describe('on a simple table with row header', () => {`
- L426: `it('should move column 0 -> 2', () => {`
- L449: `it('should move column 2 -> 0', () => {`
- L472: `it('should move column 1 -> 2', () => {`
- L496: `describe('on a simple table with col & row header', () => {`
- L497: `it('should move column 0 -> 2', () => {`
- L520: `it('should move column 2 -> 0', () => {`
- L543: `it('should move column 1 -> 2', () => {`
- L567: `describe('table with headers and varying cell types', () => {`
- L568: `it('should move column 2 to 0', () => {`
- L591: `it('should move column 0 to 2', () => {`

## `../prosekit/packages/extensions/src/table/table-commands/move-table-row.spec.ts`

- L24: `describe('moveTableRow', () => {`
- L25: `describe('on a simple table', () => {`
- L26: `it('should move row bottom-to-top', () => {`
- L49: `it('should move row top-to-bottom', () => {`
- L72: `it('should select row after moving with select option', () => {`
- L93: `describe('on a table with merged cells', () => {`
- L94: `it('should move columns merged at first line', () => {`
- L117: `it('should move lines with columns merged at last line', () => {`
- L140: `it('should move and keep table headers', () => {`
- L164: `describe('on a table with merged rows', () => {`
- L165: `it('should move rows', () => {`
- L189: `describe('on a simple table with header', () => {`
- L190: `it('should move row header top-to-bottom', () => {`
- L213: `it('should move row header bottom-to-top', () => {`
- L236: `it('should move col header top-to-bottom', () => {`
- L259: `it('should move col header bottom-to-top', () => {`
- L282: `it('should move row header correctly within a single column table', () => {`
- L305: `it('should move col header correctly within a single column table', () => {`
- L329: `describe('table with varying row node sizes', () => {`
- L330: `it('should move row from top-to-bottom', () => {`
- L353: `it('should move row from bottom-to-top', () => {`

## `../prosekit/packages/extensions/src/table/table-commands/select-table-cell.spec.ts`

- L7: `describe('selectTableCell', () => {`
- L8: `it('can select a table cell', () => {`

## `../prosekit/packages/extensions/src/table/table-commands/select-table-column.spec.ts`

- L6: `describe('selectTableColumn', () => {`
- L7: `it('can select the whole table column', () => {`

## `../prosekit/packages/extensions/src/table/table-commands/select-table-row.spec.ts`

- L6: `describe('selectTableRow', () => {`
- L7: `it('can select the whole table row', () => {`

## `../prosekit/packages/extensions/src/table/table-commands/select-table.spec.ts`

- L6: `describe('selectTable', () => {`
- L7: `it('can select the whole table', () => {`

## `../prosekit/packages/extensions/src/table/table-spec.spec.ts`

- L10: `describe('table spec', () => {`
- L11: `it('should be defined', () => {`

## `../prosekit/packages/extensions/src/text-color/text-color-commands.spec.ts`

- L5: `describe('addTextColor', () => {`
- L6: `it('can add color to text', () => {`
- L21: `it('can override existing color', () => {`
- L47: `describe('removeColor', () => {`
- L48: `it('can remove color from text', () => {`

## `../prosekit/packages/extensions/src/text-color/text-color-spec.spec.ts`

- L6: `describe('defineTextColorSpec', () => {`
- L7: `it('should render color as inline span with style attribute', () => {`
- L69: `it('should parse color from style attribute', () => {`
- L90: `it('should parse color from data-text-color attribute', () => {`
- L111: `it('should prioritize data-text-color attribute over style attribute', () => {`
- L132: `it('can handle non-span inline elements', () => {`
- L195: `it('should ignore empty attributes', () => {`
- L208: `it('should ignore inherit attributes', () => {`
- L221: `it('can handle block elements', () => {`

## `../prosekit/packages/extensions/src/virtual-selection/index.spec.ts`

- L88: `describe('defineVirtualSelection', () => {`
- L89: `it('shows the selection as a decoration after blur', () => {`
- L99: `it('follows selection changes dispatched while blurred', () => {`
- L110: `it('keeps the decoration through doc changes', () => {`
- L120: `it('removes the decoration before pointer focus in a nested editable node view', async () => {`
- L139: `it('keeps the decoration for non-editable controls and secondary pointers', async () => {`

## `../prosekit/packages/preact/src/extensions/preact-node-view.spec.ts`

- L13: `describe('PreactNodeView', () => {`
- L89: `it('can render a single self-update image node', async () => {`
- L118: `it('can render multiple self-update image nodes', async () => {`

## `../prosekit/packages/react/src/extensions/react-node-view.spec.ts`

- L12: `describe('ReactNodeView', () => {`
- L88: `it('can render a single self-update image node', async () => {`
- L117: `it('can render multiple self-update image nodes', async () => {`

## `../prosekit/packages/solid/src/extensions/solid-node-view.spec.tsx`

- L12: `describe('SolidNodeView', () => {`
- L81: `it('can render a single self-update image node', async () => {`
- L110: `it('can render multiple self-update image nodes', async () => {`

## `../prosekit/packages/svelte/src/extensions/svelte-node-view.spec.ts`

- L9: `describe('SvelteNodeView', () => {`
- L25: `it('can render a single self-update image node', async () => {`
- L54: `it('can render multiple self-update image nodes', async () => {`

## `../prosekit/packages/vue/src/extensions/vue-node-view.spec.ts`

- L12: `describe('VueNodeView', () => {`
- L96: `it('can render a single self-update image node', async () => {`
- L125: `it('can render multiple self-update image nodes', async () => {`

## `../prosekit/packages/vue/src/hooks/use-extension.spec.ts`

- L13: `describe('useExtension', () => {`
- L14: `it('should register and dispose an extension', async () => {`
- L43: `it('should not print warning if the editor context is not available', () => {`

## `../prosekit/packages/web/src/components/autocomplete/helpers.spec.ts`

- L5: `describe('defaultQueryBuilder', () => {`
- L6: `it('can remove extra spaces', () => {`
- L12: `it('can remove punctuations', () => {`

## `../prosekit/packages/web/src/components/resizable/calc-resize.spec.ts`

- L5: `test('calcBottomRightResize', () => {`
- L36: `test('calcBottomLeftResize', () => {`
- L67: `test('calcTopRightResize', () => {`
- L98: `test('calcTopLeftResize', () => {`
- L129: `test('calcTopResize', () => {`
- L159: `test('calcRightResize', () => {`
- L189: `test('sizes are clamped to positive values', () => {`
- L196: `test('calcBottomResize', () => {`
- L226: `test('calcLeftResize', () => {`

## `../prosekit/packages/web/src/utils/lazy-signal.spec.ts`

- L6: `describe('createLazySignal', () => {`
- L7: `it('returns fallback when remote is undefined', () => {`
- L12: `it('delegates get to remote when resolved', () => {`
- L18: `it('delegates set to remote when resolved', () => {`
- L25: `it('set is a no-op when remote is undefined', () => {`
- L31: `it('propagates reactivity when remote is bound late', () => {`
- L49: `it('releases old dependency when remote is reparented', () => {`

## `../prosekit/packages/web/src/utils/resolve-anchor.spec.ts`

- L6: `describe('resolveAnchor', () => {`
- L7: `it('returns undefined for null', () => {`
- L11: `it('returns the element for an element', () => {`
- L16: `it('returns the virtual element for a virtual element', () => {`
- L23: `it('calls a function anchor and returns its result', () => {`
- L28: `it('returns undefined when a function anchor returns null', () => {`

## `../prosekit/registry/test/block-handle.test.ts`

- L20: `it('has enough space for an empty editor', async () => {`
- L27: `it('show block handle on hover', async () => {`
- L94: `it(\`position the block handle when hovering over a list node with multiple paragraphs\`, async () => {`
- L143: `it('writes ProseMirror clipboard data when dragging the handle', async () => {`

## `../prosekit/registry/test/blockquote.test.ts`

- L9: `it('toggle blockquote on current paragraph', async () => {`

## `../prosekit/registry/test/bold.test.ts`

- L9: `it('toggle via toolbar while typing', async () => {`

## `../prosekit/registry/test/change-tracking.test.ts`

- L9: `it('save commits and restore previous version', async () => {`

## `../prosekit/registry/test/code-block-themes.test.ts`

- L11: `it('code-block-themes', async () => {`

## `../prosekit/registry/test/code-block.test.ts`

- L11: `it('input rule', async () => {`
- L33: `it('enter rule', async () => {`

## `../prosekit/registry/test/code.test.ts`

- L9: `it('toggle code mark via toolbar', async () => {`

## `../prosekit/registry/test/drop-cursor.test.ts`

- L9: `it('reorders images by HTML5 drag-and-drop', async () => {`

## `../prosekit/registry/test/emoji-rules.test.ts`

- L10: `it('convert :apple: and :banana: on Enter', async () => {`

## `../prosekit/registry/test/full.test.ts`

- L13: `it('default content', async () => {`
- L20: `describe('link', () => {`
- L21: `it('press Space to insert a link', async () => {`
- L39: `it('press Space to insert a link ends with a period', async () => {`
- L57: `it('press Enter to insert', async () => {`
- L75: `it('press Enter to insert a link ends with a period', async () => {`
- L94: `describe('mark input rules', () => {`
- L95: `it('bold', async () => {`
- L117: `it('italic', async () => {`
- L136: `it('code', async () => {`
- L155: `it('strike', async () => {`
- L178: `describe('toolbar', () => {`
- L179: `it('press Space to insert an image', async () => {`

## `../prosekit/registry/test/gap-cursor.test.ts`

- L17: `it('shows gap cursor between stacked images', async () => {`

## `../prosekit/registry/test/hard-break.test.ts`

- L10: `it('insert hard break via toolbar and keyboard', async () => {`

## `../prosekit/registry/test/heading.test.ts`

- L9: `it('input rule', async () => {`

## `../prosekit/registry/test/horizontal-rule.test.ts`

- L9: `it('insert divider and continue typing', async () => {`

## `../prosekit/registry/test/image-view.test.ts`

- L11: `it('renders default images', async () => {`
- L22: `it('selects image on click', async () => {`

## `../prosekit/registry/test/inline-menu.test.ts`

- L20: `it('show and dismiss', async () => {`
- L52: `it('multiple empty paragraphs selection', async () => {`
- L79: `it('inline mark', async () => {`
- L103: `it('inline link', async () => {`

## `../prosekit/registry/test/italic.test.ts`

- L9: `it('toggle via toolbar while typing', async () => {`

## `../prosekit/registry/test/katex.test.ts`

- L9: `it('should render content correctly', async () => {`
- L48: `it('should show and hide source and display based on cursor position', async () => {`

## `../prosekit/registry/test/keymap.test.ts`

- L10: `it('keymap', async () => {`

## `../prosekit/registry/test/link-mark-view.test.ts`

- L9: `it('link-mark-view', async () => {`

## `../prosekit/registry/test/link.test.ts`

- L9: `it('add, show, and remove link via inline menu', async () => {`

## `../prosekit/registry/test/list-custom-checkbox.test.ts`

- L9: `it('list-custom-checkbox', async () => {`

## `../prosekit/registry/test/list.test.ts`

- L24: `it('toggle bullet list', async () => {`
- L39: `it('toggle ordered list', async () => {`
- L54: `it('toggle task list', async () => {`
- L68: `it('toggle toggle-list', async () => {`

## `../prosekit/registry/test/loro.test.ts`

- L8: `it('synchronizes content across two editors', async () => {`

## `../prosekit/registry/test/mark-rule.test.ts`

- L9: `it('hashtag', async () => {`
- L57: `it('link', async () => {`

## `../prosekit/registry/test/minimal.test.ts`

- L8: `it('typing', async () => {`

## `../prosekit/registry/test/page.test.ts`

- L10: `it('should render four pages by default', async () => {`
- L33: `it('should update layout after deleting a page break', async () => {`
- L68: `it('should update layout after appending a new paragraph at the end of the document', async () => {`
- L151: `if (nodeName === 'p' || /^h\d$/.test(nodeName)) {`

## `../prosekit/registry/test/placeholder.test.ts`

- L8: `it('shows when empty, hides on input, and reappears after clearing', async () => {`

## `../prosekit/registry/test/readonly.test.ts`

- L9: `it('readonly', async () => {`

## `../prosekit/registry/test/rtl.test.ts`

- No direct `describe`, `it`, or `test` call matched. Classification must rely on the file read or harness role.

## `../prosekit/registry/test/sample-content-full.test.ts`

- L5: `describe('sample content full', () => {`
- L6: `it('should render the sample content', () => {`

## `../prosekit/registry/test/save-html.test.ts`

- L19: `it('save-html', async () => {`

## `../prosekit/registry/test/save-json.test.ts`

- L19: `it('save-json', async () => {`

## `../prosekit/registry/test/save-markdown.test.ts`

- L19: `it('save-markdown', async () => {`

## `../prosekit/registry/test/search.test.ts`

- L10: `it('search', async () => {`

## `../prosekit/registry/test/slash-menu.test.ts`

- L20: `it('execute command', async () => {`
- L34: `it('filter items by typing', async () => {`
- L49: `it('ignore slash followed by a space', async () => {`
- L60: `it('press Escape to hide the menu', async () => {`
- L73: `it('remember hidden positions', async () => {`
- L130: `it('prevent focus loss when clicking menu items', async () => {`
- L152: `it('prevent focus loss when pressing Enter', async () => {`
- L174: `it('insert list', async () => {`
- L201: `it('insert blockquote', async () => {`
- L215: `it('press arrow keys to select item', async () => {`
- L245: `it('should not show menu when typing a http link', async () => {`

## `../prosekit/registry/test/strike.test.ts`

- L9: `it('toggle via toolbar while typing', async () => {`

## `../prosekit/registry/test/table.test.ts`

- L49: `it('default table content', async () => {`
- L62: `it('smoke test', async () => {`
- L70: `it('select cells by clicking handles', async () => {`
- L131: `it('insert column before', async () => {`
- L174: `it('delete column', async () => {`
- L203: `it('clear row contents', async () => {`
- L228: `it('drag column to reorder', async () => {`
- L258: `it('drag row to reorder', async () => {`

## `../prosekit/registry/test/text-align.test.ts`

- L19: `it('commands', async () => {`
- L81: `it('inheritance', async () => {`
- L104: `it('keymap', async () => {`

## `../prosekit/registry/test/text-color.test.ts`

- L9: `it('change and clear text color via inline menu', async () => {`
- L35: `it('change and clear background color via inline menu', async () => {`

## `../prosekit/registry/test/toolbar.test.ts`

- L9: `it('bold and heading buttons work', async () => {`

## `../prosekit/registry/test/tweet.test.ts`

- L9: `it('can switch between basic and advanced mode', async () => {`

## `../prosekit/registry/test/typography.test.ts`

- L9: `it('renders headings, lists, code, and media', async () => {`

## `../prosekit/registry/test/underline.test.ts`

- L9: `it('toggle via toolbar while typing', async () => {`

## `../prosekit/registry/test/unmount.test.ts`

- L24: `it('unmount', async () => {`
- L79: `it('inline menu', async () => {`

## `../prosekit/registry/test/user-menu-dynamic.test.ts`

- L10: `it('user-menu-dynamic', async () => {`

## `../prosekit/registry/test/user-menu.test.ts`

- L9: `it('insert user and tag mentions via autocomplete', async () => {`

## `../prosekit/registry/test/view-adapter.test.ts`

- L8: `it('renders atom block with custom node view', async () => {`

## `../prosekit/registry/test/word-counter.test.ts`

- L9: `it('updates counts as you type', async () => {`

## `../prosekit/registry/test/yjs.test.ts`

- L8: `it('synchronizes content across two editors', async () => {`
