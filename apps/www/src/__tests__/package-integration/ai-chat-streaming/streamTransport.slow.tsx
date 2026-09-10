import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';

import type { UIMessageChunk } from 'ai';
import { ElementApi, NodeApi, type EditorDocumentValue } from 'platejs';
import type { AIChatRequestContext } from 'platejs/ai';
import { AIChatPlugin, type AIChatAdapter } from 'platejs/ai/react';
import { createEditor } from 'platejs/react';

import {
  AIChatTransportPlugin,
  createChatTransport,
} from '@/registry/components/editor/use-chat';

import { defaultPlugins } from './__tests__/createTestEditor';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const fetchMocks: Array<ReturnType<typeof spyOn<typeof globalThis, 'fetch'>>> =
  [];
afterEach(() => {
  for (const fetchMock of fetchMocks.splice(0)) fetchMock.mockRestore();
});

const createWire = () => {
  let controller: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(value) {
      controller = value;
    },
  });
  const encoder = new TextEncoder();
  return {
    response: new Response(body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'x-vercel-ai-ui-message-stream': 'v1',
      },
    }),
    push(...chunks: UIMessageChunk[]) {
      controller.enqueue(
        encoder.encode(
          chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('')
        )
      );
    },
    close() {
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
    error(error: Error) {
      controller.error(error);
    },
  };
};

const createEnvironment = (
  value: EditorDocumentValue = { children: [paragraph('')] }
) => {
  const [, path] = [
    ...NodeApi.texts({ type: 'document', children: value.children }),
  ][0];
  const editor = createEditor({
    plugins: [
      ...defaultPlugins.filter((plugin) => plugin.name !== AIChatPlugin.name),
      AIChatTransportPlugin,
    ],
    initialValue: value,
    selection: {
      kind: 'text',
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    },
  });
  const ai = editor.plugin(AIChatPlugin);
  const transport = createChatTransport({ editor, api: '/api/ai/command' });
  const fetchMock = spyOn(globalThis, 'fetch').mockReturnValue(
    Promise.resolve(new Response('Unexpected network request', { status: 500 }))
  );
  fetchMocks.push(fetchMock);
  const before = editor.read.value();
  const selection = editor.read.selection();
  const assertCanonical = () => {
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.selection()).toEqual(selection);
    expect(editor.read.history.undos()).toHaveLength(0);
  };
  const options = (id?: number) => ({
    trigger: 'submit-message' as const,
    chatId: 'editor',
    messageId: undefined,
    messages: [
      {
        id: 'user',
        role: 'user' as const,
        parts: [{ type: 'text' as const, text: 'Generate text' }],
      },
    ],
    abortSignal: undefined,
    body: id === undefined ? {} : { requestId: id },
  });
  const request = async (id: number) => {
    const wire = createWire();
    fetchMock.mockReturnValueOnce(Promise.resolve(wire.response));
    const stream = await transport.transport.sendMessages(options(id));
    const reader = stream.getReader();
    return { ...wire, reader };
  };
  return {
    editor,
    ai,
    transport,
    fetchMock,
    before,
    assertCanonical,
    options,
    request,
  };
};

const submit = (
  ai: ReturnType<typeof createEnvironment>['ai'],
  toolName: 'comment' | 'edit'
) => {
  let captured: Parameters<AIChatAdapter['sendMessage']>[1];
  ai.store.set({
    chat: {
      messages: [],
      status: 'ready',
      clear() {},
      stop() {},
      regenerate: async () => {},
      sendMessage: async (_text, options) => {
        captured = options;
      },
    },
  });
  const id = ai.api.submit('Review the document', { mode: 'chat', toolName });
  if (id === undefined || !captured?.body) {
    throw new Error('Expected a request context.');
  }
  return {
    id,
    context: Reflect.get(captured.body, 'ctx') as AIChatRequestContext,
  };
};

const drain = async (reader: ReadableStreamDefaultReader<UIMessageChunk>) => {
  const chunks: UIMessageChunk[] = [];
  while (true) {
    const result = await reader.read();
    if (result.done) return chunks;
    chunks.push(result.value);
  }
};

