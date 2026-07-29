import type { Emoji, EmojiMartData } from '@emoji-mart/data';
import { act, renderHook } from '@testing-library/react';

import { EmojiFloatingIndexSearch } from '../lib/EmojiLibrary';
import { type EmojiSettingsType, EmojiCategory } from './useEmojiPicker';

const useEditorMock = mock();
const coreReact = await import('@platejs/core/react');
const OriginalIntersectionObserver = globalThis.IntersectionObserver;

let observers: Array<{
  callback: IntersectionObserverCallback;
  instance: IntersectionObserverMock;
}> = [];

const observeMock = mock();
const disconnectMock = mock();

class IntersectionObserverMock {
  constructor(callback: IntersectionObserverCallback) {
    observers.push({ callback, instance: this });
  }

  disconnect = disconnectMock;
  observe = observeMock;
}

mock.module('@platejs/core/react', () => ({
  ...coreReact,
  useEditor: useEditorMock,
}));

const { EmojiFloatingLibrary, FrequentEmojiStorage, useEmojiPicker } =
  await import('./useEmojiPicker');

const wave: Emoji = {
  id: 'wave',
  keywords: ['hello'],
  name: 'Waving Hand',
  skins: [{ native: '👋', unified: '1f44b' }],
  version: 1,
};

const pizza: Emoji = {
  id: 'pizza',
  keywords: ['food'],
  name: 'Pizza',
  skins: [{ native: '🍕', unified: '1f355' }],
  version: 1,
};

const data = {
  aliases: {},
  categories: [
    { emojis: ['wave'], id: 'people' },
    { emojis: ['pizza'], id: 'foods' },
  ],
  emojis: { pizza, wave },
  sheet: { cols: 1, rows: 1 },
} satisfies EmojiMartData;

const settings = {
  buttonSize: { value: 36 },
  categories: {
    value: [EmojiCategory.People, EmojiCategory.Foods],
  },
  perLine: { value: 8 },
  showFrequent: { value: true },
} satisfies EmojiSettingsType;

const createStorage = (frequent = ['wave']) => {
  const update = mock(() => ({ wave: 2 }));

  return {
    storage: {
      get: () => ({ wave: 1 }),
      getList: () => frequent,
      set: mock(),
      update,
    },
    update,
  };
};

const createPicker = () => {
  const { storage, update } = createStorage();
  const emojiLibrary = EmojiFloatingLibrary.getInstance(
    settings,
    storage,
    data
  );

  return {
    emojiLibrary,
    indexSearch: EmojiFloatingIndexSearch.getInstance(emojiLibrary),
    update,
  };
};

