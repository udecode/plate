import React from 'react';

import type { Emoji } from '@emoji-mart/data';
import { useEditor, usePluginStore } from '@platejs/core/react';

import {
  AGridSection,
  Grid,
  type GridElements,
  type IGrid,
} from '../lib/EmojiGrid';
import {
  type AIndexSearch,
  EmojiFloatingIndexSearch,
  EmojiInlineLibrary,
  type EmojiLibrary,
  type IEmojiLibrary,
  DEFAULT_EMOJI_LIBRARY,
} from '../lib/EmojiLibrary';
import { EmojiPlugin } from './EmojiPlugin';

export const EmojiCategory = {
  Activity: 'activity',
  Custom: 'custom',
  Flags: 'flags',
  Foods: 'foods',
  Frequent: 'frequent',
  Nature: 'nature',
  Objects: 'objects',
  People: 'people',
  Places: 'places',
  Symbols: 'symbols',
} as const;

export type EmojiCategoryList =
  (typeof EmojiCategory)[keyof typeof EmojiCategory];

export type EmojiSettingsType = {
  buttonSize: {
    value: number;
  };
  categories: {
    value?: EmojiCategoryList[];
  };
  perLine: {
    value: number;
  };
  showFrequent: {
    value: boolean;
    key?: string;
    limit?: number;
    prefix?: string;
  };
};

export type EmojiIconList<T = string> = {
  categories: Record<EmojiCategoryList, { outline: T; solid: T }>;
  search: {
    delete: T;
    loupe: T;
  };
};

export type FrequentEmojis = Record<string, number>;

export type i18nProps = {
  categories: Record<EmojiCategoryList, string>;
  clear: string;
  pick: string;
  search: string;
  searchNoResultsSubtitle: string;
  searchNoResultsTitle: string;
  searchResult: string;
  skins: Record<'1' | '2' | '3' | '4' | '5' | '6' | 'choose', string>;
};

export const defaultCategories: EmojiCategoryList[] = [
  EmojiCategory.People,
  EmojiCategory.Nature,
  EmojiCategory.Foods,
  EmojiCategory.Activity,
  EmojiCategory.Places,
  EmojiCategory.Objects,
  EmojiCategory.Symbols,
  EmojiCategory.Flags,
];

export const EmojiSettings: EmojiSettingsType = {
  buttonSize: {
    value: 36,
  },
  categories: {
    value: undefined,
  },
  perLine: {
    value: 8,
  },
  showFrequent: {
    limit: 16,
    value: true,
  },
};

export const DEFAULT_FREQUENTLY_USED_EMOJI: FrequentEmojis = {
  '+1': 1,
  clap: 1,
  grinning: 1,
  heart: 1,
  heart_eyes: 1,
  hugging_face: 1,
  joy: 1,
  kissing_heart: 1,
  laughing: 1,
  pray: 1,
  rocket: 1,
  scream: 1,
  see_no_evil: 1,
};

export const i18n: i18nProps = {
  categories: {
    activity: 'Activity',
    custom: 'Custom',
    flags: 'Flags',
    foods: 'Food & Drink',
    frequent: 'Frequently used',
    nature: 'Animals & Nature',
    objects: 'Objects',
    people: 'Smileys & People',
    places: 'Travel & Places',
    symbols: 'Symbols',
  },
  clear: 'Clear',
  pick: 'Pick an emoji...',
  search: 'Search all emoji',
  searchNoResultsSubtitle: 'That emoji couldn’t be found',
  searchNoResultsTitle: 'Oh no!',
  searchResult: 'Search Results',
  skins: {
    '1': 'Default',
    '2': 'Light',
    '3': 'Medium-Light',
    '4': 'Medium',
    '5': 'Medium-Dark',
    '6': 'Dark',
    choose: 'Choose default skin tone',
  },
};

export type FrequentEmojiStorageProps = {
  key?: string;
  limit?: number;
  prefix?: string;
};

export type IFrequentEmojiStorage = {
  get: () => FrequentEmojis;
  getList: () => string[];
  set: (value: FrequentEmojis) => void;
  update: (emojiId: string) => FrequentEmojis;
};