const readFrame = async (
  wire: Awaited<ReturnType<ReturnType<typeof createEnvironment>['request']>>,
  chunk: UIMessageChunk
) => {
  wire.push(chunk);
  const result = await wire.reader.read();
  expect(result.value).toEqual(chunk);
};

const beginText = async (
  wire: Awaited<ReturnType<ReturnType<typeof createEnvironment>['request']>>
) => {
  await readFrame(wire, { type: 'text-start', id: 'text' });
  await readFrame(wire, { type: 'text-delta', id: 'text', delta: 'he' });
};

const stageReference = async (tool: 'table' | 'comment') => {
  const value =
    tool === 'comment'
      ? { children: [paragraph('original'), paragraph('unrelated')] }
      : {
          children: [
            {
              type: 'table',
              children: [
                {
                  type: 'tableRow',
                  children: ['original', 'unrelated'].map((text) => ({
                    type: 'tableCell',
                    children: [paragraph(text)],
                  })),
                },
              ],
            },
          ],
        };
  const environment = createEnvironment(value);
  const { id, context } = submit(
    environment.ai,
    tool === 'comment' ? 'comment' : 'edit'
  );
  const wire = await environment.request(id);
  await readFrame(
    wire,
    tool === 'comment'
      ? {
          type: 'data-comment',
          id: 'comment-one',
          data: {
            status: 'streaming',
            comment: {
              blockRef: context.refs.blocks[0].ref,
              content: 'original',
              comment: 'Clarify this text.',
            },
          },
        }
      : {
          type: 'data-table',
          data: {
            status: 'streaming',
            cellUpdate: {
              ref: context.refs.tableCells[0].ref,
              content: '**updated**',
            },
          },
        }
  );
  environment.assertCanonical();
  return { ...environment, id, wire };
};

