import React from 'react';

import { act, renderHook } from '@testing-library/react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createPlateEditor } from '../../editor';
import { createPlatePlugin } from '../../plugin';
import { useEditorPlugin } from './useEditorPlugin';

describe('useEditorPlugin', () => {
  it('returns the editor plugin context with a stable store-backed reference', () => {
    const CounterPlugin = createPlatePlugin({
      key: 'counter',
      options: {
        value: 1,
      },
    });
    const editor = createPlateEditor({
      plugins: [CounterPlugin],
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );

    const { result, rerender } = renderHook(
      () => useEditorPlugin(CounterPlugin),
      {
        wrapper,
      }
    );

    const firstContext = result.current;

    expect(firstContext.editor).toBe(editor);
    expect(firstContext.plugin.key).toBe('counter');
    expect(firstContext.getOptions()).toEqual({ value: 1 });
    expect(firstContext.store).toBeDefined();

    rerender();
    expect(result.current).toBe(firstContext);

    act(() => {
      editor.setOption(CounterPlugin, 'value', 2);
    });

    expect(result.current.getOptions()).toEqual({ value: 2 });
  });
});
