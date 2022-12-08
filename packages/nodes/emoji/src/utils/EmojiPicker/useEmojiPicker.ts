import { useCallback, useEffect, useRef } from 'react';
import { i18n } from '../../constants';
import { getEmojiOnInsert } from '../../handlers/getEmojiOnInsert';
import { EmojiCategoryList } from '../../types';
import { Emoji } from '../EmojiLibrary';
import { observeCategories } from '../EmojiObserver';
import { EmojiPickerState } from './EmojiPickerState';
import {
  UseEmojiPickerProps,
  UseEmojiPickerType,
} from './useEmojiPicker.types';

export const useEmojiPicker = ({
  editor,
  emojiLibrary,
  indexSearch,
}: UseEmojiPickerProps): Omit<UseEmojiPickerType, 'icons'> => {
  const [state, dispatch] = EmojiPickerState();
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    observeCategories(scrollRef);
  }, []);

  const handleCategoryClick = (id: EmojiCategoryList) => {
    // eslint-disable-next-line no-console
    console.log('id', id);
  };

  return {
    i18n,
    searchValue: state.searchValue,
    setSearch,
    clearSearch,
    hasFound: state.hasFound,
    searchResult: state.searchResult,
    isSearching: state.isSearching,
    emoji: state.emoji,
    setEmoji,
    selectEmoji,
    emojiLibrary,
    handleCategoryClick,
    scrollRef,
  };
};
