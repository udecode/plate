import type { UIMessage } from 'ai';

export type ToolName = 'comment' | 'edit' | 'generate';

export type TComment = {
  blockId: string;
  comment: string;
  content: string;
};

export type MessageDataPart = {
  toolName: ToolName;
  comment?: TComment;
};

export type ChatMessage = UIMessage<{}, MessageDataPart>;
