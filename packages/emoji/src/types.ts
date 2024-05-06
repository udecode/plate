import type { TComboboxItem } from '@udecode/plate-combobox';

import type { IEmojiTriggeringController } from './utils/index';

type ReverseMap<T> = T[keyof T];

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
    key?: string;
    limit?: number;
    prefix?: string;
    value: boolean;
  };
};

export type EmojiItemData = {
  emoji: string;
  id: string;
  name: string;
  text: string;
};

export type CreateEmoji<TData extends EmojiItemData = EmojiItemData> = (
  data: TComboboxItem<TData>
) => string;

export interface EmojiPlugin<TData extends EmojiItemData = EmojiItemData> {
  createEmoji?: CreateEmoji<TData>;
  emojiTriggeringController?: IEmojiTriggeringController;
  id?: string;
  trigger?: string;
}

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

export type EmojiIconList<T = string> = {
  categories: Record<EmojiCategoryList, { outline: T; solid: T }>;
  search: {
    delete: T;
    loupe: T;
  };
};

export type FindTriggeringInputProps = {
  action?: 'delete' | 'insert';
  char?: string;
};
