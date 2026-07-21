import { act, renderHook } from '@testing-library/react';
import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';

import type { TExcalidrawElement } from '../../lib';

const useEditorRefMock = mock();
const useEditorReadOnlyMock = mock();
const cloneDeepMock = mock(<T,>(value: T): T => structuredClone(value));
const isEqualMock = mock(
  (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
);

mock.module('lodash', () => ({
  cloneDeep: cloneDeepMock,
  isEqual: isEqualMock,
}));

mock.module('@platejs/core/react', () => ({
  useEditorRef: useEditorRefMock,
}));

mock.module('@platejs/plite-react', () => ({
  useEditorReadOnly: useEditorReadOnlyMock,
}));

mock.module('@excalidraw/excalidraw', () => ({
  Excalidraw: () => null,
}));

describe('useExcalidrawElement', () => {
  beforeEach(() => {
    useEditorRefMock.mockReset();
    useEditorReadOnlyMock.mockReset();
    cloneDeepMock.mockClear();
    isEqualMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('builds mutable initial data and writes deduplicated changes back to the editor', async () => {
    const { useExcalidrawElement } = await import(
      `./useExcalidrawElement?test=${Math.random().toString(36).slice(2)}`
    );
    const setNodes = mock();

    useEditorRefMock.mockReturnValue({
      read: {
        nodes: {
          path: () => [0],
        },
      },
      update: { nodes: { set: setNodes } },
    });
    useEditorReadOnlyMock.mockReturnValue(false);

    const element = {
      children: [{ text: '' }],
      data: {
        elements: [{ id: 'el-1' } as OrderedExcalidrawElement],
        state: { viewBackgroundColor: '#fff' },
      },
      id: 'node-1',
      type: 'excalidraw',
    } satisfies TExcalidrawElement;

    const { result } = renderHook(() => useExcalidrawElement({ element }));

    act(() => {
      result.current.excalidrawProps.onChange?.(
        [
          {
            id: 'el-2',
          } as OrderedExcalidrawElement,
        ],
        {
          viewBackgroundColor: '#000',
        },
        {}
      );
      result.current.excalidrawProps.onChange?.(
        [
          {
            id: 'el-2',
          } as OrderedExcalidrawElement,
        ],
        {
          viewBackgroundColor: '#000',
        },
        {}
      );
    });

    expect(result.current.excalidrawProps.initialData).toEqual({
      appState: { viewBackgroundColor: '#fff' },
      elements: [{ id: 'el-1' }],
      libraryItems: [],
      scrollToContent: true,
    });
    expect(setNodes).toHaveBeenCalledTimes(1);
  });
});
