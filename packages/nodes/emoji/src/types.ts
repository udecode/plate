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
