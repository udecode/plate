import { Data, NoData, TComboboxItem } from '@udecode/plate-combobox';
import { TElement, TNodeProps } from '@udecode/plate-core';

export interface TEmojiElement extends TElement {
  value: string;
}

export interface TEmojiInputElement extends TElement {
  trigger: string;
}

export interface CreateEmojiNode<TData extends Data> {
  (
    item: TComboboxItem<TData>,
    meta: CreateEmojiNodeMeta
  ): TNodeProps<TEmojiElement>;
}

export interface CreateEmojiNodeMeta {
  search: string;
}

export interface EmojiPlugin<TData extends Data = NoData> {
  createEmojiNode?: CreateEmojiNode<TData>;
  id?: string;
  trigger?: string;
  insertSpaceAfterEmoji?: boolean;
}
