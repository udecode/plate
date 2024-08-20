import { AlignPlugin } from '@udecode/plate-alignment';
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
import { ParagraphPlugin } from '@udecode/plate-common';
import { DndPlugin } from '@udecode/plate-dnd';
import { EmojiPlugin } from '@udecode/plate-emoji';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { LineHeightPlugin } from '@udecode/plate-line-height';
import { LinkPlugin } from '@udecode/plate-link/react';
import { TodoListPlugin } from '@udecode/plate-list/react';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { MentionPlugin } from '@udecode/plate-mention/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { ResetNodePlugin } from '@udecode/plate-reset-node';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { DeserializeCsvPlugin } from '@udecode/plate-serializer-csv';
import { DeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { DeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { TabbablePlugin } from '@udecode/plate-tabbable';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import { uniqBy } from 'lodash';

import { customizerItems } from '@/config/customizer-items';
import { DragOverCursorPlugin } from '@/plate/demo/plugins/DragOverCursorPlugin';

export const customizerList = [
  {
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
    ],
    id: 'blocks',
    label: 'Nodes',
  },
  {
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
    id: 'marks',
    label: 'Marks',
  },
  {
    children: [
      customizerItems[AlignPlugin.key],
      customizerItems[IndentPlugin.key],
      customizerItems[IndentListPlugin.key],
      customizerItems[LineHeightPlugin.key],
    ],
    id: 'style',
    label: 'Block Style',
  },
  {
    children: [
      customizerItems.components,
      customizerItems[AutoformatPlugin.key],
      customizerItems[BlockSelectionPlugin.key],
      customizerItems[CaptionPlugin.key],
      customizerItems[DndPlugin.key],
      customizerItems[DragOverCursorPlugin.key],
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
    ],
    id: 'functionality',
    label: 'Functionality',
  },
  {
    children: [
      customizerItems[DeserializeCsvPlugin.key],
      customizerItems[DeserializeDocxPlugin.key],
      customizerItems[DeserializeMdPlugin.key],
      customizerItems[JuicePlugin.key],
    ],
    id: 'Deserialization',
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
  DragOverCursorPlugin.key,

  // Collaboration
  CommentsPlugin.key,

  // Deserialization
  DeserializeDocxPlugin.key,
  DeserializeCsvPlugin.key,
  DeserializeMdPlugin.key,
  JuicePlugin.key,
];

export const allPlugins = customizerList.flatMap((group) => group.children);

export const allComponents = uniqBy(
  allPlugins.flatMap((plugin) => plugin.components ?? []),
  'id'
);
