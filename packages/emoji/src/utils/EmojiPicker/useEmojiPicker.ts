import React from 'react';

import { useEditorRef } from '@udecode/plate-common/react';

import type {
  EmojiCategoryList,
  EmojiIconList,
  EmojiSettingsType,
  i18nProps,
} from '../../types';
import type { Emoji, IEmojiFloatingLibrary } from '../EmojiLibrary/index';
import type { AIndexSearch } from '../IndexSearch/index';

import { i18n } from '../../constants';
import {
  type SetFocusedAndVisibleSectionsType,
  observeCategories,
} from '../EmojiObserver';
import { insertEmoji } from '../insertEmoji';
import {
  EmojiPickerState,
  type MapEmojiCategoryList,
} from './EmojiPickerState';

export type MutableRefs = React.MutableRefObject<{
  content: React.RefObject<HTMLDivElement> | undefined;
  contentRoot: React.RefObject<HTMLDivElement> | undefined;
}>;

export type UseEmojiPickerProps = {
  closeOnSelect: boolean;
  emojiLibrary: IEmojiFloatingLibrary;
  indexSearch: AIndexSearch;
};

export type UseEmojiPickerType<
  T extends React.ReactElement = React.ReactElement,
> = {
  clearSearch: () => void;
  emoji?: Emoji;
  emojiLibrary: IEmojiFloatingLibrary;
  focusedCategory?: EmojiCategoryList;
  handleCategoryClick: (id: EmojiCategoryList) => void;
  hasFound: boolean;
  i18n: i18nProps;
  icons: EmojiIconList<T>;
  isOpen: boolean;
  isSearching: boolean;
  onMouseOver: (emoji?: Emoji) => void;
  onSelectEmoji: (emoji: Emoji) => void;
  refs: MutableRefs;
  searchResult: Emoji[];
  searchValue: string;
  setIsOpen: (isOpen: boolean) => void;
  setSearch: (value: string) => void;
  settings?: EmojiSettingsType;
  styles?: any;
  visibleCategories: MapEmojiCategoryList;
};

export const useEmojiPicker = ({
  closeOnSelect,
  emojiLibrary,
  indexSearch,
}: UseEmojiPickerProps): Omit<UseEmojiPickerType, 'icons' | 'settings'> => {
  const editor = useEditorRef();

  const [state, dispatch] = EmojiPickerState();
  const refs = React.useRef({
    content: React.createRef<HTMLDivElement>(),
    contentRoot: React.createRef<HTMLDivElement>(),
  });

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
      value ? handleSearchInput(value) : dispatch({ type: 'CLEAR_SEARCH' });
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

  const handleCategoryClick = React.useCallback(
    (categoryId: EmojiCategoryList) => {
      dispatch({
        payload: { focusedCategory: categoryId },
        type: 'SET_FOCUSED_CATEGORY',
      });

      const getSectionPositionToScrollIntoView = () => {
        const trashHold = 1;
        const section = emojiLibrary.getGrid().section(categoryId);

        const contentRootScrollTop =
          refs.current.contentRoot.current?.scrollTop ?? 0;
        const contentRootTopPosition =
          refs.current.contentRoot.current?.getBoundingClientRect().top ?? 0;
        const sectionTopPosition =
          section?.root.current?.getBoundingClientRect().top ?? 0;

        return (
          trashHold +
          contentRootScrollTop +
          sectionTopPosition -
          contentRootTopPosition
        );
      };

      if (refs.current.contentRoot.current) {
        refs.current.contentRoot.current.scrollTop =
          getSectionPositionToScrollIntoView();
      }
    },
    [dispatch, emojiLibrary]
  );

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
    handleCategoryClick,
    i18n,
    onMouseOver,
    onSelectEmoji,
    refs,
    setIsOpen,
    setSearch,
    ...state,
  };
};
