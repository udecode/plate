import React from 'react';

import { getContainerTypes } from '@platejs/core';
import { createPlateEditor, Plate } from '@platejs/core/react';
import { renderHook } from '@testing-library/react';

import {
  useSelectionFragment,
  useSelectionFragmentProp,
} from './useSelectionFragment';

const createWrapper = (editor: ReturnType<typeof createPlateEditor>) =>
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
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const fragment = [{ children: [{ text: 'one' }], type: 'p' }];
    const fragmentSpy = spyOn(editor.api, 'fragment');
    (fragmentSpy as any).mockReturnValue(fragment as any);

    const { result } = renderHook(() => useSelectionFragment(), {
      wrapper: createWrapper(editor),
    });

    expect(result.current).toEqual(fragment);
    expect(fragmentSpy).toHaveBeenCalledWith(editor.selection, {
      unwrap: getContainerTypes(editor),
    });
  });

  it('derives a shared property from the selected fragment', () => {
    const editor = createPlateEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const fragment = [{ children: [{ text: 'one' }], type: 'p' }];
    const fragmentSpy = spyOn(editor.api, 'fragment');
    (fragmentSpy as any).mockReturnValue(fragment as any);
    const propSpy = spyOn(editor.api, 'prop');
    (propSpy as any).mockReturnValue('p');

    const { result } = renderHook(
      () => useSelectionFragmentProp({ key: 'type' }),
      {
        wrapper: createWrapper(editor),
      }
    );

    expect(result.current).toBe('p');
    expect(fragmentSpy).toHaveBeenCalledWith(editor.selection, {
      unwrap: getContainerTypes(editor),
    });
    expect(propSpy).toHaveBeenCalledWith({
      key: 'type',
      nodes: fragment,
    });
  });
});
