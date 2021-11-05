import { Data, NoData } from '@udecode/plate-combobox';
import { PlatePluginKey, TElement } from '@udecode/plate-core';
import { CreateMentionNode } from './getMentionOnSelectItem';

export interface MentionNodeData {
  value: string;
}

export interface MentionInputNodeData {
  trigger: string;
}

export type MentionNode = TElement<MentionNodeData>;
export type MentionInputNode = TElement<MentionInputNodeData>;

export interface MentionPluginOptions<TData extends Data = NoData>
  extends PlatePluginKey {
  id?: string;
  trigger?: string;
  insertSpaceAfterMention?: boolean;
  createMentionNode?: CreateMentionNode<TData>;
}
