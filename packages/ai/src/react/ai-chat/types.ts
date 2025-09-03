import { UIMessage } from 'ai';

export type Choice = 'generate' | 'edit' | 'comment';

export type MessageMetadata = {
  choice?: Choice;
};

export type MessageDataPart = {
  choice: Choice;
};

export type ChatMessage = UIMessage<MessageMetadata, MessageDataPart>;
