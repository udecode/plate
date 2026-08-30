import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createEditor } from '../../editor';
import { useEditorSelector } from './useEditorSelector';

describe('useEditorSelector', () => {
  it('skips rerenders when equalityFn treats the derived value as unchanged', async () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    const renderValues: number[] = [];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );

    const { result } = renderHook(
      () => {
        const value = useEditorSelector(
          (nextEditor) => nextEditor.read.children().length,
          { equalityFn: (a, b) => a === b }
        );

        renderValues.push(value);

        return { value };
      },
      { wrapper }
    );

    expect(result.current.value).toBe(1);
    const initialRenderCount = renderValues.length;

    act(() => {
      editor.update.selection.set({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });

    expect(result.current.value).toBe(1);
    expect(renderValues).toHaveLength(initialRenderCount);

    act(() => {
      editor.update.nodes.insert(
        { children: [{ text: 'two' }], type: 'paragraph' },
        { at: [1] }
      );
    });

    await waitFor(() => {
      expect(result.current.value).toBe(2);
    });

    expect(renderValues).toHaveLength(initialRenderCount + 1);
    expect(renderValues.at(-1)).toBe(2);
  });
});
