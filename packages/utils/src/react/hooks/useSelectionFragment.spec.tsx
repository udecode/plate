import React from 'react';

import {
  createPlateEditor,
  Plate,
  type PlateEditorReference,
} from '@platejs/core/react';
import { renderHook } from '@testing-library/react';

import {
  useSelectionFragment,
  useSelectionFragmentProp,
} from './useSelectionFragment';

const createWrapper = <E extends PlateEditorReference>(editor: E) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Plate editor={editor} suppressInstanceWarning>
        {children}
      </Plate>
    );
  };

describe('useSelectionFragment', () => {
  it('returns the selected fragment with container unwrap types', () => {
    const editor = createPlateEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    const fragment = [{ children: [{ text: 'one' }], type: 'paragraph' }];

    const { result } = renderHook(() => useSelectionFragment(), {
      wrapper: createWrapper(editor),
    });

    expect(result.current).toEqual(fragment);
  });

  it('derives a shared property from the selected fragment', () => {
    const editor = createPlateEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });

    const { result } = renderHook(
      () => useSelectionFragmentProp({ key: 'type' }),
      {
        wrapper: createWrapper(editor),
      }
    );

    expect(result.current).toBe('paragraph');
  });
});
