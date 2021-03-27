import { TElement } from '@udecode/slate-plugins-core';

// Data of Element node
export interface TagNodeData {
  value: string;
  [key: string]: any;
}

// Element node
export interface TagNode extends TElement<TagNodeData> {}
