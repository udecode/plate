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

import { KEY_DRAG_OVER_CURSOR } from '@/plate/demo/plugins/dragOverCursorPlugin';

export type CheckedId =
  | 'heading'
  | 'list'
  | typeof KEY_DRAG_OVER_CURSOR
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
  | typeof KEY_SINGLE_LINE
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

export type SettingBadge = {
  label: string;
};

export const SettingBadges = {
  element: {
    label: 'Element',
    tooltip: '',
  },
  inline: {
    label: 'Inline',
  },
  void: {
    label: 'Void',
  },
  leaf: {
    label: 'Leaf',
  },
  style: {
    label: 'Style',
  },
  normalizer: {
    label: 'Normalizer',
  },
  handler: {
    label: 'Handler',
  },
  ui: {
    label: 'UI',
  },
};

export const PluginLabels = {
  [KEY_COMBOBOX]: 'Combobox',
  [KEY_INDENT]: 'Indent',
  [KEY_NODE_ID]: 'Id',
  [KEY_TRAILING_BLOCK]: 'Trailing Block',
  [KEY_SINGLE_LINE]: 'Single Line',
  [KEY_JUICE]: 'Juice',
  [KEY_LIST_STYLE_TYPE]: 'Indent List',
  list: 'List',
};

export const categories = [
  {
    id: 'blocks',
    label: 'Nodes',
    children: [
      {
        id: ELEMENT_BLOCKQUOTE as CheckedId,
        label: 'Blockquote',
        tooltip: 'Highlight important text or citations.',
        route: '/docs/basic-elements',
        badges: [SettingBadges.element],
      },
      {
        id: ELEMENT_CODE_BLOCK as CheckedId,
        label: 'Code block',
        tooltip: 'Encapsulate blocks of code.',
        badges: [SettingBadges.element],
      },
      {
        id: ELEMENT_EXCALIDRAW as CheckedId,
        label: 'Excalidraw',
        tooltip: 'Create drawings and diagrams as block nodes.',
        badges: [SettingBadges.element, SettingBadges.void],
      },
      {
        id: ELEMENT_HR as CheckedId,
        label: 'Horizontal Rule',
        tooltip: 'Insert horizontal lines.',
        badges: [SettingBadges.element, SettingBadges.void],
      },
      {
        id: ELEMENT_IMAGE as CheckedId,
        label: 'Image',
        tooltip: 'Embed images into your document.',
        badges: [SettingBadges.element, SettingBadges.void],
      },
      {
        id: ELEMENT_LINK as CheckedId,
        label: 'Link',
        tooltip: 'Insert and manage hyperlinks.',
        badges: [SettingBadges.element, SettingBadges.inline],
      },
      {
        id: 'heading' as CheckedId,
        label: 'Heading',
        tooltip: 'Organize your document with up to 6 headings.',
        badges: [SettingBadges.element],
      },
      {
        id: 'list' as CheckedId,
        label: PluginLabels.list,
        tooltip: 'Organize nestable items in a bulleted or numbered list.',
        badges: [SettingBadges.element],
        conflicts: [KEY_LIST_STYLE_TYPE],
      },
      {
        id: ELEMENT_MEDIA_EMBED as CheckedId,
        label: 'Media Embed',
        tooltip: 'Embed medias like videos or tweets into your document.',
        badges: [SettingBadges.element, SettingBadges.void],
      },
      {
        id: ELEMENT_MENTION as CheckedId,
        label: 'Mention',
        tooltip: 'Enable autocompletion for user mentions.',
        badges: [
          SettingBadges.element,
          SettingBadges.inline,
          SettingBadges.void,
        ],
        dependencies: [KEY_COMBOBOX],
      },
      {
        id: ELEMENT_PARAGRAPH as CheckedId,
        label: 'Paragraph',
        tooltip:
          'The foundational block in your editor, serving as the default block for text entry',
        badges: [SettingBadges.element],
      },
      {
        id: ELEMENT_TABLE as CheckedId,
        label: 'Table',
        tooltip:
          'Organize and display data in a structured and resizable tabular format.',
        badges: [SettingBadges.element],
      },
      {
        id: ELEMENT_TODO_LI as CheckedId,
        label: 'Todo List',
        tooltip: 'Manage tasks within your document.',
        badges: [SettingBadges.element],
      },
    ],
  },
  {
    id: 'marks',
    label: 'Marks',
    children: [
      {
        id: MARK_BOLD as CheckedId,
        label: 'Bold',
        tooltip: 'Make your text stand out.',
        badges: [SettingBadges.leaf],
      },
      {
        id: MARK_CODE as CheckedId,
        label: 'Code',
        tooltip: 'Embed code into your text.',
        badges: [SettingBadges.leaf],
      },

      {
        id: MARK_COMMENT as CheckedId,
        label: 'Comments',
        tooltip: 'Add comments to text as marks.',
        badges: [SettingBadges.leaf],
      },
      {
        id: MARK_BG_COLOR as CheckedId,
        label: 'Font Background',
        tooltip: 'Add color to text backgrounds.',
        badges: [SettingBadges.style],
      },
      {
        id: MARK_COLOR as CheckedId,
        label: 'Font Color',
        tooltip: 'Highlight text with a specific color.',
        badges: [SettingBadges.style],
      },
      {
        id: MARK_FONT_SIZE as CheckedId,
        label: 'Font Size',
        tooltip: 'Adjust the size of the text.',
        badges: [SettingBadges.style],
      },
      {
        id: MARK_HIGHLIGHT as CheckedId,
        label: 'Highlight',
        tooltip: 'Mark and reference text for review.',
        badges: [SettingBadges.leaf],
      },
      {
        id: MARK_ITALIC as CheckedId,
        label: 'Italic',
        tooltip: 'Emphasize your text.',
        badges: [SettingBadges.leaf],
      },
      {
        id: MARK_KBD as CheckedId,
        label: 'Keyboard Input',
        tooltip: 'Indicate keyboard inputs or commands.',
        badges: [SettingBadges.leaf],
      },
      {
        id: MARK_STRIKETHROUGH as CheckedId,
        label: 'Strikethrough',
        tooltip: 'Cross out text to indicate deletion or correction.',
        badges: [SettingBadges.leaf],
      },
      {
        id: MARK_SUBSCRIPT as CheckedId,
        label: 'Subscript',
        tooltip: 'Lower portions of your text.',
        badges: [SettingBadges.leaf],
      },
      {
        id: MARK_SUPERSCRIPT as CheckedId,
        label: 'Superscript',
        tooltip: 'Elevate portions of your text.',
        badges: [SettingBadges.leaf],
      },
      {
        id: MARK_UNDERLINE as CheckedId,
        label: 'Underline',
        tooltip: 'Emphasize specific words or phrases in your text.',
        badges: [SettingBadges.leaf],
      },
    ],
  },
  {
    id: 'style',
    label: 'Block Style',
    children: [
      {
        id: KEY_ALIGN as CheckedId,
        label: 'Align',
        tooltip: 'Align your content to different positions.',
        badges: [SettingBadges.style],
      },
      {
        id: KEY_INDENT as CheckedId,
        label: 'Indent',
        tooltip: 'Customize text indentation.',
        badges: [SettingBadges.style],
      },
      {
        id: KEY_LIST_STYLE_TYPE as CheckedId,
        label: PluginLabels[KEY_LIST_STYLE_TYPE],
        tooltip: 'Turn any block into a list item. Alternative to List.',
        badges: [SettingBadges.style],
        dependencies: [KEY_INDENT],
        conflicts: ['list'],
      },
    ],
  },
  {
    id: 'functionality',
    label: 'Functionality',
    children: [
      {
        id: KEY_AUTOFORMAT as CheckedId,
        label: 'Autoformat',
        tooltip: 'Apply formatting automatically using shortcodes.',
        badges: [SettingBadges.handler],
      },
      {
        id: KEY_BLOCK_SELECTION as CheckedId,
        label: 'Block Selection',
        tooltip: 'Select and manipulate entire text blocks.',
        badges: [SettingBadges.ui],
      },
      {
        id: KEY_COMBOBOX as CheckedId,
        label: 'Combobox',
        tooltip: 'Select options from a predefined list.',
        badges: [SettingBadges.handler, SettingBadges.ui],
      },
      {
        id: KEY_DND as CheckedId,
        label: 'Drag & Drop',
        tooltip: 'Move blocks within the editor.',
        badges: [SettingBadges.handler, SettingBadges.ui],
        dependencies: [KEY_NODE_ID],
      },
      {
        id: KEY_DRAG_OVER_CURSOR as CheckedId,
        label: 'Drag Cursor',
        tooltip: 'Customize the cursor when dragging.',
        badges: [SettingBadges.handler, SettingBadges.ui],
      },
      {
        id: KEY_EMOJI as CheckedId,
        label: 'Emoji',
        tooltip: 'Enhance your text with emojis.',
        badges: [SettingBadges.handler],
        dependencies: [KEY_COMBOBOX],
      },
      {
        id: KEY_EXIT_BREAK as CheckedId,
        label: 'Exit Break',
        tooltip: 'Exit a large block using a shortcut.',
        badges: [SettingBadges.handler],
      },
      {
        id: KEY_NODE_ID as CheckedId,
        label: 'Id',
        tooltip: 'Assign unique identifiers to nodes within your document.',
        badges: [SettingBadges.normalizer],
      },
      {
        id: KEY_NORMALIZE_TYPES as CheckedId,
        label: 'Normalize Types',
        tooltip: 'Enforce block types using rules.',
        badges: [SettingBadges.normalizer],
      },
      {
        id: KEY_RESET_NODE as CheckedId,
        label: 'Reset Node',
        tooltip: 'Reset the block type using rules.',
        badges: [SettingBadges.handler],
      },
      {
        id: KEY_SELECT_ON_BACKSPACE as CheckedId,
        label: 'Select on Backspace',
        tooltip:
          'Select the preceding block instead of deleting when pressing backspace.',
        badges: [SettingBadges.handler],
      },
      {
        id: KEY_SINGLE_LINE as CheckedId,
        label: 'Single Line',
        tooltip: 'Restrict the editor to a single block.',
        disablePlugins: [KEY_TRAILING_BLOCK],
        badges: [SettingBadges.normalizer],
        conflicts: [KEY_TRAILING_BLOCK],
      },
      {
        id: KEY_SOFT_BREAK as CheckedId,
        label: 'Soft Break',
        tooltip:
          'Insert line breaks within a block of text without starting a new block.',
        badges: [SettingBadges.handler],
      },
      {
        id: KEY_TABBABLE as CheckedId,
        label: 'Tabbable',
        tooltip: 'Maintain a consistent tab order for tabbable elements.',
        badges: [SettingBadges.handler],
      },
      {
        id: KEY_TRAILING_BLOCK as CheckedId,
        label: 'Trailing Block',
        tooltip: 'Automatically add a new paragraph after the final block.',
        disablePlugins: [KEY_SINGLE_LINE],
        badges: [SettingBadges.normalizer],
        conflicts: [KEY_SINGLE_LINE],
      },
    ],
  },
  {
    id: 'Deserialization',
    label: 'Deserialization',
    children: [
      {
        id: KEY_DESERIALIZE_DOCX as CheckedId,
        label: 'Deserialize DOCX',
        tooltip: 'Copy paste from DOCX to Slate.',
        badges: [SettingBadges.handler],
        dependencies: [KEY_JUICE],
      },
      {
        id: KEY_DESERIALIZE_MD as CheckedId,
        label: 'Deserialize MD',
        tooltip: 'Copy paste from MD to Slate.',
        badges: [SettingBadges.handler],
      },
      {
        id: KEY_JUICE as CheckedId,
        label: 'Juice',
        tooltip:
          'Inline CSS properties into the `style` attribute when pasting HTML.',
        badges: [SettingBadges.handler],
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

  checkedIds: {
    ...defaultCheckedIds,
    singleLine: false,
    list: false,
  } as Record<CheckedId, boolean>,
})
  .extendActions((set) => ({
    setCheckedId: (id: CheckedId, checked: boolean, uncheck?: string[]) => {
      set.state((draft) => {
        draft.checkedIds = { ...draft.checkedIds };

        uncheck?.forEach((item) => {
          draft.checkedIds[item] = false;
        });

        draft.checkedIds[id] = checked;
      });
    },
  }))
  .extendSelectors((get) => ({
    checkedId: (id: CheckedId) => get.checkedIds[id],
  }));
