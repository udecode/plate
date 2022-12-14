import { TComboboxItem } from '@udecode/plate-combobox';
import { TEditableProps, Value } from '@udecode/plate-core';
import { IEmojiTriggeringController } from './utils';

type ReverseMap<T> = T[keyof T];

export type EmojiComboboxProps = (
  editableProps: TEditableProps<Value>
) => JSX.Element | null;

export type EmojiItemData = {
  id: string;
  emoji: string;
  name: string;
  text: string;
};

export interface CreateEmoji<TData extends EmojiItemData = EmojiItemData> {
  (data: TComboboxItem<TData>): string;
}

export interface EmojiPlugin<TData extends EmojiItemData = EmojiItemData> {
  trigger?: string;
  createEmoji?: CreateEmoji<TData>;
  emojiTriggeringController?: IEmojiTriggeringController;
  id?: string;
}

export const EmojiCategoryType = {
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

export type EmojiCategoryAll = ReverseMap<typeof EmojiCategoryType>;
export type EmojiCategoryList = Exclude<EmojiCategoryAll, 'search'>;

export type i18nProps = {
  search: string;
  searchResult: string;
  clear: string;
  searchNoResultsTitle: string;
  searchNoResultsSubtitle: string;
  pick: string;
  categories: Record<EmojiCategoryAll, string>;
  skins: Record<'choose' | '1' | '2' | '3' | '4' | '5' | '6', string>;
};

export type IconList<T = string> = {
  categories: Record<EmojiCategoryList, { outline: T; solid: T }>;
  search: {
    loupe: T;
    delete: T;
  };
};
