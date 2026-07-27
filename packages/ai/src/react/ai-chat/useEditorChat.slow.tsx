import React from 'react';

import { renderHook } from '@testing-library/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { BaseParagraphPlugin } from '@platejs/core';
import { Plate, createPlateEditor } from '@platejs/core/react';

import { BaseAIPlugin } from '../../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';
import { useEditorChat } from './useAIChat';

describe('useEditorChat', () => {
  it('routes open state to selected blocks before cursor or text selection', () => {
    const onOpenBlockSelection = mock();
    const onOpenCursor = mock();
    const onOpenSelection = mock();
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseAIPlugin,
        BlockSelectionPlugin,
        AIChatPlugin,
      ],
      initialValue: [
        { children: [{ text: 'one' }], id: 'b1', type: 'p' },
        { children: [{ text: 'two' }], id: 'b2', type: 'p' },
      ],
    });
    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedIds: new Set(['b1']) });
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
      [{ children: [{ text: 'one' }], id: 'b1', type: 'p' }, [0]],
    ]);
    expect(onOpenCursor).not.toHaveBeenCalled();
    expect(onOpenSelection).not.toHaveBeenCalled();
  });
});
