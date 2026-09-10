import { spyOn } from 'bun:test';

import { act } from '@testing-library/react';
import { AIChatPlugin } from 'platejs/ai/react';
import { MarkdownPlugin } from 'platejs/markdown';
import { Plate, ParagraphPlugin, createEditor } from 'platejs/react';
import React from 'react';

import { AIAnchorElement, AIKit } from '@/registry/components/editor/ai';
import { Editor } from '@/registry/components/editor/editor';
import { AIChatTransportPlugin } from '@/registry/components/editor/use-chat';

export const makeEditor = () =>
  createEditor({
    plugins: [
      ParagraphPlugin,
      MarkdownPlugin,
      ...AIKit,
      AIChatTransportPlugin.configure({
        component: AIAnchorElement,
        slots: {
          afterContainer: () => <span data-testid="custom-ai-container" />,
          afterEditable: () => <span data-testid="custom-ai-menu" />,
        },
      }),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 8 },
    },
  });
const defaultReadOnly = [false];
const defaultVisibility = [true];

export function Body({
  editor,
  readOnly = defaultReadOnly,
  visible = defaultVisibility,
  views = 1,
  sessionKey = 0,
}: {
  editor: ReturnType<typeof makeEditor>;
  readOnly?: readonly boolean[];
  visible?: readonly boolean[];
  views?: number;
  sessionKey?: number;
}) {
  return (
    <>
      {visible[0] && (
        <Editor key={sessionKey} readOnly={readOnly[0]} data-testid="view-0" />
      )}
      {views === 2 && (
        <Plate editor={editor} readOnly={readOnly[1]} suppressInstanceWarning>
          {(visible.at(1) ?? true) && (
            <Editor
              key={sessionKey}
              readOnly={readOnly[1]}
              data-testid="view-1"
            />
          )}
        </Plate>
      )}
    </>
  );
}

export function Assembly(props: React.ComponentProps<typeof Body>) {
  return (
    <Plate
      editor={props.editor}
      readOnly={props.readOnly?.[0] ?? false}
      suppressInstanceWarning
    >
      <section data-testid="custom-ai-root">
        <Body {...props} />
      </section>
    </Plate>
  );
}
export function deferred<T>() {
  return Promise.withResolvers<T>();
}
export async function flush() {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
}
export function controlledFetch(waitForHTTP = false) {
  const requests: Array<{
    signal: AbortSignal;
    url: RequestInfo | URL;
    send: (part: unknown) => void;
    fail: () => void;
    reject: () => void;
    open: () => void;
    close: () => void;
  }> = [];
  const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(
    Object.assign(async (...[url, init]: Parameters<typeof fetch>) => {
      let control!: ReadableStreamDefaultController<Uint8Array>;
      let closed = false;
      const response = deferred<Response>();
      const body = new ReadableStream<Uint8Array>({
        start(value) {
          control = value;
        },
      });
      const open = () =>
        response.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'text/event-stream' }),
          body,
        } as Response);
      const close = () => {
        open();
        if (!closed) {
          closed = true;
          control.close();
        }
      };
      requests.push({
        signal: init?.signal as AbortSignal,
        url,
        send: (part) =>
          control.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(part)}\n\n`)
          ),
        fail: () =>
          response.resolve({ ok: false, status: 500, body: null } as Response),
        reject: () => response.reject(new TypeError('fetch failed')),
        open,
        close,
      });
      if (!waitForHTTP) open();
      return response.promise;
    }, globalThis.fetch)
  );
  return { requests, restore: () => fetchSpy.mockRestore() };
}
export async function chunk(
  request: ReturnType<typeof controlledFetch>['requests'][0],
  text = 'hello'
) {
  act(() => {
    request.send({ type: 'start', messageId: 'assistant' });
    request.send({ type: 'text-start', id: 't' });
    request.send({ type: 'text-delta', id: 't', delta: text });
  });
  await flush();
}
export function adapter(editor: ReturnType<typeof makeEditor>) {
  const chat = editor.plugin(AIChatPlugin).store.get('chat');
  if (!chat) throw new Error('Expected mounted AI adapter');
  return chat;
}
export const value = (editor: ReturnType<typeof makeEditor>) =>
  JSON.stringify(editor.read.value());
export function streamState(editor: ReturnType<typeof makeEditor>) {
  const state = editor.plugin(AIChatPlugin).store.get();
  return {
    streaming: state.streaming,
    chunks: state._blockChunks,
    path: state._blockPath,
    mdx: state._mdxName,
  };
}
export const emptyState = {
  streaming: false,
  chunks: '',
  path: null,
  mdx: null,
};
