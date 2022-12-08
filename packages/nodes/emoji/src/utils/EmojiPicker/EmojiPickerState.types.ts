import { EmojiCategoryList } from '../../types';
import { Emoji } from '../EmojiLibrary';

export type MapEmojiCategoryType = Map<EmojiCategoryList, number>;

export type EmojiPickerStateProps = {
  searchValue: string;
  hasFound: boolean;
  isSearching: boolean;
  searchResult: Emoji[];
  visibleCategories: MapEmojiCategoryType;
  emoji?: Emoji;
  focusedCategory?: EmojiCategoryList;
};

export type EmojiPickerStateDispatch = {
  type: string;
  payload?: Partial<EmojiPickerStateProps>;
};
