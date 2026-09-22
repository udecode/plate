import { act, render, waitFor } from '@testing-library/react';
import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai';
import React from 'react';

import { DefaultAuthoredPlugin } from '../../authored';
import { createEditor, ParagraphPlugin, EditorRoot } from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';
import { useAIChat } from './useAIChat';

function controlledTransport() {
  let stream!: ReadableStreamDefaultController<UIMessageChunk>;
  let markReady!: () => void;
  let requestCount = 0;
  const requestWaiters = new Map<number, () => void>();
  const ready = new Promise<void>((resolve) => {
    markReady = resolve;
  });
  const transport: ChatTransport<UIMessage> = {
    reconnectToStream: async () => null,
    sendMessages: async () =>
      new ReadableStream({
        start: (controller) => {
          stream = controller;
          requestCount += 1;
          markReady();
          requestWaiters.get(requestCount)?.();
          requestWaiters.delete(requestCount);
        },
      }),
  };
  return {
    ready,
    transport,
    send: (part: UIMessageChunk) => stream.enqueue(part),
    close: () => stream.close(),
    waitForRequest: (count: number) =>
      requestCount >= count
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            requestWaiters.set(count, resolve);
          }),
  };
}

it('streams edit output into one native suggestion without changing the view', async () => {
  const source = controlledTransport();
  const editor = createEditor({
    plugins: [DefaultAuthoredPlugin, ParagraphPlugin, AIChatPlugin],
    userId: 'alice',
    initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 8 },
    },
  });
  editor.api.authored.setView({ intent: 'edit', projection: 'markup' });

  function Binding() {
    const editableRef = React.useRef<HTMLDivElement>(null);
    useAIChat({ editableRef, transport: source.transport });
    return <div ref={editableRef} />;
  }

  const view = render(
    <EditorRoot editor={editor}>
      <Binding />
    </EditorRoot>
  );

  try {
    await act(async () => {
      editor.plugin(AIChatPlugin).api.submit('rewrite', {
        mode: 'chat',
        toolName: 'edit',
      });
    });
    await source.ready;
    await act(async () => {
      source.send({ type: 'start', messageId: 'assistant' });
      source.send({ type: 'text-start', id: 'text' });
      source.send({ type: 'text-delta', id: 'text', delta: 're' });
      source.send({ type: 'text-delta', id: 'text', delta: 'written' });
      source.send({ type: 'text-end', id: 'text' });
      source.close();
    });
    await waitFor(() =>
      expect(editor.plugin(AIChatPlugin).store.get('chat')?.status).not.toBe(
        'streaming'
      )
    );
    const chat = editor.plugin(AIChatPlugin).store.get('chat');
    if (chat?.error) throw chat.error;
    expect(chat?.status).toBe('ready');

    expect(editor.plugin(AIChatPlugin).store.get('previewValue')).toEqual([]);
    expect(
      editor.read.authored.changes({ status: 'pending' }).items
    ).toHaveLength(1);
    expect(editor.read.value().children).toEqual([
      { type: 'paragraph', children: [{ text: 'original' }] },
    ]);
    expect(editor.read.text.string([])).toBe('rewritten');
    expect(editor.read.authored.view()).toEqual({
      intent: 'edit',
      projection: 'markup',
    });

    await act(async () => editor.plugin(AIChatPlugin).api.accept());
    expect(
      editor.read.authored.changes({ status: 'pending' }).items
    ).toHaveLength(0);
    expect(editor.read.value().children).toEqual([
      { type: 'paragraph', children: [{ text: 'rewritten' }] },
    ]);
    expect(editor.read.authored.view()).toEqual({
      intent: 'edit',
      projection: 'markup',
    });
  } finally {
    view.unmount();
  }
});

