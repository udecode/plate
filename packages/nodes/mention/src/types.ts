import { Data, NoData } from '@udecode/plate-combobox';
import { TElement } from '@udecode/plate-core';
import { CreateMentionNode } from './getMentionOnSelectItem';

export interface MentionNodeData {
  value: string;
}

export interface MentionInputNodeData {
  trigger: string;
  creationId?: string;
}

export type MentionNode = TElement<MentionNodeData>;
export type MentionInputNode = TElement<MentionInputNodeData>;

export interface MentionPlugin<TData extends Data = NoData> {
  createMentionNode?: CreateMentionNode<TData>;
  id?: string;
  insertSpaceAfterMention?: boolean;
  trigger?: string;
  creationId?: string;
}
