import { EmojiCategoryList } from '../../types';
import { Emoji } from '../IndexSearch';

export type EmojiPickerStateProps = {
  searchValue: string;
  hasFound: boolean;
  isSearching: boolean;
  searchResult: Emoji[];
  emoji?: Emoji;
  category: EmojiCategoryList;
};

export type EmojiPickerStateDispatch = {
  type: string;
  payload?: Partial<EmojiPickerStateProps>;
};
