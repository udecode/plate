import { CopilotPlugin } from '@udecode/plate-ai/react';
import { AlignPlugin } from '@udecode/plate-alignment/react';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import {
  ExitBreakPlugin,
  SingleLinePlugin,
  SoftBreakPlugin,
} from '@udecode/plate-break/react';
import { CaptionPlugin } from '@udecode/plate-caption/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { CsvPlugin } from '@udecode/plate-csv';
import { DatePlugin } from '@udecode/plate-date/react';
import { DndPlugin } from '@udecode/plate-dnd';
import { DocxPlugin } from '@udecode/plate-docx';
import { EmojiPlugin } from '@udecode/plate-emoji/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import {
  FontBackgroundColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { TodoListPlugin } from '@udecode/plate-list/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { MentionPlugin } from '@udecode/plate-mention/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { columnValue } from '@/lib/plate/demo/values/columnValue';
import { copilotValue } from '@/lib/plate/demo/values/copilotValue';
import { slashCommandValue } from '@/lib/plate/demo/values/slahMenuValue';
import { DragOverCursorPlugin } from '@/plate/demo/plugins/DragOverCursorPlugin';
import { alignValue } from '@/plate/demo/values/alignValue';
import { autoformatValue } from '@/plate/demo/values/autoformatValue';
import { basicElementsValue } from '@/plate/demo/values/basicElementsValue';
import { basicMarksValue } from '@/plate/demo/values/basicMarksValue';
import { commentsValue } from '@/plate/demo/values/commentsValue';
import { cursorOverlayValue } from '@/plate/demo/values/cursorOverlayValue';
import { dateValue } from '@/plate/demo/values/dateValue';
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
import { toggleValue } from '@/plate/demo/values/toggleValue';

export type ValueId = keyof typeof customizerPlugins | 'tableMerge';

