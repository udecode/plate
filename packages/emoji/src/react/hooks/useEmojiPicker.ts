import React from 'react';

import type { Emoji } from '@emoji-mart/data';

import { useEditorRef } from 'platejs/react';

import { i18n } from '../../lib/constants';
import type {
  EmojiCategoryList,
  EmojiIconList,
  EmojiSettingsType,
  i18nProps,
} from '../../lib/types';
import { insertEmoji } from '../../lib/transforms/insertEmoji';
import type { AIndexSearch } from '../../lib/utils/IndexSearch/IndexSearch';
import { observeCategories } from '../utils/EmojiObserver';
import type { IEmojiFloatingLibrary } from '../utils/EmojiLibrary/EmojiFloatingLibrary.types';
import type { SetFocusedAndVisibleSectionsType } from '../utils/EmojiObserver';
import {
  useEmojiPickerState,
  type MapEmojiCategoryList,
} from './useEmojiPickerState';

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
  T extends React.ReactElement<any> = React.ReactElement<any>,
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
  setIsOpen: (isOpen: boolean) => void;
  setSearch: (value: string) => void;
  handleCategoryClick: (id: EmojiCategoryList) => void;
  onMouseOver: (emoji?: Emoji) => void;
  onSelectEmoji: (emoji: Emoji) => void;
  emoji?: Emoji;
  focusedCategory?: EmojiCategoryList;
  settings?: EmojiSettingsType;
  styles?: any;
};

export const useEmojiPicker = ({
  closeOnSelect,
  emojiLibrary,
  indexSearch,
}: UseEmojiPickerProps): Omit<UseEmojiPickerType, 'icons' | 'settings'> => {
  const editor = useEditorRef();

  const [state, dispatch] = useEmojiPickerState();
  const refs = React.useRef({
    content: React.createRef<HTMLDivElement>(),
    contentRoot: React.createRef<HTMLDivElement>(),
  });
  const pendingCategoryScrollRef = React.useRef<EmojiCategoryList | null>(null);

  const setIsOpen = React.useCallback(
    (isOpen: boolean) => {
      dispatch({
        type: isOpen ? 'SET_OPEN' : 'SET_CLOSE',
      });
    },
    [dispatch]
  );

  const setFocusedAndVisibleSections =
    React.useCallback<SetFocusedAndVisibleSectionsType>(
      (visibleSections, categoryId) => {
        dispatch({
          payload: {
            focusedCategory: categoryId,
            visibleCategories: visibleSections,
          },
          type: 'SET_FOCUSED_AND_VISIBLE_CATEGORIES',
        });
      },
      [dispatch]
    );

  const handleSearchInput = React.useCallback(
    (input: string) => {
      const value = String(input).replaceAll(/\s/g, '');

      if (!value && !input) {
        dispatch({ type: 'CLEAR_SEARCH' });

        return;
      }

      const hasFound = indexSearch.search(value).hasFound();

      dispatch({
        payload: {
          hasFound,
          searchResult: indexSearch.get(),
          searchValue: value,
        },
        type: 'UPDATE_SEARCH_RESULT',
      });
    },
    [dispatch, indexSearch]
  );

  const setSearch = React.useCallback(
    (value: string) => {
      if (value) {
        handleSearchInput(value);
      } else {
        dispatch({ type: 'CLEAR_SEARCH' });
      }
    },
    [dispatch, handleSearchInput]
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
          frequentEmoji: emojiId,
          isOpen: closeOnSelect ? false : state.isOpen,
        },
        type: 'UPDATE_FREQUENT_EMOJIS',
      });
    },
    [closeOnSelect, dispatch, emojiLibrary, state.isOpen]
  );

  const onSelectEmoji = React.useCallback(
    (emoji: Emoji) => {
      insertEmoji(editor, emoji);
      updateFrequentEmojis(emoji.id);
    },
    [editor, updateFrequentEmojis]
  );

  const scrollCategoryIntoView = React.useCallback(
    (categoryId: EmojiCategoryList) => {
      const grid = emojiLibrary.getGrid();
      const contentRoot = refs.current.contentRoot.current;
      const sectionRoot = grid.section(categoryId)?.root.current;

      if (!contentRoot || !sectionRoot || !contentRoot.contains(sectionRoot)) {
        return false;
      }

      const threshold = 1;
      const contentRootScrollTop = contentRoot.scrollTop;
      const contentRootTopPosition = contentRoot.getBoundingClientRect().top;
      const sectionTopPosition = sectionRoot.getBoundingClientRect().top;

      contentRoot.scrollTop =
        threshold +
        contentRootScrollTop +
        sectionTopPosition -
        contentRootTopPosition;

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

    if (!categoryId) return;

    if (scrollCategoryIntoView(categoryId)) {
      pendingCategoryScrollRef.current = null;
    }
  }, [
    scrollCategoryIntoView,
    state.focusedCategory,
    state.isSearching,
    state.visibleCategories,
  ]);

  React.useEffect(() => {
    if (state.isOpen && !state.isSearching) {
      // Timeout to allow the category element refs to populate
      setTimeout(() => {
        observeCategories({
          ancestorRef: refs.current.contentRoot,
          emojiLibrary,
          setFocusedAndVisibleSections,
        });
      }, 0);
    }
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
