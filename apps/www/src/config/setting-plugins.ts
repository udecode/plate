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
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { KEY_COMBOBOX } from '@udecode/plate-combobox';
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
import { ELEMENT_LINK } from '@udecode/plate-link';
import { ELEMENT_TODO_LI } from '@udecode/plate-list';
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate-media';
import { ELEMENT_MENTION } from '@udecode/plate-mention';
import { KEY_NODE_ID } from '@udecode/plate-node-id';
import { KEY_NORMALIZE_TYPES } from '@udecode/plate-normalizers';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { KEY_RESET_NODE } from '@udecode/plate-reset-node';
import { KEY_SELECT_ON_BACKSPACE } from '@udecode/plate-select';
import { KEY_BLOCK_SELECTION } from '@udecode/plate-selection';
import { KEY_DESERIALIZE_DOCX } from '@udecode/plate-serializer-docx';
import { KEY_DESERIALIZE_MD } from '@udecode/plate-serializer-md';
import { KEY_TABBABLE } from '@udecode/plate-tabbable';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { KEY_TRAILING_BLOCK } from '@udecode/plate-trailing-block';

import { SettingBadge, SettingBadges } from '@/config/setting-badges';
import { KEY_DRAG_OVER_CURSOR } from '@/plate/demo/plugins/dragOverCursorPlugin';

export type CheckedId = keyof typeof SettingPlugins;

export type SettingPlugin = {
  id: string;
  label: string;
  tooltip: string;
  route?: string;
  badges?: SettingBadge[];
  dependencies?: CheckedId[];
  conflicts?: CheckedId[];
};

