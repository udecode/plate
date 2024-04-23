import { KEY_DRAG_OVER_CURSOR } from '@/plate/demo/plugins/dragOverCursorPlugin';
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
import { KEY_CAPTION } from '@udecode/plate-caption';
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
import { uniqBy } from 'lodash';

import { customizerItems } from '@/config/customizer-items';

export const customizerList = [
  {
    id: 'blocks',
    label: 'Nodes',
    children: [
      customizerItems[ELEMENT_BLOCKQUOTE],
      customizerItems[ELEMENT_CODE_BLOCK],
      customizerItems[ELEMENT_EXCALIDRAW],
      customizerItems[ELEMENT_HR],
      customizerItems[ELEMENT_IMAGE],
      customizerItems[ELEMENT_LINK],
      customizerItems[ELEMENT_TOGGLE],
      customizerItems.column,
      customizerItems.heading,
      customizerItems.list,
      customizerItems[ELEMENT_MEDIA_EMBED],
      customizerItems[ELEMENT_MENTION],
      customizerItems[ELEMENT_PARAGRAPH],
      customizerItems[ELEMENT_TABLE],
      customizerItems[ELEMENT_TODO_LI],
    ],
  },
  {
    id: 'marks',
    label: 'Marks',
    children: [
      customizerItems[MARK_BOLD],
      customizerItems[MARK_CODE],
      customizerItems[MARK_COMMENT],
      customizerItems[MARK_BG_COLOR],
      customizerItems[MARK_COLOR],
      customizerItems[MARK_FONT_SIZE],
      customizerItems[MARK_HIGHLIGHT],
      customizerItems[MARK_ITALIC],
      customizerItems[MARK_KBD],
      customizerItems[MARK_STRIKETHROUGH],
      customizerItems[MARK_SUBSCRIPT],
      customizerItems[MARK_SUPERSCRIPT],
      customizerItems[MARK_UNDERLINE],
    ],
  },
  {
    id: 'style',
    label: 'Block Style',
    children: [
      customizerItems[KEY_ALIGN],
      customizerItems[KEY_INDENT],
      customizerItems[KEY_LIST_STYLE_TYPE],
      customizerItems[KEY_LINE_HEIGHT],
    ],
  },
  {
    id: 'functionality',
    label: 'Functionality',
    children: [
      customizerItems.components,
      customizerItems[KEY_AUTOFORMAT],
      customizerItems[KEY_BLOCK_SELECTION],
      customizerItems[KEY_CAPTION],
      customizerItems[KEY_COMBOBOX],
      customizerItems[KEY_DND],
      customizerItems[KEY_DRAG_OVER_CURSOR],
      customizerItems[KEY_EMOJI],
      customizerItems[KEY_EXIT_BREAK],
      customizerItems[KEY_NODE_ID],
      customizerItems[KEY_NORMALIZE_TYPES],
      customizerItems[KEY_RESET_NODE],
      customizerItems[KEY_SELECT_ON_BACKSPACE],
      customizerItems[KEY_DELETE],
      customizerItems[KEY_SINGLE_LINE],
      customizerItems[KEY_SOFT_BREAK],
      customizerItems[KEY_TABBABLE],
      customizerItems[KEY_TRAILING_BLOCK],
    ],
  },
  {
    id: 'Deserialization',
    label: 'Deserialization',
    children: [
      customizerItems[KEY_DESERIALIZE_CSV],
      customizerItems[KEY_DESERIALIZE_DOCX],
      customizerItems[KEY_DESERIALIZE_MD],
      customizerItems[KEY_JUICE],
    ],
  },
];

export const orderedPluginKeys = [
  ELEMENT_PARAGRAPH,
  'heading',
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_HR,
  ELEMENT_LINK,
  'list',
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  KEY_CAPTION,
  ELEMENT_MENTION,
  ELEMENT_TABLE,
  ELEMENT_TODO_LI,
  ELEMENT_EXCALIDRAW,

  // Marks
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  MARK_STRIKETHROUGH,
  MARK_CODE,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_COLOR,
  MARK_BG_COLOR,
  MARK_FONT_SIZE,
  MARK_HIGHLIGHT,
  MARK_KBD,

  // Block Style
  KEY_ALIGN,
  KEY_INDENT,
  KEY_LIST_STYLE_TYPE,
  KEY_LINE_HEIGHT,

  // Functionality
  KEY_AUTOFORMAT,
  KEY_BLOCK_SELECTION,
  KEY_COMBOBOX,
  KEY_DND,
  KEY_EMOJI,
  KEY_EXIT_BREAK,
  KEY_NODE_ID,
  KEY_NORMALIZE_TYPES,
  KEY_RESET_NODE,
  KEY_SELECT_ON_BACKSPACE,
  KEY_DELETE,
  KEY_SINGLE_LINE,
  KEY_SOFT_BREAK,
  KEY_TABBABLE,
  KEY_TRAILING_BLOCK,
  KEY_DRAG_OVER_CURSOR,

  // Collaboration
  MARK_COMMENT,

  // Deserialization
  KEY_DESERIALIZE_DOCX,
  KEY_DESERIALIZE_CSV,
  KEY_DESERIALIZE_MD,
  KEY_JUICE,
];

export const allPlugins = customizerList.flatMap((group) => group.children);

export const allComponents = uniqBy(
  allPlugins.flatMap((plugin) => plugin.components ?? []),
  'id'
);
