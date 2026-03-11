import React from 'react';

import { act, renderHook, waitFor } from '@testing-library/react';

import { createPlateEditor } from '../../editor';
import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { usePlateStore } from './createPlateStore';
import { useEditorSelector } from './useEditorSelector';

describe('useEditorSelector', () => {
  it('skips rerenders when equalityFn treats the derived value as unchanged', async () => {
    const editor = createPlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const renderValues: number[] = [];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );

    const { result } = renderHook(
      () => {
        const store = usePlateStore();
        const value = useEditorSelector(
          (nextEditor) => nextEditor.children.length,
          [],
          { equalityFn: (a, b) => a === b }
        );

        renderValues.push(value);

        return { store, value };
      },
      { wrapper }
    );

    expect(result.current.value).toBe(1);
    const initialRenderCount = renderValues.length;

    act(() => {
      editor.children = [...editor.children];
      result.current.store.set('versionEditor', 2);
    });

    expect(result.current.value).toBe(1);
    expect(renderValues).toHaveLength(initialRenderCount);

    act(() => {
      editor.children = [
        ...editor.children,
        { children: [{ text: 'two' }], type: 'p' },
      ];
      result.current.store.set('versionEditor', 3);
    });

    await waitFor(() => {
      expect(result.current.value).toBe(2);
    });

    expect(renderValues).toHaveLength(initialRenderCount + 1);
    expect(renderValues.at(-1)).toBe(2);
  });
});
