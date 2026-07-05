import React from 'react';

import type { Range, Value } from '@platejs/plite';

import { act, renderHook, waitFor } from '@testing-library/react';

import { createPlateEditor, type PlateEditor } from '../../editor';
import {
  PlateStoreProvider,
  useEditorId,
  useEditorMounted,
  useEditorRef,
  useEditorSelection,
  useEditorState,
  useEditorValue,
  usePlateState,
  usePlateStore,
  usePlateValue,
} from './createPlateStore';

describe('createPlateStore', () => {
  const createScopedWrapper = () => {
    const editor = createPlateEditor({
      id: 'scoped-editor',
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as Range,
      value: [{ children: [{ text: 'one' }], type: 'p' }],
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
        editor: useEditorState('custom'),
        editorRef: useEditorRef('custom'),
        selection: useEditorSelection('custom'),
        store: usePlateStore('custom'),
        value: useEditorValue('custom'),
      }),
      { wrapper }
    );

    expect(result.current.editor).toBe(editor);
    expect(result.current.editorRef).toBe(editor);
    expect(result.current.editorRef.store.store).toBe(
      result.current.store.store
    );
    expect(result.current.selection).toEqual(editor.read.selection());
    expect(result.current.value).toEqual(editor.read.children());

    act(() => {
      editor.update.selection.set({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      } as Range);
      editor.update.nodes.insert(
        { children: [{ text: 'two' }], type: 'p' },
        { at: [1] }
      );
    });

    await waitFor(() => {
      expect(result.current.selection).toEqual(editor.read.selection());
      expect(result.current.value).toEqual(editor.read.children());
    });
  });

  it('reads a Plate editor through typed Plate store hooks', () => {
    const value: Value = [{ children: [{ text: 'runtime' }], type: 'p' }];
    const editor = createPlateEditor({
      id: 'runtime-store-editor',
      value,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PlateStoreProvider editor={editor} scope="runtime">
        {children}
      </PlateStoreProvider>
    );

    const { result } = renderHook(
      () => ({
        editor: useEditorState<PlateEditor<Value>>('runtime'),
        editorRef: useEditorRef<PlateEditor<Value>>('runtime'),
      }),
      { wrapper }
    );

    act(() => {
      result.current.editorRef.update((tx) => {
        tx.selection.set({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        });
      });
    });

    expect(result.current.editor).toBe(editor);
    expect(result.current.editorRef).toBe(editor);
    expect(result.current.editorRef.store).toBeDefined();
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
});
