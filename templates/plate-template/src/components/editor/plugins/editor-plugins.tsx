'use client';

import { CalloutPlugin } from '@udecode/plate-callout/react';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { DocxPlugin } from '@udecode/plate-docx';
import { EmojiPlugin } from '@udecode/plate-emoji/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
} from '@udecode/plate-font/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import {
  EquationPlugin,
  InlineEquationPlugin,
} from '@udecode/plate-math/react';
import { CursorOverlayPlugin } from '@udecode/plate-selection/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { basicNodesPlugins } from '@/components/editor/plugins/basic-nodes-plugins';
import { deletePlugins } from '@/components/editor/plugins/delete-plugins';
import { exitBreakPlugin } from '@/components/editor/plugins/exit-break-plugin';
import { indentListPlugins } from '@/components/editor/plugins/indent-list-plugins';
import { linkPlugin } from '@/components/editor/plugins/link-plugin';
import { mediaPlugins } from '@/components/editor/plugins/media-plugins';
import { mentionPlugin } from '@/components/editor/plugins/mention-plugin';
import { softBreakPlugin } from '@/components/editor/plugins/soft-break-plugin';
import { tablePlugin } from '@/components/editor/plugins/table-plugin';
import { tocPlugin } from '@/components/editor/plugins/toc-plugin';
import { CursorOverlay } from '@/components/potion-ui/cursor-overlay';

import { aiPlugins } from './ai-plugins';
import { autoformatPlugin } from './autoformat-plugin';
import { blockMenuPlugins } from './block-menu-plugins';
import { commentsPlugin } from './comments-plugin';
import { dndPlugins } from './dnd-plugins';
import { FloatingToolbarPlugin } from './floating-toolbar-plugin';
import { resetBlockTypePlugin } from './reset-node-plugin';

export const editorPlugins = [
  // AI
  ...aiPlugins,

  // Nodes
  ...basicNodesPlugins,
  HorizontalRulePlugin,
  linkPlugin,
  DatePlugin,
  mentionPlugin,
  SlashPlugin,
  tablePlugin,
  TogglePlugin,
  tocPlugin,
  ...mediaPlugins,
  InlineEquationPlugin,
  EquationPlugin,
  CalloutPlugin,
  ColumnPlugin,

  // Marks
  FontColorPlugin,
  FontBackgroundColorPlugin,

  // Block Style
  ...indentListPlugins,

  // Functionality
  autoformatPlugin,
  CursorOverlayPlugin.configure({
    render: { afterEditable: () => <CursorOverlay /> },
  }),
  ...blockMenuPlugins,
  ...dndPlugins,
  EmojiPlugin,
  exitBreakPlugin,
  resetBlockTypePlugin,
  ...deletePlugins,
  softBreakPlugin,
  TrailingBlockPlugin.configure({
    options: { type: ParagraphPlugin.key },
  }),

  // Collaboration
  commentsPlugin,

  // Deserialization
  DocxPlugin,
  MarkdownPlugin.configure({ options: { indentList: true } }),
  JuicePlugin,

  // UI
  FloatingToolbarPlugin,
];
