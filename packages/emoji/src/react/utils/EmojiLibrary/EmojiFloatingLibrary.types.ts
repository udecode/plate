import type {
  EmojiCategoryList,
  FrequentEmojis,
  IEmojiLibrary,
} from '../../../lib';
import type { EmojiFloatingGridType } from './EmojiFloatingGrid';

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
