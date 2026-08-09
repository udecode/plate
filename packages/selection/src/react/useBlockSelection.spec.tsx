import React from 'react';

import { renderHook } from '@testing-library/react';
import * as actualCoreReact from '@platejs/core/react';
import type { Element, Path, NodeKey } from '@platejs/plite';

const useEditorMock = mock();
const useEditorPluginMock = mock();
const useEditorSelectorMock = mock();
const useElementContextMock = mock();
const usePluginStoreMock = mock();

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditor: useEditorMock,
  useEditorPlugin: useEditorPluginMock,
  useEditorSelector: useEditorSelectorMock,
  usePluginStore: usePluginStoreMock,
}));
mock.module('@platejs/core/react/internal', () => ({
  useElementContext: useElementContextMock,
}));

const loadHooks = () =>
  import(`./useBlockSelection?test=${Math.random().toString(36).slice(2)}`);

describe('block selection hooks', () => {
  afterEach(() => {
    mock.restore();
    useEditorMock.mockReset();
    useEditorPluginMock.mockReset();
    useEditorSelectorMock.mockReset();
    useElementContextMock.mockReset();
    usePluginStoreMock.mockReset();
  });

  it('returns selectable element props from the plugin API', async () => {
    const addOnContextMenu = mock();
    const element = { id: 'a', children: [{ text: '' }], type: 'paragraph' };

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
    const element = { id: 'a', children: [{ text: '' }], type: 'paragraph' };

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
    const element = { children: [{ text: '' }], type: 'paragraph' };
    const nodeKey = 'runtime:a' as NodeKey;

    useElementContextMock.mockReturnValue({ element, path: [0] });
    useEditorMock.mockReturnValue({
      key: () => nodeKey,
    });
    usePluginStoreMock.mockImplementation(
      (_plugin, key, id) => key === 'isSelected' && id === nodeKey
    );

    const { useBlockSelected } = await loadHooks();

    expect(renderHook(() => useBlockSelected()).result.current).toBe(true);
    expect(
      renderHook(() => useBlockSelected('runtime:b' as NodeKey)).result.current
    ).toBe(false);
  });

  it('returns selected nodes, fragments, and fragment props', async () => {
    const firstNodeKey = 'runtime:a' as NodeKey;
    const secondNodeKey = 'runtime:b' as NodeKey;
    const blocks: [Element, Path][] = [
      [{ children: [{ text: '' }], dir: 'rtl', type: 'paragraph' }, [0]],
      [{ children: [{ text: '' }], dir: 'rtl', type: 'paragraph' }, [1]],
    ];
    const nodeKeys = new Map<Element, NodeKey>([
      [blocks[0]![0], firstNodeKey],
      [blocks[1]![0], secondNodeKey],
    ]);

    useEditorMock.mockReturnValue({
      key: (node: Element) => nodeKeys.get(node),
      read: {
        nodes: {
          toArray: () => blocks,
        },
      },
    });
    usePluginStoreMock.mockReturnValue(new Set([firstNodeKey, secondNodeKey]));

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

    usePluginStoreMock.mockReturnValue(false);
    useEditorSelectorMock.mockReturnValue(false);
    expect(renderHook(() => useIsSelecting()).result.current).toBe(false);

    useEditorSelectorMock.mockReturnValue(true);
    expect(renderHook(() => useIsSelecting()).result.current).toBe(true);
  });

  it('reports active block selection from the derived selector', async () => {
    usePluginStoreMock.mockReturnValue(true);
    useEditorSelectorMock.mockReturnValue(false);

    const { useIsSelecting } = await loadHooks();

    expect(renderHook(() => useIsSelecting()).result.current).toBe(true);
  });
});
