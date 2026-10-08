import { act, render, waitFor } from '@testing-library/react';
import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai';
import React from 'react';

import { AuthoredPlugin } from '../../authored';
import { NodeApi } from '../../core';
import { createEditor, ParagraphPlugin, EditorRoot } from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';
import { useAIChat } from './useAIChat';

function controlledTransport() {
  let stream!: ReadableStreamDefaultController<UIMessageChunk>;
  let markReady!: () => void;
  let requestCount = 0;
  const requestWaiters = new Map<number, () => void>();
  const signals: Array<AbortSignal | undefined> = [];
  const ready = new Promise<void>((resolve) => {
    markReady = resolve;
  });
  const transport: ChatTransport<UIMessage> = {
    reconnectToStream: async () => null,
    sendMessages: async ({ abortSignal }) => {
      signals.push(abortSignal);

      return new ReadableStream({
        start: (controller) => {
          stream = controller;
          requestCount += 1;
          markReady();
          requestWaiters.get(requestCount)?.();
          requestWaiters.delete(requestCount);
        },
      });
    },
  };
  return {
    ready,
    signals,
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
    plugins: [AuthoredPlugin, ParagraphPlugin, AIChatPlugin],
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
    plugins: [AuthoredPlugin, ParagraphPlugin, AIChatPlugin],
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
    plugins: [AuthoredPlugin, ParagraphPlugin, AIChatPlugin],
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
      await act(() => {
        editor.api.history.undo();
      });
      expect(editor.read.text.string([])).toBe('original');
    } finally {
      view.unmount();
    }
  });
}

function mountChat(
  source: ReturnType<typeof controlledTransport>,
  { edit = false }: { edit?: boolean } = {}
) {
  const editor = createEditor({
    plugins: [AuthoredPlugin, ParagraphPlugin, AIChatPlugin],
    userId: 'alice',
    initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: edit ? 0 : 8 },
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
  const drafts: string[] = [];
  const unsubscribe = editor
    .plugin(AIChatPlugin)
    .store.subscribe((state, previous) => {
      if (
        state.previewValue === previous.previewValue ||
        state.previewValue.length === 0
      ) {
        return;
      }
      drafts.push(
        state.previewValue.map((node) => NodeApi.string(node)).join('\n')
      );
    });

  return {
    drafts,
    editor,
    unmount: () => {
      unsubscribe();
      view.unmount();
    },
  };
}

const settle = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 50);
      })
  );

it('publishes the first chunk at once, the latest draft every 32 ms and one final draft', async () => {
  const source = controlledTransport();
  const { drafts, editor, unmount } = mountChat(source);
  const ai = editor.plugin(AIChatPlugin);

  try {
    await act(async () => {
      ai.api.submit('continue', { mode: 'insert' });
    });
    await source.waitForRequest(1);
    await act(async () => {
      source.send({ type: 'start', messageId: 'assistant' });
      source.send({ type: 'text-start', id: 'text' });
      source.send({ type: 'text-delta', id: 'text', delta: 'A' });
    });
    await waitFor(() => expect(drafts).toEqual(['A']));
    await act(async () => {
      source.send({ type: 'text-delta', id: 'text', delta: 'B' });
      source.send({ type: 'text-delta', id: 'text', delta: 'C' });
    });
    expect(drafts).toEqual(['A']);
    await waitFor(() => expect(drafts).toEqual(['A', 'ABC']));

    // A partial draft is not acceptable.
    await act(async () => ai.api.accept());
    expect(editor.read.text.string([])).toBe('original');

    await act(async () => {
      source.send({ type: 'text-end', id: 'text' });
      source.send({ type: 'finish' });
      source.close();
    });
    await waitFor(() => expect(ai.store.get('chat')?.status).toBe('ready'));
    await settle();
    expect(drafts).toEqual(['A', 'ABC', 'ABC']);
    expect(ai.store.get('streaming')).toBe(false);

    const undos = editor.read.history().undos.length;
    await act(async () => ai.api.accept());
    expect(editor.read.text.string([])).toBe('originalABC');
    expect(editor.read.history().undos).toHaveLength(undos + 1);
    await act(() => {
      editor.api.history.undo();
    });
    expect(editor.read.text.string([])).toBe('original');
  } finally {
    unmount();
  }
});

