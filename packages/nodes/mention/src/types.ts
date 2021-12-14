import { TElement } from '@udecode/plate-core';
import { Data, NoData } from '@udecode/plate-ui-combobox';
import { CreateMentionNode } from './getMentionOnSelectItem';

export interface MentionNodeData {
  value: string;
}

export interface MentionInputNodeData {
  trigger: string;
}

export type MentionNode = TElement<MentionNodeData>;
export type MentionInputNode = TElement<MentionInputNodeData>;

export interface MentionPlugin<TData extends Data = NoData> {
  createMentionNode?: CreateMentionNode<TData>;
  id?: string;
  insertSpaceAfterMention?: boolean;
  trigger?: string;
}
