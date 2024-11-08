import { AIChatPlugin, AIPlugin, CopilotPlugin } from '@udecode/plate-ai/react';
import { AlignPlugin } from '@udecode/plate-alignment/react';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  ExitBreakPlugin,
  SingleLinePlugin,
  SoftBreakPlugin,
} from '@udecode/plate-break/react';
import { CaptionPlugin } from '@udecode/plate-caption/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { CsvPlugin } from '@udecode/plate-csv';
import { DatePlugin } from '@udecode/plate-date/react';
import { DndPlugin } from '@udecode/plate-dnd';
import { DocxPlugin } from '@udecode/plate-docx';
import { EmojiPlugin } from '@udecode/plate-emoji/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { TodoListPlugin } from '@udecode/plate-list/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { MentionPlugin } from '@udecode/plate-mention/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';
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
import { uniqBy } from 'lodash';

import { customizerItems } from '@/config/customizer-items';

export const customizerList = [
  {
    id: 'ai',
    children: [
      customizerItems[AIPlugin.key],
      customizerItems[AIChatPlugin.key],
      customizerItems[CopilotPlugin.key],
    ],
    label: 'AI',
  },
  {
    id: 'blocks',
    children: [
      customizerItems[BlockquotePlugin.key],
      customizerItems[CodeBlockPlugin.key],
      customizerItems[ExcalidrawPlugin.key],
      customizerItems[HorizontalRulePlugin.key],
      customizerItems[ImagePlugin.key],
      customizerItems[LinkPlugin.key],
      customizerItems[TogglePlugin.key],
      customizerItems.column,
      customizerItems.heading,
      customizerItems.list,
      customizerItems[MediaEmbedPlugin.key],
      customizerItems[MentionPlugin.key],
      customizerItems[ParagraphPlugin.key],
      customizerItems[TablePlugin.key],
      customizerItems[TodoListPlugin.key],
      customizerItems[DatePlugin.key],
      customizerItems[TocPlugin.key],
    ],
    label: 'Nodes',
  },
  {
    id: 'marks',
    children: [
      customizerItems[BoldPlugin.key],
      customizerItems[CodePlugin.key],
      customizerItems[CommentsPlugin.key],
      customizerItems[FontBackgroundColorPlugin.key],
      customizerItems[FontColorPlugin.key],
      customizerItems[FontSizePlugin.key],
      customizerItems[HighlightPlugin.key],
      customizerItems[ItalicPlugin.key],
      customizerItems[KbdPlugin.key],
      customizerItems[StrikethroughPlugin.key],
      customizerItems[SubscriptPlugin.key],
      customizerItems[SuperscriptPlugin.key],
      customizerItems[UnderlinePlugin.key],
    ],
    label: 'Marks',
  },
  {
    id: 'style',
    children: [
      customizerItems[AlignPlugin.key],
      customizerItems[IndentPlugin.key],
      customizerItems[IndentListPlugin.key],
      customizerItems[LineHeightPlugin.key],
    ],
    label: 'Block Style',
  },
  {
    id: 'functionality',
    children: [
      customizerItems.components,
      customizerItems[AutoformatPlugin.key],
      customizerItems[BlockSelectionPlugin.key],
      customizerItems[BlockMenuPlugin.key],
      customizerItems[CaptionPlugin.key],
      customizerItems[CursorOverlayPlugin.key],
      customizerItems[DndPlugin.key],
      customizerItems[EmojiPlugin.key],
      customizerItems[ExitBreakPlugin.key],
      customizerItems[NodeIdPlugin.key],
      customizerItems[NormalizeTypesPlugin.key],
      customizerItems[ResetNodePlugin.key],
      customizerItems[SelectOnBackspacePlugin.key],
      customizerItems[DeletePlugin.key],
      customizerItems[SingleLinePlugin.key],
      customizerItems[SoftBreakPlugin.key],
      customizerItems[TabbablePlugin.key],
      customizerItems[TrailingBlockPlugin.key],
      customizerItems[SlashPlugin.key],
    ],
    label: 'Functionality',
  },
  {
    id: 'Deserialization',
    children: [
      customizerItems[CsvPlugin.key],
      customizerItems[DocxPlugin.key],
      customizerItems[MarkdownPlugin.key],
      customizerItems[JuicePlugin.key],
    ],
    label: 'Deserialization',
  },
];

export const orderedPluginKeys = [
  ParagraphPlugin.key,
  'heading',
  BlockquotePlugin.key,
  CodeBlockPlugin,
  HorizontalRulePlugin.key,
  LinkPlugin.key,
  'list',
  ImagePlugin.key,
  MediaEmbedPlugin.key,
  CaptionPlugin.key,
  MentionPlugin.key,
  TablePlugin.key,
  TodoListPlugin.key,
  ExcalidrawPlugin.key,

  // Marks
  BoldPlugin.key,
  ItalicPlugin.key,
  UnderlinePlugin.key,
  StrikethroughPlugin.key,
  CodePlugin.key,
  SubscriptPlugin.key,
  SuperscriptPlugin.key,
  FontColorPlugin.key,
  FontBackgroundColorPlugin.key,
  FontSizePlugin.key,
  HighlightPlugin.key,
  KbdPlugin.key,

  // Block Style
  AlignPlugin.key,
  IndentPlugin.key,
  IndentListPlugin.key,
  LineHeightPlugin.key,

  // Functionality
  AutoformatPlugin.key,
  BlockSelectionPlugin.key,
  DndPlugin.key,
  EmojiPlugin.key,
  ExitBreakPlugin.key,
  NodeIdPlugin.key,
  NormalizeTypesPlugin.key,
  ResetNodePlugin.key,
  SelectOnBackspacePlugin.key,
  DeletePlugin.key,
  SingleLinePlugin.key,
  SoftBreakPlugin.key,
  TabbablePlugin.key,
  TrailingBlockPlugin.key,
  CursorOverlayPlugin.key,

  // Collaboration
  CommentsPlugin.key,

  // Deserialization
  DocxPlugin.key,
  CsvPlugin.key,
  MarkdownPlugin.key,
  JuicePlugin.key,
];

export const allPlugins = customizerList.flatMap((group) => group.children);

export const allComponents = uniqBy(
  allPlugins.flatMap((plugin) => plugin.components ?? []),
  'id'
);
