import React from 'react';

import { createPlateEditor, Plate } from '@platejs/core/react';
import { renderHook } from '@testing-library/react';

import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from './useMarkToolbarButton';

const createWrapper = (editor: any) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Plate editor={editor} suppressInstanceWarning>
        {children}
      </Plate>
    );
  };

describe('useMarkToolbarButton', () => {
  it('derives pressed state from editor marks', () => {
    const editor = createPlateEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    editor.update((tx) => {
      tx.marks.add('bold', true);
    });

    const { result } = renderHook(
      () => useMarkToolbarButtonState({ clear: 'italic', nodeType: 'bold' }),
      {
        wrapper: createWrapper(editor),
      }
    );

    expect(result.current).toEqual({
      clear: 'italic',
      nodeType: 'bold',
      pressed: true,
    });
  });

  it('toggles the mark and focuses the editor on click', () => {
    const editor = createPlateEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    editor.update((tx) => {
      tx.marks.add('italic', true);
    });
    const focusSpy = spyOn(editor.api.dom as any, 'focus');

    const { result } = renderHook(
      () =>
        useMarkToolbarButton({
          clear: ['italic'],
          nodeType: 'bold',
          pressed: true,
        }),
      {
        wrapper: createWrapper(editor),
      }
    );

    result.current.props.onClick();

    expect((editor.api as any).hasMark('bold')).toBe(true);
    expect((editor.api as any).hasMark('italic')).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
  });

  it('prevents the default mouse down behavior', () => {
    const editor = createPlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const preventDefault = mock();

    const { result } = renderHook(
      () =>
        useMarkToolbarButton({
          clear: undefined,
          nodeType: 'bold',
          pressed: false,
        }),
      {
        wrapper: createWrapper(editor),
      }
    );

    result.current.props.onMouseDown({
      preventDefault,
    } as unknown as React.MouseEvent<HTMLButtonElement>);

    expect(preventDefault).toHaveBeenCalled();
  });
});
