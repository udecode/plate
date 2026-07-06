import React from 'react';

import {
  createPlateEditor,
  Plate,
  type PlateEditor,
} from '@platejs/core/react';
import type { Element } from '@platejs/plite';
import { renderHook } from '@testing-library/react';

import { useRemoveNodeButton } from './useRemoveNodeButton';

const createWrapper = (editor: PlateEditor) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Plate editor={editor} suppressInstanceWarning>
        {children}
      </Plate>
    );
  };

describe('useRemoveNodeButton', () => {
  it('removes the node at the current node path', () => {
    const editor = createPlateEditor({
      value: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: 'two' }], type: 'p' },
      ],
    });
    const element = editor.read.children()[0];

    const { result } = renderHook(() => useRemoveNodeButton({ element }), {
      wrapper: createWrapper(editor),
    });

    result.current.props.onClick();

    expect(editor.read.children()).toEqual([
      expect.objectContaining({
        children: [{ text: 'two' }],
        type: 'p',
      }),
    ]);
  });

  it('resolves the node path when clicked', () => {
    const editor = createPlateEditor({
      value: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: 'two' }], type: 'p' },
        { children: [{ text: 'three' }], type: 'p' },
      ],
    });
    const element = editor.read.children()[1];

    const { result } = renderHook(() => useRemoveNodeButton({ element }), {
      wrapper: createWrapper(editor),
    });

    editor.update.nodes.remove({ at: [0] });
    result.current.props.onClick();

    expect(editor.read.children()).toEqual([
      expect.objectContaining({
        children: [{ text: 'three' }],
        type: 'p',
      }),
    ]);
  });

  it('prevents the default mouse down behavior', () => {
    const editor = createPlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const preventDefault = mock();

    const { result } = renderHook(
      () =>
        useRemoveNodeButton({
          element: { children: [{ text: 'one' }], type: 'p' } satisfies Element,
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
