import { renderHook } from '@testing-library/react';

const useEditorRefMock = mock();
const useEditorSelectorMock = mock();
const useReadOnlyMock = mock();
const someListMock = mock();
const someTodoListMock = mock();
const toggleListMock = mock();

mock.module('platejs/react', () => ({
  useEditorRef: useEditorRefMock,
  useEditorSelector: useEditorSelectorMock,
  useReadOnly: useReadOnlyMock,
}));

mock.module('../../index', () => ({
  ListStyleType: { Disc: 'disc' },
  toggleList: toggleListMock,
}));

mock.module('../../lib/queries/someList', () => ({
  someList: someListMock,
}));

mock.module('../../lib/queries/someTodoList', () => ({
  someTodoList: someTodoListMock,
}));

describe('list hooks', () => {
  beforeEach(() => {
    useEditorRefMock.mockReset();
    useEditorSelectorMock.mockReset();
    useReadOnlyMock.mockReset();
    someListMock.mockReset();
    someTodoListMock.mockReset();
    toggleListMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('builds list toolbar button props from query state', async () => {
    const { useListToolbarButton, useListToolbarButtonState } = await import(
      `./useListToolbarButton?test=${Math.random().toString(36).slice(2)}`
    );
    const editor = {};
    someListMock.mockReturnValue(true);
    useEditorRefMock.mockReturnValue(editor);
    useEditorSelectorMock.mockImplementation((selector: any) => selector({}));

    const { result } = renderHook(() => {
      const state = useListToolbarButtonState();

      return useListToolbarButton(state);
    });

    result.current.props.onClick();

    expect(result.current.props.pressed).toBe(true);
    expect(toggleListMock).toHaveBeenCalledWith(editor, {
      listStyleType: 'disc',
    });
  });

  it('updates todo checked state only when editable and the path exists', async () => {
    const { useTodoListElement, useTodoListElementState } = await import(
      `./useTodoListElement?test=${Math.random().toString(36).slice(2)}`
    );
    const setNodes = mock();
    const element = { checked: false, id: 'todo-1' };

    useEditorRefMock.mockReturnValue({
      api: {
        findPath: () => [0],
      },
      tf: { setNodes },
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
    const { useIndentTodoToolBarButton, useIndentTodoToolBarButtonState } =
      await import(
        `./useTodoListToolbarButton?test=${Math.random().toString(36).slice(2)}`
      );
    const editor = {};

    someTodoListMock.mockReturnValue(true);
    useEditorRefMock.mockReturnValue(editor);
    useEditorSelectorMock.mockImplementation((selector: any) => selector({}));

    const { result } = renderHook(() => {
      const state = useIndentTodoToolBarButtonState();

      return useIndentTodoToolBarButton(state);
    });

    result.current.props.onClick();

    expect(result.current.props.pressed).toBe(true);
    expect(toggleListMock).toHaveBeenCalledWith(editor, {
      listStyleType: 'disc',
    });
  });
});
