import type { UIMessage } from 'ai';

export type Choice = 'comment' | 'edit' | 'generate';

export type TComment = {
  blockId: string;
  comment: string;
  content: string;
};

export type MessageDataPart = {
  choice: Choice;
  comment?: TComment;
};

export type ChatMessage = UIMessage<{}, MessageDataPart>;
