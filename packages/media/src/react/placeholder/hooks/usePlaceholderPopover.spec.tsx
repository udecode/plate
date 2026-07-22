import { renderHook } from '@testing-library/react';
import * as actualCoreReact from '@platejs/core/react';
import * as actualUtils from '@platejs/utils';

const useEditorMock = mock();
const useEditorSelectorMock = mock();
const useElementMock = mock();
const useEditorFocusedMock = mock();
const useEditorReadOnlyMock = mock();
const useElementSelectedMock = mock();
const usePlaceholderSetMock = mock();
const usePlaceholderValueMock = mock();

mock.module('@platejs/utils', () => ({
  ...actualUtils,
  KEYS: { ...actualUtils.KEYS, placeholder: 'placeholder' },
}));

mock.module('@platejs/plite-react', () => ({
  useEditorFocused: useEditorFocusedMock,
  useEditorReadOnly: useEditorReadOnlyMock,
  useElementSelected: useElementSelectedMock,
}));

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditor: useEditorMock,
  useEditorSelector: useEditorSelectorMock,
  useElement: useElementMock,
}));

mock.module('../placeholderStore', () => ({
  usePlaceholderSet: usePlaceholderSetMock,
  usePlaceholderValue: usePlaceholderValueMock,
}));

describe('usePlaceholderPopoverState', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
    useEditorSelectorMock.mockReset();
    useElementMock.mockReset();
    useEditorFocusedMock.mockReset();
    useEditorReadOnlyMock.mockReset();
    useElementSelectedMock.mockReset();
    usePlaceholderSetMock.mockReset();
    usePlaceholderValueMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('collects placeholder state from editor, element, and store selectors', async () => {
    const { usePlaceholderPopoverState } = await import(
      `./usePlaceholderPopover?test=${Math.random().toString(36).slice(2)}`
    );
    const setProgresses = mock();
    const setUploading = mock();
    const setUpdatedFiles = mock();

    useEditorMock.mockReturnValue({ id: 'editor' });
    useEditorSelectorMock.mockReturnValue(true);
    useElementMock.mockReturnValue({ id: 'ph-1', mediaType: 'image' });
    useEditorFocusedMock.mockReturnValue(true);
    useEditorReadOnlyMock.mockReturnValue(false);
    useElementSelectedMock.mockReturnValue(true);
    usePlaceholderSetMock
      .mockReturnValueOnce(setProgresses)
      .mockReturnValueOnce(setUploading)
      .mockReturnValueOnce(setUpdatedFiles);
    usePlaceholderValueMock.mockReturnValue(42);

    const { result } = renderHook(() => usePlaceholderPopoverState());

    expect(result.current.id).toBe('ph-1');
    expect(result.current.mediaType).toBe('image');
    expect(result.current.selectionCollapsed).toBe(true);
    expect(result.current.setProgresses).toBe(setProgresses);
    expect(result.current.size).toBe(42);
  });
});
