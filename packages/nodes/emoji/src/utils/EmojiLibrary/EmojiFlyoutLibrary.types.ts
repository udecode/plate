import { RefObject } from 'react';
import { EmojiCategoryList } from '../../types';
import { IEmojiLibrary } from './EmojiLibrary.types';

export type GridRow = {
  emojis: string[];
  id: number;
};

export type EmojiCategory = {
  id: EmojiCategoryList;
  emojis: string[];
};
export type EmojiCategories = Array<EmojiCategory>;

export interface IEmojiFlyoutLibrary extends IEmojiLibrary {
  getCategories: () => EmojiCategoryList[];
  getEmojisInRows: (categoryId: EmojiCategoryList) => { rows: GridRow[] };
}

export type TGridCategory = {
  root: RefObject<HTMLDivElement>;
  rows: GridRow[];
};
