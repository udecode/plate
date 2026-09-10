import { act, render } from '@testing-library/react';
import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai';
import React from 'react';

import { createEditor, ParagraphPlugin, Plate } from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';
import { useAIChat } from './useAIChat';

function controlledTransport() {
  let stream!: ReadableStreamDefaultController<UIMessageChunk>;
  const transport: ChatTransport<UIMessage> = {
    reconnectToStream: async () => null,
    sendMessages: async () =>
      new ReadableStream({
        start: (controller) => {
          stream = controller;
        },
      }),
  };
  return {
    transport,
    send: (part: UIMessageChunk) => stream.enqueue(part),
    close: () => stream.close(),
  };
}

for (const parts of [['Generated'], ['First', ' second']]) {
  it(`accepts ${parts.length} assistant text parts without a preview component`, async () => {
    const source = controlledTransport();
    const editor = createEditor({
      plugins: [ParagraphPlugin, AIChatPlugin],
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
      <Plate editor={editor}>
        <Binding />
      </Plate>
    );
    let pending: Promise<void> | undefined;
    try {
      await act(async () => {
        editor
          .plugin(AIChatPlugin)
          .store.set({ mode: 'chat', toolName: 'generate' });
        pending = editor
          .plugin(AIChatPlugin)
          .store.get('chat')!
          .sendMessage('replace');
      });
      await act(async () => {
        source.send({ type: 'start', messageId: 'assistant' });
        for (const [index, text] of parts.entries()) {
          const id = String(index);
          source.send({ type: 'text-start', id });
          source.send({ type: 'text-delta', id, delta: text });
          source.send({ type: 'text-end', id });
        }
        source.close();
        await pending;
      });
      expect(editor.plugin(AIChatPlugin).store.get('chat')?.status).toBe(
        'ready'
      );
      expect(editor.plugin(AIChatPlugin).store.get('previewValue')).toEqual([
        { type: 'paragraph', children: [{ text: parts.join('') }] },
      ]);
      await act(async () =>
        editor.plugin(AIChatPlugin).update.replaceSelection({ format: 'none' })
      );
      expect(editor.read.text.string([])).toBe(parts.join(''));
      await act(async () => editor.update.history.undo());
      expect(editor.read.text.string([])).toBe('original');
    } finally {
      view.unmount();
      await pending;
    }
  });
}
