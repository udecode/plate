import { RefObject } from 'react';
import { EmojiCategoryList } from '../../types';
import { EmojiFloatingGrid } from './EmojiFloatingGrid';
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

export interface IEmojiFloatingLibrary extends IEmojiLibrary {
  getCategories: () => EmojiCategoryList[];
  getGrid: () => EmojiFloatingGrid;
}

export type EmojisListType = Partial<Record<EmojiCategoryList, string[]>>;
