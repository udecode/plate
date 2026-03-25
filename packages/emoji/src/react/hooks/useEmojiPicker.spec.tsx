import { act, renderHook } from '@testing-library/react';

const useEditorRefMock = mock();
const insertEmojiMock = mock();
const observeCategoriesMock = mock();
const useEmojiPickerStateMock = mock();

mock.module('platejs/react', () => ({
  useEditorRef: useEditorRefMock,
}));

mock.module('../../lib', () => ({
  EmojiCategory: { Frequent: 'frequent' },
  i18n: { search: 'Search' },
  insertEmoji: insertEmojiMock,
}));

mock.module('../utils', () => ({
  observeCategories: observeCategoriesMock,
}));

mock.module('./useEmojiPickerState', () => ({
  useEmojiPickerState: useEmojiPickerStateMock,
}));

describe('useEmojiPicker', () => {
  beforeEach(() => {
    useEditorRefMock.mockReset();
    insertEmojiMock.mockReset();
    observeCategoriesMock.mockReset();
    useEmojiPickerStateMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('dispatches search and selection updates, then inserts the chosen emoji', async () => {
    const { useEmojiPicker } = await import(
      `./useEmojiPicker?test=${Math.random().toString(36).slice(2)}`
    );
    const dispatch = mock();
    const emojiLibrary = {
      getGrid: () => ({
        section: () => ({
          root: {
            current: {
              getBoundingClientRect: () => ({ top: 20 }),
            },
          },
        }),
      }),
      updateFrequentCategory: mock(),
    };
    const indexSearch = {
      get: () => [{ id: 'wave' }],
      search: () => ({
        hasFound: () => true,
      }),
    };

    useEditorRefMock.mockReturnValue({ id: 'editor' });
    useEmojiPickerStateMock.mockReturnValue([
      {
        isOpen: true,
        isSearching: false,
        searchValue: '',
        visibleCategories: new Map(),
      },
      dispatch,
    ]);

    const { result } = renderHook(() =>
      useEmojiPicker({
        closeOnSelect: true,
        emojiLibrary: emojiLibrary as any,
        indexSearch: indexSearch as any,
      })
    );

    act(() => {
      result.current.setSearch(' wave ');
      result.current.onSelectEmoji({ id: 'wave' } as any);
    });

    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        hasFound: true,
        searchResult: [{ id: 'wave' }],
        searchValue: 'wave',
      },
      type: 'UPDATE_SEARCH_RESULT',
    });
    expect(insertEmojiMock).toHaveBeenCalledWith(
      { id: 'editor' },
      { id: 'wave' }
    );
    expect(emojiLibrary.updateFrequentCategory).toHaveBeenCalledWith('wave');
  });
});
