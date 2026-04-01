import {
  DefaultChatTransport,
  type HttpChatTransportInitOptions,
  type UIMessage,
  type UIMessageChunk,
} from 'ai';

export type AIChatTextStreamState = {
  __plateTextStreamChannelId?: string;
};

type ChatTextStreamChunk = Extract<
  UIMessageChunk,
  { type: 'text-delta' | 'text-end' | 'text-start' }
>;

type ChatTextStreamListener = (chunk: ChatTextStreamChunk) => void;

const chatTextStreamListeners = new Map<string, Set<ChatTextStreamListener>>();
let nextChatTextStreamChannelId = 0;

const createChatTextStreamChannelId = (chatId: string) =>
  `${chatId}:${++nextChatTextStreamChannelId}`;

export const emitChatTextStreamChunk = (
  channelId: string,
  chunk: ChatTextStreamChunk
) => {
  chatTextStreamListeners.get(channelId)?.forEach((listener) => {
    listener(chunk);
  });
};

export const subscribeChatTextStream = (
  channelId: string,
  listener: ChatTextStreamListener
) => {
  const listeners = chatTextStreamListeners.get(channelId) ?? new Set();

  listeners.add(listener);
  chatTextStreamListeners.set(channelId, listeners);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      chatTextStreamListeners.delete(channelId);
    }
  };
};

export class AIChatTextStreamTransport<
  UI_MESSAGE extends UIMessage,
> extends DefaultChatTransport<UI_MESSAGE> {
  readonly channelId: string;

  constructor(
    chatId: string,
    options: HttpChatTransportInitOptions<UI_MESSAGE> = {}
  ) {
    super(options);
    this.channelId = createChatTextStreamChannelId(chatId);
  }

  protected processResponseStream(
    stream: ReadableStream<Uint8Array<ArrayBufferLike>>
  ) {
    const uiMessageStream = super.processResponseStream(stream);
    const [sdkStream, observerStream] = uiMessageStream.tee();

    void this.forwardTextStreamChunks(observerStream);

    return sdkStream;
  }

  private async forwardTextStreamChunks(
    stream: ReadableStream<UIMessageChunk>
  ) {
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) return;

        if (
          value.type === 'text-start' ||
          value.type === 'text-delta' ||
          value.type === 'text-end'
        ) {
          emitChatTextStreamChunk(this.channelId, value);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const createAIChatTextStreamTransport = <UI_MESSAGE extends UIMessage>({
  chatId,
  ...options
}: HttpChatTransportInitOptions<UI_MESSAGE> & {
  chatId: string;
}) => new AIChatTextStreamTransport<UI_MESSAGE>(chatId, options);

export const getAIChatTextStreamChannelId = (transport: unknown) =>
  transport instanceof AIChatTextStreamTransport
    ? transport.channelId
    : undefined;

export const withAIChatTextStream = <CHAT extends object>(
  chat: CHAT,
  transport: unknown
): CHAT & AIChatTextStreamState => {
  const channelId = getAIChatTextStreamChannelId(transport);

  if (!channelId) return { ...chat };

  return {
    ...chat,
    __plateTextStreamChannelId: channelId,
  };
};
