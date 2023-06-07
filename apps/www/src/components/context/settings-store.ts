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
import { KEY_EXIT_BREAK, KEY_SOFT_BREAK } from '@udecode/plate-break';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { KEY_COMBOBOX } from '@udecode/plate-combobox';
import { MARK_COMMENT } from '@udecode/plate-comments';
import { createStore } from '@udecode/plate-common';
import { KEY_DESERIALIZE_HTML } from '@udecode/plate-core';
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
import { KEY_SELECT_ON_BACKSPACE } from '@udecode/plate-select';
import { KEY_BLOCK_SELECTION } from '@udecode/plate-selection';
import { KEY_DESERIALIZE_CSV } from '@udecode/plate-serializer-csv';
import { KEY_DESERIALIZE_DOCX } from '@udecode/plate-serializer-docx';
import { KEY_DESERIALIZE_MD } from '@udecode/plate-serializer-md';
import { KEY_TABBABLE } from '@udecode/plate-tabbable';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { KEY_TRAILING_BLOCK } from '@udecode/plate-trailing-block';

export type CheckedId =
  | 'heading'
  | 'list'
  | 'drag-over-cursor'
  | typeof ELEMENT_PARAGRAPH
  | typeof ELEMENT_BLOCKQUOTE
  | typeof ELEMENT_CODE_BLOCK
  | typeof ELEMENT_TODO_LI
  | typeof ELEMENT_IMAGE
  | typeof ELEMENT_HR
  | typeof ELEMENT_TABLE
  | typeof ELEMENT_LINK
  | typeof ELEMENT_EXCALIDRAW
  | typeof ELEMENT_MENTION
  | typeof ELEMENT_MEDIA_EMBED
  | typeof MARK_COLOR
  | typeof MARK_BOLD
  | typeof MARK_ITALIC
  | typeof MARK_HIGHLIGHT
  | typeof MARK_STRIKETHROUGH
  | typeof MARK_UNDERLINE
  | typeof MARK_SUBSCRIPT
  | typeof MARK_SUPERSCRIPT
  | typeof MARK_CODE
  | typeof MARK_COLOR
  | typeof MARK_FONT_SIZE
  | typeof MARK_BG_COLOR
  | typeof MARK_KBD
  | typeof MARK_COMMENT
  | typeof KEY_RESET_NODE
  | typeof KEY_ALIGN
  | typeof KEY_LINE_HEIGHT
  | typeof KEY_NODE_ID
  | typeof KEY_BLOCK_SELECTION
  | typeof KEY_INDENT
  | typeof KEY_SOFT_BREAK
  | typeof KEY_EXIT_BREAK
  | typeof KEY_NORMALIZE_TYPES
  | typeof KEY_TRAILING_BLOCK
  | typeof KEY_SELECT_ON_BACKSPACE
  | typeof KEY_AUTOFORMAT
  | typeof KEY_COMBOBOX
  | typeof KEY_TABBABLE
  | typeof KEY_DESERIALIZE_CSV
  | typeof KEY_DESERIALIZE_DOCX
  | typeof KEY_JUICE
  | typeof KEY_EMOJI
  | typeof KEY_LIST_STYLE_TYPE
  | typeof KEY_DND
  | typeof KEY_DESERIALIZE_HTML
  | typeof KEY_DESERIALIZE_MD;

