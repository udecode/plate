import React from 'react';

import { act, renderHook } from '@testing-library/react';
import { BaseParagraphPlugin } from '@platejs/core';
import { Plate, createPlateEditor } from '@platejs/core/react';

import { BaseAIPlugin } from '../../../lib/BaseAIPlugin';
import { type AIChatPluginConfig, AIChatPlugin } from '../AIChatPlugin';
import { useChatChunk } from './useChatChunk';

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
  }) as unknown as NonNullable<AIChatPluginConfig['options']['chat']>;

describe('useChatChunk', () => {
  it('emits new text chunks and calls finish when streaming stops', () => {
    const onChunk = mock();
    const onFinish = mock();
    const editor = createPlateEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
    });
    editor
      .plugin(AIChatPlugin)
      .setOption('chat', createChat('streaming', 'he'));
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const hook = renderHook(() => useChatChunk({ onChunk, onFinish }), {
      wrapper,
    });

    act(() => {
      editor
        .plugin(AIChatPlugin)
        .setOption('chat', createChat('streaming', 'hello'));
      hook.rerender();
    });

    act(() => {
      editor
        .plugin(AIChatPlugin)
        .setOption('chat', createChat('ready', 'hello'));
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
      .setOption('chat', createChat('streaming', 'he'));
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const hook = renderHook(() => useChatChunk({ onChunk, onFinish }), {
      wrapper,
    });

    act(() => {
      editor
        .plugin(AIChatPlugin)
        .setOption('chat', createChat('ready', 'hello'));
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
