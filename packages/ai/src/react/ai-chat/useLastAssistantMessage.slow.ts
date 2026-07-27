import React from 'react';

import { act, renderHook } from '@testing-library/react';
import { BaseParagraphPlugin } from '@platejs/core';
import { Plate, createPlateEditor } from '@platejs/core/react';

import { BaseAIPlugin } from '../../lib/BaseAIPlugin';
import { type AIChatPluginConfig, AIChatPlugin } from './AIChatPlugin';
import { useLastAssistantMessage } from './useAIChat';

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
} as unknown as NonNullable<AIChatPluginConfig['initialState']['chat']>;

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
