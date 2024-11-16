import { AIPlugin, CopilotPlugin } from '@udecode/plate-ai/react';
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
import { TocPlugin } from '@udecode/plate-heading/react';
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
import {
  BlockMenuPlugin,
  BlockSelectionPlugin,
  CursorOverlayPlugin,
} from '@udecode/plate-selection/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { FixedToolbarPlugin } from '@/registry/default/components/editor/plugins/fixed-toolbar-plugin';
import { FloatingToolbarPlugin } from '@/registry/default/components/editor/plugins/floating-toolbar-plugin';
import { aiValue } from '@/registry/default/example/values/ai-value';
import { alignValue } from '@/registry/default/example/values/align-value';
import { autoformatValue } from '@/registry/default/example/values/autoformat-value';
import { basicElementsValue } from '@/registry/default/example/values/basic-elements-value';
import { basicMarksValue } from '@/registry/default/example/values/basic-marks-value';
import { blockMenuValue } from '@/registry/default/example/values/block-menu-value';
import { blockSelectionValue } from '@/registry/default/example/values/block-selection-value';
import { columnValue } from '@/registry/default/example/values/column-value';
import { commentsValue } from '@/registry/default/example/values/comments-value';
import { copilotValue } from '@/registry/default/example/values/copilot-value';
import { cursorOverlayValue } from '@/registry/default/example/values/cursor-overlay-value';
import { dateValue } from '@/registry/default/example/values/date-value';
import { deserializeCsvValue } from '@/registry/default/example/values/deserialize-csv-value';
import { deserializeDocxValue } from '@/registry/default/example/values/deserialize-docx-value';
import { deserializeHtmlValue } from '@/registry/default/example/values/deserialize-html-value';
import { deserializeMdValue } from '@/registry/default/example/values/deserialize-md-value';
import { emojiValue } from '@/registry/default/example/values/emoji-value';
import { excalidrawValue } from '@/registry/default/example/values/excalidraw-value';
import {
  exitBreakValue,
  trailingBlockValue,
} from '@/registry/default/example/values/exit-break-value';
import { fontValue } from '@/registry/default/example/values/font-value';
import { highlightValue } from '@/registry/default/example/values/highlight-value';
import { horizontalRuleValue } from '@/registry/default/example/values/horizontal-rule-value';
import { indentListValue } from '@/registry/default/example/values/indent-list-value';
import { indentValue } from '@/registry/default/example/values/indent-value';
import { kbdValue } from '@/registry/default/example/values/kbd-value';
import { lineHeightValue } from '@/registry/default/example/values/line-height-value';
import { linkValue } from '@/registry/default/example/values/link-value';
import {
  listValue,
  todoListValue,
} from '@/registry/default/example/values/list-value';
import { mediaValue } from '@/registry/default/example/values/media-value';
import { mentionValue } from '@/registry/default/example/values/mention-value';
import { placeholderValue } from '@/registry/default/example/values/placeholder-value';
import { singleLineValue } from '@/registry/default/example/values/single-line-value';
import { slashCommandValue } from '@/registry/default/example/values/slash-command-value';
import { softBreakValue } from '@/registry/default/example/values/soft-break-value';
import { tabbableValue } from '@/registry/default/example/values/tabbable-value';
import { tableValue } from '@/registry/default/example/values/table-value';
import { tocValue } from '@/registry/default/example/values/toc-value';
import { toggleValue } from '@/registry/default/example/values/toggle-value';

export type ValueId = keyof typeof customizerPlugins | 'tableMerge';

// cmdk needs lowercase
export const customizerPlugins = {
  ai: {
    id: 'ai',
    label: 'AI',
    plugins: [AIPlugin.key],
    route: '/docs/ai',
    value: aiValue,
  },
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
  'basic-elements': {
    id: 'basic-elements',
    label: 'Basic Elements',
    plugins: [],
    route: '/docs/basic-elements',
    value: basicElementsValue,
  },
  'basic-marks': {
    id: 'basic-marks',
    label: 'Basic Marks',
    plugins: [],
    route: '/docs/basic-marks',
    value: basicMarksValue,
  },
  'basic-nodes': {
    id: 'basic-nodes',
    label: 'Basic Nodes',
    plugins: [],
    route: '/docs/basic-nodes',
    value: [...basicElementsValue, ...basicMarksValue],
  },
  'block-menu': {
    id: 'block-menu',
    label: 'Block Menu',
    plugins: [BlockMenuPlugin.key],
    route: '/docs/block-menu',
    value: blockMenuValue,
  },
  'block-selection': {
    id: 'block-selection',
    label: 'Block Selection',
    plugins: [
      NodeIdPlugin.key,
      BlockSelectionPlugin.key,
      ImagePlugin.key,
      MediaEmbedPlugin.key,
    ],
    route: '/docs/block-selection',
    value: blockSelectionValue,
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
  'cursor-overlay': {
    id: 'cursor-overlay',
    label: 'Cursor Overlay',
    plugins: [CursorOverlayPlugin.key],
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
  'exit-break': {
    id: 'exit-break',
    label: 'Exit Break',
    plugins: [ExitBreakPlugin.key],
    route: '/docs/exit-break',
    value: exitBreakValue,
  },
  'fixed-toolbar': {
    id: 'fixed-toolbar',
    label: 'Fixed Toolbar',
    plugins: [FixedToolbarPlugin.key],
    // route: '/docs/toolbar',
    value: [],
  },
  'floating-toolbar': {
    id: 'floating-toolbar',
    label: 'Floating Toolbar',
    plugins: [FloatingToolbarPlugin.key],
    // route: '/docs/toolbar',
    value: [],
  },
  font: {
    id: 'font',
    label: 'Font',
    plugins: [FontSizePlugin.key, FontBackgroundColorPlugin.key],
    route: '/docs/font',
    value: fontValue,
  },
  'forced-layout': {
    id: 'forced-layout',
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
  'indent-list': {
    id: 'indent-list',
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
  'line-height': {
    id: 'line-height',
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
  'reset-node': {
    id: 'reset-node',
    label: 'Reset Node',
    plugins: [ResetNodePlugin.key],
    route: '/docs/reset-node',
    value: [],
  },
  'single-line': {
    id: 'single-line',
    label: 'Single Line',
    plugins: [SingleLinePlugin.key],
    route: '/docs/single-line',
    value: singleLineValue,
  },
  'slash-command': {
    id: 'slash-command',
    label: 'Slash Command',
    plugins: [SlashPlugin.key],
    route: '/docs/slash-command',
    value: slashCommandValue,
  },
  'soft-break': {
    id: 'soft-break',
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
  toc: {
    id: 'toc',
    label: 'Table of Contents',
    plugins: [TocPlugin.key],
    route: '/docs/toc',
    value: tocValue,
  },
  'todo-list': {
    id: 'todo-list',
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
  'trailing-block': {
    id: 'trailing-block',
    label: 'Trailing Block',
    plugins: [TrailingBlockPlugin.key],
    route: '/docs/trailing-block',
    value: trailingBlockValue,
  },
};
