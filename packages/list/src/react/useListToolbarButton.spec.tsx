import { renderHook } from '@testing-library/react';

const useEditorMock = mock();
const useEditorSelectorMock = mock();
const toggleListMock = mock();

mock.module('@platejs/core/react', () => ({
  useEditor: useEditorMock,
  useEditorSelector: useEditorSelectorMock,
}));

mock.module('./ListPlugin', () => ({
  ListPlugin: { key: 'list' },
}));

const {
  useListToolbarButton,
  useListToolbarButtonState,
  useTodoListToolbarButton,
  useTodoListToolbarButtonState,
} = await import('./useListToolbarButton');

describe('useListToolbarButton', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
    useEditorSelectorMock.mockReset();
    toggleListMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('builds list toolbar button props from query state', () => {
    useEditorMock.mockReturnValue({
      plugin: () => ({
        update: { toggle: toggleListMock },
      }),
    });
    useEditorSelectorMock.mockReturnValue(true);

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

  it('builds todo toolbar button props from todo selection state', () => {
    useEditorMock.mockReturnValue({
      plugin: () => ({
        update: { toggle: toggleListMock },
      }),
    });
    useEditorSelectorMock.mockReturnValue(true);

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
