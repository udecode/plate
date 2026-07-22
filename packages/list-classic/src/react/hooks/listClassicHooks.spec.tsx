import { renderHook } from '@testing-library/react';
import * as actualCoreReact from '@platejs/core/react';
import * as actualPliteReact from '@platejs/plite-react';
import { KEYS } from '@platejs/utils';

const useEditorMock = mock();
const useEditorSelectorMock = mock();
const useEditorReadOnlyMock = mock();

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditor: useEditorMock,
  useEditorSelector: useEditorSelectorMock,
}));

mock.module('@platejs/plite-react', () => ({
  ...actualPliteReact,
  useEditorReadOnly: useEditorReadOnlyMock,
}));

mock.module('../ListPlugin', () => ({
  ListPlugin: { key: 'listClassic' },
}));

describe('list-classic hooks', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
    useEditorSelectorMock.mockReset();
    useEditorReadOnlyMock.mockReset();
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
        read: {
          selection: () => ({}),
          nodes: {
            some: () => true,
          },
        },
        getType: (type: string) => type,
      })
    );
    useEditorMock.mockReturnValue({
      plugin: () => ({
        update: { toggle: { list: listToggle } },
      }),
    });

    const { result } = renderHook(() => {
      const state = useListToolbarButtonState();

      return useListToolbarButton(state);
    });

    result.current.props.onClick();

    expect(result.current.props.pressed).toBe(true);
    expect(listToggle).toHaveBeenCalledWith({ type: KEYS.ulClassic });
  });

  it('toggles classic todo items by element reference when editable', async () => {
    const { useTodoListElement, useTodoListElementState } = await import(
      `./useTodoListElement?test=${Math.random().toString(36).slice(2)}`
    );
    const setNodes = mock();
    const element = { checked: false, id: 'todo-1' };

    useEditorMock.mockReturnValue({
      update: { nodes: { set: setNodes } },
    });
    useEditorReadOnlyMock.mockReturnValue(false);

    const { result } = renderHook(() => {
      const state = useTodoListElementState({ element } as any);

      return useTodoListElement(state);
    });

    result.current.checkboxProps.onCheckedChange(true);

    expect(setNodes).toHaveBeenCalledWith({ checked: true }, { at: element });
  });
});
