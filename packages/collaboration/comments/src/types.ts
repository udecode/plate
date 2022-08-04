import { TElement } from '@udecode/plate-core';
import { Thread } from './utils/types';

export interface ThreadNodeData {
  thread: Thread;
  selected: boolean;
}

export type ThreadElement = TElement & ThreadNodeData;

export interface ThreadPlugin {}
