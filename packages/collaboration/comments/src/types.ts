import { TNode } from '@udecode/plate-core';
import { Thread } from './Thread';

export interface ThreadNodeData {
  thread: Thread;
  selected: boolean;
}

export type ThreadNode = TNode & ThreadNodeData;

export interface ThreadPlugin {}
