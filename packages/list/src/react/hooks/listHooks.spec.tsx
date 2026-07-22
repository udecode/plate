import { renderHook } from '@testing-library/react';

const useEditorRefMock = mock();
const useEditorSelectorMock = mock();
const useReadOnlyMock = mock();
const isActiveMock = mock();
const toggleListMock = mock();

mock.module('@platejs/core/react', () => ({
  useEditorRef: useEditorRefMock,
  useEditorSelector: useEditorSelectorMock,
}));

mock.module('@platejs/plite-react', () => ({
  useEditorReadOnly: useReadOnlyMock,
}));

mock.module('../ListPlugin', () => ({
  ListPlugin: { key: 'list' },
}));

const { useListToolbarButton, useListToolbarButtonState } = await import(
  './useListToolbarButton'
);
const { useTodoListElement, useTodoListElementState } = await import(
  './useTodoListElement'
);
const { useTodoListToolbarButton, useTodoListToolbarButtonState } =
  await import('./useTodoListToolbarButton');

describe('list hooks', () => {
  beforeEach(() => {
    useEditorRefMock.mockReset();
    useEditorSelectorMock.mockReset();
    useReadOnlyMock.mockReset();
    isActiveMock.mockReset();
    toggleListMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('builds list toolbar button props from query state', async () => {
    const editor = {
      plugin: () => ({
        api: { isActive: isActiveMock },
        update: { toggle: toggleListMock },
      }),
    };
    isActiveMock.mockReturnValue(true);
    useEditorRefMock.mockReturnValue(editor);
    useEditorSelectorMock.mockImplementation((selector: any) =>
      selector(editor)
    );

    const { result } = renderHook(() => {
      const state = useListToolbarButtonState();

      return useListToolbarButton(state);
    });

    result.current.props.onClick();

    expect(result.current.props.pressed).toBe(true);
    expect(toggleListMock).toHaveBeenCalledWith({
      listStyleType: 'disc',
    });
  });

  it('updates todo checked state only when editable and the path exists', async () => {
    const setNodes = mock();
    const element = { checked: false, id: 'todo-1' };
    const update = mock(
      (
        run: (tx: {
          nodes: {
            path: () => number[];
            set: typeof setNodes;
          };
        }) => void
      ) =>
        run({
          nodes: {
            path: () => [0],
            set: setNodes,
          },
        })
    );

    useEditorRefMock.mockReturnValue({
      update,
    });
    useReadOnlyMock.mockReturnValue(false);

    const { result } = renderHook(() => {
      const state = useTodoListElementState({ element } as any);

      return useTodoListElement(state);
    });

    result.current.checkboxProps.onCheckedChange(true);

    expect(setNodes).toHaveBeenCalledWith({ checked: true }, { at: [0] });
  });

  it('builds todo toolbar button props from todo selection state', async () => {
    const editor = {
      plugin: () => ({
        api: { isActive: isActiveMock },
        update: { toggle: toggleListMock },
      }),
    };

    isActiveMock.mockReturnValue(true);
    useEditorRefMock.mockReturnValue(editor);
    useEditorSelectorMock.mockImplementation((selector: any) =>
      selector(editor)
    );

    const { result } = renderHook(() => {
      const state = useTodoListToolbarButtonState();

      return useTodoListToolbarButton(state);
    });

    result.current.props.onClick();

    expect(result.current.props.pressed).toBe(true);
    expect(toggleListMock).toHaveBeenCalledWith({
      listStyleType: 'todo',
    });
  });
});
