import { renderHook } from '@testing-library/react';

const useEditorReadOnlyMock = mock();
const useEditorRefMock = mock();
const useElementMock = mock();

mock.module('platejs/react', () => ({
  useEditorReadOnly: useEditorReadOnlyMock,
  useEditorRef: useEditorRefMock,
  useElement: useElementMock,
}));

describe('useCalloutEmojiPicker', () => {
  beforeEach(() => {
    useEditorReadOnlyMock.mockReset();
    useEditorRefMock.mockReset();
    useElementMock.mockReset();
    localStorage.clear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('updates the element icon, stores it, and closes the picker when editable', async () => {
    const { useCalloutEmojiPicker } = await import(
      `./useCalloutEmojiPicker?test=${Math.random().toString(36).slice(2)}`
    );
    const setNodes = mock();
    const setIsOpen = mock();

    useEditorReadOnlyMock.mockReturnValue(false);
    useEditorRefMock.mockReturnValue({
      tf: { setNodes },
    });
    useElementMock.mockReturnValue({ id: 'callout-1' });

    const { result } = renderHook(() =>
      useCalloutEmojiPicker({ isOpen: true, setIsOpen })
    );

    result.current.props.onSelectEmoji({
      skins: [{ native: '🔥' }],
    });

    expect(setNodes).toHaveBeenCalledWith(
      { icon: '🔥' },
      { at: { id: 'callout-1' } }
    );
    expect(localStorage.getItem('plate-storage-callout')).toBe('🔥');
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });
});
