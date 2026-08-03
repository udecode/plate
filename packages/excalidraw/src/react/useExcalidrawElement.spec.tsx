import { act, renderHook, waitFor } from '@testing-library/react';
import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { LibraryItems } from '@excalidraw/excalidraw/types';

import type { ExcalidrawElement } from '../lib';

const useEditorMock = mock();
const useEditorReadOnlyMock = mock();
const cloneDeepMock = mock(<T,>(value: T): T => structuredClone(value));
const isEqualMock = mock(
  (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
);
const ExcalidrawMock = () => null;

mock.module('lodash', () => ({
  cloneDeep: cloneDeepMock,
  isEqual: isEqualMock,
}));

mock.module('@platejs/core/react', () => ({
  useEditor: useEditorMock,
}));

mock.module('@platejs/plite-react', () => ({
  useEditorReadOnly: useEditorReadOnlyMock,
}));

mock.module('@excalidraw/excalidraw', () => ({
  Excalidraw: ExcalidrawMock,
}));

describe('useExcalidrawElement', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
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

    useEditorMock.mockReturnValue({
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
      type: 'excalidraw',
    } satisfies ExcalidrawElement;

    const { result } = renderHook(() => useExcalidrawElement({ element }));

    await waitFor(() => {
      expect(result.current.Excalidraw).toBe(ExcalidrawMock);
    });

    act(() => {
      result.current.excalidrawProps.onChange?.(
        [
          {
            id: 'el-2',
          } as OrderedExcalidrawElement,
        ],
        {
          activeTool: undefined,
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
          activeTool: undefined,
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
    expect(setNodes).toHaveBeenCalledWith(
      {
        data: {
          elements: [{ id: 'el-2' }],
          state: { viewBackgroundColor: '#000' },
        },
      },
      { at: [0] }
    );
  });

  it('loads the component and disables writes in read-only mode', async () => {
    const { useExcalidrawElement } = await import(
      `./useExcalidrawElement?readonly=${Math.random().toString(36).slice(2)}`
    );

    useEditorMock.mockReturnValue({ id: 'editor' });
    useEditorReadOnlyMock.mockReturnValue(true);

    const libraryItems = [] satisfies LibraryItems;
    const element = {
      children: [{ text: '' }],
      type: 'excalidraw',
    } satisfies ExcalidrawElement;
    const { result } = renderHook(() =>
      useExcalidrawElement({
        element,
        libraryItems,
        scrollToContent: false,
      })
    );

    await waitFor(() => {
      expect(result.current.Excalidraw).toBe(ExcalidrawMock);
    });

    expect(result.current.excalidrawProps).toMatchObject({
      autoFocus: false,
      initialData: {
        elements: [],
        libraryItems,
        scrollToContent: false,
      },
      onChange: undefined,
    });
    expect(result.current.excalidrawProps.initialData?.libraryItems).not.toBe(
      libraryItems
    );
  });
});
