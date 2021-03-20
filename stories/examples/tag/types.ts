import { Element } from 'slate';

// Data of Element node
export interface TagNodeData {
  value: string;
  [key: string]: any;
}

// Element node
export interface TagNode extends Element, TagNodeData {}
