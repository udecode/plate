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
      name: 'block',
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
      name: 'counter',
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
    expect(firstContext.plugin.name).toBe('counter');
    expect(firstContext.store.get()).toEqual({ value: 1 });
    expect(firstContext.store).toBeDefined();

    rerender();
    expect(result.current).toBe(firstContext);

    act(() => {
      editor.plugin(CounterPlugin).store.set({ value: 2 });
    });

    expect(result.current.store.get()).toEqual({ value: 2 });
  });

  it('accepts runtime names without weakening missing-plugin errors', () => {
    const CounterPlugin = createPlatePlugin({ name: 'counter' });
    const editor = createPlateEditor({ plugins: [CounterPlugin] });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { result: installed } = renderHook(() => useEditorPlugin('counter'), {
      wrapper,
    });
    const { result: missing } = renderHook(() => useEditorPlugin('missing'), {
      wrapper,
    });

    expect(installed.current.installed).toBe(true);
    expect(installed.current.type).toBe('counter');
    expect(missing.current.installed).toBe(false);
    expect(() => missing.current.type).toThrow(
      'Plate plugin "missing" is not installed.'
    );

    const weakNameReference = { name: 'counter' } as const;
    const assertWeakNameObjectRejected = () => {
      // @ts-expect-error Weak name objects are not public hook inputs.
      useEditorPlugin(weakNameReference);
    };
    void assertWeakNameObjectRejected;
  });
});
