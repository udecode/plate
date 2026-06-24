import React from 'react';

import { createPlateEditor, Plate } from '@platejs/core/react';
import { renderHook } from '@testing-library/react';

import { useRemoveNodeButton } from './useRemoveNodeButton';

const createWrapper = (editor: any) =>
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
    const element = editor.children[0] as any;

    const { result } = renderHook(() => useRemoveNodeButton({ element }), {
      wrapper: createWrapper(editor),
    });

    result.current.props.onClick();

    expect(editor.children).toEqual([
      expect.objectContaining({
        children: [{ text: 'two' }],
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
          element: { children: [{ text: 'one' }], type: 'p' } as any,
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
