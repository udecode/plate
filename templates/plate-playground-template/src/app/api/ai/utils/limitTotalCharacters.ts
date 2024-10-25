import { Message } from 'ai';

export function limitTotalCharacters(
  messages: Message[],
  maxTotalChars: number
) {
  let totalChars = 0;
  const limitedMessages: Message[] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msgChars = messages[i].content.length;

    if (totalChars + msgChars > maxTotalChars) break;

    totalChars += msgChars;
    limitedMessages.unshift(messages[i]);
  }

  return limitedMessages;
}
