import type { UIMessage } from 'ai';

export type ToolName = 'comment' | 'edit' | 'generate';

export interface TComment {
  blockId: string;
  comment: string;
  content: string;
}

export interface MessageDataPart {
  [key: string]: unknown;
  toolName: ToolName;
  comment?: TComment;
}

export type ChatMessage = UIMessage<{}, MessageDataPart>;
