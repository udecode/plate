import React from 'react';

import { act, renderHook } from '@testing-library/react';
import { BaseParagraphPlugin } from '@platejs/core';
import { Plate, createPlateEditor } from '@platejs/core/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { createEditor, type Value } from '@platejs/plite';

import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { type AIChatDefinition, AIChatPlugin } from './AIChatPlugin';
import {
  useAIChatEditor,
  useChatChunk,
  useEditorChat,
  useLastAssistantMessage,
} from './useAIChat';

// biome-ignore lint/complexity/noUselessLoneBlockStatements: isolates the merged hook behavior family.
{
  describe('useAIChatEditor', () => {
    it('deserializes markdown and registers the preview value', () => {
      const primaryEditor = createPlateEditor({
        editor: createEditor<Value>(),
        plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      });
      const editor = createPlateEditor({
        editor: createEditor<Value>(),
        plugins: [BaseParagraphPlugin, MarkdownPlugin],
      });
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Plate editor={primaryEditor}>{children}</Plate>
      );

      const { result } = renderHook(() => useAIChatEditor(editor, 'hi'), {
        wrapper,
      });

      expect(editor.read.children()).toEqual(result.current);
      expect(editor.read.text.string([])).toBe('hi');
      const registered = primaryEditor
        .plugin(AIChatPlugin)
        .store.get('previewValue');

      expect(registered).toEqual(editor.read.children());
    });
  });
}

{
  const createChat = (status: 'ready' | 'streaming', text: string) =>
    ({
      messages: [
        {
          id: 'assistant',
          parts: [{ text, type: 'text' }],
          role: 'assistant',
        },
      ],
      status,
    }) as unknown as NonNullable<AIChatDefinition['initialState']['chat']>;

  describe('useChatChunk', () => {
    it('emits new text chunks and calls finish when streaming stops', () => {
      const onChunk = mock();
      const onFinish = mock();
      const editor = createPlateEditor({
        plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      });
      editor
        .plugin(AIChatPlugin)
        .store.set({ chat: createChat('streaming', 'he') });
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Plate editor={editor}>{children}</Plate>
      );
      const hook = renderHook(() => useChatChunk({ onChunk, onFinish }), {
        wrapper,
      });

      act(() => {
        editor
          .plugin(AIChatPlugin)
          .store.set({ chat: createChat('streaming', 'hello') });
        hook.rerender();
      });

      act(() => {
        editor
          .plugin(AIChatPlugin)
          .store.set({ chat: createChat('ready', 'hello') });
        hook.rerender();
      });

      expect(onChunk).toHaveBeenNthCalledWith(1, {
        chunk: 'he',
        isFirst: true,
        nodes: [{ text: 'he' }],
        text: 'he',
      });
      expect(onChunk).toHaveBeenNthCalledWith(2, {
        chunk: 'llo',
        isFirst: false,
        nodes: [{ text: 'llo' }],
        text: 'hello',
      });
      expect(onFinish).toHaveBeenCalledWith({ content: 'hello' });
    });

    it('emits only the final chunk when content and status finish together', () => {
      const onChunk = mock();
      const onFinish = mock();
      const editor = createPlateEditor({
        plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      });
      editor
        .plugin(AIChatPlugin)
        .store.set({ chat: createChat('streaming', 'he') });
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Plate editor={editor}>{children}</Plate>
      );
      const hook = renderHook(() => useChatChunk({ onChunk, onFinish }), {
        wrapper,
      });

      act(() => {
        editor
          .plugin(AIChatPlugin)
          .store.set({ chat: createChat('ready', 'hello') });
        hook.rerender();
      });

      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenNthCalledWith(2, {
        chunk: 'llo',
        isFirst: false,
        nodes: [{ text: 'llo' }],
        text: 'hello',
      });
      expect(onFinish).toHaveBeenCalledWith({ content: 'hello' });
    });
  });
}

// biome-ignore lint/complexity/noUselessLoneBlockStatements: isolates the merged hook behavior family.
{
  describe('useEditorChat', () => {
    it('routes open state to selected blocks before cursor or text selection', () => {
      const onOpenBlockSelection = mock();
      const onOpenCursor = mock();
      const onOpenSelection = mock();
      const editor = createPlateEditor({
        editor: createEditor<Value>(),
        plugins: [
          BaseParagraphPlugin,
          BaseAIPlugin,
          BlockSelectionPlugin,
          AIChatPlugin,
        ],
        initialValue: [
          { children: [{ text: 'one' }], type: 'paragraph' },
          { children: [{ text: 'two' }], type: 'paragraph' },
        ],
      });
      const selectedKey = editor.key([0])!;
      editor
        .plugin(BlockSelectionPlugin)
        .store.set({ selectedKeys: new Set([selectedKey]) });
      editor.plugin(AIChatPlugin).store.set({ open: true });
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Plate editor={editor}>{children}</Plate>
      );

      renderHook(
        () =>
          useEditorChat({
            onOpenBlockSelection,
            onOpenCursor,
            onOpenSelection,
          }),
        { wrapper }
      );

      expect(onOpenBlockSelection).toHaveBeenCalledWith([
        [{ children: [{ text: 'one' }], type: 'paragraph' }, [0]],
      ]);
      expect(onOpenCursor).not.toHaveBeenCalled();
      expect(onOpenSelection).not.toHaveBeenCalled();
    });
  });
}

{
  const messages = [
    {
      id: 'user',
      parts: [{ text: 'a', type: 'text' as const }],
      role: 'user' as const,
    },
    {
      id: 'assistant',
      parts: [{ text: 'b', type: 'text' as const }],
      role: 'assistant' as const,
    },
  ];

  const chat = {
    messages,
  } as unknown as NonNullable<AIChatDefinition['initialState']['chat']>;

  const createEditor = () => {
    const editor = createPlateEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
    });

    editor.plugin(AIChatPlugin).store.set({ chat });

    return editor;
  };

  describe('AI chat assistant message', () => {
    it('returns the last assistant message from editor chat state', () => {
      const editor = createEditor();

      expect(
        editor.plugin(AIChatPlugin).store.get('lastAssistantMessage')
      ).toEqual(messages[1]);
    });

    it('hides the hook result for the comment tool', () => {
      const editor = createEditor();
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(Plate, { children, editor });
      const visible = renderHook(() => useLastAssistantMessage(), { wrapper });

      expect(visible.result.current).toEqual(messages[1]);

      act(() => {
        editor.plugin(AIChatPlugin).store.set({ toolName: 'comment' });
      });

      expect(visible.result.current).toBeUndefined();
    });
  });
}