class LocalStorage<T> {
  private readonly defaultValue: T;
  private readonly key: string;

  constructor(key: string, defaultValue: T) {
    this.defaultValue = defaultValue;
    this.key = key;
  }

  get(): T {
    if (typeof window === 'undefined') return this.defaultValue;

    const value = window.localStorage.getItem(this.key);

    if (!value) return this.defaultValue;

    try {
      return JSON.parse(value);
    } catch {
      window.localStorage.removeItem(this.key);

      return this.defaultValue;
    }
  }

  set(value: T) {
    window.localStorage.setItem(this.key, JSON.stringify(value));
  }
}

export class FrequentEmojiStorage implements IFrequentEmojiStorage {
  protected defaultValue = DEFAULT_FREQUENTLY_USED_EMOJI;
  protected key = EmojiCategory.Frequent;
  protected limit = 8;
  protected localStorage: LocalStorage<FrequentEmojis>;
  protected prefix = 'emoji';

  constructor(
    props: FrequentEmojiStorageProps,
    defaultValue = DEFAULT_FREQUENTLY_USED_EMOJI
  ) {
    this.defaultValue = defaultValue;
    this.limit = props.limit ?? this.limit;
    this.localStorage = new LocalStorage(
      `${props.prefix ?? this.prefix}:${props.key ?? this.key}`,
      defaultValue
    );
  }

  get(): FrequentEmojis {
    const data = this.localStorage.get();

    return Object.fromEntries(
      Object.keys(data)
        .sort((a, b) => data[b] - data[a])
        .map((key) => [key, data[key]])
    );
  }

  getList(): string[] {
    return Object.keys(this.get()).slice(0, this.limit);
  }

  set(value: FrequentEmojis) {
    this.localStorage.set(value);
  }

  update(emojiId: string) {
    const previous = this.localStorage.get();
    const emojis = {
      ...previous,
      [emojiId]: (previous[emojiId] ?? 0) + 1,
    };

    this.localStorage.set(emojis);

    return emojis;
  }
}

type EmojiFloatingGridType = IGrid<
  React.RefObject<HTMLDivElement | null>,
  EmojiCategoryList
>;

class EmojiFloatingGrid extends Grid<
  React.RefObject<HTMLDivElement | null>,
  EmojiCategoryList
> {}

class EmojiGridSectionWithRoot extends AGridSection<
  React.RefObject<HTMLDivElement | null>,
  EmojiCategoryList
> {
  protected createRootRef() {
    this._root = React.createRef<HTMLDivElement>();
  }
}

class EmojiFloatingGridBuilder {
  private readonly elements: GridElements<EmojiCategoryList>;
  private readonly grid = new EmojiFloatingGrid();
  private readonly localStorage: IFrequentEmojiStorage;
  private readonly sections: EmojiCategoryList[];
  private readonly settings: EmojiSettingsType;

  constructor(
    localStorage: IFrequentEmojiStorage,
    sections: EmojiCategoryList[],
    elements: GridElements<EmojiCategoryList>,
    settings: EmojiSettingsType
  ) {
    this.elements = elements;
    this.localStorage = localStorage;
    this.sections = sections;
    this.settings = settings;
  }

  build() {
    if (this.settings.showFrequent.value) {
      const id = EmojiCategory.Frequent;

      this.grid.addSection(
        id,
        new EmojiGridSectionWithRoot(id, this.settings.perLine.value),
        { [id]: this.localStorage.getList() }
      );
    }

    for (const id of this.sections) {
      if (this.elements[id]?.length) {
        this.grid.addSection(
          id,
          new EmojiGridSectionWithRoot(id, this.settings.perLine.value),
          this.elements
        );
      }
    }

    return this.grid;
  }
}

export interface IEmojiFloatingLibrary extends IEmojiLibrary {
  getGrid: () => EmojiFloatingGridType;
  indexOf: (focusedCategory: EmojiCategoryList) => number;
  updateFrequentCategory: (emojiId: string) => void;
}

