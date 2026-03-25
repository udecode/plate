import React from 'react';

import { renderHook } from '@testing-library/react';

import { addOnContextMenu } from './useBlockSelectable';

const useEditorPluginMock = mock();
const useElementMock = mock();
const usePathMock = mock();

mock.module('platejs/react', async () => ({
  useEditorPlugin: useEditorPluginMock,
  useElement: useElementMock,
  usePath: usePathMock,
}));

const loadModule = async () =>
  import(`./useBlockSelectable?test=${Math.random().toString(36).slice(2)}`);

describe('useBlockSelectable', () => {
  afterEach(() => {
    mock.restore();
    useEditorPluginMock.mockReset();
    useElementMock.mockReset();
    usePathMock.mockReset();
  });

  describe('addOnContextMenu', () => {
    it('does nothing when context menus are disabled', () => {
      const editor = {
        getOptions: () => ({
          enableContextMenu: false,
          selectedIds: new Set<string>(),
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
      const editor = {
        api: {
          above: () => [{ id: 'a', type: 'p' }, [0]],
          findPath: () => [0],
          isVoid: () => false,
        },
        getApi: () => ({
          blockSelection: { add: mock() },
        }),
        getOption: () => false,
        getOptions: () => ({
          enableContextMenu: true,
          selectedIds: new Set<string>(),
        }),
        selection: {
          focus: { offset: 0, path: [0, 0] },
        },
      } as any;

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
      const editor = {
        api: {
          above: () => {},
          findPath: () => [0],
          isVoid: () => false,
        },
        getApi: () => ({
          blockSelection: { add },
        }),
        getOptions: () => ({
          enableContextMenu: true,
          selectedIds: new Set<string>(),
        }),
      } as any;

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
      const editor = {
        api: {
          above: () => {},
          findPath: () => [0],
          isVoid: () => false,
        },
        getApi: () => ({
          blockSelection: { add: mock() },
        }),
        getOptions: () => ({
          enableContextMenu: true,
          selectedIds: new Set(['b']),
        }),
        setOption,
      } as any;

      addOnContextMenu(editor, {
        element: { id: 'a', type: 'p' } as any,
        event: {
          target: { dataset: {} },
        } as any,
      });

      expect(setOption).toHaveBeenCalledWith(
        expect.anything(),
        'selectedIds',
        new Set(['a'])
      );
    });
  });

  describe('useBlockSelectable', () => {
    it('returns selectable props when the block is selectable', async () => {
      const editor = {
        getApi: () => ({
          blockSelection: {
            add: mock(),
            isSelectable: () => true,
          },
        }),
        getOptions: () => ({
          enableContextMenu: true,
          selectedIds: new Set<string>(),
        }),
      } as any;

      useElementMock.mockReturnValue({ id: 'a', type: 'p' });
      usePathMock.mockReturnValue([0]);
      useEditorPluginMock.mockReturnValue({
        api: {
          blockSelection: {
            isSelectable: () => true,
          },
        },
        editor,
      });

      const { useBlockSelectable } = await loadModule();
      const { result } = renderHook(() => useBlockSelectable());

      expect(result.current.props.className).toBe('slate-selectable');
      expect(typeof result.current.props.onContextMenu).toBe('function');
    });

    it('returns empty props when the block is not selectable', async () => {
      useElementMock.mockReturnValue({ id: 'a', type: 'p' });
      usePathMock.mockReturnValue([0]);
      useEditorPluginMock.mockReturnValue({
        api: {
          blockSelection: {
            isSelectable: () => false,
          },
        },
        editor: {},
      });

      const { useBlockSelectable } = await loadModule();
      const { result } = renderHook(() => useBlockSelectable());

      expect(result.current.props).toEqual({});
    });
  });
});