describe('request-bound AI transport', () => {
  it('receives he then hello and finishes without canonical edits until Accept', async () => {
    const { ai, editor, request, assertCanonical } = createEnvironment();
    const id = ai.api.start();
    const wire = await request(id);
    await beginText(wire);
    expect(ai.store.get('operation')?.source).toBe('he');
    assertCanonical();
    await readFrame(wire, { type: 'text-delta', id: 'text', delta: 'llo' });
    expect(ai.store.get('operation')?.source).toBe('hello');
    expect(ai.store.get('operation')?.status).toBe('streaming');
    await readFrame(wire, { type: 'text-end', id: 'text' });
    wire.close();
    await drain(wire.reader);
    expect(ai.store.get('operation')).toMatchObject({
      source: 'hello',
      status: 'ready',
      value: [paragraph('hello')],
    });
    assertCanonical();
    expect(ai.api.accept()).toBe(true);
    expect(editor.read.children()).toEqual([paragraph('hello')]);
    expect(editor.read.history.undos()).toHaveLength(1);
  });

  it('keeps the final delta when content and finish arrive together', async () => {
    const { ai, request, assertCanonical } = createEnvironment();
    const wire = await request(ai.api.start());
    await beginText(wire);
    wire.push(
      { type: 'text-delta', id: 'text', delta: 'llo' },
      { type: 'text-end', id: 'text' },
      { type: 'finish' }
    );
    wire.close();
    await drain(wire.reader);
    expect(ai.store.get('operation')).toMatchObject({
      source: 'hello',
      status: 'ready',
      value: [paragraph('hello')],
    });
    assertCanonical();
  });

  it('combines multiple text parts in declaration order and ignores empty deltas', async () => {
    const { ai, request, assertCanonical } = createEnvironment();
    const wire = await request(ai.api.start());
    await beginText(wire);
    await readFrame(wire, { type: 'text-start', id: 'second' });
    await readFrame(wire, {
      type: 'text-delta',
      id: 'second',
      delta: ' world',
    });
    expect(ai.store.get('operation')?.source).toBe('he world');
    await readFrame(wire, { type: 'text-delta', id: 'text', delta: 'llo' });
    expect(ai.store.get('operation')?.source).toBe('hello world');
    const unchanged = ai.store.get('operation');
    await readFrame(wire, { type: 'text-delta', id: 'text', delta: '' });
    expect(ai.store.get('operation')).toBe(unchanged);
    wire.close();
    await drain(wire.reader);
    expect(ai.store.get('operation')).toMatchObject({
      source: 'hello world',
      status: 'ready',
    });
    assertCanonical();
  });

  for (const action of ['stop', 'retry', 'start'] as const) {
    it(`ignores obsolete text, tool, reference, and error frames after ${action}`, async () => {
      const { ai, request, assertCanonical } = createEnvironment();
      const first = await request(ai.api.start());
      await beginText(first);
      let nextId: number | undefined;
      if (action === 'stop') ai.api.stop();
      else nextId = action === 'retry' ? ai.api.retry() : ai.api.start();
      const current = ai.store.get('operation');
      first.push(
        { type: 'text-delta', id: 'text', delta: ' stale' },
        { type: 'data-toolName', data: 'edit' },
        {
          type: 'data-table',
          data: {
            status: 'streaming',
            cellUpdate: { ref: 'stale', content: 'wrong' },
          },
        },
        {
          type: 'data-comment',
          id: 'stale',
          data: {
            status: 'streaming',
            comment: { blockRef: 'stale', content: 'wrong', comment: 'wrong' },
          },
        },
        { type: 'error', errorText: 'obsolete failure' }
      );
      first.close();
      expect(await drain(first.reader)).toEqual([]);
      expect(ai.store.get('operation')).toBe(current);
      expect(ai.store.get('toolName')).toBe('generate');
      if (nextId !== undefined) {
        const next = await request(nextId);
        await beginText(next);
        next.close();
        await drain(next.reader);
        expect(ai.store.get('operation')).toMatchObject({
          id: nextId,
          source: 'he',
          status: 'ready',
        });
      } else {
        expect(current).toMatchObject({
          source: 'he',
          status: 'ready',
          partial: true,
        });
      }
      assertCanonical();
    });
  }

  for (const status of [401, 404, 500]) {
    it(`keeps HTTP ${status} as an error with demo disabled by default`, async () => {
      const { ai, editor, transport, options, fetchMock, assertCanonical } =
        createEnvironment();
      expect(
        editor.plugin(AIChatTransportPlugin).store.get('chatOptions').demo
      ).toBe(false);
      fetchMock.mockReturnValueOnce(
        Promise.resolve(new Response(`HTTP ${status}`, { status }))
      );
      const id = ai.api.start();
      await expect(
        transport.transport.sendMessages(options(id))
      ).rejects.toThrow(`HTTP ${status}`);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(ai.store.get('operation')).toMatchObject({
        id,
        status: 'error',
        source: '',
        error: `HTTP ${status}`,
      });
      assertCanonical();
    });
  }

  it('requires an explicit request id before sending', async () => {
    const { transport, options, fetchMock, assertCanonical } =
      createEnvironment();
    await expect(transport.transport.sendMessages(options())).rejects.toThrow(
      'operation identity'
    );
    expect(fetchMock).not.toHaveBeenCalled();
    assertCanonical();
  });

  it('marks the matching request errored on an error frame and retains its partial source', async () => {
    const { ai, request, assertCanonical } = createEnvironment();
    const id = ai.api.start();
    const wire = await request(id);
    await beginText(wire);
    await readFrame(wire, { type: 'error', errorText: 'generation failed' });
    wire.close();
    await drain(wire.reader);
    expect(ai.store.get('operation')).toMatchObject({
      id,
      source: 'he',
      status: 'error',
      error: 'generation failed',
    });
    expect(ai.api.accept()).toBe(false);
    assertCanonical();
  });

  for (const obsolete of [false, true]) {
    it(`rejects a broken response stream without damaging ${obsolete ? 'a newer request' : 'canonical content'}`, async () => {
      const { ai, request, assertCanonical } = createEnvironment();
      const id = ai.api.start();
      const wire = await request(id);
      await beginText(wire);
      const currentId = obsolete ? ai.api.start() : id;
      const current = ai.store.get('operation');
      wire.error(new Error('connection lost'));
      await expect(drain(wire.reader)).rejects.toThrow('connection lost');
      if (obsolete) expect(ai.store.get('operation')).toBe(current);
      else {
        expect(ai.store.get('operation')).toMatchObject({
          id: currentId,
          source: 'he',
          status: 'error',
          error: 'connection lost',
        });
      }
      assertCanonical();
    });
  }

  it('runs fake output only with explicit demo configuration and stops it without committing', async () => {
    const { ai, editor, transport, options, fetchMock, assertCanonical } =
      createEnvironment();
    const plugin = editor.plugin(AIChatTransportPlugin);
    plugin.store.set({
      chatOptions: { ...plugin.store.get('chatOptions'), demo: true },
    });
    const id = ai.api.start();
    const stream = await transport.transport.sendMessages(options(id));
    const reader = stream.getReader();
    while (true) {
      const result = await reader.read();
      if (result.done) throw new Error('Expected a generated text frame.');
      if (result.value.type === 'text-delta') break;
    }
    expect(ai.store.get('operation')?.source.length).toBeGreaterThan(0);
    ai.api.stop();
    const stopped = ai.store.get('operation');
    transport.abortFakeStream();
    await expect(drain(reader)).rejects.toThrow('Stream aborted');
    expect(ai.store.get('operation')).toBe(stopped);
    expect(fetchMock).not.toHaveBeenCalled();
    assertCanonical();
  });

  for (const tool of ['comment', 'table'] as const) {
    it(`consumes current request ${tool} frames into a detached preview before Accept`, async () => {
      const value =
        tool === 'comment'
          ? { children: [paragraph('original')] }
          : {
              children: [
                {
                  type: 'table',
                  children: [
                    {
                      type: 'tableRow',
                      children: [
                        {
                          type: 'tableCell',
                          children: [paragraph('original')],
                        },
                      ],
                    },
                  ],
                },
              ],
            };
      const { ai, editor, request, assertCanonical } = createEnvironment(value);
      const onCommentsAccepted = mock();
      ai.store.set({ onCommentsAccepted });
      const { id, context } = submit(
        ai,
        tool === 'comment' ? 'comment' : 'edit'
      );
      const wire = await request(id);
      await readFrame(wire, {
        type: 'data-toolName',
        data: tool === 'comment' ? 'comment' : 'edit',
      });
      expect(ai.store.get('toolName')).toBe(
        tool === 'comment' ? 'comment' : 'edit'
      );
      if (tool === 'comment') {
        const { ref } = context.refs.blocks[0];
        const frame = {
          type: 'data-comment' as const,
          id: 'comment-one',
          data: {
            status: 'streaming',
            comment: {
              blockRef: ref,
              content: 'original',
              comment: 'Clarify this text.',
            },
          },
        };
        await readFrame(wire, frame);
        await readFrame(wire, frame);
        expect(ai.store.get('operation')?.comments).toEqual([
          {
            id: 'comment-one',
            content: 'original',
            comment: 'Clarify this text.',
          },
        ]);
      } else {
        const { ref } = context.refs.tableCells[0];
        await readFrame(wire, {
          type: 'data-table',
          data: {
            status: 'streaming',
            cellUpdate: { ref, content: '**updated**' },
          },
        });
        const preview = ai.store.get('operation')?.preview ?? [];
        expect(NodeApi.string({ type: 'document', children: preview })).toBe(
          'updated'
        );
      }
      assertCanonical();
      wire.close();
      await drain(wire.reader);
      expect(ai.store.get('operation')?.status).toBe('ready');
      assertCanonical();
      const beforeAccept = editor.read.value();
      const selectionBeforeAccept = editor.read.selection();
      expect(onCommentsAccepted).not.toHaveBeenCalled();
      expect(ai.api.accept()).toBe(true);
      expect(onCommentsAccepted).toHaveBeenCalledTimes(1);
      expect(editor.read.history.undos()).toHaveLength(1);
      const accepted = editor.read.value();
      const acceptedSelection = editor.read.selection();
      editor.update.history.undo();
      expect(editor.read.value()).toEqual(beforeAccept);
      expect(editor.read.selection()).toEqual(selectionBeforeAccept);
      editor.update.history.redo();
      expect(editor.read.value()).toEqual(accepted);
      expect(editor.read.selection()).toEqual(acceptedSelection);
      expect(onCommentsAccepted).toHaveBeenCalledTimes(1);
      if (tool === 'table') {
        const cell = editor.read.nodes.get([0, 0, 0])?.[0];
        if (!cell || !ElementApi.isElement(cell)) {
          throw new Error('Expected a table cell.');
        }
        expect(cell.children).toEqual([
          { type: 'paragraph', children: [{ text: 'updated', bold: true }] },
        ]);
      }
    });
  }

  for (const tool of ['table', 'comment'] as const) {
    for (const mutation of ['edit', 'delete'] as const) {
      it(`rejects a staged ${tool} target after ${mutation} without overwriting the user`, async () => {
        const { ai, editor, wire } = await stageReference(tool);
        const path = tool === 'table' ? [0, 0, 0] : [0];
        if (mutation === 'delete') editor.update.nodes.remove({ at: path });
        else {
          editor.update.text.insert('!', {
            at: {
              path: [...path, ...(tool === 'table' ? [0, 0] : [0])],
              offset: 8,
            },
          });
        }
        const changed = editor.read.value();
        const history = editor.read.history.undos();
        wire.close();
        await drain(wire.reader);
        expect(ai.store.get('operation')?.status).toBe('error');
        expect(ai.api.accept()).toBe(false);
        expect(editor.read.value()).toEqual(changed);
        expect(editor.read.history.undos()).toEqual(history);
      });
    }

    it(`discards staged ${tool} output without publishing accepted comments or formal changes`, async () => {
      const { ai, wire, assertCanonical } = await stageReference(tool);
      const onCommentsAccepted = mock();
      ai.store.set({ onCommentsAccepted });
      ai.api.discard();
      wire.close();
      await drain(wire.reader);
      expect(ai.store.get('operation')).toBeNull();
      expect(onCommentsAccepted).not.toHaveBeenCalled();
      assertCanonical();
    });
  }

  it('preserves unrelated table-cell edits through Accept, Undo, and Redo', async () => {
    const { ai, editor, wire } = await stageReference('table');
    editor.update({ history: 'new-batch' }, (tx) =>
      tx.text.insert('!', { at: { path: [0, 0, 1, 0, 0], offset: 9 } })
    );
    const beforeAccept = editor.read.value();
    const selectionBeforeAccept = editor.read.selection();
    const historyBeforeAccept = editor.read.history.undos().length;
    wire.close();
    await drain(wire.reader);
    expect(ai.store.get('operation')?.status).toBe('ready');
    expect(ai.api.accept()).toBe(true);
    expect(editor.read.text.string([0, 0, 0])).toBe('updated');
    expect(editor.read.text.string([0, 0, 1])).toBe('unrelated!');
    expect(editor.read.history.undos()).toHaveLength(historyBeforeAccept + 1);
    const accepted = editor.read.value();
    const acceptedSelection = editor.read.selection();
    editor.update.history.undo();
    expect(editor.read.value()).toEqual(beforeAccept);
    expect(editor.read.selection()).toEqual(selectionBeforeAccept);
    editor.update.history.redo();
    expect(editor.read.value()).toEqual(accepted);
    expect(editor.read.selection()).toEqual(acceptedSelection);
  });

  it('returns the last assistant message from editor chat state', () => {
    const { ai } = createEnvironment();
    const messages = [
      {
        id: 'user',
        role: 'user' as const,
        parts: [{ text: 'a', type: 'text' as const }],
      },
      {
        id: 'assistant',
        role: 'assistant' as const,
        parts: [{ text: 'b', type: 'text' as const }],
      },
    ];
    ai.store.set({
      chat: {
        messages,
        status: 'ready',
        clear() {},
        stop() {},
        regenerate: async () => {},
        sendMessage: async () => {},
      },
    });
    expect(ai.store.get('lastAssistantMessage')).toEqual(messages[1]);
  });
});
