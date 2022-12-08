import { Dispatch, Reducer, useReducer } from 'react';
import { EmojiCategoryType } from '../../types';
import {
  EmojiPickerStateDispatch,
  EmojiPickerStateProps,
} from './EmojiPickerState.types';

const initialState: EmojiPickerStateProps = {
  searchValue: '',
  emoji: undefined,
  hasFound: false,
  isSearching: false,
  searchResult: [],
  focusedCategory: undefined,
  visibleCategories: new Map(),
};

export const EmojiPickerState = (): [
  EmojiPickerStateProps,
  Dispatch<EmojiPickerStateDispatch>
] => {
  const [cache, dispatch] = useReducer<
    Reducer<EmojiPickerStateProps, EmojiPickerStateDispatch>
  >((state, action) => {
    const { type, payload } = action;

    switch (type) {
      case 'CLEAR_SEARCH':
        return {
          ...state,
          searchValue: '',
          isSearching: false,
          hasFound: false,
          focusedCategory: EmojiCategoryType.Frequent,
        };
      case 'UPDATE_SEARCH_RESULT':
        return {
          ...state,
          ...payload,
          isSearching: true,
          focusedCategory: undefined,
        };
      case 'SET_SEARCH':
      case 'SET_EMOJI':
      case 'SET_FOCUSED_CATEGORY':
      case 'SET_FOCUSED_AND_VISIBLE_CATEGORIES':
        return { ...state, ...payload };
      default: {
        throw new Error(`Unhandled action type: ${type}`);
      }
    }
  }, initialState);

  return [cache, dispatch];
};
