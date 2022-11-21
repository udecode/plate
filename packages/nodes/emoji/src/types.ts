import { Data, NoData, TComboboxItem } from '@udecode/plate-combobox';
import { IEmojiTriggeringController } from './utils';

export interface CreateEmoji<TData extends Data> {
  (item: TComboboxItem<TData>): string;
}

export interface EmojiPluginOptions<TData extends Data = NoData> {
  trigger: string;
  createEmoji: CreateEmoji<TData>;
  emojiTriggeringController: IEmojiTriggeringController;
  id?: string;
}
