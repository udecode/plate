import React from 'react';

import { renderHook } from '@testing-library/react';

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

describe('useBlockSelectable', () => {
  afterEach(() => {
    mock.restore();
    useEditorPluginMock.mockReset();
    useElementContextMock.mockReset();
  });

  describe('useBlockSelectable', () => {
    it('returns selectable props when the block is selectable', async () => {
      const addOnContextMenu = mock();
      const editor = {
        api: {
          blockSelection: {
            add: mock(),
            isSelectable: () => true,
          },
        },
        getPlugin: () => ({ type: 'p' }),
      } as any;

      useElementContextMock.mockReturnValue({
        element: { id: 'a', type: 'p' },
        path: [0],
      });
      useEditorPluginMock.mockReturnValue({
        api: {
          addOnContextMenu,
          isSelectable: () => true,
        },
        editor,
      });

      const { useBlockSelectable } = await loadModule();
      const { result } = renderHook(() => useBlockSelectable());

      expect(result.current.props.className).toBe('plite-selectable');
      expect(typeof result.current.props.onContextMenu).toBe('function');

      const event = {} as any;

      result.current.props.onContextMenu?.(event);
      expect(addOnContextMenu).toHaveBeenCalledWith({
        element: { id: 'a', type: 'p' },
        event,
      });
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
