import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { BaseParagraphPlugin } from '../../core';
import { Plate, createEditor as createProductEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { type AIChatDefinition, AIChatPlugin } from './AIChatPlugin';
import { useChatChunk } from './useAIChat';

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
      const editor = createProductEditor({
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
      const editor = createProductEditor({
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
    const editor = createProductEditor({
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
  });
}
