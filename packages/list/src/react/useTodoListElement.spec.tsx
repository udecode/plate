import { createPlateEditor, Plate } from '@platejs/core/react';
import type { Element } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { ListPlugin } from './ListPlugin';
import {
  useTodoListElement,
  useTodoListElementState,
} from './useTodoListElement';

describe('useTodoListElement', () => {
  it('updates checked state by live element when editable', () => {
    const initialValue: Element[] = [
      {
        checked: false,
        children: [{ text: '' }],
        id: 'todo-1',
        indent: 1,
        listStyleType: KEYS.listTodo,
        type: KEYS.p,
      },
    ];
    const editor = createPlateEditor({
      initialValue,
      plugins: [ListPlugin],
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
});
