'use client';

import React, { useMemo } from 'react';

import type { Value } from '@udecode/slate';

import { AIChatPlugin, CopilotPlugin } from '@udecode/plate-ai/react';
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
import { ParagraphPlugin, Plate } from '@udecode/plate-common/react';
import { DndPlugin } from '@udecode/plate-dnd';
import { DocxPlugin } from '@udecode/plate-docx';
import { EmojiPlugin } from '@udecode/plate-emoji/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { ListPlugin, TodoListPlugin } from '@udecode/plate-list/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { MentionPlugin } from '@udecode/plate-mention/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { PlaywrightPlugin } from '@udecode/plate-playwright';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';
import {
  BlockSelectionPlugin,
  CursorOverlayPlugin,
} from '@udecode/plate-selection/react';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { settingsStore } from '@/components/context/settings-store';
import { copilotPlugins } from '@/registry/default/components/editor/plugins/copilot-plugins';
import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
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
import { slashCommandValue } from '@/registry/default/example/values/slash-command-value';
import { softBreakValue } from '@/registry/default/example/values/soft-break-value';
import { tableValue } from '@/registry/default/example/values/table-value';
import { tocPlaygroundValue } from '@/registry/default/example/values/toc-value';
import { toggleValue } from '@/registry/default/example/values/toggle-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export default function PlaygroundDemo({ className }: { className?: string }) {
  const value = usePlaygroundValue();
  const enabled = usePlaygroundEnabled();

  const editor = useCreateEditor(
    {
      override: { enabled },
      plugins: [
        ...copilotPlugins,
        ...editorPlugins,

        NormalizeTypesPlugin.configure({
          options: {
            rules: [{ path: [0], strictType: HEADING_KEYS.h1 }],
          },
        }),

        // Testing
        PlaywrightPlugin.configure({
          enabled: process.env.NODE_ENV !== 'production',
        }),
      ],
      value: value,
    },
    []
  );

  return (
    <Plate editor={editor}>
      <EditorContainer className={className}>
        <Editor variant="demo" className="pb-[20vh]" spellCheck={false} />
      </EditorContainer>
    </Plate>
  );
}

const usePlaygroundValue = (): Value => {
  return useMemo(() => {
    const enabled = settingsStore.get.checkedPlugins();

    let value: any[] = [...basicElementsValue, ...basicMarksValue];

    value = [{ children: [{ text: 'Playground' }], type: 'h1' }];

    // TOC
    if (enabled.toc) value.push(...tocPlaygroundValue);

    // AI
    value.push({ children: [{ text: 'AI' }], type: 'h1' });

    if (enabled.ai) value.push(...aiValue);
    if (enabled.copilot) value.push(...copilotValue);

    // Standard Markdown nodes
    value.push(
      { children: [{ text: 'Nodes' }], type: 'h1' },
      ...basicElementsValue,
      ...basicMarksValue
    );

    if (enabled.list) value.push(...listValue);
    if (enabled.action_item) value.push(...todoListValue);
    if (enabled.a) value.push(...linkValue);
    if (enabled.hr) value.push(...horizontalRuleValue);
    if (enabled.table) value.push(...tableValue);
    if (enabled.img || enabled.media_embed || enabled.media_placeholder)
      value.push(...mediaValue);
    if (enabled.column) value.push(...columnValue);
    if (enabled.mention) value.push(...mentionValue);
    if (enabled.date) value.push(...dateValue);
    if (enabled.emoji) value.push(...emojiValue);
    if (enabled.color || enabled.backgroundColor) value.push(...fontValue);
    if (enabled.highlight) value.push(...highlightValue);
    if (enabled.kbd) value.push(...kbdValue);
    if (enabled.comment) value.push(...commentsValue);

    // Layout and structure
    value.push({ children: [{ text: 'Layout' }], type: 'h1' });

    if (enabled.align) value.push(...alignValue);
    if (enabled.lineHeight) value.push(...lineHeightValue);
    if (enabled.indent) value.push(...indentValue);
    if (enabled.listStyleType) value.push(...indentListValue);
    if (enabled.toggle) value.push(...toggleValue);

    // Functionality
    value.push({ children: [{ text: 'Functionality' }], type: 'h1' });

    if (enabled.slash_command) value.push(...slashCommandValue);
    if (enabled.blockSelection) value.push(...blockSelectionValue);
    if (enabled.blockMenu) value.push(...blockMenuValue);
    if (enabled.autoformat) value.push(...autoformatValue);
    if (enabled.softBreak) value.push(...softBreakValue);
    if (enabled.exitBreak) value.push(...exitBreakValue);
    if (enabled.cursorOverlay) value.push(...cursorOverlayValue);
    if (enabled.trailingBlock) value.push(...trailingBlockValue);

    // Deserialization
    value.push({ children: [{ text: 'Deserialization' }], type: 'h1' });

    if (enabled.html) value.push(...deserializeHtmlValue);
    if (enabled.markdown) value.push(...deserializeMdValue);
    if (enabled.docx) value.push(...deserializeDocxValue);
    if (enabled.csv) value.push(...deserializeCsvValue);

    return value;
  }, []);
};

