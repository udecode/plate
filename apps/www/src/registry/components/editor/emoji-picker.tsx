'use client';

import emojiMartData, {
  type Emoji,
  type EmojiMartData,
} from '@emoji-mart/data';
import {
  AGridSection,
  EmojiFloatingIndexSearch,
  EmojiInlineLibrary,
  type EmojiLibrary,
  type GridElements,
  type GridRow,
  type IEmojiLibrary,
  type IGrid,
  DEFAULT_EMOJI_LIBRARY,
  Grid,
} from '@platejs/emoji';
import { EmojiPlugin } from '@platejs/emoji/react';
import {
  AppleIcon,
  ClockIcon,
  CompassIcon,
  FlagIcon,
  LeafIcon,
  LightbulbIcon,
  MusicIcon,
  SearchIcon,
  SmileIcon,
  StarIcon,
  XIcon,
} from 'lucide-react';
import { useEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const defaultEmojiData = emojiMartData as unknown as EmojiMartData;

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

type EmojiIconList<T = string> = {
  categories: Record<EmojiCategoryList, { outline: T; solid: T }>;
  search: {
    delete: T;
    loupe: T;
  };
};

type FrequentEmojis = Record<string, number>;

type i18nProps = {
  categories: Record<EmojiCategoryList, string>;
  clear: string;
  pick: string;
  search: string;
  searchNoResultsSubtitle: string;
  searchNoResultsTitle: string;
  searchResult: string;
  skins: Record<'1' | '2' | '3' | '4' | '5' | '6' | 'choose', string>;
};

const defaultCategories: EmojiCategoryList[] = [
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

const DEFAULT_FREQUENTLY_USED_EMOJI: FrequentEmojis = {
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

const i18n: i18nProps = {
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

type FrequentEmojiStorageProps = {
  key?: string;
  limit?: number;
  prefix?: string;
};

type IFrequentEmojiStorage = {
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

class FrequentEmojiStorage implements IFrequentEmojiStorage {
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

interface IEmojiFloatingLibrary extends IEmojiLibrary {
  getGrid: () => EmojiFloatingGridType;
  indexOf: (focusedCategory: EmojiCategoryList) => number;
  updateFrequentCategory: (emojiId: string) => void;
}

class EmojiFloatingLibrary
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

const emojiPickerReducer = (
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

  throw new Error('Unknown emoji picker action.');
};

type MutableRefs = React.RefObject<{
  content: React.RefObject<HTMLDivElement | null> | undefined;
  contentRoot: React.RefObject<HTMLDivElement | null> | undefined;
}>;

export type EmojiPickerOptions = {
  closeOnSelect?: boolean;
  data?: EmojiMartData;
  onSelectEmoji?: (emoji: Emoji) => void;
  settings?: EmojiSettingsType;
};

type EmojiPickerState<T extends React.ReactElement = React.ReactElement> = {
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

const useEmojiPickerController = ({
  closeOnSelect = true,
  data,
  onSelectEmoji: onSelectEmojiProp,
  settings = EmojiSettings,
}: EmojiPickerOptions & { data: EmojiMartData }): Omit<
  EmojiPickerState,
  'icons'
> => {
  const [emojiLibrary, indexSearch] = React.useMemo(() => {
    const innerEmojiLibrary = EmojiFloatingLibrary.getInstance(
      settings,
      new FrequentEmojiStorage({
        key: settings.showFrequent.key,
        limit: settings.showFrequent.limit,
        prefix: settings.showFrequent.prefix,
      }),
      data
    );

    return [
      innerEmojiLibrary,
      EmojiFloatingIndexSearch.getInstance(innerEmojiLibrary),
    ] as const;
  }, [data, settings]);
  const editor = useEditor();
  const [state, dispatch] = React.useReducer(
    emojiPickerReducer,
    emojiPickerInitialState
  );
  const contentRef = React.useRef<HTMLDivElement>(null);
  const contentRootRef = React.useRef<HTMLDivElement>(null);
  const refs = React.useMemo(
    () => ({
      current: {
        content: contentRef,
        contentRoot: contentRootRef,
      },
    }),
    [contentRef, contentRootRef]
  );
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
      if (onSelectEmojiProp) {
        onSelectEmojiProp(emoji);
      } else {
        editor.plugin(EmojiPlugin).update.insert(emoji);
      }
      updateFrequentEmojis(emoji.id);
    },
    [editor, onSelectEmojiProp, updateFrequentEmojis]
  );

  const scrollCategoryIntoView = React.useCallback(
    (categoryId: EmojiCategoryList) => {
      const contentRoot = contentRootRef.current;
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
    [contentRootRef, emojiLibrary]
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
    if (!state.isOpen || state.isSearching) return undefined;

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
        { root: contentRootRef.current, threshold: 0 }
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
    contentRootRef,
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
    settings,
    setIsOpen,
    setSearch,
    handleCategoryClick,
    onMouseOver,
    onSelectEmoji,
    ...state,
  };
};

type EmojiPickerController = Omit<EmojiPickerState, 'icons'>;

const assignEmojiPickerRef = (
  refs: EmojiPickerState['refs'],
  key: 'content' | 'contentRoot',
  element: HTMLDivElement | null
) => {
  const targetRef = refs.current[key];

  if (targetRef) {
    targetRef.current = element;
  }
};

export function EmojiPicker({
  children,
  closeOnSelect,
  data = defaultEmojiData,
  disabled,
  onSelectEmoji,
  settings,
}: React.PropsWithChildren<
  EmojiPickerOptions & {
    disabled?: boolean;
  }
>) {
  const picker = useEmojiPickerController({
    closeOnSelect,
    data,
    onSelectEmoji,
    settings,
  });

  return (
    <Popover
      open={picker.isOpen}
      onOpenChange={(open) => {
        if (!disabled) picker.setIsOpen(open);
      }}
    >
      {children}

      <PopoverContent className="z-100 w-auto border-0 p-0">
        <EmojiPickerPanel picker={picker} />
      </PopoverContent>
    </Popover>
  );
}

export function EmojiPickerTrigger({
  children,
}: {
  children: React.ReactElement;
}) {
  return <PopoverTrigger asChild>{children}</PopoverTrigger>;
}

function EmojiPickerPanel({ picker }: { picker: EmojiPickerController }) {
  const {
    clearSearch,
    emoji,
    emojiLibrary,
    focusedCategory,
    handleCategoryClick,
    hasFound,
    i18n: innerI18n,
    isSearching,
    onMouseOver,
    onSelectEmoji,
    refs,
    searchResult,
    searchValue,
    setSearch,
    settings = EmojiSettings,
    visibleCategories,
  } = picker;
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl bg-popover text-popover-foreground',
        'h-[23rem] w-80 border shadow-md'
      )}
    >
      <EmojiPickerNavigation
        onClick={handleCategoryClick}
        emojiLibrary={emojiLibrary}
        focusedCategory={focusedCategory}
        i18n={innerI18n}
        icons={emojiPickerIcons}
      />
      <EmojiPickerSearchBar
        i18n={innerI18n}
        searchValue={searchValue}
        setSearch={setSearch}
      >
        <EmojiPickerSearchAndClear
          clearSearch={clearSearch}
          i18n={innerI18n}
          searchValue={searchValue}
        />
      </EmojiPickerSearchBar>
      <EmojiPickerContent
        onMouseOver={onMouseOver}
        onSelectEmoji={onSelectEmoji}
        emojiLibrary={emojiLibrary}
        i18n={innerI18n}
        isSearching={isSearching}
        refs={refs}
        searchResult={searchResult}
        settings={settings}
        visibleCategories={visibleCategories}
      />
      <EmojiPickerPreview
        emoji={emoji}
        hasFound={hasFound}
        i18n={innerI18n}
        isSearching={isSearching}
      />
    </div>
  );
}

function EmojiButton({
  emoji,
  index,
  onMouseOver,
  onSelect,
}: {
  emoji: Emoji;
  index: number;
  onMouseOver: (emoji?: Emoji) => void;
  onSelect: (emoji: Emoji) => void;
}) {
  return (
    <button
      className="group relative flex size-9 cursor-pointer items-center justify-center border-none bg-transparent text-2xl leading-none"
      onClick={() => {
        onSelect(emoji);
      }}
      onMouseEnter={() => {
        onMouseOver(emoji);
      }}
      onMouseLeave={() => {
        onMouseOver();
      }}
      aria-label={emoji.skins[0].native}
      data-index={index}
      tabIndex={-1}
      type="button"
    >
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
        aria-hidden="true"
      />
      <span
        className="relative"
        style={{
          fontFamily:
            '"Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols',
        }}
        data-emoji-set="native"
      >
        {emoji.skins[0].native}
      </span>
    </button>
  );
}

function RowOfButtons({
  emojiLibrary,
  row,
  onMouseOver,
  onSelectEmoji,
}: {
  row: GridRow;
} & Pick<EmojiPickerState, 'emojiLibrary' | 'onMouseOver' | 'onSelectEmoji'>) {
  return (
    <div key={row.id} className="flex" data-index={row.id}>
      {row.elements.map((emojiId, index) => {
        const emoji = emojiLibrary.getEmoji(emojiId);

        if (!emoji) return null;

        return (
          <EmojiButton
            key={emojiId}
            onMouseOver={onMouseOver}
            onSelect={onSelectEmoji}
            emoji={emoji}
            index={index}
          />
        );
      })}
    </div>
  );
}

function EmojiPickerContent({
  emojiLibrary,
  i18n: innerI18n2,
  isSearching = false,
  refs,
  searchResult,
  settings = EmojiSettings,
  visibleCategories,
  onMouseOver,
  onSelectEmoji,
}: Pick<
  EmojiPickerState,
  | 'emojiLibrary'
  | 'i18n'
  | 'isSearching'
  | 'onMouseOver'
  | 'onSelectEmoji'
  | 'refs'
  | 'searchResult'
  | 'settings'
  | 'visibleCategories'
>) {
  const getRowWidth = settings.perLine.value * settings.buttonSize.value;
  const setContentRootRef = (element: HTMLDivElement | null) => {
    assignEmojiPickerRef(refs, 'contentRoot', element);
  };
  const setContentRef = (element: HTMLDivElement | null) => {
    assignEmojiPickerRef(refs, 'content', element);
  };

  const isCategoryVisible = React.useCallback(
    (categoryId: EmojiCategoryList) =>
      visibleCategories.has(categoryId)
        ? visibleCategories.get(categoryId)
        : false,
    [visibleCategories]
  );

  const EmojiList = React.useCallback(
    () =>
      emojiLibrary
        .getGrid()
        .sections()
        .map((section) => {
          const categoryId = section.id;
          const { buttonSize } = settings;

          return (
            <div
              key={categoryId}
              ref={section.root}
              style={{ width: getRowWidth }}
              data-id={categoryId}
            >
              <div className="sticky -top-px z-1 bg-popover/90 p-1 py-2 text-sm font-semibold backdrop-blur-xs">
                {innerI18n2.categories[categoryId]}
              </div>
              <div
                className="relative flex flex-wrap"
                style={{ height: section.getRows().length * buttonSize.value }}
              >
                {isCategoryVisible(categoryId) &&
                  section
                    .getRows()
                    .map((row: GridRow) => (
                      <RowOfButtons
                        key={row.id}
                        onMouseOver={onMouseOver}
                        onSelectEmoji={onSelectEmoji}
                        emojiLibrary={emojiLibrary}
                        row={row}
                      />
                    ))}
              </div>
            </div>
          );
        }),
    [
      emojiLibrary,
      getRowWidth,
      innerI18n2.categories,
      isCategoryVisible,
      onSelectEmoji,
      onMouseOver,
      settings,
    ]
  );

  const SearchList = React.useCallback(
    () => (
      <div style={{ width: getRowWidth }} data-id="search">
        <div className="sticky -top-px z-1 bg-popover/90 p-1 py-2 text-sm font-semibold text-card-foreground backdrop-blur-xs">
          {innerI18n2.searchResult}
        </div>
        <div className="relative flex flex-wrap">
          {searchResult.map((emoji: Emoji, index: number) => (
            <EmojiButton
              key={emoji.id}
              onMouseOver={onMouseOver}
              onSelect={onSelectEmoji}
              emoji={emoji}
              index={index}
            />
          ))}
        </div>
      </div>
    ),
    [
      getRowWidth,
      innerI18n2.searchResult,
      searchResult,
      onSelectEmoji,
      onMouseOver,
    ]
  );

  return (
    <div
      ref={setContentRootRef}
      className={cn(
        'h-full min-h-[50%] overflow-y-auto overflow-x-hidden px-2',
        '[&::-webkit-scrollbar]:w-4',
        '[&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0',
        '[&::-webkit-scrollbar-thumb]:min-h-11 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/25',
        '[&::-webkit-scrollbar-thumb]:border-4 [&::-webkit-scrollbar-thumb]:border-popover [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:bg-clip-padding'
      )}
      data-id="scroll"
    >
      <div ref={setContentRef} className="h-full">
        {isSearching ? SearchList() : EmojiList()}
      </div>
    </div>
  );
}

function EmojiPickerSearchBar({
  children,
  i18n: innerI18n3,
  searchValue,
  setSearch,
}: {
  children: React.ReactNode;
} & Pick<EmojiPickerState, 'i18n' | 'searchValue' | 'setSearch'>) {
  return (
    <div className="flex items-center px-2">
      <div className="relative flex grow items-center">
        <input
          className="block w-full appearance-none rounded-full border-0 bg-muted px-10 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none"
          value={searchValue}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder={innerI18n3.search}
          aria-label="Search"
          autoComplete="off"
          type="text"
          autoFocus
        />
        {children}
      </div>
    </div>
  );
}

function EmojiPickerSearchAndClear({
  clearSearch,
  i18n: innerI18n4,
  searchValue,
}: Pick<EmojiPickerState, 'clearSearch' | 'i18n' | 'searchValue'>) {
  return (
    <div className="flex items-center text-foreground">
      <div
        className={cn(
          '-translate-y-1/2 absolute top-1/2 left-2.5 z-10 flex size-5 items-center justify-center text-foreground'
        )}
      >
        {emojiSearchIcons.loupe}
      </div>
      {searchValue && (
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            '-translate-y-1/2 absolute top-1/2 right-0.5 flex size-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-popover-foreground hover:bg-transparent'
          )}
          onClick={clearSearch}
          title={innerI18n4.clear}
          aria-label="Clear"
          type="button"
        >
          {emojiSearchIcons.delete}
        </Button>
      )}
    </div>
  );
}

function EmojiPreview({ emoji }: Pick<EmojiPickerState, 'emoji'>) {
  return (
    <div className="flex h-14 max-h-14 min-h-14 items-center border-t border-muted p-2">
      <div className="flex items-center justify-center text-2xl">
        {emoji?.skins[0].native}
      </div>
      <div className="overflow-hidden pl-2">
        <div className="truncate text-sm font-semibold">{emoji?.name}</div>
        <div className="truncate text-sm">{`:${emoji?.id}:`}</div>
      </div>
    </div>
  );
}

function NoEmoji({ i18n: innerI18n5 }: Pick<EmojiPickerState, 'i18n'>) {
  return (
    <div className="flex h-14 max-h-14 min-h-14 items-center border-t border-muted p-2">
      <div className="flex items-center justify-center text-2xl">😢</div>
      <div className="overflow-hidden pl-2">
        <div className="truncate text-sm font-bold">
          {innerI18n5.searchNoResultsTitle}
        </div>
        <div className="truncate text-sm">
          {innerI18n5.searchNoResultsSubtitle}
        </div>
      </div>
    </div>
  );
}

function PickAnEmoji({ i18n: innerI18n6 }: Pick<EmojiPickerState, 'i18n'>) {
  return (
    <div className="flex h-14 max-h-14 min-h-14 items-center border-t border-muted p-2">
      <div className="flex items-center justify-center text-2xl">☝️</div>
      <div className="overflow-hidden pl-2">
        <div className="truncate text-sm font-semibold">{innerI18n6.pick}</div>
      </div>
    </div>
  );
}

function EmojiPickerPreview({
  emoji,
  hasFound = true,
  i18n: innerI18n7,
  isSearching = false,
  ...props
}: Pick<EmojiPickerState, 'emoji' | 'hasFound' | 'i18n' | 'isSearching'>) {
  const showPickEmoji = !emoji && (!isSearching || hasFound);
  const showNoEmoji = isSearching && !hasFound;
  const showPreview = emoji && !showNoEmoji && !showNoEmoji;

  return (
    <>
      {showPreview && <EmojiPreview emoji={emoji} {...props} />}
      {showPickEmoji && <PickAnEmoji i18n={innerI18n7} {...props} />}
      {showNoEmoji && <NoEmoji i18n={innerI18n7} {...props} />}
    </>
  );
}

function EmojiPickerNavigation({
  emojiLibrary,
  focusedCategory,
  i18n: innerI18n8,
  icons,
  onClick,
}: {
  onClick: (id: EmojiCategoryList) => void;
} & Pick<
  EmojiPickerState,
  'emojiLibrary' | 'focusedCategory' | 'i18n' | 'icons'
>) {
  return (
    <TooltipProvider>
      <nav
        id="emoji-nav"
        className="mb-2.5 border-0 border-b border-solid border-b-border p-1.5"
      >
        <div className="relative flex items-center justify-evenly">
          {emojiLibrary
            .getGrid()
            .sections()
            .map(({ id }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      'h-fit rounded-full fill-current p-1.5 text-muted-foreground hover:bg-muted hover:text-muted-foreground',
                      id === focusedCategory &&
                        'pointer-events-none bg-accent fill-current text-accent-foreground'
                    )}
                    onClick={() => {
                      onClick(id);
                    }}
                    aria-label={innerI18n8.categories[id]}
                    type="button"
                  >
                    <span className="inline-flex size-5 items-center justify-center">
                      {icons.categories[id].outline}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {innerI18n8.categories[id]}
                </TooltipContent>
              </Tooltip>
            ))}
        </div>
      </nav>
    </TooltipProvider>
  );
}

