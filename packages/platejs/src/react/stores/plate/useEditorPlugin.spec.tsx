import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createEditor } from '../../editor';
import { definePlatePlugin } from '../../plugin';
import { useEditorPlugin } from './useEditorPlugin';

describe('useEditorPlugin', () => {
  it('infers plugin-owned updates from the descriptor', () => {
    const duplicate = vi.fn();
    const BlockPlugin = definePlatePlugin('block', {
      update: () => ({ duplicate }),
    });
    const editor = createEditor({ plugins: [BlockPlugin] });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { result } = renderHook(() => useEditorPlugin(BlockPlugin), {
      wrapper: Wrapper,
    });

    void act(() => result.current.update.duplicate());

    expect(duplicate).toHaveBeenCalledTimes(1);
  });

  it('returns the flat plugin portal with a stable store-backed reference', () => {
    const CounterPlugin = definePlatePlugin('counter', {
      initialState: {
        value: 1,
      },
    });
    const editor = createEditor({
      plugins: [CounterPlugin],
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );

    const { result, rerender } = renderHook(
      () => useEditorPlugin(CounterPlugin),
      {
        wrapper: Wrapper,
      }
    );

    const firstPortal = result.current;

    expect(firstPortal.name).toBe('counter');
    expect(firstPortal.store.get()).toEqual({ value: 1 });
    expect(firstPortal.store).toBeDefined();
    expect('plugin' in firstPortal).toBe(false);
    expect('editor' in firstPortal).toBe(false);
    expect('defineCodecs' in firstPortal).toBe(false);

    rerender();
    expect(result.current).toBe(firstPortal);

    act(() => {
      editor.plugin(CounterPlugin).store.set({ value: 2 });
    });

    expect(result.current.store.get()).toEqual({ value: 2 });
  });

  it('accepts runtime names without weakening missing-plugin errors', () => {
    const CounterPlugin = definePlatePlugin('counter', {});
    const editor = createEditor({ plugins: [CounterPlugin] });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { result: installed } = renderHook(() => useEditorPlugin('counter'), {
      wrapper: Wrapper,
    });
    const { result: missing } = renderHook(() => useEditorPlugin('missing'), {
      wrapper: Wrapper,
    });

    expect(installed.current.installed).toBe(true);
    expect(installed.current.name).toBe('counter');
    expect(missing.current.installed).toBe(false);
    expect(() => missing.current.name).toThrow(
      'Plate plugin "missing" is not installed.'
    );

    const weakNameReference = { name: 'counter' } as const;
    const useAssertWeakNameObjectRejected = () => {
      // @ts-expect-error Weak name objects are not public hook inputs.
      useEditorPlugin(weakNameReference);
    };
    void useAssertWeakNameObjectRejected;
  });
});
