import { renderHook } from '@testing-library/react';
import * as actualCoreReact from '@platejs/core/react';

const useEditorMock = mock();
const usePluginStoreMock = mock();

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditor: useEditorMock,
  usePluginStore: usePluginStoreMock,
}));

const loadModule = async () =>
  import(
    `./useBlockSelectionNodes?test=${Math.random().toString(36).slice(2)}`
  );

describe('useBlockSelectionNodes', () => {
  afterEach(() => {
    mock.restore();
    useEditorMock.mockReset();
    usePluginStoreMock.mockReset();
  });

  it('returns selected block entries from the editor', async () => {
    const blocks = [
      [{ id: 'a', type: 'p' }, [0]],
      [{ id: 'b', type: 'p' }, [1]],
    ];

    useEditorMock.mockReturnValue({
      read: {
        nodes: {
          toArray: mock(() => blocks),
        },
      },
    });
    usePluginStoreMock.mockReturnValue(new Set(['a', 'b']));

    const { useBlockSelectionNodes } = await loadModule();
    const { result } = renderHook(() => useBlockSelectionNodes());

    expect(result.current).toEqual(blocks);
  });

  it('returns fragment nodes and derived props from the selection', async () => {
    const blocks = [
      [{ dir: 'rtl', id: 'a', type: 'p' }, [0]],
      [{ dir: 'rtl', id: 'b', type: 'p' }, [1]],
    ];

    useEditorMock.mockReturnValue({
      read: {
        nodes: {
          toArray: mock(() => blocks),
        },
      },
    });
    usePluginStoreMock.mockReturnValue(new Set(['a', 'b']));

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
