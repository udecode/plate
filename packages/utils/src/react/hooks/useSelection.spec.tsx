import React from 'react';

import { createPlateEditor, Plate } from '@platejs/core/react';
import { renderHook } from '@testing-library/react';

import {
  useSelectionAcrossBlocks,
  useSelectionCollapsed,
  useSelectionExpanded,
  useSelectionWithinBlock,
} from './useSelection';

const createWrapper = (editor: ReturnType<typeof createPlateEditor>) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Plate editor={editor} suppressInstanceWarning>
        {children}
      </Plate>
    );
  };

describe('useSelection hooks', () => {
  it('reports a collapsed selection within one block', () => {
    const editor = createPlateEditor({
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    const wrapper = createWrapper(editor);

    const { result: collapsed } = renderHook(() => useSelectionCollapsed(), {
      wrapper,
    });
    const { result: expanded } = renderHook(() => useSelectionExpanded(), {
      wrapper,
    });
    const { result: withinBlock } = renderHook(
      () => useSelectionWithinBlock(),
      {
        wrapper,
      }
    );
    const { result: acrossBlocks } = renderHook(
      () => useSelectionAcrossBlocks(),
      {
        wrapper,
      }
    );

    expect(collapsed.current).toBe(true);
    expect(expanded.current).toBe(false);
    expect(withinBlock.current).toBe(true);
    expect(acrossBlocks.current).toBe(false);
  });

  it('reports an expanded selection across blocks', () => {
    const editor = createPlateEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
      value: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: 'two' }], type: 'p' },
      ],
    });

    const wrapper = createWrapper(editor);

    const { result: collapsed } = renderHook(() => useSelectionCollapsed(), {
      wrapper,
    });
    const { result: expanded } = renderHook(() => useSelectionExpanded(), {
      wrapper,
    });
    const { result: withinBlock } = renderHook(
      () => useSelectionWithinBlock(),
      {
        wrapper,
      }
    );
    const { result: acrossBlocks } = renderHook(
      () => useSelectionAcrossBlocks(),
      {
        wrapper,
      }
    );

    expect(collapsed.current).toBe(false);
    expect(expanded.current).toBe(true);
    expect(withinBlock.current).toBe(false);
    expect(acrossBlocks.current).toBe(true);
  });
});
