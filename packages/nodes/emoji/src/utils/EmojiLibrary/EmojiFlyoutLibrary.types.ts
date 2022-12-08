import { RefObject } from 'react';
import { EmojiCategoryList } from '../../types';
import { EmojiFlyoutGrid } from './EmojiFlyoutGrid';
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

export type TGridCategory = {
  root: RefObject<HTMLDivElement>;
  rows: GridRow[];
};

export interface IEmojiFlyoutLibrary extends IEmojiLibrary {
  getCategories: () => EmojiCategoryList[];
  getGrid: () => EmojiFlyoutGrid;
}

export type EmojisListType = Partial<Record<EmojiCategoryList, string[]>>;