const emojiCategoryIcons: Record<
  EmojiCategoryList,
  {
    outline: React.ReactElement;
    // Needed to add another solid variant - outline will be used for now
    solid: React.ReactElement;
  }
> = {
  activity: {
    outline: (
      <svg
        className="size-full"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2.1 13.4A10.1 10.1 0 0 0 13.4 2.1" />
        <path d="m5 4.9 14 14.2" />
        <path d="M21.9 10.6a10.1 10.1 0 0 0-11.3 11.3" />
      </svg>
    ),
    solid: (
      <svg
        className="size-full"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2.1 13.4A10.1 10.1 0 0 0 13.4 2.1" />
        <path d="m5 4.9 14 14.2" />
        <path d="M21.9 10.6a10.1 10.1 0 0 0-11.3 11.3" />
      </svg>
    ),
  },

  custom: {
    outline: <StarIcon className="size-full" />,
    solid: <StarIcon className="size-full" />,
  },

  flags: {
    outline: <FlagIcon className="size-full" />,
    solid: <FlagIcon className="size-full" />,
  },

  foods: {
    outline: <AppleIcon className="size-full" />,
    solid: <AppleIcon className="size-full" />,
  },

  frequent: {
    outline: <ClockIcon className="size-full" />,
    solid: <ClockIcon className="size-full" />,
  },

  nature: {
    outline: <LeafIcon className="size-full" />,
    solid: <LeafIcon className="size-full" />,
  },

  objects: {
    outline: <LightbulbIcon className="size-full" />,
    solid: <LightbulbIcon className="size-full" />,
  },

  people: {
    outline: <SmileIcon className="size-full" />,
    solid: <SmileIcon className="size-full" />,
  },

  places: {
    outline: <CompassIcon className="size-full" />,
    solid: <CompassIcon className="size-full" />,
  },

  symbols: {
    outline: <MusicIcon className="size-full" />,
    solid: <MusicIcon className="size-full" />,
  },
};

const emojiSearchIcons = {
  delete: <XIcon className="size-4 text-current" />,
  loupe: <SearchIcon className="size-4 text-current" />,
};

const emojiPickerIcons: EmojiIconList<React.ReactElement> = {
  categories: emojiCategoryIcons,
  search: emojiSearchIcons,
};
