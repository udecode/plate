import { TComboboxItem } from '@udecode/plate-combobox';
import { IEmojiTriggeringController } from './utils';

export type EmojiItemData = {
  id: string;
  emoji: string;
  name: string;
  text: string;
};

export interface CreateEmoji<TData extends EmojiItemData = EmojiItemData> {
  (data: TComboboxItem<TData>): string;
}

export interface EmojiPluginOptions<
  TData extends EmojiItemData = EmojiItemData
> {
  trigger: string;
  createEmoji: CreateEmoji<TData>;
  emojiTriggeringController: IEmojiTriggeringController;
  id?: string;
}
