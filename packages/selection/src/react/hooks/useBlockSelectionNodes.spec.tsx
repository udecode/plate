import { renderHook } from '@testing-library/react';

const useEditorRefMock = mock();
const usePluginOptionMock = mock();

mock.module('../BlockSelectionPlugin', () => ({
  BlockSelectionPlugin: { key: 'blockSelection' },
}));

mock.module('platejs/react', async () => ({
  useEditorRef: useEditorRefMock,
  usePluginOption: usePluginOptionMock,
}));

const loadModule = async () =>
  import(
    `./useBlockSelectionNodes?test=${Math.random().toString(36).slice(2)}`
  );

describe('useBlockSelectionNodes', () => {
  afterEach(() => {
    mock.restore();
    useEditorRefMock.mockReset();
    usePluginOptionMock.mockReset();
  });

  it('returns selected block entries from the editor', async () => {
    const blocks = [
      [{ id: 'a', type: 'p' }, [0]],
      [{ id: 'b', type: 'p' }, [1]],
    ];

    useEditorRefMock.mockReturnValue({
      api: {
        blocks: mock(() => blocks),
        prop: mock(),
      },
    });
    usePluginOptionMock.mockReturnValue(new Set(['a', 'b']));

    const { useBlockSelectionNodes } = await loadModule();
    const { result } = renderHook(() => useBlockSelectionNodes());

    expect(result.current).toEqual(blocks);
  });

  it('returns fragment nodes and derived props from the selection', async () => {
    const blocks = [
      [{ id: 'a', type: 'p' }, [0]],
      [{ id: 'b', type: 'p' }, [1]],
    ];
    const prop = { dir: 'rtl' };
    const propSpy = mock(() => prop);

    useEditorRefMock.mockReturnValue({
      api: {
        blocks: mock(() => blocks),
        prop: propSpy,
      },
    });
    usePluginOptionMock.mockReturnValue(new Set(['a', 'b']));

    const { useBlockSelectionFragment, useBlockSelectionFragmentProp } =
      await loadModule();

    const { result: fragment } = renderHook(() => useBlockSelectionFragment());
    const { result: fragmentProp } = renderHook(() =>
      useBlockSelectionFragmentProp({
        key: 'dir',
      } as any)
    );

    expect(fragment.current).toEqual([
      { id: 'a', type: 'p' },
      { id: 'b', type: 'p' },
    ]);
    expect(fragmentProp.current).toEqual(prop);
    expect(propSpy).toHaveBeenCalledWith({
      key: 'dir',
      nodes: [
        { id: 'a', type: 'p' },
        { id: 'b', type: 'p' },
      ],
    });
  });
});