// cmdk needs lowercase
export const customizerPlugins = {
  align: {
    id: 'align',
    label: 'Align',
    plugins: [AlignPlugin.key],
    route: '/docs/alignment',
    value: alignValue,
  },
  autoformat: {
    id: 'autoformat',
    label: 'Autoformat',
    plugins: [AutoformatPlugin.key],
    route: '/docs/autoformat',
    value: autoformatValue,
  },
  basicmarks: {
    id: 'basicmarks',
    label: 'Basic Marks',
    plugins: [],
    route: '/docs/basic-marks',
    value: [...basicElementsValue, ...basicMarksValue],
  },
  basicnodes: {
    id: 'basicnodes',
    label: 'Basic Nodes',
    plugins: [],
    route: '/docs/basic-elements',
    value: [...basicElementsValue, ...basicMarksValue],
  },
  blockselection: {
    id: 'blockselection',
    label: 'Block Selection',
    plugins: [
      NodeIdPlugin.key,
      BlockSelectionPlugin.key,
      ImagePlugin.key,
      MediaEmbedPlugin.key,
    ],
    route: '/docs/block-selection',
    value: mediaValue,
  },
  caption: {
    id: 'caption',
    label: 'Caption',
    plugins: [CaptionPlugin.key],
    route: '/docs/caption',
    value: mediaValue,
  },
  column: {
    id: 'column',
    label: 'Column',
    plugins: [ColumnPlugin.key],
    route: '/docs/column',
    value: columnValue,
  },
  comment: {
    id: 'comment',
    label: 'Comment',
    plugins: [CommentsPlugin.key],
    route: '/docs/comments',
    value: commentsValue,
  },
  copilot: {
    id: 'copilot',
    label: 'Copilot',
    plugins: [CopilotPlugin.key],
    route: '/docs/copilot',
    value: copilotValue,
  },
  csv: {
    id: 'csv',
    label: 'CSV',
    plugins: [CsvPlugin.key],
    route: '/docs/csv',
    value: deserializeCsvValue,
  },
  cursoroverlay: {
    id: 'cursoroverlay',
    label: 'Cursor Overlay',
    plugins: [DragOverCursorPlugin.key],
    route: '/docs/cursor-overlay',
    value: cursorOverlayValue,
  },
  date: {
    id: 'date',
    label: 'Date',
    plugins: [DatePlugin.key],
    route: '/docs/date',
    value: dateValue,
  },
  dnd: {
    id: 'dnd',
    label: 'Drag & Drop',
    plugins: [DndPlugin.key],
    route: '/docs/components/draggable',
    value: [],
  },
  docx: {
    id: 'docx',
    label: 'DOCX',
    plugins: [DocxPlugin.key],
    route: '/docs/docx',
    value: deserializeDocxValue,
  },
  emoji: {
    id: 'emoji',
    label: 'Emoji',
    plugins: [EmojiPlugin.key],
    route: '/docs/emoji',
    value: emojiValue,
  },
  excalidraw: {
    id: 'excalidraw',
    label: 'Excalidraw',
    plugins: [ExcalidrawPlugin.key],
    route: '/docs/excalidraw',
    value: excalidrawValue,
  },
  exitbreak: {
    id: 'exitbreak',
    label: 'Exit Break',
    plugins: [ExitBreakPlugin.key],
    route: '/docs/exit-break',
    value: exitBreakValue,
  },
  font: {
    id: 'font',
    label: 'Font',
    plugins: [FontSizePlugin.key, FontBackgroundColorPlugin.key],
    route: '/docs/font',
    value: fontValue,
  },
  forcedlayout: {
    id: 'forcedlayout',
    label: 'Forced Layout',
    plugins: [NormalizeTypesPlugin.key, TrailingBlockPlugin.key],
    route: '/docs/forced-layout',
    value: [],
  },
  highlight: {
    id: 'highlight',
    label: 'Highlight',
    plugins: [HighlightPlugin.key],
    route: '/docs/highlight',
    value: highlightValue,
  },
  hr: {
    id: 'hr',
    label: 'Horizontal Rule',
    plugins: [HorizontalRulePlugin.key],
    route: '/docs/horizontal-rule',
    value: horizontalRuleValue,
  },
  html: {
    id: 'html',
    label: 'HTML',
    plugins: [],
    route: '/docs/html',
    value: deserializeHtmlValue,
  },
  indent: {
    id: 'indent',
    label: 'Indent',
    plugins: [IndentPlugin.key],
    route: '/docs/indent',
    value: indentValue,
  },
  indentlist: {
    id: 'indentlist',
    label: 'Indent List',
    plugins: [IndentListPlugin.key],
    route: '/docs/indent-list',
    value: indentListValue,
  },
  kbd: {
    id: 'kbd',
    label: 'Keyboard Input',
    plugins: [KbdPlugin.key],
    route: '/docs/components/kbd-leaf',
    value: kbdValue,
  },
  lineheight: {
    id: 'lineheight',
    label: 'Line Height',
    plugins: [LineHeightPlugin.key],
    route: '/docs/line-height',
    value: lineHeightValue,
  },
  link: {
    id: 'link',
    label: 'Link',
    plugins: [LinkPlugin.key],
    route: '/docs/link',
    value: linkValue,
  },
  list: {
    id: 'list',
    label: 'List',
    plugins: ['list'],
    route: '/docs/list',
    value: listValue,
  },
  markdown: {
    id: 'markdown',
    label: 'Markdown',
    plugins: [MarkdownPlugin.key],
    route: '/docs/markdown',
    value: deserializeMdValue,
  },
  media: {
    id: 'media',
    label: 'Media',
    plugins: [ImagePlugin.key, MediaEmbedPlugin.key],
    route: '/docs/media',
    value: mediaValue,
  },
  mention: {
    id: 'mention',
    label: 'Mention',
    plugins: [MentionPlugin.key],
    route: '/docs/mention',
    value: mentionValue,
  },
  placeholder: {
    id: 'placeholder',
    label: 'Placeholder',
    plugins: [],
    route: '/docs/components/placeholder',
    value: placeholderValue,
  },
  playground: {
    id: 'playground',
    label: 'Playground',
    value: [],
  },
  resetnode: {
    id: 'resetnode',
    label: 'Reset Node',
    plugins: [ResetNodePlugin.key],
    route: '/docs/reset-node',
    value: [],
  },
  singleline: {
    id: 'singleline',
    label: 'Single Line',
    plugins: [SingleLinePlugin.key],
    route: '/docs/single-line',
    value: singleLineValue,
  },
  slashCommand: {
    id: 'slashCommand',
    label: 'Slash Command',
    plugins: [SlashPlugin.key],
    route: '/docs/slash-command',
    value: slashCommandValue,
  },
  softbreak: {
    id: 'softbreak',
    label: 'Soft Break',
    plugins: [SoftBreakPlugin.key],
    route: '/docs/soft-break',
    value: softBreakValue,
  },
  tabbable: {
    id: 'tabbable',
    label: 'Tabbable',
    plugins: [TabbablePlugin.key],
    route: '/docs/tabbable',
    value: tabbableValue,
  },
  table: {
    id: 'table',
    label: 'Table',
    plugins: [TablePlugin.key],
    route: '/docs/table',
    value: tableValue,
  },
  todoli: {
    id: 'todoli',
    label: 'Todo List',
    plugins: [TodoListPlugin.key],
    route: '/docs/list',
    value: todoListValue,
  },
  toggle: {
    id: 'toggle',
    label: 'Toggle',
    plugins: [TogglePlugin.key],
    route: '/docs/toggle',
    value: toggleValue,
  },
  trailingblock: {
    id: 'trailingblock',
    label: 'Trailing Block',
    plugins: [TrailingBlockPlugin.key],
    route: '/docs/trailing-block',
    value: trailingBlockValue,
  },
};
