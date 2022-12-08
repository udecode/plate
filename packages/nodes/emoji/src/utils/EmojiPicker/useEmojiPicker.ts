import { useCallback, useEffect, useRef } from 'react';
import { i18n } from '../../constants';
import { getEmojiOnInsert } from '../../handlers/getEmojiOnInsert';
import { EmojiCategoryList } from '../../types';
import { Emoji } from '../EmojiLibrary';
import {
  observeCategories,
  SetFocusedAndVisibleSectionsType,
} from '../EmojiObserver';
import { EmojiPickerState } from './EmojiPickerState';
import {
  UseEmojiPickerProps,
  UseEmojiPickerType,
} from './useEmojiPicker.types';

export const useEmojiPicker = ({
  isOpen,
  editor,
  emojiLibrary,
  indexSearch,
}: UseEmojiPickerProps): Omit<UseEmojiPickerType, 'icons'> => {
  const [state, dispatch] = EmojiPickerState();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const setFocusedAndVisibleSections = useCallback<SetFocusedAndVisibleSectionsType>(
    (visibleSections, categoryId) => {
      dispatch({
        type: 'SET_FOCUSED_AND_VISIBLE_CATEGORIES',
        payload: {
          focusedCategory: categoryId,
          visibleCategories: visibleSections,
        },
      });
    },
    [dispatch]
  );

  const handleSearchInput = useCallback(
    (input: string) => {
      const value = String(input).replace(/\s/g, '');
      if (!value && !input) {
        dispatch({ type: 'CLEAR_SEARCH' });
        return;
      }

      const hasFound = indexSearch.search(value).hasFound();

      dispatch({
        type: 'UPDATE_SEARCH_RESULT',
        payload: {
          searchValue: value,
          hasFound,
          searchResult: indexSearch.get(),
        },
      });
    },
    [dispatch, indexSearch]
  );

  const setSearch = useCallback(
    (value: string) => {
      value ? handleSearchInput(value) : dispatch({ type: 'CLEAR_SEARCH' });
    },
    [dispatch, handleSearchInput]
  );

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, [dispatch]);

  const setEmoji = useCallback(
    (emoji?: Emoji) => {
      dispatch({ type: 'SET_EMOJI', payload: { emoji } });
    },
    [dispatch]
  );

  const selectEmoji = useCallback(
    (emoji: Emoji) => {
      const selectItem = getEmojiOnInsert();
      selectItem(editor, {
        key: emoji.id,
        text: emoji.name,
        data: {
          id: emoji.id,
          emoji: emoji.skins[0].native,
          name: emoji.name,
          text: emoji.name,
        },
      });
    },
    [editor]
  );

  const handleCategoryClick = useCallback(
    (categoryId: EmojiCategoryList) => {
      dispatch({
        type: 'SET_FOCUSED_CATEGORY',
        payload: { focusedCategory: categoryId },
      });
    },
    [dispatch]
  );

  useEffect(() => {
    if (isOpen && !state.isSearching) {
      observeCategories({
        ancestorRef: scrollRef,
        emojiLibrary,
        setFocusedAndVisibleSections,
      });
    }
  }, [emojiLibrary, isOpen, state.isSearching, setFocusedAndVisibleSections]);

  return {
    i18n,
    setSearch,
    clearSearch,
    emoji: state.emoji,
    setEmoji,
    selectEmoji,
    emojiLibrary,
    handleCategoryClick,
    scrollRef,
    ...state,
  };
};
