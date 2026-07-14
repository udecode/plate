import { renderHook } from '@testing-library/react';
import * as actualCoreReact from '@platejs/core/react';

const useEditorRefMock = mock();
const usePluginOptionMock = mock();

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
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
      read: {
        nodes: {
          toArray: mock(() => blocks),
        },
      },
    });
    usePluginOptionMock.mockReturnValue(new Set(['a', 'b']));

    const { useBlockSelectionNodes } = await loadModule();
    const { result } = renderHook(() => useBlockSelectionNodes());

    expect(result.current).toEqual(blocks);
  });

  it('returns fragment nodes and derived props from the selection', async () => {
    const blocks = [
      [{ dir: 'rtl', id: 'a', type: 'p' }, [0]],
      [{ dir: 'rtl', id: 'b', type: 'p' }, [1]],
    ];

    useEditorRefMock.mockReturnValue({
      read: {
        nodes: {
          toArray: mock(() => blocks),
        },
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
      { dir: 'rtl', id: 'a', type: 'p' },
      { dir: 'rtl', id: 'b', type: 'p' },
    ]);
    expect(fragmentProp.current).toBe('rtl');
  });
});
