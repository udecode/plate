import { createPlateEditor, Plate } from '@platejs/core/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import {
  useListToolbarButton,
  useListToolbarButtonState,
  useTodoListToolbarButton,
  useTodoListToolbarButtonState,
} from './useListToolbarButton';
import { ListPlugin } from './ListPlugin';

describe('useListToolbarButton', () => {
  it('builds list toolbar button props from query state', async () => {
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
      indent: 1,
      listStyleType: 'disc',
    });
    await waitFor(() => {
      expect(result.current.pressed).toBe(true);
    });
  });

  it('builds todo toolbar button props from todo selection state', async () => {
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
        const state = useTodoListToolbarButtonState();

        return {
          ...state,
          ...useTodoListToolbarButton(state).props,
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
      checked: false,
      indent: 1,
      listStyleType: 'todo',
    });
    await waitFor(() => {
      expect(result.current.pressed).toBe(true);
    });
  });
});