export class EmojiFloatingLibrary
  extends EmojiInlineLibrary
  implements IEmojiFloatingLibrary
{
  private readonly categories: EmojiCategoryList[] = defaultCategories;
  private readonly emojis: Partial<Record<EmojiCategoryList, string[]>> = {};
  private readonly grid: EmojiFloatingGridType;
  private readonly localStorage: IFrequentEmojiStorage;

  private constructor(
    settings: EmojiSettingsType,
    localStorage: IFrequentEmojiStorage,
    library: EmojiLibrary = DEFAULT_EMOJI_LIBRARY
  ) {
    super(library);

    this.localStorage = localStorage;
    this.categories = settings.categories.value ?? this.categories;

    for (const category of library.categories) {
      const categoryId = this.categories.find((id) => id === category.id);

      if (categoryId) this.emojis[categoryId] = category.emojis;
    }

    this.grid = new EmojiFloatingGridBuilder(
      this.localStorage,
      this.categories,
      this.emojis,
      settings
    ).build();
  }

  static getInstance(
    settings: EmojiSettingsType,
    localStorage: IFrequentEmojiStorage,
    library = DEFAULT_EMOJI_LIBRARY
  ) {
    return new EmojiFloatingLibrary(settings, localStorage, library);
  }

  getGrid() {
    return this.grid;
  }

  indexOf(focusedCategory: EmojiCategoryList) {
    return Math.max(0, this.grid.indexOf(focusedCategory));
  }

  updateFrequentCategory(emojiId: string) {
    this.localStorage.update(emojiId);
    this.grid.updateSection(
      EmojiCategory.Frequent,
      this.localStorage.getList()
    );
  }
}

type MapEmojiCategoryList = Map<EmojiCategoryList, boolean>;

type EmojiPickerStateProps = {
  hasFound: boolean;
  isOpen: boolean;
  isSearching: boolean;
  searchResult: Emoji[];
  searchValue: string;
  visibleCategories: MapEmojiCategoryList;
  emoji?: Emoji;
  focusedCategory?: EmojiCategoryList;
};

type EmojiPickerStateDispatch = {
  type:
    | 'CLEAR_SEARCH'
    | 'SET_CLOSE'
    | 'SET_EMOJI'
    | 'SET_FOCUSED_AND_VISIBLE_CATEGORIES'
    | 'SET_OPEN'
    | 'UPDATE_FREQUENT_EMOJIS'
    | 'UPDATE_SEARCH_RESULT';
  payload?: Partial<EmojiPickerStateProps>;
};

const emojiPickerInitialState: EmojiPickerStateProps = {
  emoji: undefined,
  focusedCategory: undefined,
  hasFound: false,
  isOpen: false,
  isSearching: false,
  searchResult: [],
  searchValue: '',
  visibleCategories: new Map(),
};

const useEmojiPickerState = (): [
  EmojiPickerStateProps,
  React.Dispatch<EmojiPickerStateDispatch>,
] => {
  const [state, dispatch] = React.useReducer(
    (
      current: EmojiPickerStateProps,
      { payload, type }: EmojiPickerStateDispatch
    ) => {
      switch (type) {
        case 'CLEAR_SEARCH': {
          return {
            ...current,
            focusedCategory: EmojiCategory.Frequent,
            hasFound: false,
            isSearching: false,
            searchValue: '',
          };
        }
        case 'SET_CLOSE': {
          return {
            ...current,
            emoji: undefined,
            isOpen: false,
          };
        }
        case 'SET_EMOJI':
        case 'SET_FOCUSED_AND_VISIBLE_CATEGORIES': {
          return { ...current, ...payload };
        }
        case 'SET_OPEN': {
          return {
            ...current,
            isOpen: true,
          };
        }
        case 'UPDATE_FREQUENT_EMOJIS': {
          return {
            ...current,
            ...payload,
            emoji: undefined,
          };
        }
        case 'UPDATE_SEARCH_RESULT': {
          return {
            ...current,
            ...payload,
            focusedCategory: undefined,
            isSearching: true,
          };
        }
      }
    },
    emojiPickerInitialState
  );

  return [state, dispatch];
};

