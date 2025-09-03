import type { UIMessage } from 'ai';

export type Choice = 'comment' | 'edit' | 'generate';

export type MessageMetadata = {
  choice?: Choice;
};

export type MessageDataPart = {
  choice: Choice;
};

export type ChatMessage = UIMessage<MessageMetadata, MessageDataPart>;
