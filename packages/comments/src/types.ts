import { TElement } from '@udecode/plate-core';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Comment {
  id: any;
  text: string;
  createdAt: number;
  createdBy: User;
}

export interface Thread {
  id: any;
  comments: Comment[];
  isResolved: boolean;
  createdBy: User;
  assignedTo?: User;
}

export interface ThreadNodeData {
  thread: Thread;
  selected: boolean;
}

export type ThreadElement = TElement & ThreadNodeData;

export interface ThreadPlugin {}
