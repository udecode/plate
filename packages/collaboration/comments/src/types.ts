export interface ThreadNodeData {
  thread: Thread;
}

export interface ThreadPlugin {}

export interface Comment {
  id: any;
  text: string;
}

export interface Thread {
  id: any;
  comments: Comment[];
}
