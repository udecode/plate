'use client';

import React, { useMemo } from 'react';

import type { Value } from '@udecode/plate';

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
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
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
import { ParagraphPlugin, Plate, useStoreValue } from '@udecode/plate/react';

import { SettingsStore } from '@/components/context/settings-store';
import { useLocale } from '@/hooks/useLocale';
import { getI18nValues } from '@/i18n/getI18nValues';
import { copilotPlugins } from '@/registry/default/components/editor/plugins/copilot-plugins';
import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
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
      value,
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
  const locale = useLocale();
  const values = getI18nValues(locale);

  return useMemo(() => {
    const enabled = SettingsStore.get('checkedPlugins');

    let value: any[] = [...values.basicElements, ...values.basicMarks];

    value = [{ children: [{ text: 'Playground' }], type: 'h1' }];

    // New Features
    if (enabled.comment) value.push(...values.comments);

    // // TOC
    // if (enabled.toc) value.push(...values.toc);

    // // AI
    // value.push({ children: [{ text: 'AI' }], type: 'h1' });

    // if (enabled.ai) value.push(...values.ai);
    // if (enabled.copilot) value.push(...values.copilot);

    // // Standard Markdown nodes
    // value.push(
    //   { children: [{ text: 'Nodes' }], type: 'h1' },
    //   ...values.basicElements,
    //   ...values.basicMarks
    // );

    // if (enabled.list) value.push(...values.list);
    // if (enabled.action_item) value.push(...values.todoList);
    // if (enabled.a) value.push(...values.link);
    // if (enabled.hr) value.push(...values.horizontalRule);
    // if (enabled.table) value.push(...values.table);
    // if (enabled.img || enabled.media_embed || enabled.media_placeholder)
    //   value.push(...values.media);
    // if (enabled.column) value.push(...values.column);
    // if (enabled.mention) value.push(...values.mention);
    // if (enabled.date) value.push(...values.date);
    // if (enabled.equation) value.push(...values.equation);
    // if (enabled.emoji) value.push(...values.emoji);
    // if (enabled.color || enabled.backgroundColor) value.push(...values.font);
    // if (enabled.highlight) value.push(...values.highlight);
    // if (enabled.kbd) value.push(...values.kbd);
    // // if (enabled.comment) value.push(...values.comments);

    // // Layout and structure
    // value.push({ children: [{ text: 'Layout' }], type: 'h1' });

    // if (enabled.align) value.push(...values.align);
    // if (enabled.lineHeight) value.push(...values.lineHeight);
    // if (enabled.indent) value.push(...values.indent);
    // if (enabled.listStyleType) value.push(...values.indentList);
    // if (enabled.toggle) value.push(...values.toggle);

    // // Functionality
    // value.push({ children: [{ text: 'Functionality' }], type: 'h1' });

    // if (enabled.slash_command) value.push(...values.slashCommand);
    // if (enabled.blockSelection) value.push(...values.blockSelection);
    // if (enabled.blockMenu) value.push(...values.blockMenu);
    // if (enabled.autoformat) value.push(...values.autoformat);
    // if (enabled.softBreak) value.push(...values.softBreak);
    // if (enabled.exitBreak) value.push(...values.exitBreak);
    // if (enabled.cursorOverlay) value.push(...values.cursorOverlay);
    // if (enabled.trailingBlock) value.push(...values.trailingBlock);

    // // Deserialization
    // value.push({ children: [{ text: 'Deserialization' }], type: 'h1' });

    // if (enabled.html) value.push(...values.deserializeHtml);
    // if (enabled.markdown) value.push(...values.deserializeMd);
    // if (enabled.docx) value.push(...values.deserializeDocx);
    // if (enabled.csv) value.push(...values.deserializeCsv);

    return value;
  }, [values]);
};

function usePlaygroundEnabled(id?: string) {
  const enabled = useStoreValue(SettingsStore, 'checkedPlugins');

  return useMemo(
    () => ({
      [AIChatPlugin.key]: id === 'ai' || !!enabled[AIChatPlugin.key],
      [AlignPlugin.key]: !!enabled.align,
      [AutoformatPlugin.key]: !!enabled.autoformat,
      [BlockquotePlugin.key]: !!enabled.blockquote,
      [BlockSelectionPlugin.key]:
        id === 'block-selection' || !!enabled.blockSelection,
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
