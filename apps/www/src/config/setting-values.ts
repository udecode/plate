import { alignValue } from '@/plate/demo/values/alignValue';
import { autoformatValue } from '@/plate/demo/values/autoformatValue';
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
import { lineHeightValue } from '@/plate/demo/values/lineHeightValue';
import { linkValue } from '@/plate/demo/values/linkValue';
import { listValue, todoListValue } from '@/plate/demo/values/listValue';
import { mediaValue } from '@/plate/demo/values/mediaValue';
import { mentionValue } from '@/plate/demo/values/mentionValue';
import { softBreakValue } from '@/plate/demo/values/softBreakValue';
import { tabbableValue } from '@/plate/demo/values/tabbableValue';
import { tableValue } from '@/plate/demo/values/tableValue';

export type SettingValue = keyof typeof settingValues;

// cmdk needs lowercase
export const settingValues = {
  playground: {
    id: 'playground',
    label: 'Playground',
    value: [],
  },
  font: {
    id: 'font',
    label: 'Font',
    value: fontValue,
  },
  highlight: {
    id: 'highlight',
    label: 'Highlight',
    value: highlightValue,
  },
  link: {
    id: 'link',
    label: 'Link',
    value: linkValue,
  },
  mention: {
    id: 'mention',
    label: 'Mention',
    value: mentionValue,
  },
  emoji: {
    id: 'emoji',
    label: 'Emoji',
    value: emojiValue,
  },
  align: {
    id: 'align',
    label: 'Align',
    value: alignValue,
  },
  lineheight: {
    id: 'lineheight',
    label: 'Line Height',
    value: lineHeightValue,
  },
  indent: {
    id: 'indent',
    label: 'Indent',
    value: indentValue,
  },
  liststyletype: {
    id: 'liststyletype',
    label: 'Indent List',
    value: indentListValue,
  },
  hr: {
    id: 'hr',
    label: 'Horizontal Rule',
    value: horizontalRuleValue,
  },
  list: {
    id: 'list',
    label: 'List',
    value: listValue,
  },
  media: {
    id: 'media',
    label: 'Media',
    value: mediaValue,
  },
  table: {
    id: 'table',
    label: 'Table',
    value: tableValue,
  },
  action_item: {
    id: 'action_item',
    label: 'Action Item',
    value: todoListValue,
  },
  autoformat: {
    id: 'autoformat',
    label: 'Autoformat',
    value: autoformatValue,
  },
  softbreak: {
    id: 'softbreak',
    label: 'Soft Break',
    value: softBreakValue,
  },
  exitbreak: {
    id: 'exitbreak',
    label: 'Exit Break',
    value: exitBreakValue,
  },
  dragovercursor: {
    id: 'dragovercursor',
    label: 'Drag Over Cursor',
    value: cursorOverlayValue,
  },
  tabbable: {
    id: 'tabbable',
    label: 'Tabbable',
    value: tabbableValue,
  },
  comment: {
    id: 'comment',
    label: 'Comment',
    value: commentsValue,
  },
  deserializehtml: {
    id: 'deserializehtml',
    label: 'Deserialize HTML',
    value: deserializeHtmlValue,
  },
  deserializemd: {
    id: 'deserializemd',
    label: 'Deserialize Markdown',
    value: deserializeMdValue,
  },
  deserializedocx: {
    id: 'deserializedocx',
    label: 'Deserialize DOCX',
    value: deserializeDocxValue,
  },
  deserializecsv: {
    id: 'deserializecsv',
    label: 'Deserialize CSV',
    value: deserializeCsvValue,
  },
  trailingblock: {
    id: 'trailingblock',
    label: 'Trailing Block',
    value: trailingBlockValue,
  },
  excalidraw: {
    id: 'excalidraw',
    label: 'Excalidraw',
    value: excalidrawValue,
  },
};