describe('emoji picker hook family', () => {
  beforeEach(() => {
    observers = [];
    observeMock.mockReset();
    disconnectMock.mockReset();
    useEditorMock.mockReset();
    window.localStorage.clear();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: IntersectionObserverMock,
    });
  });

  afterAll(() => {
    mock.restore();
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      value: OriginalIntersectionObserver,
    });
  });

  it('searches, clears, opens, closes, and inserts through public actions', () => {
    const insert = mock();
    const { emojiLibrary, indexSearch, update } = createPicker();

    useEditorMock.mockReturnValue({
      plugin: () => ({ update: { insert } }),
    });

    const { result } = renderHook(() =>
      useEmojiPicker({
        closeOnSelect: true,
        emojiLibrary,
        indexSearch,
      })
    );

    act(() => {
      result.current.setIsOpen(true);
      result.current.setSearch(' wave ');
    });

    expect(result.current).toMatchObject({
      hasFound: true,
      isOpen: true,
      isSearching: true,
      searchValue: 'wave',
    });
    expect(result.current.searchResult.map((emoji) => emoji.id)).toEqual([
      'wave',
    ]);

    act(() => {
      result.current.onSelectEmoji(wave);
    });

    expect(insert).toHaveBeenCalledWith(wave);
    expect(update).toHaveBeenCalledWith('wave');
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.setSearch('   ');
      result.current.setIsOpen(false);
    });

    expect(result.current).toMatchObject({
      hasFound: false,
      isOpen: false,
      isSearching: false,
      searchValue: '',
    });
  });

  it('focuses and scrolls a category after search results unmount', () => {
    const { emojiLibrary, indexSearch } = createPicker();
    const foodsSection = emojiLibrary.getGrid().section(EmojiCategory.Foods);

    if (!foodsSection) throw new Error('Missing foods section');

    const contentRoot = document.createElement('div');
    const foodsRoot = document.createElement('div');

    contentRoot.scrollTop = 5;
    contentRoot.getBoundingClientRect = () => DOMRect.fromRect({ y: 10 });
    foodsRoot.getBoundingClientRect = () => DOMRect.fromRect({ y: 110 });
    contentRoot.append(foodsRoot);
    useEditorMock.mockReturnValue({ id: 'editor' });

    const { result } = renderHook(() =>
      useEmojiPicker({
        closeOnSelect: true,
        emojiLibrary,
        indexSearch,
      })
    );
    const contentRootRef = result.current.refs.current.contentRoot;

    if (!contentRootRef) throw new Error('Missing content root ref');

    contentRootRef.current = contentRoot;

    act(() => {
      result.current.setSearch('pizza');
    });
    act(() => {
      result.current.handleCategoryClick(EmojiCategory.Foods);
      foodsSection.root.current = foodsRoot;
    });

    expect(result.current.focusedCategory).toBe(EmojiCategory.Foods);
    expect(result.current.visibleCategories).toEqual(
      new Map([
        [EmojiCategory.Frequent, false],
        [EmojiCategory.People, false],
        [EmojiCategory.Foods, true],
      ])
    );
    expect(contentRoot.scrollTop).toBe(106);
  });

  it('observes mounted category roots and promotes the first visible one', async () => {
    const { emojiLibrary, indexSearch } = createPicker();
    const contentRoot = document.createElement('div');

    for (const section of emojiLibrary.getGrid().sections()) {
      const root = document.createElement('div');

      root.dataset.id = section.id;
      section.root.current = root;
      contentRoot.append(root);
    }
    useEditorMock.mockReturnValue({ id: 'editor' });

    const { result } = renderHook(() =>
      useEmojiPicker({
        closeOnSelect: true,
        emojiLibrary,
        indexSearch,
      })
    );
    const contentRootRef = result.current.refs.current.contentRoot;

    if (!contentRootRef) throw new Error('Missing content root ref');

    contentRootRef.current = contentRoot;

    act(() => {
      result.current.setIsOpen(true);
    });
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });

    const observer = observers[0];
    const peopleRoot = emojiLibrary.getGrid().section(EmojiCategory.People)
      ?.root.current;

    if (!observer || !peopleRoot) throw new Error('Missing emoji observer');

    act(() => {
      observer.callback(
        [
          {
            boundingClientRect: DOMRect.fromRect({}),
            intersectionRatio: 1,
            intersectionRect: DOMRect.fromRect({}),
            isIntersecting: true,
            rootBounds: null,
            target: peopleRoot,
            time: 0,
          },
        ],
        observer.instance as unknown as IntersectionObserver
      );
    });

    expect(observeMock).toHaveBeenCalledTimes(3);
    expect(result.current.focusedCategory).toBe(EmojiCategory.People);
    expect(result.current.visibleCategories.get(EmojiCategory.People)).toBe(
      true
    );
  });

  it('builds independent grids with an unconditional frequent section', () => {
    const firstStorage = createStorage();
    const secondStorage = createStorage([]);
    const first = EmojiFloatingLibrary.getInstance(
      settings,
      firstStorage.storage,
      data
    );
    const second = EmojiFloatingLibrary.getInstance(
      { ...settings, categories: { value: [] } },
      secondStorage.storage,
      { ...data, categories: [] }
    );
    const withoutFrequent = EmojiFloatingLibrary.getInstance(
      {
        ...settings,
        categories: { value: [] },
        showFrequent: { value: false },
      },
      createStorage([]).storage,
      { ...data, categories: [] }
    );

    expect(first.getGrid().sections()).toHaveLength(3);
    expect(second).not.toBe(first);
    expect(second.getGrid().sections()).toHaveLength(1);
    expect(withoutFrequent.getGrid().sections()).toHaveLength(0);
    expect(first.indexOf(EmojiCategory.Symbols)).toBe(0);

    first.updateFrequentCategory('wave');

    expect(firstStorage.update).toHaveBeenCalledWith('wave');
  });

  it('persists, ranks, limits, and repairs frequent emoji storage', () => {
    const storage = new FrequentEmojiStorage(
      { key: 'test', limit: 2, prefix: 'plate' },
      { pizza: 1, wave: 2 }
    );

    expect(storage.getList()).toEqual(['wave', 'pizza']);

    storage.update('pizza');

    expect(storage.getList()).toEqual(['pizza', 'wave']);

    window.localStorage.setItem('plate:test', '{broken');

    expect(storage.get()).toEqual({ pizza: 1, wave: 2 });
    expect(window.localStorage.getItem('plate:test')).toBeNull();
  });
});
