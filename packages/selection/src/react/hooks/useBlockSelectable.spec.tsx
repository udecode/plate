import React from 'react';

import { renderHook } from '@testing-library/react';

import { addOnContextMenu } from './useBlockSelectable';

const useEditorPluginMock = mock();
const useElementContextMock = mock();

mock.module('@platejs/core/react', async () => ({
  useEditorPlugin: useEditorPluginMock,
}));
mock.module('@platejs/core/react/internal', async () => ({
  useElementContext: useElementContextMock,
}));

const loadModule = async () =>
  import(`./useBlockSelectable?test=${Math.random().toString(36).slice(2)}`);

const createContextMenuEditor = ({
  add = mock(),
  selectedIds = new Set<string>(),
  selection,
  setOption = mock(),
}: {
  add?: AnyTestMock;
  selectedIds?: Set<string>;
  selection?: unknown;
  setOption?: AnyTestMock;
} = {}) =>
  ({
    api: {
      blockSelection: { add },
    },
    getPlugin: () => ({ type: 'p' }),
    plugin: () => ({
      api: {
        add,
      },
      getOption: () => false,
      getOptions: () => ({
        enableContextMenu: true,
        selectedIds,
      }),
      setOption,
    }),
    read: {
      nodes: {
        above: () => [{ id: 'a', type: 'p' }, [0]],
        path: () => [0],
      },
      schema: {
        isVoid: () => false,
      },
      selection: () => selection,
    },
  }) as any;

describe('useBlockSelectable', () => {
  afterEach(() => {
    mock.restore();
    useEditorPluginMock.mockReset();
    useElementContextMock.mockReset();
  });

  describe('addOnContextMenu', () => {
    it('does nothing when context menus are disabled', () => {
      const editor = {
        plugin: () => ({
          getOptions: () => ({
            enableContextMenu: false,
            selectedIds: new Set<string>(),
          }),
        }),
      } as any;
      const stopPropagation = mock();

      addOnContextMenu(editor, {
        element: { id: 'a', type: 'p' } as any,
        event: { stopPropagation } as any,
      });

      expect(stopPropagation).not.toHaveBeenCalled();
    });

    it('stops propagation when right click is on a focused unselected non-void block', () => {
      const stopPropagation = mock();
      const editor = createContextMenuEditor({
        selection: {
          focus: { offset: 0, path: [0, 0] },
        },
      });

      addOnContextMenu(editor, {
        element: { id: 'a', type: 'p' } as any,
        event: {
          stopPropagation,
          target: { dataset: {} },
        } as any,
      });

      expect(stopPropagation).toHaveBeenCalled();
    });

    it('adds to the current block selection on shift right click', () => {
      const add = mock();
      const editor = createContextMenuEditor({ add });

      addOnContextMenu(editor, {
        element: { id: 'a', type: 'p' } as any,
        event: {
          shiftKey: true,
          target: { dataset: {} },
        } as any,
      });

      expect(add).toHaveBeenCalledWith('a');
    });

    it('replaces the selection when the clicked block was not already selected', () => {
      const setOption = mock();
      const editor = createContextMenuEditor({
        selectedIds: new Set(['b']),
        setOption,
      });

      addOnContextMenu(editor, {
        element: { id: 'a', type: 'p' } as any,
        event: {
          target: { dataset: {} },
        } as any,
      });

      expect(setOption).toHaveBeenCalledWith('selectedIds', new Set(['a']));
    });
  });

  describe('useBlockSelectable', () => {
    it('returns selectable props when the block is selectable', async () => {
      const editor = {
        api: {
          blockSelection: {
            add: mock(),
            isSelectable: () => true,
          },
        },
        getOptions: () => ({
          enableContextMenu: true,
          selectedIds: new Set<string>(),
        }),
        getPlugin: () => ({ type: 'p' }),
      } as any;

      useElementContextMock.mockReturnValue({
        element: { id: 'a', type: 'p' },
        path: [0],
      });
      useEditorPluginMock.mockReturnValue({
        api: {
          isSelectable: () => true,
        },
        editor,
      });

      const { useBlockSelectable } = await loadModule();
      const { result } = renderHook(() => useBlockSelectable());

      expect(result.current.props.className).toBe('plite-selectable');
      expect(typeof result.current.props.onContextMenu).toBe('function');
    });

    it('returns empty props when the block is not selectable', async () => {
      useElementContextMock.mockReturnValue({
        element: { id: 'a', type: 'p' },
        path: [0],
      });
      useEditorPluginMock.mockReturnValue({
        api: {
          isSelectable: () => false,
        },
        editor: {},
      });

      const { useBlockSelectable } = await loadModule();
      const { result } = renderHook(() => useBlockSelectable());

      expect(result.current.props).toEqual({});
    });

    it('uses transform props without requiring element context', async () => {
      useElementContextMock.mockReturnValue(null);
      useEditorPluginMock.mockReturnValue({
        api: {
          isSelectable: () => true,
        },
        editor: {},
      });

      const { useBlockSelectable } = await loadModule();
      const { result } = renderHook(() =>
        useBlockSelectable({ element: { id: 'a', type: 'p' }, path: [0] })
      );

      expect(result.current.props.className).toBe('plite-selectable');
    });
  });
});
