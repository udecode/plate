import { describe, expect, it } from 'bun:test';

import {
  createAIChatTextStreamTransport,
  emitChatTextStreamChunk,
  getAIChatTextStreamChannelId,
  subscribeChatTextStream,
  withAIChatTextStream,
} from './chatTextStreamTransport';

describe('chatTextStreamTransport', () => {
  it('isolates listeners per transport instance even when chat ids match', () => {
    const transportA = createAIChatTextStreamTransport({ chatId: 'editor' });
    const transportB = createAIChatTextStreamTransport({ chatId: 'editor' });
    const channelA = getAIChatTextStreamChannelId(transportA);
    const channelB = getAIChatTextStreamChannelId(transportB);
    const receivedChunksA: Parameters<typeof emitChatTextStreamChunk>[1][] = [];
    const receivedChunksB: Parameters<typeof emitChatTextStreamChunk>[1][] = [];

    expect(channelA).toBeTruthy();
    expect(channelB).toBeTruthy();
    expect(channelA).not.toBe(channelB);

    const unsubscribeA = subscribeChatTextStream(channelA!, (chunk) => {
      receivedChunksA.push(chunk);
    });
    const unsubscribeB = subscribeChatTextStream(channelB!, (chunk) => {
      receivedChunksB.push(chunk);
    });

    emitChatTextStreamChunk(channelA!, {
      id: 'text-1',
      type: 'text-start',
    });
    emitChatTextStreamChunk(channelA!, {
      delta: 'hello',
      id: 'text-1',
      type: 'text-delta',
    });
    emitChatTextStreamChunk(channelA!, {
      id: 'text-1',
      type: 'text-end',
    });

    expect(receivedChunksA).toHaveLength(3);
    expect(receivedChunksB).toHaveLength(0);

    unsubscribeA();
    unsubscribeB();
  });

  it('decorates chat helpers only when the transport exposes a text-stream channel', () => {
    const transport = createAIChatTextStreamTransport({ chatId: 'editor' });
    const channelId = getAIChatTextStreamChannelId(transport);
    const chat = withAIChatTextStream({ status: 'streaming' }, transport);
    const plainChat = withAIChatTextStream({ status: 'streaming' }, {});

    expect(chat.__plateTextStreamChannelId).toBe(channelId);
    expect(plainChat.__plateTextStreamChannelId).toBeUndefined();
  });
});
