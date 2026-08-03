import { createPlateEditor, Plate } from '@platejs/core/react';
import { createEditor, type Element, type Value } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { ListPlugin, TodoListPlugin } from './ListPlugin';
import {
  useListToolbarButton,
  useListToolbarButtonState,
} from './useListToolbarButton';
import {
  useTodoListElement,
  useTodoListElementState,
} from './useTodoListElement';

describe('list-classic hooks', () => {
  it('builds classic list toolbar button props from the current selection', async () => {
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'Item' }], type: 'paragraph' }],
      plugins: [ListPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });
    const { result } = renderHook(
      () => {
        const state = useListToolbarButtonState();

        return {
          ...state,
          ...useListToolbarButton(state).props,
        };
      },
      {
        wrapper: ({ children }) => (
          <Plate editor={editor} suppressInstanceWarning>
            {children}
          </Plate>
        ),
      }
    );

    expect(result.current.pressed).toBe(false);

    act(() => {
      result.current.onClick();
    });

    expect(editor.read.children()[0]).toMatchObject({
      type: editor.plugin(PLUGINS.bulletedList).schema.element!.type,
    });
    await waitFor(() => {
      expect(result.current.pressed).toBe(true);
    });
  });

  it('toggles classic todo items by element reference when editable', () => {
    const initialValue: Element[] = [
      {
        checked: false,
        children: [{ text: 'Task' }],
        type: 'todoList',
      },
    ];
    const editor = createPlateEditor({
      editor: createEditor<Value>(),
      initialValue,
      plugins: [TodoListPlugin],
    });
    const element = editor.read.children()[0];
    const { result } = renderHook(
      () => {
        const state = useTodoListElementState({ element });

        return useTodoListElement(state);
      },
      {
        wrapper: ({ children }) => (
          <Plate editor={editor} suppressInstanceWarning>
            {children}
          </Plate>
        ),
      }
    );

    act(() => {
      result.current.checkboxProps.onCheckedChange(true);
    });

    expect(editor.read.children()[0]).toMatchObject({ checked: true });
  });

  it('keeps classic todo items unchanged when read-only', () => {
    const initialValue: Element[] = [
      {
        checked: false,
        children: [{ text: 'Task' }],
        type: 'todoList',
      },
    ];
    const editor = createPlateEditor({
      editor: createEditor<Value>(),
      initialValue,
      plugins: [TodoListPlugin],
      readOnly: true,
    });
    const element = editor.read.children()[0];
    const { result } = renderHook(
      () => {
        const state = useTodoListElementState({ element });

        return useTodoListElement(state);
      },
      {
        wrapper: ({ children }) => (
          <Plate editor={editor} readOnly suppressInstanceWarning>
            {children}
          </Plate>
        ),
      }
    );

    act(() => {
      result.current.checkboxProps.onCheckedChange(true);
    });

    expect(editor.read.children()[0]).toMatchObject({ checked: false });
  });
});
