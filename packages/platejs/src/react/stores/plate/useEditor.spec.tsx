import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import type { Range } from '../../../core';
import { EditorProvider } from '../../components/EditorProvider';
import { createEditor } from '../../editor';
import {
  useEditor,
  useEditorHasSelection,
  useOptionalEditor,
  useEditorSelection,
  useEditorState,
  useEditorValue,
} from './useEditor';

describe('editor context', () => {
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

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EditorProvider editor={editor}>{children}</EditorProvider>
    );
    return { editor, wrapper };
  };

  it('rerenders for selection presence changes, not caret movement or document edits', () => {
    const { editor, wrapper } = createScopedWrapper();
    const rendered: boolean[] = [];
    const { result } = renderHook(
      () => {
        const hasSelection = useEditorHasSelection();
        rendered.push(hasSelection);
        return hasSelection;
      },
      { wrapper }
    );

    expect(result.current).toBe(true);
    const initialRenderCount = rendered.length;

    act(() => {
      editor.update.selection.set({
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
    });
    act(() => {
      editor.update.selection.set({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      });
    });
    act(() => {
      editor.update.nodes.insert(
        { type: 'paragraph', children: [{ text: 'unrelated' }] },
        { at: [1] }
      );
    });
    expect(result.current).toBe(true);
    expect(rendered).toHaveLength(initialRenderCount);

    act(() => editor.update.selection.set(null));
    expect(result.current).toBe(false);
    expect(rendered).toHaveLength(initialRenderCount + 1);

    act(() => {
      editor.update.selection.set({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });
    expect(result.current).toBe(true);
    expect(rendered).toHaveLength(initialRenderCount + 2);
  });

  it('follows an explicitly provided replacement editor', () => {
    const first = createEditor();
    const second = createEditor({
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });
    let selected = first;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EditorProvider editor={first}>
        <EditorProvider editor={selected}>{children}</EditorProvider>
      </EditorProvider>
    );
    const { result, rerender } = renderHook(
      () => ({ editor: useEditor(), hasSelection: useEditorHasSelection() }),
      { wrapper }
    );
    expect(result.current).toEqual({ editor: first, hasSelection: false });
    selected = second;
    rerender();
    expect(result.current).toEqual({ editor: second, hasSelection: true });
    act(() =>
      first.update.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      })
    );
    expect(result.current.editor).toBe(second);
    act(() => second.update.selection.set(null));
    expect(result.current.hasSelection).toBe(false);
  });

  it('tracks editor, selection, and value through Plite runtime state', async () => {
    const { editor, wrapper } = createScopedWrapper();

    const { result } = renderHook(
      () => ({
        activeEditor: useOptionalEditor(),
        editor: useEditor(),
        version: useEditorState((state) => state.runtime.snapshot().version),
        selection: useEditorSelection(),
        value: useEditorValue(),
      }),
      { wrapper }
    );

    expect(result.current.editor).toBe(editor);
    expect(result.current.activeEditor).toBe(editor);
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

  it('reads a Plate editor through typed context hooks', () => {
    const value = [
      { children: [{ text: 'runtime' }], type: 'paragraph' },
    ] as const;
    const editor = createEditor({
      id: 'runtime-store-editor',
      initialValue: value,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EditorProvider editor={editor}>{children}</EditorProvider>
    );

    const { result } = renderHook(
      () => ({
        editor: useEditor(),
        value: useEditorState((state) => state.children()),
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
