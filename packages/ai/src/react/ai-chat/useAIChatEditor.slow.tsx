import React from 'react';

import { renderHook } from '@testing-library/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { BaseParagraphPlugin } from '@platejs/core';
import { Plate, createPlateEditor } from '@platejs/core/react';

import { BaseAIPlugin } from '../../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';
import { useAIChatEditor } from './useAIChat';

describe('useAIChatEditor', () => {
  it('deserializes markdown, writes editor children, and registers the editor', () => {
    const primaryEditor = createPlateEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
    });
    const editor = createPlateEditor({
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
    const registered = primaryEditor.plugin(AIChatPlugin).getOption('aiEditor');

    expect(registered?.id).toBe(editor.id);
    expect(registered?.read.text.string([])).toBe('hi');
  });
});