export type MutableRefs = React.MutableRefObject<{
  content: React.RefObject<HTMLDivElement | null> | undefined;
  contentRoot: React.RefObject<HTMLDivElement | null> | undefined;
}>;

export type UseEmojiPickerProps = {
  closeOnSelect: boolean;
  emojiLibrary: IEmojiFloatingLibrary;
  indexSearch: AIndexSearch;
};

export type UseEmojiPickerType<
  T extends React.ReactElement = React.ReactElement,
> = {
  emojiLibrary: IEmojiFloatingLibrary;
  hasFound: boolean;
  i18n: i18nProps;
  icons: EmojiIconList<T>;
  isOpen: boolean;
  isSearching: boolean;
  refs: MutableRefs;
  searchResult: Emoji[];
  searchValue: string;
  visibleCategories: MapEmojiCategoryList;
  clearSearch: () => void;
  handleCategoryClick: (id: EmojiCategoryList) => void;
  onMouseOver: (emoji?: Emoji) => void;
  onSelectEmoji: (emoji: Emoji) => void;
  setIsOpen: (isOpen: boolean) => void;
  setSearch: (value: string) => void;
  emoji?: Emoji;
  focusedCategory?: EmojiCategoryList;
  settings?: EmojiSettingsType;
};

const isEmojiCategory = (value: string): value is EmojiCategoryList =>
  Object.values(EmojiCategory).some((category) => category === value);

