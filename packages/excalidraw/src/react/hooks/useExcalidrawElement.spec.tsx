import { act, renderHook } from '@testing-library/react';

const useEditorRefMock = mock();
const useNodePathMock = mock();
const useReadOnlyMock = mock();
const cloneDeepMock = mock((value: any) => structuredClone(value));
const isEqualMock = mock(
  (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)
);

mock.module('lodash', () => ({
  cloneDeep: cloneDeepMock,
  isEqual: isEqualMock,
}));

mock.module('platejs/react', () => ({
  useEditorRef: useEditorRefMock,
  useNodePath: useNodePathMock,
  useReadOnly: useReadOnlyMock,
}));

describe('useExcalidrawElement', () => {
  beforeEach(() => {
    useEditorRefMock.mockReset();
    useNodePathMock.mockReset();
    useReadOnlyMock.mockReset();
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
    const update = mock((fn: any) => fn({ nodes: { set: setNodes } }));

    useEditorRefMock.mockReturnValue({ update });
    useNodePathMock.mockReturnValue([0]);
    useReadOnlyMock.mockReturnValue(false);

    const element = {
      data: {
        elements: [{ id: 'el-1' }],
        state: { zoom: 1 },
      },
      id: 'node-1',
    } as any;

    const { result } = renderHook(() =>
      useExcalidrawElement({ element, libraryItems: [{ id: 'lib' }] as any })
    );

    act(() => {
      result.current.excalidrawProps.onChange?.(
        [{ id: 'el-2' }] as any,
        { zoom: 2 } as any
      );
      result.current.excalidrawProps.onChange?.(
        [{ id: 'el-2' }] as any,
        { zoom: 2 } as any
      );
    });

    expect(result.current.excalidrawProps.initialData).toEqual({
      appState: { zoom: 1 },
      elements: [{ id: 'el-1' }],
      libraryItems: [{ id: 'lib' }],
      scrollToContent: true,
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(setNodes).toHaveBeenCalledWith(
      {
        data: {
          elements: [{ id: 'el-2' }],
          state: { zoom: 2 },
        },
      },
      { at: [0] }
    );
  });
});
