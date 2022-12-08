import { EmojiCategoryList } from '../../types';
import { TGridCategory } from './EmojiFlyoutLibrary.types';

export interface IEmojiFlyoutGrid {
  values: () => IterableIterator<TGridCategory>;
  section: (sectionId: EmojiCategoryList) => TGridCategory;
}
