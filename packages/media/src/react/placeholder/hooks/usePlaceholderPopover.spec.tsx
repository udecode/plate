import { renderHook } from '@testing-library/react';
import * as actualPlatejs from 'platejs';
import * as actualPlatejsReact from 'platejs/react';

const useEditorRefMock = mock();
const useEditorSelectorMock = mock();
const useElementMock = mock();
const useFocusedMock = mock();
const useReadOnlyMock = mock();
const useSelectedMock = mock();
const usePlaceholderSetMock = mock();
const usePlaceholderValueMock = mock();

mock.module('platejs', () => ({
  ...actualPlatejs,
  KEYS: { ...actualPlatejs.KEYS, placeholder: 'placeholder' },
}));

mock.module('platejs/react', () => ({
  ...actualPlatejsReact,
  useEditorRef: useEditorRefMock,
  useEditorSelector: useEditorSelectorMock,
  useElement: useElementMock,
  useFocused: useFocusedMock,
  useReadOnly: useReadOnlyMock,
  useSelected: useSelectedMock,
}));

mock.module('../placeholderStore', () => ({
  usePlaceholderSet: usePlaceholderSetMock,
  usePlaceholderValue: usePlaceholderValueMock,
}));

describe('usePlaceholderPopoverState', () => {
  beforeEach(() => {
    useEditorRefMock.mockReset();
    useEditorSelectorMock.mockReset();
    useElementMock.mockReset();
    useFocusedMock.mockReset();
    useReadOnlyMock.mockReset();
    useSelectedMock.mockReset();
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

    useEditorRefMock.mockReturnValue({ id: 'editor' });
    useEditorSelectorMock.mockReturnValue(true);
    useElementMock.mockReturnValue({ id: 'ph-1', mediaType: 'image' });
    useFocusedMock.mockReturnValue(true);
    useReadOnlyMock.mockReturnValue(false);
    useSelectedMock.mockReturnValue(true);
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
