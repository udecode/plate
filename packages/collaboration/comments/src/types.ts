import { Node } from 'slate';
import { Thread } from './Thread';

export interface ThreadNodeData {
  thread: Thread;
  selected: boolean;
}

export type ThreadNode = Node & ThreadNodeData;

export interface ThreadPlugin {}
