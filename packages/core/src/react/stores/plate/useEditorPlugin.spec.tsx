import React from 'react';

import { act, renderHook } from '@testing-library/react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createPlateEditor } from '../../editor';
import { createPlatePlugin } from '../../plugin';
import { useEditorPlugin } from './useEditorPlugin';

describe('useEditorPlugin', () => {
  it('infers plugin-owned updates from the descriptor', () => {
    const duplicate = vi.fn();
    const BlockPlugin = createPlatePlugin({
      key: 'block',
      update: () => ({ duplicate }),
    });
    const editor = createPlateEditor({ plugins: [BlockPlugin] });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { result } = renderHook(() => useEditorPlugin(BlockPlugin), {
      wrapper,
    });

    act(() => result.current.update.duplicate());

    expect(duplicate).toHaveBeenCalledTimes(1);
  });

  it('returns the editor plugin context with a stable store-backed reference', () => {
    const CounterPlugin = createPlatePlugin({
      key: 'counter',
      initialState: {
        value: 1,
      },
    });
    const editor = createPlateEditor({
      plugins: [CounterPlugin],
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );

    const { result, rerender } = renderHook(
      () => useEditorPlugin(CounterPlugin),
      {
        wrapper,
      }
    );

    const firstContext = result.current;

    expect(firstContext.editor).toBe(editor);
    expect(firstContext.plugin.key).toBe('counter');
    expect(firstContext.store.get()).toEqual({ value: 1 });
    expect(firstContext.store).toBeDefined();

    rerender();
    expect(result.current).toBe(firstContext);

    act(() => {
      editor.plugin(CounterPlugin).store.set({ value: 2 });
    });

    expect(result.current.store.get()).toEqual({ value: 2 });
  });
});