for (const action of ['hide', 'reset', 'reload'] as const) {
  it(`${action} aborts a streaming request without publishing a final draft`, async () => {
    const source = controlledTransport();
    const { drafts, editor, unmount } = mountChat(source);
    const ai = editor.plugin(AIChatPlugin);

    try {
      await act(async () => {
        ai.api.submit('continue', { mode: 'insert' });
      });
      await source.waitForRequest(1);
      await act(async () => {
        source.send({ type: 'start', messageId: 'assistant' });
        source.send({ type: 'text-start', id: 'text' });
        source.send({ type: 'text-delta', id: 'text', delta: 'A' });
      });
      await waitFor(() => expect(drafts).toEqual(['A']));
      await act(async () => {
        source.send({ type: 'text-delta', id: 'text', delta: 'B' });
      });

      await act(async () => {
        if (action === 'hide') ai.api.hide({ focus: false });
        else if (action === 'reset') ai.api.reset();
        else ai.api.reload();
      });
      await settle();

      expect(source.signals[0]?.aborted).toBe(true);
      expect(drafts).toEqual(['A']);
      expect(ai.store.get('previewValue')).toEqual([]);
      expect(ai.store.get('streaming')).toBe(false);
      expect(editor.read.text.string([])).toBe('original');
    } finally {
      unmount();
    }
  });
}

for (const action of ['hide', 'reload'] as const) {
  it(`${action} during an edit stream leaves no suggestion or history entry`, async () => {
    const source = controlledTransport();
    const { editor, unmount } = mountChat(source, { edit: true });
    const ai = editor.plugin(AIChatPlugin);
    const undos = editor.read.history().undos.length;

    try {
      await act(async () => {
        ai.api.submit('rewrite', { mode: 'chat', toolName: 'edit' });
      });
      await source.waitForRequest(1);
      await act(async () => {
        source.send({ type: 'start', messageId: 'assistant' });
        source.send({ type: 'text-start', id: 'text' });
        source.send({ type: 'text-delta', id: 'text', delta: 'rewritten' });
      });
      await waitFor(() => expect(ai.store.get('streaming')).toBe(true));

      await act(async () => {
        if (action === 'hide') ai.api.hide({ focus: false });
        else ai.api.reload();
      });
      await settle();

      expect(source.signals[0]?.aborted).toBe(true);
      expect(
        editor.read.authored.changes({ status: 'pending' }).items
      ).toHaveLength(0);
      expect(editor.read.history().undos).toHaveLength(undos);
      expect(editor.read.value().children).toEqual([
        { type: 'paragraph', children: [{ text: 'original' }] },
      ]);
    } finally {
      unmount();
    }
  });
}

for (const end of ['finish', 'stop'] as const) {
  it(`${end} ends an edit stream whose response Markdown cannot represent`, async () => {
    const source = controlledTransport();
    const { editor, unmount } = mountChat(source, { edit: true });
    const ai = editor.plugin(AIChatPlugin);

    try {
      await act(async () => {
        ai.api.submit('rewrite', { mode: 'chat', toolName: 'edit' });
      });
      await source.waitForRequest(1);
      await act(async () => {
        source.send({ type: 'start', messageId: 'assistant' });
        source.send({ type: 'text-start', id: 'text' });
        source.send({
          type: 'text-delta',
          id: 'text',
          delta: '![image](https://example.com/image.png)',
        });
      });
      await waitFor(() => expect(ai.store.get('streaming')).toBe(true));

      await act(async () => {
        if (end === 'stop') {
          ai.api.stop();
          return;
        }
        source.send({ type: 'text-end', id: 'text' });
        source.send({ type: 'finish' });
        source.close();
      });
      await settle();

      if (end === 'stop') expect(source.signals[0]?.aborted).toBe(true);
      else expect(ai.store.get('chat')?.status).toBe('ready');
      expect(ai.store.get('streaming')).toBe(false);
      expect(ai.store.get('chat')?.error).toBeUndefined();
      expect(
        editor.read.authored.changes({ status: 'pending' }).items
      ).toHaveLength(0);
      await act(async () => ai.api.accept());
      expect(editor.read.value().children).toEqual([
        { type: 'paragraph', children: [{ text: 'original' }] },
      ]);
    } finally {
      unmount();
    }
  });
}
