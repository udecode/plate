import React from 'react';

import { renderHook } from '@testing-library/react';
import * as actualCoreReact from '@platejs/core/react';

const useEditorMock = mock();
const useEditorPluginMock = mock();
const useEditorSelectorMock = mock();
const useElementContextMock = mock();

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditor: useEditorMock,
  useEditorPlugin: useEditorPluginMock,
  useEditorSelector: useEditorSelectorMock,
}));
mock.module('@platejs/core/react/internal', () => ({
  useElementContext: useElementContextMock,
}));

const loadHooks = () =>
  import(`./useBlockSelection?test=${Math.random().toString(36).slice(2)}`);

const createStore = (values: Record<string, unknown>) => ({
  get: (key: string) => values[key],
  subscribe: () => () => {},
});

describe('block selection hooks', () => {
  afterEach(() => {
    mock.restore();
    useEditorMock.mockReset();
    useEditorPluginMock.mockReset();
    useEditorSelectorMock.mockReset();
    useElementContextMock.mockReset();
  });

  it('returns selectable element props from the plugin API', async () => {
    const addOnContextMenu = mock();
    const element = { id: 'a', children: [{ text: '' }], type: 'p' };

    useElementContextMock.mockReturnValue({ element, path: [0] });
    useEditorPluginMock.mockReturnValue({
      api: {
        addOnContextMenu,
        isSelectable: () => true,
      },
    });

    const { useBlockSelectable } = await loadHooks();
    const { result } = renderHook(() => useBlockSelectable());
    const event = {} as React.MouseEvent<HTMLDivElement>;

    expect(result.current.props.className).toBe('plite-selectable');
    result.current.props.onContextMenu?.(event);
    expect(addOnContextMenu).toHaveBeenCalledWith({ element, event });
  });

  it('returns no props for a non-selectable explicit target', async () => {
    const element = { id: 'a', children: [{ text: '' }], type: 'p' };

    useElementContextMock.mockReturnValue(undefined);
    useEditorPluginMock.mockReturnValue({
      api: {
        addOnContextMenu: mock(),
        isSelectable: () => false,
      },
    });

    const { useBlockSelectable } = await loadHooks();
    const { result } = renderHook(() =>
      useBlockSelectable({ element, path: [0] })
    );

    expect(result.current.props).toEqual({});
  });

  it('reads selected state from the typed plugin portal', async () => {
    const element = { id: 'a', children: [{ text: '' }], type: 'p' };

    useElementContextMock.mockReturnValue({ element, path: [0] });
    useEditorPluginMock.mockReturnValue({
      store: createStore({ selectedIds: new Set(['a']) }),
    });

    const { useBlockSelected } = await loadHooks();

    expect(renderHook(() => useBlockSelected()).result.current).toBe(true);
    expect(renderHook(() => useBlockSelected('b')).result.current).toBe(false);
  });

  it('returns selected nodes, fragments, and fragment props', async () => {
    const blocks = [
      [{ dir: 'rtl', id: 'a', type: 'p' }, [0]],
      [{ dir: 'rtl', id: 'b', type: 'p' }, [1]],
    ];

    useEditorMock.mockReturnValue({
      read: {
        nodes: {
          toArray: () => blocks,
        },
      },
    });
    useEditorPluginMock.mockReturnValue({
      store: createStore({ selectedIds: new Set(['a', 'b']) }),
    });

    const {
      useBlockSelectionFragment,
      useBlockSelectionFragmentProp,
      useBlockSelectionNodes,
    } = await loadHooks();

    expect(renderHook(() => useBlockSelectionNodes()).result.current).toEqual(
      blocks
    );
    expect(
      renderHook(() => useBlockSelectionFragment()).result.current
    ).toEqual(blocks.map(([node]) => node));
    expect(
      renderHook(() => useBlockSelectionFragmentProp({ key: 'dir' } as any))
        .result.current
    ).toBe('rtl');
  });

  it('combines expanded text and block selection state', async () => {
    const { useIsSelecting } = await loadHooks();

    useEditorPluginMock.mockReturnValue({
      store: createStore({ isSelecting: false, isSelectingSome: false }),
    });
    useEditorSelectorMock.mockReturnValue(false);
    expect(renderHook(() => useIsSelecting()).result.current).toBe(false);

    useEditorSelectorMock.mockReturnValue(true);
    expect(renderHook(() => useIsSelecting()).result.current).toBe(true);
  });

  it('reports active block selection from the derived selector', async () => {
    useEditorPluginMock.mockReturnValue({
      store: createStore({ isSelecting: false, isSelectingSome: true }),
    });
    useEditorSelectorMock.mockReturnValue(false);

    const { useIsSelecting } = await loadHooks();

    expect(renderHook(() => useIsSelecting()).result.current).toBe(true);
  });
});
