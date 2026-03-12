import React from 'react';

import { createPlateEditor, Plate } from '@platejs/core/react';
import { renderHook } from '@testing-library/react';

import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from './useMarkToolbarButton';

const createWrapper = (editor: ReturnType<typeof createPlateEditor>) =>
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
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const hasMarkSpy = spyOn(editor.api, 'hasMark');
    (hasMarkSpy as any).mockReturnValue(true);

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
    expect(hasMarkSpy).toHaveBeenCalledWith('bold');
  });

  it('toggles the mark and focuses the editor on click', () => {
    const editor = createPlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const toggleMarkSpy = spyOn(editor.tf, 'toggleMark');
    const focusSpy = spyOn(editor.tf, 'focus');

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

    expect(toggleMarkSpy).toHaveBeenCalledWith('bold', {
      remove: ['italic'],
    });
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
