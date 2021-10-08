import { AnyObject, PlatePluginKey, TElement } from '@udecode/plate-core';

export interface MentionNodeData extends AnyObject {
  value: string;
}

export type MentionNode = TElement<MentionNodeData>;

export interface MentionPluginOptions extends PlatePluginKey {}