export const SettingPlugins = {
  [ELEMENT_BLOCKQUOTE]: {
    id: ELEMENT_BLOCKQUOTE,
    label: 'Blockquote',
    tooltip: 'Highlight important text or citations.',
    route: '/docs/basic-elements',
    badges: [SettingBadges.element],
  },
  [ELEMENT_CODE_BLOCK]: {
    id: ELEMENT_CODE_BLOCK,
    label: 'Code block',
    tooltip: 'Encapsulate blocks of code.',
    badges: [SettingBadges.element],
  },
  [ELEMENT_EXCALIDRAW]: {
    id: ELEMENT_EXCALIDRAW,
    label: 'Excalidraw',
    tooltip: 'Create drawings and diagrams as block nodes.',
    badges: [SettingBadges.element, SettingBadges.void],
  },
  [ELEMENT_HR]: {
    id: ELEMENT_HR,
    label: 'Horizontal Rule',
    tooltip: 'Insert horizontal lines.',
    badges: [SettingBadges.element, SettingBadges.void],
  },
  [ELEMENT_IMAGE]: {
    id: ELEMENT_IMAGE,
    label: 'Image',
    tooltip: 'Embed images into your document.',
    badges: [SettingBadges.element, SettingBadges.void],
  },
  [ELEMENT_LINK]: {
    id: ELEMENT_LINK,
    label: 'Link',
    tooltip: 'Insert and manage hyperlinks.',
    badges: [SettingBadges.element, SettingBadges.inline],
  },
  // add the rest in a similar manner...
  heading: {
    id: 'heading',
    label: 'Heading',
    tooltip: 'Organize your document with up to 6 headings.',
    badges: [SettingBadges.element],
  },
  list: {
    id: 'list',
    label: 'List',
    tooltip: 'Organize nestable items in a bulleted or numbered list.',
    badges: [SettingBadges.element],
    conflicts: [KEY_LIST_STYLE_TYPE],
  },
  [ELEMENT_MEDIA_EMBED]: {
    id: ELEMENT_MEDIA_EMBED,
    label: 'Media Embed',
    tooltip: 'Embed medias like videos or tweets into your document.',
    badges: [SettingBadges.element, SettingBadges.void],
  },
  [ELEMENT_MENTION]: {
    id: ELEMENT_MENTION,
    label: 'Mention',
    tooltip: 'Enable autocompletion for user mentions.',
    badges: [SettingBadges.element, SettingBadges.inline, SettingBadges.void],
    dependencies: [KEY_COMBOBOX],
  },
  [ELEMENT_PARAGRAPH]: {
    id: ELEMENT_PARAGRAPH,
    label: 'Paragraph',
    tooltip:
      'The foundational block in your editor, serving as the default block for text entry',
    badges: [SettingBadges.element],
  },
  [ELEMENT_TABLE]: {
    id: ELEMENT_TABLE,
    label: 'Table',
    tooltip:
      'Organize and display data in a structured and resizable tabular format.',
    badges: [SettingBadges.element],
  },
  [ELEMENT_TODO_LI]: {
    id: ELEMENT_TODO_LI,
    label: 'Todo List',
    tooltip: 'Manage tasks within your document.',
    badges: [SettingBadges.element],
  },
  [MARK_BOLD]: {
    id: MARK_BOLD,
    label: 'Bold',
    tooltip: 'Make your text stand out.',
    badges: [SettingBadges.leaf],
  },
  [MARK_CODE]: {
    id: MARK_CODE,
    label: 'Code',
    tooltip: 'Embed code into your text.',
    badges: [SettingBadges.leaf],
  },
  [MARK_COMMENT]: {
    id: MARK_COMMENT,
    label: 'Comments',
    tooltip: 'Add comments to text as marks.',
    badges: [SettingBadges.leaf],
  },
  [MARK_BG_COLOR]: {
    id: MARK_BG_COLOR,
    label: 'Font Background',
    tooltip: 'Add color to text backgrounds.',
    badges: [SettingBadges.style],
  },
  [MARK_COLOR]: {
    id: MARK_COLOR,
    label: 'Font Color',
    tooltip: 'Highlight text with a specific color.',
    badges: [SettingBadges.style],
  },
  [MARK_FONT_SIZE]: {
    id: MARK_FONT_SIZE,
    label: 'Font Size',
    tooltip: 'Adjust the size of the text.',
    badges: [SettingBadges.style],
  },
  [MARK_HIGHLIGHT]: {
    id: MARK_HIGHLIGHT,
    label: 'Highlight',
    tooltip: 'Mark and reference text for review.',
    badges: [SettingBadges.leaf],
  },
  [MARK_ITALIC]: {
    id: MARK_ITALIC,
    label: 'Italic',
    tooltip: 'Emphasize your text.',
    badges: [SettingBadges.leaf],
  },
  [MARK_KBD]: {
    id: MARK_KBD,
    label: 'Keyboard Input',
    tooltip: 'Indicate keyboard inputs or commands.',
    badges: [SettingBadges.leaf],
  },
  [MARK_STRIKETHROUGH]: {
    id: MARK_STRIKETHROUGH,
    label: 'Strikethrough',
    tooltip: 'Cross out text to indicate deletion or correction.',
    badges: [SettingBadges.leaf],
  },
  [MARK_SUBSCRIPT]: {
    id: MARK_SUBSCRIPT,
    label: 'Subscript',
    tooltip: 'Lower portions of your text.',
    badges: [SettingBadges.leaf],
  },
  [MARK_SUPERSCRIPT]: {
    id: MARK_SUPERSCRIPT,
    label: 'Superscript',
    tooltip: 'Elevate portions of your text.',
    badges: [SettingBadges.leaf],
  },
  [MARK_UNDERLINE]: {
    id: MARK_UNDERLINE,
    label: 'Underline',
    tooltip: 'Emphasize specific words or phrases in your text.',
    badges: [SettingBadges.leaf],
  },
  [KEY_ALIGN]: {
    id: KEY_ALIGN,
    label: 'Align',
    tooltip: 'Align your content to different positions.',
    badges: [SettingBadges.style],
  },
  [KEY_INDENT]: {
    id: KEY_INDENT,
    label: 'Indent',
    tooltip: 'Customize text indentation.',
    badges: [SettingBadges.style],
  },
  [KEY_LIST_STYLE_TYPE]: {
    id: KEY_LIST_STYLE_TYPE,
    label: 'Indent List',
    tooltip: 'Turn any block into a list item. Alternative to List.',
    badges: [SettingBadges.style],
    dependencies: [KEY_INDENT],
    conflicts: ['list'],
  },

  // Functionality
  [KEY_AUTOFORMAT]: {
    id: KEY_AUTOFORMAT,
    label: 'Autoformat',
    tooltip: 'Apply formatting automatically using shortcodes.',
    badges: [SettingBadges.handler],
  },
  [KEY_BLOCK_SELECTION]: {
    id: KEY_BLOCK_SELECTION,
    label: 'Block Selection',
    tooltip: 'Select and manipulate entire text blocks.',
    badges: [SettingBadges.ui],
  },
  [KEY_COMBOBOX]: {
    id: KEY_COMBOBOX,
    label: 'Combobox',
    tooltip: 'Select options from a predefined list.',
    badges: [SettingBadges.handler, SettingBadges.ui],
  },
  [KEY_DND]: {
    id: KEY_DND,
    label: 'Drag & Drop',
    tooltip: 'Move blocks within the editor.',
    badges: [SettingBadges.handler, SettingBadges.ui],
    dependencies: [KEY_NODE_ID],
  },
  [KEY_DRAG_OVER_CURSOR]: {
    id: KEY_DRAG_OVER_CURSOR,
    label: 'Drag Cursor',
    tooltip: 'Customize the cursor when dragging.',
    badges: [SettingBadges.handler, SettingBadges.ui],
  },
  [KEY_EMOJI]: {
    id: KEY_EMOJI,
    label: 'Emoji',
    tooltip: 'Enhance your text with emojis.',
    badges: [SettingBadges.handler],
    dependencies: [KEY_COMBOBOX],
  },
  [KEY_EXIT_BREAK]: {
    id: KEY_EXIT_BREAK,
    label: 'Exit Break',
    tooltip: 'Exit a large block using a shortcut.',
    badges: [SettingBadges.handler],
  },
  [KEY_NODE_ID]: {
    id: KEY_NODE_ID,
    label: 'Id',
    tooltip: 'Assign unique identifiers to nodes within your document.',
    badges: [SettingBadges.normalizer],
  },
  [KEY_NORMALIZE_TYPES]: {
    id: KEY_NORMALIZE_TYPES,
    label: 'Normalize Types',
    tooltip: 'Enforce block types using rules.',
    badges: [SettingBadges.normalizer],
  },
  [KEY_RESET_NODE]: {
    id: KEY_RESET_NODE,
    label: 'Reset Node',
    tooltip: 'Reset the block type using rules.',
    badges: [SettingBadges.handler],
  },
  [KEY_SELECT_ON_BACKSPACE]: {
    id: KEY_SELECT_ON_BACKSPACE,
    label: 'Select on Backspace',
    tooltip:
      'Select the preceding block instead of deleting when pressing backspace.',
    badges: [SettingBadges.handler],
  },
  [KEY_SINGLE_LINE]: {
    id: KEY_SINGLE_LINE,
    label: 'Single Line',
    tooltip: 'Restrict the editor to a single block.',
    disablePlugins: [KEY_TRAILING_BLOCK],
    badges: [SettingBadges.normalizer],
    conflicts: [KEY_TRAILING_BLOCK],
  },
  [KEY_SOFT_BREAK]: {
    id: KEY_SOFT_BREAK,
    label: 'Soft Break',
    tooltip:
      'Insert line breaks within a block of text without starting a new block.',
    badges: [SettingBadges.handler],
  },
  [KEY_TABBABLE]: {
    id: KEY_TABBABLE,
    label: 'Tabbable',
    tooltip: 'Maintain a consistent tab order for tabbable elements.',
    badges: [SettingBadges.handler],
  },
  [KEY_TRAILING_BLOCK]: {
    id: KEY_TRAILING_BLOCK,
    label: 'Trailing Block',
    tooltip: 'Automatically add a new paragraph after the final block.',
    disablePlugins: [KEY_SINGLE_LINE],
    badges: [SettingBadges.normalizer],
    conflicts: [KEY_SINGLE_LINE],
  },

  // Deserialization
  [KEY_DESERIALIZE_DOCX]: {
    id: KEY_DESERIALIZE_DOCX,
    label: 'Deserialize DOCX',
    tooltip: 'Copy paste from DOCX to Slate.',
    badges: [SettingBadges.handler],
    dependencies: [KEY_JUICE],
  },
  [KEY_DESERIALIZE_MD]: {
    id: KEY_DESERIALIZE_MD,
    label: 'Deserialize MD',
    tooltip: 'Copy paste from MD to Slate.',
    badges: [SettingBadges.handler],
  },
  [KEY_JUICE]: {
    id: KEY_JUICE,
    label: 'Juice',
    tooltip:
      'Inline CSS properties into the `style` attribute when pasting HTML.',
    badges: [SettingBadges.handler],
  },
};

