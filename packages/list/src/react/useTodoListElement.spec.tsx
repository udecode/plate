import { renderHook } from '@testing-library/react';

const useEditorMock = mock();
const useReadOnlyMock = mock();

mock.module('@platejs/core/react', () => ({
  useEditor: useEditorMock,
}));

mock.module('@platejs/plite-react', () => ({
  useEditorReadOnly: useReadOnlyMock,
}));

const { useTodoListElement, useTodoListElementState } = await import(
  './useTodoListElement'
);

describe('useTodoListElement', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
    useReadOnlyMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('updates checked state by live element when editable', () => {
    const setNodes = mock();
    const element = {
      checked: false,
      children: [{ text: '' }],
      id: 'todo-1',
      type: 'p',
    };

    useEditorMock.mockReturnValue({
      update: {
        nodes: {
          set: setNodes,
        },
      },
    });
    useReadOnlyMock.mockReturnValue(false);

    const { result } = renderHook(() => {
      const state = useTodoListElementState({ element });

      return useTodoListElement(state);
    });

    result.current.checkboxProps.onCheckedChange(true);

    expect(setNodes).toHaveBeenCalledWith({ checked: true }, { at: element });
  });
});
