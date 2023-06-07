import { KEY_ALIGN } from '@udecode/plate-alignment';
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
import { KEY_SOFT_BREAK } from '@udecode/plate-break';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { createStore } from '@udecode/plate-common';
import { ELEMENT_EXCALIDRAW } from '@udecode/plate-excalidraw';
import { MARK_BG_COLOR, MARK_COLOR, MARK_FONT_SIZE } from '@udecode/plate-font';
import { MARK_HIGHLIGHT } from '@udecode/plate-highlight';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { KEY_INDENT } from '@udecode/plate-indent';
import { MARK_KBD } from '@udecode/plate-kbd';
import { KEY_LINE_HEIGHT } from '@udecode/plate-line-height';
import { ELEMENT_LINK } from '@udecode/plate-link';
import { ELEMENT_TODO_LI } from '@udecode/plate-list';
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate-media';
import { KEY_NODE_ID } from '@udecode/plate-node-id';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { KEY_RESET_NODE } from '@udecode/plate-reset-node';
import { KEY_BLOCK_SELECTION } from '@udecode/plate-selection';
import { ELEMENT_TABLE } from '@udecode/plate-table';

export type CheckedId =
  | 'heading'
  | typeof ELEMENT_PARAGRAPH
  | typeof ELEMENT_BLOCKQUOTE
  | typeof ELEMENT_CODE_BLOCK
  | typeof MARK_COLOR
  | typeof ELEMENT_TODO_LI
  | typeof ELEMENT_IMAGE
  | typeof ELEMENT_HR
  | typeof MARK_BOLD
  | typeof MARK_ITALIC
  | typeof MARK_HIGHLIGHT
  | typeof ELEMENT_TABLE
  | typeof MARK_STRIKETHROUGH
  | typeof MARK_UNDERLINE
  | typeof MARK_SUBSCRIPT
  | typeof MARK_SUPERSCRIPT
  | typeof MARK_CODE
  | typeof MARK_COLOR
  | typeof MARK_FONT_SIZE
  | typeof MARK_BG_COLOR
  | typeof KEY_RESET_NODE
  | typeof ELEMENT_LINK
  | typeof KEY_ALIGN
  | typeof KEY_LINE_HEIGHT
  | typeof MARK_KBD
  | typeof KEY_NODE_ID
  | typeof KEY_BLOCK_SELECTION
  | typeof KEY_INDENT
  | typeof ELEMENT_EXCALIDRAW
  | typeof KEY_SOFT_BREAK
  | typeof ELEMENT_MEDIA_EMBED;

export const categories = [
  {
    id: 'blocks',
    label: 'Nodes',
    children: [
      {
        id: ELEMENT_PARAGRAPH as CheckedId,
        label: 'Paragraph',
        popoverContent:
          'The foundational block in your editor, serving as the default block for text entry',
      },
      {
        id: 'heading' as CheckedId,
        label: 'Heading',
        popoverContent:
          'Structure your content into well-defined sections using up to six different levels of headings.',
      },
      {
        id: ELEMENT_BLOCKQUOTE as CheckedId,
        label: 'Blockquote',
        popoverContent: '',
      },
      {
        id: ELEMENT_CODE_BLOCK as CheckedId,
        label: 'Code block',
        popoverContent: '',
      },
      {
        id: ELEMENT_TODO_LI as CheckedId,
        label: 'Todo List',
        popoverContent: '',
      },
      {
        id: ELEMENT_IMAGE as CheckedId,
        label: 'Image',
        popoverContent: '',
      },
      {
        id: ELEMENT_HR as CheckedId,
        label: 'Hr',
        popoverContent: '',
      },
      {
        id: ELEMENT_TABLE as CheckedId,
        label: 'Table',
        popoverContent: '',
      },
      {
        id: ELEMENT_MEDIA_EMBED as CheckedId,
        label: 'Media embed',
        popoverContent: '',
      },
      {
        id: ELEMENT_LINK as CheckedId,
        label: 'a',
        popoverContent: '',
      },
      {
        id: ELEMENT_EXCALIDRAW as CheckedId,
        label: 'Excalidraw',
        popoverContent: '',
      },
    ],
  },
  {
    id: 'marks',
    label: 'Marks',
    children: [
      {
        id: MARK_COLOR as CheckedId,
        label: 'Color',
        popoverContent: '',
      },
      {
        id: MARK_STRIKETHROUGH as CheckedId,
        label: 'Strikethrough',
        popoverContent: '',
      },
      {
        id: MARK_UNDERLINE as CheckedId,
        label: 'Underline',
        popoverContent: '',
      },
      {
        id: MARK_SUBSCRIPT as CheckedId,
        label: 'Subscript',
        popoverContent: '',
      },
      {
        id: MARK_CODE as CheckedId,
        label: 'Code',
        popoverContent: '',
      },
      {
        id: MARK_COLOR as CheckedId,
        label: 'Color',
        popoverContent: '',
      },
      {
        id: MARK_SUPERSCRIPT as CheckedId,
        label: 'Superscript',
        popoverContent: '',
      },
      {
        id: MARK_FONT_SIZE as CheckedId,
        label: 'Font Size',
        popoverContent: '',
      },
      {
        id: MARK_BOLD as CheckedId,
        label: 'Bold',
        popoverContent: '',
      },
      {
        id: MARK_ITALIC as CheckedId,
        label: 'Italic',
        popoverContent: '',
      },
      {
        id: MARK_HIGHLIGHT as CheckedId,
        label: 'Highlight',
        popoverContent: '',
      },
      {
        id: MARK_BG_COLOR as CheckedId,
        label: 'Background Color',
        popoverContent: '',
      },
      {
        id: MARK_KBD as CheckedId,
        label: 'Kbd',
        popoverContent: '',
      },
    ],
  },
  {
    id: 'functionality',
    label: 'Functionality',
    children: [
      {
        id: KEY_RESET_NODE as CheckedId,
        label: 'Reset node',
        popoverContent: '',
      },
      {
        id: KEY_ALIGN as CheckedId,
        label: 'Align',
        popoverContent: '',
      },
      {
        id: KEY_ALIGN as CheckedId,
        label: 'Line height',
        popoverContent: '',
      },
      {
        id: KEY_NODE_ID as CheckedId,
        label: 'Node Id',
        popoverContent: '',
      },
      {
        id: KEY_BLOCK_SELECTION as CheckedId,
        label: 'Block selection',
        popoverContent: '',
      },
      {
        id: KEY_INDENT as CheckedId,
        label: 'Indent',
        popoverContent: '',
      },
      {
        id: KEY_SOFT_BREAK as CheckedId,
        label: 'Soft break',
        popoverContent: '',
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