export const settingPlugins = [
  {
    id: 'blocks',
    label: 'Nodes',
    children: [
      SettingPlugins[ELEMENT_BLOCKQUOTE],
      SettingPlugins[ELEMENT_CODE_BLOCK],
      SettingPlugins[ELEMENT_EXCALIDRAW],
      SettingPlugins[ELEMENT_HR],
      SettingPlugins[ELEMENT_IMAGE],
      SettingPlugins[ELEMENT_LINK],
      SettingPlugins.heading,
      SettingPlugins.list,
      SettingPlugins[ELEMENT_MEDIA_EMBED],
      SettingPlugins[ELEMENT_MENTION],
      SettingPlugins[ELEMENT_PARAGRAPH],
      SettingPlugins[ELEMENT_TABLE],
      SettingPlugins[ELEMENT_TODO_LI],
    ],
  },
  {
    id: 'marks',
    label: 'Marks',
    children: [
      SettingPlugins[MARK_BOLD],
      SettingPlugins[MARK_CODE],
      SettingPlugins[MARK_COMMENT],
      SettingPlugins[MARK_BG_COLOR],
      SettingPlugins[MARK_COLOR],
      SettingPlugins[MARK_FONT_SIZE],
      SettingPlugins[MARK_HIGHLIGHT],
      SettingPlugins[MARK_ITALIC],
      SettingPlugins[MARK_KBD],
      SettingPlugins[MARK_STRIKETHROUGH],
      SettingPlugins[MARK_SUBSCRIPT],
      SettingPlugins[MARK_SUPERSCRIPT],
      SettingPlugins[MARK_UNDERLINE],
    ],
  },
  {
    id: 'style',
    label: 'Block Style',
    children: [
      SettingPlugins[KEY_ALIGN],
      SettingPlugins[KEY_INDENT],
      SettingPlugins[KEY_LIST_STYLE_TYPE],
    ],
  },
  {
    id: 'functionality',
    label: 'Functionality',
    children: [
      SettingPlugins[KEY_AUTOFORMAT],
      SettingPlugins[KEY_BLOCK_SELECTION],
      SettingPlugins[KEY_COMBOBOX],
      SettingPlugins[KEY_DND],
      SettingPlugins[KEY_DRAG_OVER_CURSOR],
      SettingPlugins[KEY_EMOJI],
      SettingPlugins[KEY_EXIT_BREAK],
      SettingPlugins[KEY_NODE_ID],
      SettingPlugins[KEY_NORMALIZE_TYPES],
      SettingPlugins[KEY_RESET_NODE],
      SettingPlugins[KEY_SELECT_ON_BACKSPACE],
      SettingPlugins[KEY_SINGLE_LINE],
      SettingPlugins[KEY_SOFT_BREAK],
      SettingPlugins[KEY_TABBABLE],
      SettingPlugins[KEY_TRAILING_BLOCK],
    ],
  },
  {
    id: 'Deserialization',
    label: 'Deserialization',
    children: [
      SettingPlugins[KEY_DESERIALIZE_DOCX],
      SettingPlugins[KEY_DESERIALIZE_MD],
      SettingPlugins[KEY_JUICE],
    ],
  },
];
