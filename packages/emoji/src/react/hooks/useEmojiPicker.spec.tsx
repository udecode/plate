import { act, renderHook } from '@testing-library/react';

const useEditorMock = mock();
const useEmojiPickerStateMock = mock();
const coreReact = await import('@platejs/core/react');

mock.module('@platejs/core/react', () => ({
  ...coreReact,
  useEditor: useEditorMock,
}));

mock.module('./useEmojiPickerState', () => ({
  useEmojiPickerState: useEmojiPickerStateMock,
}));

const { useEmojiPicker } = await import('./useEmojiPicker');

describe('useEmojiPicker', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
    useEmojiPickerStateMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('dispatches search and selection updates, then inserts the chosen emoji', async () => {
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
        sections: () => [],
      }),
      updateFrequentCategory: mock(),
    };
    const indexSearch = {
      get: () => [{ id: 'wave' }],
      search: () => ({
        hasFound: () => true,
      }),
    };

    const insert = mock();
    const editor = {
      plugin: () => ({
        update: { insert },
      }),
    };

    useEditorMock.mockReturnValue(editor);
    useEmojiPickerStateMock.mockReturnValue([
      {
        hasFound: true,
        isOpen: false,
        isSearching: true,
        searchValue: 'pizza',
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
    expect(insert).toHaveBeenCalledWith({ id: 'wave' });
    expect(emojiLibrary.updateFrequentCategory).toHaveBeenCalledWith('wave');
  });

  it('marks a clicked category visible before scrolling to it', async () => {
    const dispatch = mock();
    const foodsRoot = {
      getBoundingClientRect: () => ({ top: 110 }),
    };
    const contentRoot = {
      scrollTop: 5,
      contains: (element: unknown) => element === foodsRoot,
      getBoundingClientRect: () => ({ top: 10 }),
    };
    const sections = [
      {
        id: 'people',
        root: {
          current: {
            getBoundingClientRect: () => ({ top: 10 }),
          },
        },
      },
      {
        id: 'foods',
        root: {
          current: foodsRoot,
        },
      },
    ];
    const emojiLibrary = {
      getGrid: () => ({
        section: (id: string) => sections.find((section) => section.id === id),
        sections: () => sections,
      }),
      updateFrequentCategory: mock(),
    };
    const indexSearch = {
      get: () => [],
      search: () => ({
        hasFound: () => false,
      }),
    };

    useEditorMock.mockReturnValue({ id: 'editor' });
    useEmojiPickerStateMock.mockReturnValue([
      {
        isOpen: false,
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

    const contentRootRef = result.current.refs.current.contentRoot;

    if (!contentRootRef) throw new Error('Missing content root ref');

    contentRootRef.current = contentRoot as any;

    act(() => {
      result.current.handleCategoryClick('foods' as any);
    });

    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        focusedCategory: 'foods',
        hasFound: false,
        isSearching: false,
        searchValue: '',
        visibleCategories: new Map([
          ['people', false],
          ['foods', true],
        ]),
      },
      type: 'SET_FOCUSED_AND_VISIBLE_CATEGORIES',
    });
    expect(contentRoot.scrollTop).toBe(106);
  });

  it('scrolls to a clicked category after search results unmount', async () => {
    let state = {
      hasFound: true,
      isOpen: false,
      isSearching: true,
      searchValue: 'pizza',
      visibleCategories: new Map(),
    };
    const dispatch = mock((action: any) => {
      state = { ...state, ...action.payload };
    });
    const contentRoot = {
      scrollTop: 5,
      contains: (element: unknown) => element === foodsRoot.current,
      getBoundingClientRect: () => ({ top: 10 }),
    };
    const foodsRoot = {
      current: null as null | { getBoundingClientRect: () => { top: number } },
    };
    const sections = [
      {
        id: 'people',
        root: {
          current: {
            getBoundingClientRect: () => ({ top: 10 }),
          },
        },
      },
      {
        id: 'foods',
        root: foodsRoot,
      },
    ];
    const emojiLibrary = {
      getGrid: () => ({
        section: (id: string) => sections.find((section) => section.id === id),
        sections: () => sections,
      }),
      updateFrequentCategory: mock(),
    };
    const indexSearch = {
      get: () => [],
      search: () => ({
        hasFound: () => false,
      }),
    };

    useEditorMock.mockReturnValue({ id: 'editor' });
    useEmojiPickerStateMock.mockImplementation(() => [state, dispatch]);

    const { rerender, result } = renderHook(() =>
      useEmojiPicker({
        closeOnSelect: true,
        emojiLibrary: emojiLibrary as any,
        indexSearch: indexSearch as any,
      })
    );

    const contentRootRef = result.current.refs.current.contentRoot;

    if (!contentRootRef) throw new Error('Missing content root ref');

    contentRootRef.current = contentRoot as any;

    act(() => {
      result.current.handleCategoryClick('foods' as any);
    });

    expect(contentRoot.scrollTop).toBe(5);

    foodsRoot.current = {
      getBoundingClientRect: () => ({ top: 110 }),
    };

    act(() => {
      rerender();
    });

    expect(contentRoot.scrollTop).toBe(106);
  });
});
