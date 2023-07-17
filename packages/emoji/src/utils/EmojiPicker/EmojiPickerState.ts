import { Dispatch, Reducer, useReducer } from 'react';

import { EmojiCategory, EmojiCategoryList } from '../../types';
import { Emoji } from '../EmojiLibrary/index';

export type MapEmojiCategoryList = Map<EmojiCategoryList, boolean>;

export type EmojiPickerStateProps = {
  isOpen: boolean;
  searchValue: string;
  hasFound: boolean;
  isSearching: boolean;
  searchResult: Emoji[];
  visibleCategories: MapEmojiCategoryList;
  emoji?: Emoji;
  focusedCategory?: EmojiCategoryList;
  frequentEmoji?: string;
};

export type EmojiPickerStateDispatch = {
  type: string;
  payload?: Partial<EmojiPickerStateProps>;
};

const initialState: EmojiPickerStateProps = {
  isOpen: false,
  searchValue: '',
  emoji: undefined,
  hasFound: false,
  isSearching: false,
  searchResult: [],
  focusedCategory: undefined,
  visibleCategories: new Map(),
  frequentEmoji: undefined,
};

export const EmojiPickerState = (): [
  EmojiPickerStateProps,
  Dispatch<EmojiPickerStateDispatch>,
] => {
  const [cache, dispatch] = useReducer<
    Reducer<EmojiPickerStateProps, EmojiPickerStateDispatch>
  >((state, action) => {
    const { type, payload } = action;

    switch (type) {
      case 'CLEAR_SEARCH': {
        return {
          ...state,
          searchValue: '',
          isSearching: false,
          hasFound: false,
          focusedCategory: EmojiCategory.Frequent,
        };
      }
      case 'UPDATE_SEARCH_RESULT': {
        return {
          ...state,
          ...payload,
          isSearching: true,
          focusedCategory: undefined,
        };
      }
      case 'SET_FOCUSED_CATEGORY': {
        return {
          ...state,
          ...payload,
          searchValue: '',
          isSearching: false,
          hasFound: false,
        };
      }
      case 'SET_OPEN': {
        return {
          ...state,
          isOpen: true,
        };
      }
      case 'SET_CLOSE': {
        return {
          ...state,
          emoji: undefined,
          isOpen: false,
        };
      }
      case 'UPDATE_FREQUENT_EMOJIS': {
        return {
          ...state,
          ...payload,
          emoji: undefined,
        };
      }
      case 'SET_SEARCH':
      case 'SET_EMOJI':
      case 'SET_FOCUSED_AND_VISIBLE_CATEGORIES': {
        return { ...state, ...payload };
      }
      default: {
        throw new Error(`Unhandled action type: ${type}`);
      }
    }
  }, initialState);

  return [cache, dispatch];
};
