import { KEY_DRAG_OVER_CURSOR } from '@/plate/demo/plugins/dragOverCursorPlugin';
import { alignValue } from '@/plate/demo/values/alignValue';
import { autoformatValue } from '@/plate/demo/values/autoformatValue';
import { basicElementsValue } from '@/plate/demo/values/basicElementsValue';
import { basicMarksValue } from '@/plate/demo/values/basicMarksValue';
import { commentsValue } from '@/plate/demo/values/commentsValue';
import { cursorOverlayValue } from '@/plate/demo/values/cursorOverlayValue';
import { deserializeCsvValue } from '@/plate/demo/values/deserializeCsvValue';
import { deserializeDocxValue } from '@/plate/demo/values/deserializeDocxValue';
import { deserializeHtmlValue } from '@/plate/demo/values/deserializeHtmlValue';
import { deserializeMdValue } from '@/plate/demo/values/deserializeMdValue';
import { emojiValue } from '@/plate/demo/values/emojiValue';
import { excalidrawValue } from '@/plate/demo/values/excalidrawValue';
import {
  exitBreakValue,
  trailingBlockValue,
} from '@/plate/demo/values/exitBreakValue';
import { fontValue } from '@/plate/demo/values/fontValue';
import { highlightValue } from '@/plate/demo/values/highlightValue';
import { horizontalRuleValue } from '@/plate/demo/values/horizontalRuleValue';
import { indentListValue } from '@/plate/demo/values/indentListValue';
import { indentValue } from '@/plate/demo/values/indentValue';
import { kbdValue } from '@/plate/demo/values/kbdValue';
import { lineHeightValue } from '@/plate/demo/values/lineHeightValue';
import { linkValue } from '@/plate/demo/values/linkValue';
import { listValue, todoListValue } from '@/plate/demo/values/listValue';
import { mediaValue } from '@/plate/demo/values/mediaValue';
import { mentionValue } from '@/plate/demo/values/mentionValue';
import { placeholderValue } from '@/plate/demo/values/placeholderValue';
import { singleLineValue } from '@/plate/demo/values/singleLineValue';
import { softBreakValue } from '@/plate/demo/values/softBreakValue';
import { tabbableValue } from '@/plate/demo/values/tabbableValue';
import { tableValue } from '@/plate/demo/values/tableValue';
import { KEY_ALIGN } from '@udecode/plate-alignment';
import { KEY_AUTOFORMAT } from '@udecode/plate-autoformat';
import {
  KEY_EXIT_BREAK,
  KEY_SINGLE_LINE,
  KEY_SOFT_BREAK,
} from '@udecode/plate-break';
import { KEY_CAPTION } from '@udecode/plate-caption';
import { KEY_COMBOBOX } from '@udecode/plate-combobox';
import { MARK_COMMENT } from '@udecode/plate-comments';
import { KEY_DND } from '@udecode/plate-dnd';
import { KEY_EMOJI } from '@udecode/plate-emoji';
import { ELEMENT_EXCALIDRAW } from '@udecode/plate-excalidraw';
import { MARK_BG_COLOR, MARK_FONT_SIZE } from '@udecode/plate-font';
import { MARK_HIGHLIGHT } from '@udecode/plate-highlight';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { KEY_INDENT } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '@udecode/plate-indent-list';
import { MARK_KBD } from '@udecode/plate-kbd';
import { KEY_LINE_HEIGHT } from '@udecode/plate-line-height';
import { ELEMENT_LINK } from '@udecode/plate-link';
import { ELEMENT_TODO_LI } from '@udecode/plate-list';
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate-media';
import { ELEMENT_MENTION } from '@udecode/plate-mention';
import { KEY_NODE_ID } from '@udecode/plate-node-id';
import { KEY_NORMALIZE_TYPES } from '@udecode/plate-normalizers';
import { KEY_RESET_NODE } from '@udecode/plate-reset-node';
import { KEY_BLOCK_SELECTION } from '@udecode/plate-selection';
import { KEY_DESERIALIZE_CSV } from '@udecode/plate-serializer-csv';
import { KEY_DESERIALIZE_DOCX } from '@udecode/plate-serializer-docx';
import { KEY_DESERIALIZE_MD } from '@udecode/plate-serializer-md';
import { KEY_TABBABLE } from '@udecode/plate-tabbable';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { KEY_TRAILING_BLOCK } from '@udecode/plate-trailing-block';