export const useEmojiPicker = ({
  closeOnSelect,
  emojiLibrary,
  indexSearch,
}: UseEmojiPickerProps): Omit<UseEmojiPickerType, 'icons' | 'settings'> => {
  const editor = useEditor();
  const [state, dispatch] = useEmojiPickerState();
  const refs = React.useRef({
    content: React.createRef<HTMLDivElement>(),
    contentRoot: React.createRef<HTMLDivElement>(),
  });
  const pendingCategoryScrollRef = React.useRef<EmojiCategoryList | null>(null);

  const setIsOpen = React.useCallback(
    (isOpen: boolean) => {
      dispatch({ type: isOpen ? 'SET_OPEN' : 'SET_CLOSE' });
    },
    [dispatch]
  );

  const setFocusedAndVisibleSections = React.useCallback(
    (
      visibleCategories: MapEmojiCategoryList,
      focusedCategory?: EmojiCategoryList
    ) => {
      dispatch({
        payload: { focusedCategory, visibleCategories },
        type: 'SET_FOCUSED_AND_VISIBLE_CATEGORIES',
      });
    },
    [dispatch]
  );

  const setSearch = React.useCallback(
    (input: string) => {
      const value = input.replaceAll(/\s/g, '');

      if (!value) {
        dispatch({ type: 'CLEAR_SEARCH' });

        return;
      }

      dispatch({
        payload: {
          hasFound: indexSearch.search(value).hasFound(),
          searchResult: indexSearch.get(),
          searchValue: value,
        },
        type: 'UPDATE_SEARCH_RESULT',
      });
    },
    [dispatch, indexSearch]
  );

  const clearSearch = React.useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, [dispatch]);

  const onMouseOver = React.useCallback(
    (emoji?: Emoji) => {
      dispatch({ payload: { emoji }, type: 'SET_EMOJI' });
    },
    [dispatch]
  );

  const updateFrequentEmojis = React.useCallback(
    (emojiId: string) => {
      emojiLibrary.updateFrequentCategory(emojiId);
      dispatch({
        payload: {
          isOpen: closeOnSelect ? false : state.isOpen,
        },
        type: 'UPDATE_FREQUENT_EMOJIS',
      });
    },
    [closeOnSelect, dispatch, emojiLibrary, state.isOpen]
  );

  const onSelectEmoji = React.useCallback(
    (emoji: Emoji) => {
      editor.plugin(EmojiPlugin).update.insert(emoji);
      updateFrequentEmojis(emoji.id);
    },
    [editor, updateFrequentEmojis]
  );

  const scrollCategoryIntoView = React.useCallback(
    (categoryId: EmojiCategoryList) => {
      const contentRoot = refs.current.contentRoot.current;
      const sectionRoot = emojiLibrary.getGrid().section(categoryId)
        ?.root.current;

      if (!contentRoot || !sectionRoot || !contentRoot.contains(sectionRoot)) {
        return false;
      }

      contentRoot.scrollTop =
        1 +
        contentRoot.scrollTop +
        sectionRoot.getBoundingClientRect().top -
        contentRoot.getBoundingClientRect().top;

      return true;
    },
    [emojiLibrary]
  );

  const handleCategoryClick = React.useCallback(
    (categoryId: EmojiCategoryList) => {
      const grid = emojiLibrary.getGrid();
      pendingCategoryScrollRef.current = categoryId;

      dispatch({
        payload: {
          focusedCategory: categoryId,
          hasFound: false,
          isSearching: false,
          searchValue: '',
          visibleCategories: new Map(
            grid
              .sections()
              .map((section) => [section.id, section.id === categoryId])
          ),
        },
        type: 'SET_FOCUSED_AND_VISIBLE_CATEGORIES',
      });

      if (scrollCategoryIntoView(categoryId)) {
        pendingCategoryScrollRef.current = null;
      }
    },
    [dispatch, emojiLibrary, scrollCategoryIntoView]
  );

  React.useLayoutEffect(() => {
    if (state.isSearching) return;

    const categoryId = pendingCategoryScrollRef.current;

    if (categoryId && scrollCategoryIntoView(categoryId)) {
      pendingCategoryScrollRef.current = null;
    }
  }, [
    scrollCategoryIntoView,
    state.focusedCategory,
    state.isSearching,
    state.visibleCategories,
  ]);

  React.useEffect(() => {
    if (!state.isOpen || state.isSearching) return;

    let observer: IntersectionObserver | undefined;
    const timeoutId = window.setTimeout(() => {
      const visibleCategories: MapEmojiCategoryList = new Map();

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const id = entry.target.getAttribute('data-id');

            if (id && isEmojiCategory(id)) {
              visibleCategories.set(id, entry.isIntersecting);
            }
          }

          const focusedCategory = Array.from(visibleCategories).find(
            ([, visible]) => visible
          )?.[0];

          if (focusedCategory) {
            setFocusedAndVisibleSections(visibleCategories, focusedCategory);
          }
        },
        { root: refs.current.contentRoot.current, threshold: 0 }
      );

      for (const section of emojiLibrary.getGrid().sections()) {
        if (section.root.current) observer.observe(section.root.current);
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, [
    emojiLibrary,
    state.isOpen,
    state.isSearching,
    setFocusedAndVisibleSections,
  ]);

  return {
    clearSearch,
    emoji: state.emoji,
    emojiLibrary,
    i18n,
    refs,
    setIsOpen,
    setSearch,
    handleCategoryClick,
    onMouseOver,
    onSelectEmoji,
    ...state,
  };
};

export type EmojiDropdownMenuOptions = {
  closeOnSelect?: boolean;
  settings?: EmojiSettingsType;
};

export function useEmojiDropdownMenuState({
  closeOnSelect = true,
  settings = EmojiSettings,
}: EmojiDropdownMenuOptions = {}) {
  const data = usePluginStore(EmojiPlugin, 'data');
  const [emojiLibrary, indexSearch] = React.useMemo(() => {
    const emojiLibrary = EmojiFloatingLibrary.getInstance(
      settings,
      new FrequentEmojiStorage({
        key: settings.showFrequent.key,
        limit: settings.showFrequent.limit,
        prefix: settings.showFrequent.prefix,
      }),
      data
    );

    return [
      emojiLibrary,
      EmojiFloatingIndexSearch.getInstance(emojiLibrary),
    ] as const;
  }, [data, settings]);
  const { isOpen, setIsOpen, ...emojiPickerState } = useEmojiPicker({
    closeOnSelect,
    emojiLibrary,
    indexSearch,
  });

  return {
    emojiPickerState,
    isOpen,
    setIsOpen,
  };
}
