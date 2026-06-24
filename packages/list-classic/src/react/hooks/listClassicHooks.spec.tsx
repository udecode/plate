import { renderHook } from '@testing-library/react';
import * as actualPlatejs from 'platejs';
import * as actualPlatejsReact from 'platejs/react';

const useEditorRefMock = mock();
const useNodePathMock = mock();
const useEditorSelectorMock = mock();
const useReadOnlyMock = mock();

mock.module('platejs', () => ({
  ...actualPlatejs,
  KEYS: { ...actualPlatejs.KEYS, ulClassic: 'ulClassic' },
}));

mock.module('platejs/react', () => ({
  ...actualPlatejsReact,
  useEditorRef: useEditorRefMock,
  useEditorSelector: useEditorSelectorMock,
  useNodePath: useNodePathMock,
  useReadOnly: useReadOnlyMock,
}));

mock.module('../ListPlugin', () => ({
  ListPlugin: { key: 'listClassic' },
}));

describe('list-classic hooks', () => {
  beforeEach(() => {
    useEditorRefMock.mockReset();
    useNodePathMock.mockReset();
    useEditorSelectorMock.mockReset();
    useReadOnlyMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('builds classic list toolbar button props from the current selection', async () => {
    const { useListToolbarButton, useListToolbarButtonState } = await import(
      `./useListToolbarButton?test=${Math.random().toString(36).slice(2)}`
    );
    const listToggle = mock();

    useEditorSelectorMock.mockImplementation((selector: any) =>
      selector({
        api: {
          some: () => true,
        },
        getType: (type: string) => type,
        selection: {},
      })
    );
    useEditorRefMock.mockReturnValue({
      update: (fn: any) => fn({ toggle: { list: listToggle } }),
    });

    const { result } = renderHook(() => {
      const state = useListToolbarButtonState();

      return useListToolbarButton(state);
    });

    result.current.props.onClick();

    expect(result.current.props.pressed).toBe(true);
    expect(listToggle).toHaveBeenCalledWith({ type: 'ulClassic' });
  });

  it('toggles classic todo items by element reference when editable', async () => {
    const { useTodoListElement, useTodoListElementState } = await import(
      `./useTodoListElement?test=${Math.random().toString(36).slice(2)}`
    );
    const setNodes = mock();
    const element = { checked: false, id: 'todo-1' };

    useEditorRefMock.mockReturnValue({
      update: (fn: any) => fn({ nodes: { set: setNodes } }),
    });
    useNodePathMock.mockReturnValue([0]);
    useReadOnlyMock.mockReturnValue(false);

    const { result } = renderHook(() => {
      const state = useTodoListElementState({ element } as any);

      return useTodoListElement(state);
    });

    result.current.checkboxProps.onCheckedChange(true);

    expect(setNodes).toHaveBeenCalledWith({ checked: true }, { at: [0] });
  });
});
