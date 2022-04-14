export interface ThreadNodeData {
  thread: Thread;
  selected: boolean;
}

export interface ThreadPlugin {}

export interface Comment {
  id: any;
  text: string;
}

export interface Thread {
  id: any;
  comments: Comment[];
  isResolved: boolean;
}
