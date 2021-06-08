import { AnyObject, TElement } from '@udecode/slate-plugins-core';

// Data of Element node
export interface TagNodeData extends AnyObject {
  value: string;
}

// Element node
export interface TagNode extends TElement<TagNodeData> {}
