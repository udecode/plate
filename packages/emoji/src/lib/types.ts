import type { Emoji, EmojiMartData } from '@emoji-mart/data';
import type { Descendant } from '@udecode/plate';
import type { TriggerComboboxPluginOptions } from '@udecode/plate-combobox';

export type EmojiPluginOptions<TEmoji extends Emoji = Emoji> = {
  /**
   * The emoji data.
   *
   * @example
   *   import emojiMartData from '@emoji-mart/data';
   */
  data?: EmojiMartData;
  createEmojiNode?: (emoji: TEmoji) => Descendant;
} & TriggerComboboxPluginOptions;

export type EmojiSettingsType = {
  buttonSize: {
    value: number;
  };
  categories: {
    value?: EmojiCategoryList[];
  };
  perLine: {
    value: number;
  };
  showFrequent: {
    value: boolean;
    key?: string;
    limit?: number;
    prefix?: string;
  };
};

type ReverseMap<T> = T[keyof T];

export const EmojiCategory = {
  Activity: 'activity',
  Custom: 'custom',
  Flags: 'flags',
  Foods: 'foods',
  Frequent: 'frequent',
  Nature: 'nature',
  Objects: 'objects',
  People: 'people',
  Places: 'places',
  Symbols: 'symbols',
} as const;

export type EmojiCategoryList = ReverseMap<typeof EmojiCategory>;

export type EmojiIconList<T = string> = {
  categories: Record<EmojiCategoryList, { outline: T; solid: T }>;
  search: {
    delete: T;
    loupe: T;
  };
};

export type FrequentEmojis = Record<string, number>;

export type i18nProps = {
  categories: Record<EmojiCategoryList, string>;
  clear: string;
  pick: string;
  search: string;
  searchNoResultsSubtitle: string;
  searchNoResultsTitle: string;
  searchResult: string;
  skins: Record<'1' | '2' | '3' | '4' | '5' | '6' | 'choose', string>;
};
