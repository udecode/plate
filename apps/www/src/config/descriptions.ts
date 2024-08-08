import { KEY_ALIGN } from '@udecode/plate-alignment';
import { KEY_AUTOFORMAT } from '@udecode/plate-autoformat';
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  KEY_EXIT_BREAK,
  KEY_SINGLE_LINE,
  KEY_SOFT_BREAK,
} from '@udecode/plate-break';
import { MARK_COMMENT } from '@udecode/plate-comments';
import { KEY_DND } from '@udecode/plate-dnd';
import { KEY_EMOJI } from '@udecode/plate-emoji';
import { ELEMENT_EXCALIDRAW } from '@udecode/plate-excalidraw';
import { MARK_BG_COLOR, MARK_COLOR, MARK_FONT_SIZE } from '@udecode/plate-font';
import { MARK_HIGHLIGHT } from '@udecode/plate-highlight';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { KEY_INDENT } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '@udecode/plate-indent-list';
import { KEY_JUICE } from '@udecode/plate-juice';
import { MARK_KBD } from '@udecode/plate-kbd';
import { KEY_LINE_HEIGHT } from '@udecode/plate-line-height';
import { ELEMENT_LINK } from '@udecode/plate-link';
import { ELEMENT_TODO_LI } from '@udecode/plate-list';
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate-media';
import { ELEMENT_MENTION } from '@udecode/plate-mention';
import { KEY_NODE_ID } from '@udecode/plate-node-id';
import { KEY_NORMALIZE_TYPES } from '@udecode/plate-normalizers';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { KEY_RESET_NODE } from '@udecode/plate-reset-node';
import { KEY_DELETE, KEY_SELECT_ON_BACKSPACE } from '@udecode/plate-select';
import { KEY_BLOCK_SELECTION } from '@udecode/plate-selection';
import { KEY_DESERIALIZE_CSV } from '@udecode/plate-serializer-csv';
import { KEY_DESERIALIZE_DOCX } from '@udecode/plate-serializer-docx';
import { KEY_DESERIALIZE_MD } from '@udecode/plate-serializer-md';
import { KEY_TABBABLE } from '@udecode/plate-tabbable';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { ELEMENT_TOGGLE } from '@udecode/plate-toggle';
import { KEY_TRAILING_BLOCK } from '@udecode/plate-trailing-block';

import { DragOverCursorPlugin } from '@/plate/demo/plugins/DragOverCursorPlugin';

export const descriptions: Record<string, string> = {
  [DragOverCursorPlugin.key]: 'Customize the cursor when dragging.',
  [ELEMENT_BLOCKQUOTE]: 'Highlight important text or citations.',
  [ELEMENT_EXCALIDRAW]: 'Create drawings and diagrams as block nodes.',
  [ELEMENT_HR]: 'Insert horizontal lines.',
  [ELEMENT_IMAGE]: 'Embed images into your document.',
  [ELEMENT_LINK]: 'Insert and manage hyperlinks.',
  [ELEMENT_MEDIA_EMBED]:
    'Embed medias like videos or tweets into your document.',
  [ELEMENT_MENTION]: 'Enable autocompletion for user mentions.',
  [ELEMENT_PARAGRAPH]:
    'The foundational block in your editor, serving as the default block for text entry',
  [ELEMENT_TABLE]:
    'Organize and display data in a structured and resizable tabular format.',
  [ELEMENT_TODO_LI]: 'Manage tasks within your document.',
  [ELEMENT_TOGGLE]: 'Add toggles to your document.',
  [KEY_ALIGN]: 'Align your content to different positions.',
  [KEY_AUTOFORMAT]: 'Apply formatting automatically using shortcodes.',
  [KEY_BLOCK_SELECTION]: 'Select and manipulate entire text blocks.',
  [KEY_DELETE]:
    'Remove the current block if empty when pressing delete forward',
  [KEY_DESERIALIZE_CSV]: 'Copy paste from CSV to Slate.',
  [KEY_DESERIALIZE_DOCX]: 'Copy paste from DOCX to Slate.',
  [KEY_DESERIALIZE_MD]: 'Copy paste from MD to Slate.',
  [KEY_DND]: 'Move blocks within the editor.',
  [KEY_EMOJI]: 'Enhance your text with emojis.',
  [KEY_EXIT_BREAK]: 'Exit a large block using a shortcut.',
  [KEY_INDENT]: 'Customize text indentation.',
  [KEY_JUICE]:
    'Inline CSS properties into the `style` attribute when pasting HTML.',
  [KEY_LINE_HEIGHT]: 'Adjust the height between lines of text.',
  [KEY_LIST_STYLE_TYPE]:
    'Turn any block into a list item. Alternative to List.',
  [KEY_NODE_ID]: 'Assign unique identifiers to nodes within your document.',
  [KEY_NORMALIZE_TYPES]: 'Enforce block types using rules.',
  [KEY_RESET_NODE]: 'Reset the block type using rules.',
  [KEY_SELECT_ON_BACKSPACE]:
    'Select the preceding block instead of deleting when pressing backspace.',
  [KEY_SINGLE_LINE]: 'Restrict the editor to a single block.',
  [KEY_SOFT_BREAK]:
    'Insert line breaks within a block of text without starting a new block.',
  [KEY_TABBABLE]: 'Maintain a consistent tab order for tabbable elements.',
  [KEY_TRAILING_BLOCK]:
    'Automatically add a new paragraph after the final block.',
  [MARK_BG_COLOR]: 'Add color to text backgrounds.',
  [MARK_BOLD]: 'Make your text stand out.',
  [MARK_CODE]: 'Embed code into your text.',
  [MARK_COLOR]: 'Highlight text with a specific color.',
  [MARK_COMMENT]: 'Add comments to text as marks.',
  [MARK_FONT_SIZE]: 'Adjust the size of the text.',
  [MARK_HIGHLIGHT]: 'Mark and reference text for review.',
  [MARK_ITALIC]: 'Emphasize your text.',
  [MARK_KBD]: 'Indicate keyboard inputs or commands.',
  [MARK_STRIKETHROUGH]: 'Cross out text to indicate deletion or correction.',
  [MARK_SUBSCRIPT]: 'Lower portions of your text.',
  [MARK_SUPERSCRIPT]: 'Elevate portions of your text.',
  [MARK_UNDERLINE]: 'Emphasize specific words or phrases in your text.',
  caption: 'Add captions to your blocks.',
  code_block: 'Encapsulate blocks of code.',
  column: 'Add column plugins',
  components: 'Components.',
  heading: 'Organize your document with up to 6 headings.',
  list: 'Organize nestable items in a bulleted or numbered list.',
};
