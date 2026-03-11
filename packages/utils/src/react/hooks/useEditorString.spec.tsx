import React from 'react';

import { createPlateEditor, Plate } from '@platejs/core/react';
import { renderHook } from '@testing-library/react';

import { useEditorString } from './useEditorString';

describe('useEditorString', () => {
  it('reads the editor string from the root path', () => {
    const editor = createPlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const stringSpy = spyOn(editor.api, 'string');
    (stringSpy as any).mockReturnValue('full text');

    const { result } = renderHook(() => useEditorString(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <Plate editor={editor} suppressInstanceWarning>
          {children}
        </Plate>
      ),
    });

    expect(result.current).toBe('full text');
    expect(stringSpy).toHaveBeenCalledWith([]);
  });
});
