import { EmojiCategoryList } from '../../types';
import { TGridCategory } from './EmojiFloatingLibrary.types';

export interface IEmojiFloatingGrid {
  values: () => IterableIterator<TGridCategory>;
  section: (sectionId: EmojiCategoryList) => TGridCategory;
}
