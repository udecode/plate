import React from 'react';

import { createPlateEditor, Plate } from '@platejs/core/react';
import { renderHook } from '@testing-library/react';

import { useRemoveNodeButton } from './useRemoveNodeButton';

const createWrapper = (editor: ReturnType<typeof createPlateEditor>) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Plate editor={editor} suppressInstanceWarning>
        {children}
      </Plate>
    );
  };

describe('useRemoveNodeButton', () => {
  it('removes the node at the path returned by findPath', () => {
    const element = { children: [{ text: 'one' }], type: 'p' } as any;
    const editor = createPlateEditor({
      value: [element],
    });
    const findPathSpy = spyOn(editor.api, 'findPath');
    (findPathSpy as any).mockReturnValue([0]);
    const removeNodesSpy = spyOn(editor.tf, 'removeNodes');

    const { result } = renderHook(() => useRemoveNodeButton({ element }), {
      wrapper: createWrapper(editor),
    });

    result.current.props.onClick();

    expect(findPathSpy).toHaveBeenCalledWith(element);
    expect(removeNodesSpy).toHaveBeenCalledWith({ at: [0] });
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
