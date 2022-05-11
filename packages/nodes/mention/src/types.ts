import { Data, NoData } from '@udecode/plate-combobox';
import { TElement } from '@udecode/plate-core';
import { CreateMentionNode } from './getMentionOnSelectItem';

export interface TMentionElement extends TElement {
  value: string;
}

export interface TMentionInputElement extends TElement {
  trigger: string;
}

export interface MentionPlugin<TData extends Data = NoData> {
  createMentionNode?: CreateMentionNode<TData>;
  id?: string;
  insertSpaceAfterMention?: boolean;
  trigger?: string;
  inputCreation?: { key: string; value: string };
}
