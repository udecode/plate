import type { EmojiCategoryList } from '../../types';
import type { EmojiFloatingGridType } from './EmojiFloatingGrid';
import type { IEmojiLibrary } from './EmojiLibrary.types';

export type FrequentEmojis = Record<string, number>;

export type FrequentEmojiStorageProps = {
  key?: string;
  limit?: number;
  prefix?: string;
};

export interface IFrequentEmojiStorage {
  get: () => FrequentEmojis;
  getList: () => string[];
  set: (value: any) => void;
  update: (emojiId: string) => any;
}

export interface IEmojiFloatingLibrary extends IEmojiLibrary {
  getGrid: () => EmojiFloatingGridType;
  indexOf: (focusedCategory: EmojiCategoryList) => number;
  updateFrequentCategory: (emojiId: string) => void;
}
