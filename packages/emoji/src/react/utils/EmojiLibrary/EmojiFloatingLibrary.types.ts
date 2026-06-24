import type { EmojiCategoryList, FrequentEmojis } from '../../../lib/types';
import type { IEmojiLibrary } from '../../../lib/utils/EmojiLibrary/EmojiLibrary.types';
import type { EmojiFloatingGridType } from './EmojiFloatingGrid';

export type FrequentEmojiStorageProps = {
  key?: string;
  limit?: number;
  prefix?: string;
};

export interface IEmojiFloatingLibrary extends IEmojiLibrary {
  getGrid: () => EmojiFloatingGridType;
  indexOf: (focusedCategory: EmojiCategoryList) => number;
  updateFrequentCategory: (emojiId: string) => void;
}

export type IFrequentEmojiStorage = {
  get: () => FrequentEmojis;
  getList: () => string[];
  set: (value: any) => void;
  update: (emojiId: string) => any;
};
