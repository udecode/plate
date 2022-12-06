import { TComboboxItem } from '@udecode/plate-combobox';
import { TEditableProps, Value } from '@udecode/plate-core';
import { IEmojiTriggeringController } from './utils';

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

export type CategoryList =
  | 'activity'
  | 'custom'
  | 'flags'
  | 'foods'
  | 'frequent'
  | 'nature'
  | 'objects'
  | 'people'
  | 'places'
  | 'search'
  | 'symbols';

export type i18nProps = {
  search: string;
  clear: string;
  searchNoResultsTitle: string;
  searchNoResultsSubtitle: string;
  pick: string;
  categories: Record<CategoryList, string>;
  skins: Record<'choose' | '1' | '2' | '3' | '4' | '5' | '6', string>;
};

export type IconList<T = string> = {
  categories: Record<Exclude<CategoryList, 'search'>, { outline: T; solid: T }>;
  search: {
    loupe: T;
    delete: T;
  };
};
