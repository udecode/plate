import { EmojiCategoryList } from '../../../common/types';
import { EmojiFloatingGridType } from './EmojiFloatingGrid';
import { IEmojiLibrary } from './EmojiLibrary.types';

export type FrequentEmojis = Record<string, number>;

export type FrequentEmojiStorageProps = {
  prefix?: string;
  key?: string;
  limit?: number;
};

export interface IFrequentEmojiStorage {
  update: (emojiId: string) => any;
  get(): FrequentEmojis;
  getList: () => string[];
  set: (value: any) => void;
}

export interface IEmojiFloatingLibrary extends IEmojiLibrary {
  getGrid: () => EmojiFloatingGridType;
  indexOf: (focusedCategory: EmojiCategoryList) => number;
  updateFrequentCategory: (emojiId: string) => void;
}
