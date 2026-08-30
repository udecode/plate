import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import type { Range } from '../../../core';
import { createEditor } from '../../editor';
import {
  PlateStoreProvider,
  useEditor,
  useOptionalEditor,
  useEditorId,
  useEditorMounted,
  useEditorSelection,
  useEditorState,
  useEditorValue,
  usePlateState,
  usePlateStore,
  usePlateValue,
} from './createPlateStore';

describe('createPlateStore', () => {
  const createScopedWrapper = () => {
    const editor = createEditor({
      id: 'scoped-editor',
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });

    const containerRef = { current: document.createElement('div') };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlateStoreProvider
        containerRef={containerRef}
        editor={editor}
        isMounted={true}
        primary={true}
        scope="custom"
      >
        {children}
      </PlateStoreProvider>
    );

    return { containerRef, editor, wrapper };
  };

  it('reads and writes scoped store values and selector hooks', () => {
    const { containerRef, wrapper } = createScopedWrapper();

    const { result } = renderHook(
      () => {
        const [isMounted, setIsMounted] = usePlateState('isMounted', 'custom');

        return {
          containerRef: usePlateValue('containerRef', { scope: 'custom' }),
          editorId: useEditorId(),
          isMounted,
          selectedIsMounted: useEditorMounted('custom'),
          setIsMounted,
          primary: usePlateValue('primary', { scope: 'custom' }),
        };
      },
      { wrapper }
    );

    expect(result.current.editorId).toBe('scoped-editor');
    expect(result.current.containerRef).toBe(containerRef);
    expect(result.current.isMounted).toBe(true);
    expect(result.current.selectedIsMounted).toBe(true);
    expect(result.current.primary).toBe(true);

    act(() => {
      result.current.setIsMounted(false);
    });

    expect(result.current.isMounted).toBe(false);
    expect(result.current.selectedIsMounted).toBe(false);
  });

  it('tracks editor, selection, and value through Plite runtime state', async () => {
    const { editor, wrapper } = createScopedWrapper();

    const { result } = renderHook(
      () => ({
        activeEditor: useOptionalEditor({ id: 'custom' }),
        editor: useEditor({ id: 'custom' }),
        version: useEditorState((state) => state.runtime.snapshot().version, {
          id: 'custom',
        }),
        selection: useEditorSelection('custom'),
        store: usePlateStore('custom'),
        value: useEditorValue('custom'),
      }),
      { wrapper }
    );

    expect(result.current.editor).toBe(editor);
    expect(result.current.activeEditor).toBe(editor);
    expect(result.current.store.store).toBeDefined();
    expect(result.current.selection).toEqual(editor.read.selection());
    expect(result.current.value).toEqual(editor.read.children());

    act(() => {
      editor.update.selection.set({
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      } as Range);
      editor.update.nodes.insert(
        { children: [{ text: 'two' }], type: 'paragraph' },
        { at: [1] }
      );
    });

    await waitFor(() => {
      expect(result.current.selection).toEqual(editor.read.selection());
      expect(result.current.value).toEqual(editor.read.children());
    });
  });

  it('reads a Plate editor through typed Plate store hooks', () => {
    const value = [
      { children: [{ text: 'runtime' }], type: 'paragraph' },
    ] as const;
    const editor = createEditor({
      id: 'runtime-store-editor',
      initialValue: value,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlateStoreProvider editor={editor} scope="runtime">
        {children}
      </PlateStoreProvider>
    );

    const { result } = renderHook(
      () => ({
        editor: useEditor({ id: 'runtime' }),
        value: useEditorState((state) => state.children(), { id: 'runtime' }),
      }),
      { wrapper }
    );

    act(() => {
      result.current.editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        });
      });
    });

    expect(result.current.editor).toBe(editor);
    expect(result.current.value).toEqual(value);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
