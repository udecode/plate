import React from 'react';

import {
  createPlateEditor,
  Plate,
  type PlateEditorReference,
} from '@platejs/core/react';
import type { Element } from '@platejs/plite';
import { renderHook } from '@testing-library/react';

import { useRemoveNodeButton } from './useRemoveNodeButton';

const createWrapper = <E extends PlateEditorReference>(editor: E) =>
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
      initialValue: [
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: 'two' }], type: 'paragraph' },
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
        type: 'paragraph',
      }),
    ]);
  });

  it('resolves the node path when clicked', () => {
    const editor = createPlateEditor({
      initialValue: [
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: 'two' }], type: 'paragraph' },
        { children: [{ text: 'three' }], type: 'paragraph' },
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
        type: 'paragraph',
      }),
    ]);
  });

  it('prevents the default mouse down behavior', () => {
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    const preventDefault = mock();

    const { result } = renderHook(
      () =>
        useRemoveNodeButton({
          element: {
            children: [{ text: 'one' }],
            type: 'paragraph',
          } satisfies Element,
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