export type ValueId = keyof typeof customizerPlugins;

// cmdk needs lowercase
export const customizerPlugins = {
  align: {
    id: 'align',
    label: 'Align',
    value: alignValue,
    route: '/docs/alignment',
    plugins: [KEY_ALIGN],
  },
  autoformat: {
    id: 'autoformat',
    label: 'Autoformat',
    value: autoformatValue,
    route: '/docs/autoformat',
    plugins: [KEY_AUTOFORMAT],
  },
  basicnodes: {
    id: 'basicnodes',
    label: 'Basic Nodes',
    value: [...basicElementsValue, ...basicMarksValue],
    route: '/docs/basic-elements',
    plugins: [],
  },
  basicmarks: {
    id: 'basicmarks',
    label: 'Basic Marks',
    value: [...basicElementsValue, ...basicMarksValue],
    route: '/docs/basic-marks',
    plugins: [],
  },
  blockselection: {
    id: 'blockselection',
    label: 'Block Selection',
    value: mediaValue,
    route: '/docs/block-selection',
    plugins: [
      KEY_NODE_ID,
      KEY_BLOCK_SELECTION,
      ELEMENT_IMAGE,
      ELEMENT_MEDIA_EMBED,
    ],
  },
  caption: {
    id: 'caption',
    label: 'Caption',
    value: mediaValue,
    route: '/docs/caption',
    plugins: [KEY_CAPTION],
  },
  combobox: {
    id: 'combobox',
    label: 'Combobox',
    route: '/docs/combobox',
    plugins: [KEY_COMBOBOX],
  },
  comment: {
    id: 'comment',
    label: 'Comment',
    value: commentsValue,
    route: '/docs/comments',
    plugins: [MARK_COMMENT],
  },
  cursoroverlay: {
    id: 'cursoroverlay',
    label: 'Cursor Overlay',
    value: cursorOverlayValue,
    route: '/docs/cursor-overlay',
    plugins: [KEY_DRAG_OVER_CURSOR],
  },
  deserializecsv: {
    id: 'deserializecsv',
    label: 'Deserialize CSV',
    value: deserializeCsvValue,
    route: '/docs/serializing-csv',
    plugins: [KEY_DESERIALIZE_CSV],
  },
  deserializedocx: {
    id: 'deserializedocx',
    label: 'Deserialize DOCX',
    value: deserializeDocxValue,
    route: '/docs/serializing-docx',
    plugins: [KEY_DESERIALIZE_DOCX],
  },
  deserializehtml: {
    id: 'deserializehtml',
    label: 'Deserialize HTML',
    value: deserializeHtmlValue,
    route: '/docs/serializing-html',
    plugins: [],
  },
  deserializemd: {
    id: 'deserializemd',
    label: 'Deserialize Markdown',
    value: deserializeMdValue,
    route: '/docs/serializing-markdown',
    plugins: [KEY_DESERIALIZE_MD],
  },
  dnd: {
    id: 'dnd',
    label: 'Drag & Drop',
    value: [],
    route: '/docs/components/draggable',
    plugins: [KEY_DND],
  },
  emoji: {
    id: 'emoji',
    label: 'Emoji',
    value: emojiValue,
    route: '/docs/emoji',
    plugins: [KEY_EMOJI],
  },
  excalidraw: {
    id: 'excalidraw',
    label: 'Excalidraw',
    value: excalidrawValue,
    route: '/docs/excalidraw',
    plugins: [ELEMENT_EXCALIDRAW],
  },
  exitbreak: {
    id: 'exitbreak',
    label: 'Exit Break',
    value: exitBreakValue,
    route: '/docs/exit-break',
    plugins: [KEY_EXIT_BREAK],
  },
  font: {
    id: 'font',
    label: 'Font',
    value: fontValue,
    route: '/docs/font',
    plugins: [MARK_FONT_SIZE, MARK_BG_COLOR],
  },
  forcedlayout: {
    id: 'forcedlayout',
    label: 'Forced Layout',
    value: [],
    route: '/docs/forced-layout',
    plugins: [KEY_NORMALIZE_TYPES, KEY_TRAILING_BLOCK],
  },
  highlight: {
    id: 'highlight',
    label: 'Highlight',
    value: highlightValue,
    route: '/docs/highlight',
    plugins: [MARK_HIGHLIGHT],
  },
  hr: {
    id: 'hr',
    label: 'Horizontal Rule',
    value: horizontalRuleValue,
    route: '/docs/horizontal-rule',
    plugins: [ELEMENT_HR],
  },
  indent: {
    id: 'indent',
    label: 'Indent',
    value: indentValue,
    route: '/docs/indent',
    plugins: [KEY_INDENT],
  },
  kbd: {
    id: 'kbd',
    label: 'Keyboard Input',
    value: kbdValue,
    route: '/docs/components/kbd-leaf',
    plugins: [MARK_KBD],
  },
  lineheight: {
    id: 'lineheight',
    label: 'Line Height',
    value: lineHeightValue,
    route: '/docs/line-height',
    plugins: [KEY_LINE_HEIGHT],
  },
  link: {
    id: 'link',
    label: 'Link',
    value: linkValue,
    route: '/docs/link',
    plugins: [ELEMENT_LINK],
  },
  list: {
    id: 'list',
    label: 'List',
    value: listValue,
    route: '/docs/list',
    plugins: ['list'],
  },
  indentlist: {
    id: 'indentlist',
    label: 'Indent List',
    value: indentListValue,
    route: '/docs/indent-list',
    plugins: [KEY_LIST_STYLE_TYPE],
  },
  media: {
    id: 'media',
    label: 'Media',
    value: mediaValue,
    route: '/docs/media',
    plugins: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED],
  },
  mention: {
    id: 'mention',
    label: 'Mention',
    value: mentionValue,
    route: '/docs/mention',
    plugins: [ELEMENT_MENTION],
  },
  placeholder: {
    id: 'placeholder',
    label: 'Placeholder',
    value: placeholderValue,
    route: '/docs/components/placeholder',
    plugins: [],
  },
  playground: {
    id: 'playground',
    label: 'Playground',
    value: [],
  },
  resetnode: {
    id: 'resetnode',
    label: 'Reset Node',
    value: [],
    route: '/docs/reset-node',
    plugins: [KEY_RESET_NODE],
  },
  singleline: {
    id: 'singleline',
    label: 'Single Line',
    value: singleLineValue,
    route: '/docs/single-line',
    plugins: [KEY_SINGLE_LINE],
  },
  softbreak: {
    id: 'softbreak',
    label: 'Soft Break',
    value: softBreakValue,
    route: '/docs/soft-break',
    plugins: [KEY_SOFT_BREAK],
  },
  tabbable: {
    id: 'tabbable',
    label: 'Tabbable',
    value: tabbableValue,
    route: '/docs/tabbable',
    plugins: [KEY_TABBABLE],
  },
  table: {
    id: 'table',
    label: 'Table',
    value: tableValue,
    route: '/docs/table',
    plugins: [ELEMENT_TABLE],
  },
  todoli: {
    id: 'todoli',
    label: 'Todo List',
    value: todoListValue,
    route: '/docs/todo-list',
    plugins: [ELEMENT_TODO_LI],
  },
  trailingblock: {
    id: 'trailingblock',
    label: 'Trailing Block',
    value: trailingBlockValue,
    route: '/docs/trailing-block',
    plugins: [KEY_TRAILING_BLOCK],
  },
};