export const categories = [
  {
    id: 'blocks',
    label: 'Nodes',
    children: [
      {
        id: ELEMENT_BLOCKQUOTE as CheckedId,
        label: 'Blockquote',
        tooltip: 'Highlight important text or citations.',
      },
      {
        id: ELEMENT_CODE_BLOCK as CheckedId,
        label: 'Code block',
        tooltip: 'Encapsulate blocks of code within your document.',
      },
      {
        id: ELEMENT_EXCALIDRAW as CheckedId,
        label: 'Excalidraw',
        tooltip:
          'Enable creation of drawings and diagrams stored as block nodes.',
      },
      {
        id: ELEMENT_HR as CheckedId,
        label: 'Hr',
        tooltip: 'Insert horizontal lines or rules.',
      },
      {
        id: ELEMENT_IMAGE as CheckedId,
        label: 'Image',
        tooltip: 'Embed visual content into your document.',
      },
      {
        id: ELEMENT_PARAGRAPH as CheckedId,
        label: 'Paragraph',
        tooltip:
          'The foundational block in your editor, serving as the default block for text entry',
      },
      {
        id: ELEMENT_TABLE as CheckedId,
        label: 'Table',
        tooltip:
          'Empower content authors with text marking tools for reviewing and referencing content.',
      },
      {
        id: ELEMENT_TODO_LI as CheckedId,
        label: 'Todo List',
        tooltip: 'Manage tasks within your document.',
      },
      {
        id: ELEMENT_LINK as CheckedId,
        label: 'Link',
        tooltip: 'Achieve comprehensive hyperlink insertion and management.',
      },
      {
        id: ELEMENT_MENTION as CheckedId,
        label: 'Mention',
        tooltip: 'Enable intelligent autocompletion support for user input.',
      },
    ],
  },
  {
    id: 'marks',
    label: 'Marks',
    children: [
      {
        id: MARK_BG_COLOR as CheckedId,
        label: 'Background Color',
        tooltip: 'Add color to text backgrounds for emphasis or style.',
      },
      {
        id: MARK_BOLD as CheckedId,
        label: 'Bold',
        tooltip: 'Make your text stand out powerfully.',
      },
      {
        id: MARK_CODE as CheckedId,
        label: 'Code',
        tooltip: 'Embed code into your text.',
      },
      {
        id: MARK_COLOR as CheckedId,
        label: 'Color',
        tooltip: 'Highlight text with a specific color.',
      },
      {
        id: MARK_COMMENT as CheckedId,
        label: 'comments',
        tooltip: 'Add comments to text as marks.',
      },
      {
        id: MARK_FONT_SIZE as CheckedId,
        label: 'Font Size',
        tooltip: 'Gain control over font size by utilizing inline elements.',
      },
      {
        id: MARK_HIGHLIGHT as CheckedId,
        label: 'Highlight',
        tooltip:
          'Empower content authors with text marking tools for reviewing and referencing content.',
      },
      {
        id: MARK_ITALIC as CheckedId,
        label: 'Italic',
        tooltip: 'Add a subtle emphasis to your text.',
      },
      {
        id: MARK_KBD as CheckedId,
        label: 'Kbd',
        tooltip: 'Designate keyboard inputs or commands in your text.',
      },
      {
        id: MARK_STRIKETHROUGH as CheckedId,
        label: 'Strikethrough',
        tooltip: 'Indicate deletions or corrections in your text.',
      },
      {
        id: MARK_SUBSCRIPT as CheckedId,
        label: 'Subscript',
        tooltip: 'Lower portions of your text.',
      },
      {
        id: MARK_SUPERSCRIPT as CheckedId,
        label: 'Superscript',
        tooltip: 'Elevate portions of your text.',
      },
      {
        id: MARK_UNDERLINE as CheckedId,
        label: 'Underline',
        tooltip: 'Emphasize specific words or phrases in your text.',
      },
    ],
  },
  {
    id: 'functionality',
    label: 'Functionality',
    children: [
      {
        id: KEY_ALIGN as CheckedId,
        label: 'Align',
        tooltip:
          'Align your content to the left, right, center, or justify it.',
      },
      {
        id: KEY_AUTOFORMAT as CheckedId,
        label: 'Autoformat',
        tooltip: 'Quickly apply formatting to content using shortcodes.',
      },
      {
        id: KEY_BLOCK_SELECTION as CheckedId,
        label: 'Block selection',
        tooltip: 'Select and manipulate entire text blocks.',
      },
      {
        id: KEY_COMBOBOX as CheckedId,
        label: 'Combobox',
        tooltip: 'Select options from a predefined list.',
      },
      {
        id: KEY_DND as CheckedId,
        label: 'Dnd',
        tooltip: 'Move images or tables within the editor.',
      },
      {
        id: KEY_EMOJI as CheckedId,
        label: 'Emoji',
        tooltip:
          'Enhance your text with emojis using the Emoji plugin, adding visual expression to your content.',
      },
      {
        id: KEY_EXIT_BREAK as CheckedId,
        label: 'Exit break',
        tooltip:
          'Streamline your workflow when working with large blocks of text.',
      },
      {
        id: KEY_INDENT as CheckedId,
        label: 'Indent',
        tooltip:
          'Customize the indentation of text blocks, including paragraphs, headings, and lists.',
      },
      {
        id: KEY_JUICE as CheckedId,
        label: 'Juice',
        tooltip: 'Inline CSS properties into the `style` attribute.',
      },
      {
        id: KEY_LIST_STYLE_TYPE as CheckedId,
        label: 'List style type',
        tooltip:
          'Choose from various bullet or numbering styles for your lists.',
      },
      {
        id: KEY_NODE_ID as CheckedId,
        label: 'Node Id',
        tooltip: 'Assign unique identifiers to nodes within your document.',
      },
      {
        id: KEY_NORMALIZE_TYPES as CheckedId,
        label: 'Normalize types',
        tooltip: 'Standardize text styles and structures for consistency.',
      },
      {
        id: KEY_RESET_NODE as CheckedId,
        label: 'Reset node',
        tooltip:
          'Quickly reset the formatting of a selected block of text to its default settings.',
      },
      {
        id: KEY_SELECT_ON_BACKSPACE as CheckedId,
        label: 'Select on backspace',
        tooltip:
          'Optimize editing efficiency by highlighting the preceding block upon hitting backspace.',
      },
      {
        id: KEY_SOFT_BREAK as CheckedId,
        label: 'Soft break',
        tooltip:
          'Insert line breaks within a block of text without starting a new block.',
      },
      {
        id: KEY_TABBABLE as CheckedId,
        label: 'Tabbable',
        tooltip:
          'Maintain a consistent tab order for tabbable elements while navigating.',
      },
      {
        id: KEY_TRAILING_BLOCK as CheckedId,
        label: 'Tailing block',
        tooltip:
          'Ensure a smooth writing flow by automatically adding a new paragraph after the final block.',
      },
    ],
  },
];

export const categoryIds = categories.map((item) => item.id);

const defaultCheckedIds = categories.reduce((acc, item) => {
  item.children.forEach((child) => {
    acc[child.id] = true;
  });
  return acc;
}, {} as Record<CheckedId, boolean>);

export const settingsStore = createStore('settings')({
  showSettings: true,

  checkedIds: { ...defaultCheckedIds } as Record<CheckedId, boolean>,
})
  .extendActions((set) => ({
    setCheckedId: (id: CheckedId, checked: boolean) => {
      set.state((draft) => {
        draft.checkedIds[id] = checked;
      });
    },
  }))
  .extendSelectors((get) => ({
    checkedId: (id: CheckedId) => get.checkedIds[id],
  }));
