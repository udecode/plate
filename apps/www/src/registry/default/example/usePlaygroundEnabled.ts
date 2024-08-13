import { useMemo } from 'react';

import { AlignPlugin } from '@udecode/plate-alignment';
import { AutoformatPlugin } from '@udecode/plate-autoformat';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { BlockquotePlugin } from '@udecode/plate-block-quote';
import {
  ExitBreakPlugin,
  SingleLinePlugin,
  SoftBreakPlugin,
} from '@udecode/plate-break';
import { CaptionPlugin } from '@udecode/plate-caption';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { CommentsPlugin } from '@udecode/plate-comments';
import { ParagraphPlugin } from '@udecode/plate-common';
import { DndPlugin } from '@udecode/plate-dnd';
import { EmojiPlugin } from '@udecode/plate-emoji';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font';
import { HeadingPlugin } from '@udecode/plate-heading';
import { HighlightPlugin } from '@udecode/plate-highlight';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { IndentPlugin } from '@udecode/plate-indent';
import { IndentListPlugin } from '@udecode/plate-indent-list';
import { JuicePlugin } from '@udecode/plate-juice';
import { KbdPlugin } from '@udecode/plate-kbd';
import { ColumnPlugin } from '@udecode/plate-layout';
import { LineHeightPlugin } from '@udecode/plate-line-height';
import { LinkPlugin } from '@udecode/plate-link';
import { ListPlugin, TodoListPlugin } from '@udecode/plate-list';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media';
import { MentionPlugin } from '@udecode/plate-mention';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { ResetNodePlugin } from '@udecode/plate-reset-node';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';
import { BlockSelectionPlugin } from '@udecode/plate-selection';
import { DeserializeDocxPlugin } from '@udecode/plate-serializer-docx';
import { DeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { TabbablePlugin } from '@udecode/plate-tabbable';
import { TablePlugin } from '@udecode/plate-table';
import { TogglePlugin } from '@udecode/plate-toggle';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { settingsStore } from '@/components/context/settings-store';
import { DragOverCursorPlugin } from '@/plate/demo/plugins/DragOverCursorPlugin';

export function usePlaygroundEnabled(id?: string) {
  const enabled = settingsStore.use.checkedPlugins();

  return useMemo(
    () => ({
      [AlignPlugin.key]: { enabled: !!enabled.align },
      [AutoformatPlugin.key]: { enabled: !!enabled.autoformat },
      [BlockSelectionPlugin.key]: {
        enabled: id === 'blockselection' || !!enabled.blockSelection,
      },
      [BlockquotePlugin.key]: { enabled: !!enabled.blockquote },
      [BoldPlugin.key]: { enabled: !!enabled.bold },
      [CaptionPlugin.key]: { enabled: !!enabled.caption },
      [CodeBlockPlugin.key]: { enabled: !!enabled.code_block },
      [CodePlugin.key]: { enabled: !!enabled.code },
      [ColumnPlugin.key]: { enabled: !!enabled.column },
      [CommentsPlugin.key]: { enabled: !!enabled.comment },
      [DeletePlugin.key]: { enabled: !!enabled.delete },
      [DeserializeDocxPlugin.key]: { enabled: !!enabled.deserializeDocx },
      [DeserializeMdPlugin.key]: { enabled: !!enabled.deserializeMd },
      [DndPlugin.key]: { enabled: !!enabled.dnd },
      [DragOverCursorPlugin.key]: { enabled: !!enabled.dragOverCursor },
      [EmojiPlugin.key]: { enabled: !!enabled.emoji },
      [ExcalidrawPlugin.key]: { enabled: !!enabled.excalidraw },
      [ExitBreakPlugin.key]: { enabled: !!enabled.exitBreak },
      [FontBackgroundColorPlugin.key]: {
        enabled: !!enabled.backgroundColor,
      },
      [FontColorPlugin.key]: { enabled: !!enabled.color },
      [FontSizePlugin.key]: { enabled: !!enabled.fontSize },
      [HeadingPlugin.key]: { enabled: !!enabled.heading },
      [HighlightPlugin.key]: { enabled: !!enabled.highlight },
      [HorizontalRulePlugin.key]: { enabled: !!enabled.hr },
      [ImagePlugin.key]: { enabled: !!enabled.img },
      [IndentListPlugin.key]: {
        enabled: id === 'indentlist' || !!enabled.listStyleType,
      },
      [IndentPlugin.key]: { enabled: !!enabled.indent },
      [ItalicPlugin.key]: { enabled: !!enabled.italic },
      [JuicePlugin.key]: { enabled: !!enabled.juice },
      [KbdPlugin.key]: { enabled: !!enabled.kbd },
      [LineHeightPlugin.key]: { enabled: !!enabled.lineHeight },
      [LinkPlugin.key]: { enabled: !!enabled.a },
      [ListPlugin.key]: { enabled: id === 'list' || !!enabled.list },
      [MediaEmbedPlugin.key]: { enabled: !!enabled.media_embed },
      [MentionPlugin.key]: { enabled: !!enabled.mention },
      [NodeIdPlugin.key]: { enabled: !!enabled.nodeId },
      [NormalizeTypesPlugin.key]: { enabled: !!enabled.normalizeTypes },
      [ParagraphPlugin.key]: { enabled: !!enabled.p },
      [ResetNodePlugin.key]: { enabled: !!enabled.resetNode },
      [SelectOnBackspacePlugin.key]: {
        enabled: !!enabled.selectOnBackspace,
      },
      [SingleLinePlugin.key]: {
        enabled: id === 'singleline' || !!enabled.singleLine,
      },
      [SoftBreakPlugin.key]: { enabled: !!enabled.softBreak },
      [StrikethroughPlugin.key]: { enabled: !!enabled.strikethrough },
      [SubscriptPlugin.key]: { enabled: !!enabled.subscript },
      [SuperscriptPlugin.key]: { enabled: !!enabled.superscript },
      [TabbablePlugin.key]: { enabled: !!enabled.tabbable },
      [TablePlugin.key]: { enabled: !!enabled.table },
      [TodoListPlugin.key]: { enabled: !!enabled.action_item },
      [TogglePlugin.key]: { enabled: !!enabled.toggle },
      [TrailingBlockPlugin.key]: {
        enabled: id !== 'singleline' && !!enabled.trailingBlock,
      },
      [UnderlinePlugin.key]: { enabled: !!enabled.underline },
    }),
    [enabled, id]
  );
}
