import { EmojiCategoryList } from '../../types';
import { Emoji } from '../EmojiLibrary';

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
