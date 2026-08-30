import { renderHook } from '@testing-library/react';
import { createEditor, Plate, type Editor } from 'platejs/react';
import React from 'react';

import { useSelectionFragmentProp } from './useSelectionFragment';

const createWrapper = (editor: Editor) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Plate editor={editor} suppressInstanceWarning>
        {children}
      </Plate>
    );
  };

describe('selection fragment hooks', () => {
  it('derives a shared property from the selected fragment', () => {
    const editor = createEditor({
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
