import React from 'react';

import type { Emoji } from '@emoji-mart/data';

import { type EmojiCategoryList, EmojiCategory } from '../../lib';

export type MapEmojiCategoryList = Map<EmojiCategoryList, boolean>;

export type EmojiPickerStateProps = {
  hasFound: boolean;
  isOpen: boolean;
  isSearching: boolean;
  searchResult: Emoji[];
  searchValue: string;
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
  emoji: undefined,
  focusedCategory: undefined,
  frequentEmoji: undefined,
  hasFound: false,
  isOpen: false,
  isSearching: false,
  searchResult: [],
  searchValue: '',
  visibleCategories: new Map(),
};

export const EmojiPickerState = (): [
  EmojiPickerStateProps,
  React.Dispatch<EmojiPickerStateDispatch>,
] => {
  const [cache, dispatch] = React.useReducer<
    React.Reducer<EmojiPickerStateProps, EmojiPickerStateDispatch>
  >((state, action) => {
    const { payload, type } = action;

    switch (type) {
      case 'CLEAR_SEARCH': {
        return {
          ...state,
          focusedCategory: EmojiCategory.Frequent,
          hasFound: false,
          isSearching: false,
          searchValue: '',
        };
      }
      case 'UPDATE_SEARCH_RESULT': {
        return {
          ...state,
          ...payload,
          focusedCategory: undefined,
          isSearching: true,
        };
      }
      case 'SET_FOCUSED_CATEGORY': {
        return {
          ...state,
          ...payload,
          hasFound: false,
          isSearching: false,
          searchValue: '',
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