it('keeps all assistant parts in one cross-block edit suggestion', async () => {
  const source = controlledTransport();
  const editor = createEditor({
    plugins: [DefaultAuthoredPlugin, ParagraphPlugin, AIChatPlugin],
    userId: 'alice',
    initialValue: [
      { type: 'paragraph', children: [{ text: 'first' }] },
      { type: 'paragraph', children: [{ text: 'second block' }] },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 6 },
    },
  });
  editor.api.authored.setView({ intent: 'edit', projection: 'markup' });

  function Binding() {
    const editableRef = React.useRef<HTMLDivElement>(null);
    useAIChat({ editableRef, transport: source.transport });
    return <div ref={editableRef} />;
  }

  const view = render(
    <EditorRoot editor={editor}>
      <Binding />
    </EditorRoot>
  );

  try {
    await act(async () => {
      editor.plugin(AIChatPlugin).api.submit('rewrite', {
        mode: 'chat',
        toolName: 'edit',
      });
    });
    await source.ready;
    await act(async () => {
      source.send({ type: 'start', messageId: 'assistant' });
      source.send({ type: 'text-start', id: 'first' });
      source.send({ type: 'text-delta', id: 'first', delta: 'Generated ' });
      source.send({ type: 'text-end', id: 'first' });
      source.send({ type: 'text-start', id: 'second' });
      source.send({ type: 'text-delta', id: 'second', delta: 'preview text.' });
      source.send({ type: 'text-end', id: 'second' });
      source.close();
    });
    await waitFor(() =>
      expect(editor.plugin(AIChatPlugin).store.get('chat')?.status).not.toBe(
        'streaming'
      )
    );
    const chat = editor.plugin(AIChatPlugin).store.get('chat');
    if (chat?.error) throw chat.error;
    expect(chat?.status).toBe('ready');

    expect(editor.read.text.string([])).toBe('Generated preview text. block');
    expect(
      editor.read.authored.changes({ status: 'pending' }).items
    ).toHaveLength(1);
  } finally {
    view.unmount();
  }
});

it('retries an edit by rejecting the previous request-owned suggestion', async () => {
  const source = controlledTransport();
  const editor = createEditor({
    plugins: [DefaultAuthoredPlugin, ParagraphPlugin, AIChatPlugin],
    userId: 'alice',
    initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 8 },
    },
  });
  editor.api.authored.setView({ intent: 'edit', projection: 'markup' });

  function Binding() {
    const editableRef = React.useRef<HTMLDivElement>(null);
    useAIChat({ editableRef, transport: source.transport });
    return <div ref={editableRef} />;
  }

  const view = render(
    <EditorRoot editor={editor}>
      <Binding />
    </EditorRoot>
  );

  const respond = async (text: string) => {
    await act(async () => {
      source.send({ type: 'start', messageId: crypto.randomUUID() });
      source.send({ type: 'text-start', id: 'text' });
      source.send({ type: 'text-delta', id: 'text', delta: text });
      source.send({ type: 'text-end', id: 'text' });
      source.close();
    });
    await waitFor(() =>
      expect(editor.plugin(AIChatPlugin).store.get('chat')?.status).toBe(
        'ready'
      )
    );
  };

  try {
    await act(async () => {
      editor.plugin(AIChatPlugin).api.submit('rewrite', {
        mode: 'chat',
        toolName: 'edit',
      });
    });
    await source.waitForRequest(1);
    await respond('first');
    const firstChange = editor.plugin(AIChatPlugin).store.get('_changeId');

    await act(async () => editor.plugin(AIChatPlugin).api.reload());
    await source.waitForRequest(2);
    await respond('second');

    const pending = editor.read.authored.changes({ status: 'pending' }).items;
    expect(pending).toHaveLength(1);
    expect(pending[0].id).not.toBe(firstChange);
    expect(editor.read.text.string([])).toBe('second');
    expect(editor.read.authored.view()).toEqual({
      intent: 'edit',
      projection: 'markup',
    });
  } finally {
    view.unmount();
  }
});

for (const parts of [['Generated'], ['First', ' second']]) {
  it(`accepts ${parts.length} assistant text parts without a preview component`, async () => {
    const source = controlledTransport();
    const editor = createEditor({
      plugins: [ParagraphPlugin, AIChatPlugin],
      userId: 'alice',
      initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 8 },
      },
    });
    function Binding() {
      const editableRef = React.useRef<HTMLDivElement>(null);
      useAIChat({ editableRef, transport: source.transport });
      return <div ref={editableRef} />;
    }
    const view = render(
      <EditorRoot editor={editor}>
        <Binding />
      </EditorRoot>
    );
    try {
      await act(async () => {
        editor.plugin(AIChatPlugin).api.submit('replace', {
          mode: 'chat',
          toolName: 'generate',
        });
      });
      await source.ready;
      await act(async () => {
        source.send({ type: 'start', messageId: 'assistant' });
        for (const [index, text] of parts.entries()) {
          const id = String(index);
          source.send({ type: 'text-start', id });
          source.send({ type: 'text-delta', id, delta: text });
          source.send({ type: 'text-end', id });
        }
        source.close();
      });
      await waitFor(() =>
        expect(editor.plugin(AIChatPlugin).store.get('chat')?.status).toBe(
          'ready'
        )
      );
      expect(editor.plugin(AIChatPlugin).store.get('previewValue')).toEqual([
        { type: 'paragraph', children: [{ text: parts.join('') }] },
      ]);
      await act(async () =>
        editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' })
      );
      expect(editor.read.text.string([])).toBe(parts.join(''));
      await act(async () => editor.api.history.undo());
      expect(editor.read.text.string([])).toBe('original');
    } finally {
      view.unmount();
    }
  });
}
