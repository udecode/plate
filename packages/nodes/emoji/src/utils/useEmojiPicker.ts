import { Dispatch, Reducer, useCallback, useEffect, useReducer } from 'react';
import { PlateEditor, Value } from '@udecode/plate-core';
import { i18n } from '../constants';
import { getEmojiOnInsert } from '../getEmojiOnInsert';
import { AIndexSearch } from './IndexSearch/IndexSearch';
import { Emoji, EmojiCategories, IEmojiFlyoutLibrary } from './IndexSearch';

export type EmojiPickerProps = {
  editor: PlateEditor<Value>;
  emojiLibrary: IEmojiFlyoutLibrary;
  indexSearch: AIndexSearch<Emoji>;
};

export type EmojiPickerState = {
  i18n: any;
  searchValue: string;
  setSearch: (value: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
  hasFound: boolean;
  searchResult: Emoji[];
  setEmoji: (emoji?: Emoji) => void;
  selectEmoji: (emoji: Emoji) => void;
  emojiLibrary: IEmojiFlyoutLibrary;
  emojiCategories?: EmojiCategories;
  emoji?: Emoji;
};

type EmojiPickerStateProps = {
  searchValue: string;
  hasFound: boolean;
  isSearching: boolean;
  searchResult: Emoji[];
  emoji?: Emoji;
  emojiCategories?: EmojiCategories;
};

const initialState: EmojiPickerStateProps = {
  searchValue: '',
  emoji: undefined,
  hasFound: false,
  isSearching: false,
  searchResult: [],
  emojiCategories: undefined,
};

export type EmojiPickerDispatchType = {
  type: string;
  payload?: Partial<EmojiPickerStateProps>;
};

const EmojiPickerState = (): [
  EmojiPickerStateProps,
  Dispatch<EmojiPickerDispatchType>
] => {
  const [cache, dispatch] = useReducer<
    Reducer<EmojiPickerStateProps, EmojiPickerDispatchType>
  >((state, action) => {
    const { type, payload } = action;

    switch (type) {
      case 'CLEAR_SEARCH':
        return {
          ...state,
          searchValue: '',
          isSearching: false,
          hasFound: false,
        };
      case 'UPDATE_SEARCH_RESULT':
        return {
          ...state,
          ...payload,
          isSearching: true,
        };
      case 'SET_SEARCH':
      case 'SET_EMOJI':
      case 'SET_EMOJI_CATEGORIES':
        return { ...state, ...payload };
      default: {
        throw new Error(`Unhandled action type: ${type}`);
      }
    }
  }, initialState);

  return [cache, dispatch];
};

export const useEmojiPicker = ({
  editor,
  emojiLibrary,
  indexSearch,
}: EmojiPickerProps): EmojiPickerState => {
  const [state, dispatch] = EmojiPickerState();

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
    dispatch({
      type: 'SET_EMOJI_CATEGORIES',
      payload: { emojiCategories: emojiLibrary.getCategories() },
    });
  }, [dispatch, emojiLibrary]);

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
    emojiCategories: state.emojiCategories,
    emojiLibrary,
  };
};