function usePlaygroundEnabled(id?: string) {
  const enabled = settingsStore.use.checkedPlugins();

  return useMemo(
    () => ({
      [AIChatPlugin.key]: id === 'ai' || !!enabled[AIChatPlugin.key],
      [AlignPlugin.key]: !!enabled.align,
      [AutoformatPlugin.key]: !!enabled.autoformat,
      [BlockSelectionPlugin.key]:
        id === 'block-selection' || !!enabled.blockSelection,
      [BlockquotePlugin.key]: !!enabled.blockquote,
      [BoldPlugin.key]: !!enabled.bold,
      [CaptionPlugin.key]: !!enabled.caption,
      [CodeBlockPlugin.key]: !!enabled.code_block,
      [CodePlugin.key]: !!enabled.code,
      [ColumnPlugin.key]: !!enabled.column,
      [CommentsPlugin.key]: !!enabled.comment,
      [CopilotPlugin.key]: id === 'copilot' || !!enabled[CopilotPlugin.key],
      [CursorOverlayPlugin.key]: !!enabled.cursorOverlay,
      [DeletePlugin.key]: !!enabled.delete,
      [DndPlugin.key]: !!enabled.dnd,
      [DocxPlugin.key]: !!enabled.docx,
      [EmojiPlugin.key]: !!enabled.emoji,
      [ExcalidrawPlugin.key]: !!enabled.excalidraw,
      [ExitBreakPlugin.key]: !!enabled.exitBreak,
      [FontBackgroundColorPlugin.key]: !!enabled.backgroundColor,
      [FontColorPlugin.key]: !!enabled.color,
      [FontSizePlugin.key]: !!enabled.fontSize,
      [HeadingPlugin.key]: !!enabled.heading,
      [HighlightPlugin.key]: !!enabled.highlight,
      [HorizontalRulePlugin.key]: !!enabled.hr,
      [ImagePlugin.key]: !!enabled.img,
      [IndentListPlugin.key]: id === 'indent-list' || !!enabled.listStyleType,
      [IndentPlugin.key]: id !== 'list' && !!enabled.indent,
      [ItalicPlugin.key]: !!enabled.italic,
      [JuicePlugin.key]: !!enabled.juice,
      [KbdPlugin.key]: !!enabled.kbd,
      [LineHeightPlugin.key]: !!enabled.lineHeight,
      [LinkPlugin.key]: !!enabled.a,
      [ListPlugin.key]: id === 'list' || !!enabled.list,
      [MarkdownPlugin.key]: !!enabled.markdown,
      [MediaEmbedPlugin.key]: !!enabled.media_embed,
      [MentionPlugin.key]: !!enabled.mention,
      [NodeIdPlugin.key]: !!enabled.nodeId,
      [NormalizeTypesPlugin.key]: !!enabled.normalizeTypes,
      [ParagraphPlugin.key]: !!enabled.p,
      [ResetNodePlugin.key]: !!enabled.resetNode,
      [SelectOnBackspacePlugin.key]: !!enabled.selectOnBackspace,
      [SingleLinePlugin.key]: id === 'single-line' || !!enabled.singleLine,
      [SoftBreakPlugin.key]: !!enabled.softBreak,
      [StrikethroughPlugin.key]: !!enabled.strikethrough,
      [SubscriptPlugin.key]: !!enabled.subscript,
      [SuperscriptPlugin.key]: !!enabled.superscript,
      [TabbablePlugin.key]: !!enabled.tabbable,
      [TablePlugin.key]: !!enabled.table,
      [TodoListPlugin.key]: !!enabled.action_item,
      [TogglePlugin.key]: !!enabled.toggle,
      [TrailingBlockPlugin.key]:
        id !== 'single-line' && !!enabled.trailingBlock,
      [UnderlinePlugin.key]: !!enabled.underline,
    }),
    [enabled, id]
  );
}
