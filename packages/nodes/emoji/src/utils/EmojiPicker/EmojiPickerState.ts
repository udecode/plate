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
  category: EmojiCategoryType.Frequent,
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
        };
      case 'UPDATE_SEARCH_RESULT':
        return {
          ...state,
          ...payload,
          isSearching: true,
        };
      case 'SET_SEARCH':
      case 'SET_EMOJI':
        return { ...state, ...payload };
      default: {
        throw new Error(`Unhandled action type: ${type}`);
      }
    }
  }, initialState);

  return [cache, dispatch];
};
