import { EmojiCategoryList } from '../../types';
import { Emoji } from '../EmojiLibrary';

export type MapEmojiCategoryList = Map<EmojiCategoryList, number>;

export type EmojiPickerStateProps = {
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
