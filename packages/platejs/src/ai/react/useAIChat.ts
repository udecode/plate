'use client';

import { Chat as SDKChat } from '@ai-sdk/react';
import type { ChatTransport, DataUIPart, UIMessage } from 'ai';
import * as React from 'react';

import { getEditorRuntimeOwner } from '../../core';
import { type Editor, useEditor, useEditorViewState } from '../../react/core';
import { AIChatPlugin, getAIChatCommandEditor } from './AIChatPlugin';

type ToolName = 'comment' | 'edit' | 'generate';
type TableData = {
  status: 'finished' | 'streaming';
  cellUpdate: { content: string; ref: string } | null;
};
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isToolName = (value: unknown): value is ToolName =>
  value === 'comment' || value === 'edit' || value === 'generate';

const isStreamStatus = (value: unknown): value is 'finished' | 'streaming' =>
  value === 'finished' || value === 'streaming';

const isTableCellUpdate = (value: unknown): value is TableData =>
  isRecord(value) &&
  isStreamStatus(value.status) &&
  (value.cellUpdate === null ||
    (isRecord(value.cellUpdate) &&
      typeof value.cellUpdate.content === 'string' &&
      typeof value.cellUpdate.ref === 'string'));

type ChatView = {
  element: HTMLElement;
  onData:
    | ((part: DataUIPart<Record<string, unknown>>, signal: AbortSignal) => void)
    | undefined;
};
type EditorChatSession = {
  transport: ChatTransport<UIMessage>;
  attach: (view: ChatView) => () => void;
  dispose: () => void;
  refresh: () => void;
};

const sessions = new WeakMap<Editor, EditorChatSession>();

function createEditorChat(
  editor: Editor,
  transport: ChatTransport<UIMessage>
): EditorChatSession {
  const { store } = editor.plugin(AIChatPlugin);

  const views = new Map<symbol, ChatView>();
  let disposed = false;
  let insertedText = '';
  let previousContent = '';
  let previousLoading = false;
  let chatPublishTimer: ReturnType<typeof setTimeout> | null = null;
  let insertStarted = false;
  let insertTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingInsert = '';
  let pendingInsertRequestId: string | null = null;
  const getCommandEditor = () => getAIChatCommandEditor(editor);
  const isOwner = () => !disposed && sessions.get(editor) === session;
  const isLive = () =>
    isOwner() &&
    !editor.read.view.isReadOnly() &&
    Array.from(views.values()).some(
      ({ element }) =>
        element.isConnected &&
        element.getAttribute('data-readonly') !== 'true' &&
        element.getAttribute('aria-readonly') !== 'true' &&
        element.getAttribute('aria-disabled') !== 'true'
    );
  let request: AbortController | null = null;
  const createChat = (messages: UIMessage[] = [], signal?: AbortSignal) =>
    new SDKChat<UIMessage>({
      id: 'editor',
      transport,
      messages,
      onData(data) {
        if (
          !isLive() ||
          !signal ||
          signal.aborted ||
          signal !== request?.signal
        ) {
          return;
        }
        if (data.type === 'data-toolName' && isToolName(data.data)) {
          editor.plugin(AIChatPlugin).store.set({ toolName: data.data });
        }

        if (data.type === 'data-table' && isTableCellUpdate(data.data)) {
          const tableData = data.data;
          const commandEditor = getCommandEditor();

          if (tableData.status === 'finished') return;

          const { cellUpdate } = tableData;

          if (cellUpdate == null) {
            throw new Error('Streaming table data requires a cell update');
          }

          commandEditor.plugin(AIChatPlugin).api.setTablePreview(cellUpdate, {
            requestId: store.get('_requestId'),
          });
        }

        const view = Array.from(views.values()).find(
          ({ element }) =>
            element.isConnected &&
            element.getAttribute('data-readonly') !== 'true' &&
            element.getAttribute('aria-readonly') !== 'true' &&
            element.getAttribute('aria-disabled') !== 'true'
        );
        view?.onData?.(data, signal);
      },
    });
  let chat = createChat();
  const clearPendingInsert = () => {
    if (insertTimer) clearTimeout(insertTimer);
    insertTimer = null;
    insertStarted = false;
    pendingInsert = '';
    pendingInsertRequestId = null;
  };
  const flushPendingInsert = () => {
    if (insertTimer) clearTimeout(insertTimer);
    insertTimer = null;

    const requestId = pendingInsertRequestId;

    if (
      !isLive() ||
      request?.signal.aborted ||
      !store.get('streaming') ||
      requestId !== store.get('_requestId')
    ) {
      clearPendingInsert();
      return;
    }

    const chunk = pendingInsert;
    pendingInsert = '';
    pendingInsertRequestId = null;

    if (!chunk) return;

    getCommandEditor().plugin(AIChatPlugin).api.setPreview(chunk, {
      requestId,
    });
    publishChat();
  };
  const queueInsert = (chunk: string) => {
    const requestId = store.get('_requestId');

    if (pendingInsert && pendingInsertRequestId !== requestId) {
      clearPendingInsert();
    }
    pendingInsert = chunk;
    pendingInsertRequestId = requestId;

    if (!insertStarted) {
      insertStarted = true;
      flushPendingInsert();
      return;
    }
    if (!insertTimer) {
      insertTimer = setTimeout(flushPendingInsert, 32);
    }
  };
  const finish = () => {
    flushPendingInsert();
    if (store.get('chat')?.stop === stop) {
      store.set({
        streaming: false,
      });
    }
  };
  const stop = () => {
    flushPendingInsert();
    request?.abort();
    clearPendingChatPublish();
    clearPendingInsert();
    finish();
    return chat.stop();
  };
  const retire = () => {
    const ownsStore = store.get('chat')?.stop === stop;

    void stop();
    if (!ownsStore) return;

    getCommandEditor().plugin(AIChatPlugin).api.reset();
  };
  const assertLive = () => {
    if (!isLive()) {
      throw new Error(
        'AI commands require a writable editor and mounted view.'
      );
    }
  };
  const clearPendingChatPublish = () => {
    if (chatPublishTimer) clearTimeout(chatPublishTimer);
    chatPublishTimer = null;
  };
  const publishChat = () => {
    clearPendingChatPublish();
    store.set({
      chat: {
        clear: () => {
          chat.messages = [];
        },
        messages: chat.messages,
        error: chat.error,
        regenerate: async (requestOptions) => {
          assertLive();
          await beginRequest().regenerate(requestOptions);
        },
        sendMessage: async (text, requestOptions) => {
          assertLive();
          await beginRequest().sendMessage({ text }, requestOptions);
        },
        status: chat.status,
        stop,
      },
    });
  };
  const queueChatPublish = () => {
    if (chatPublishTimer) return;
    chatPublishTimer = setTimeout(publishChat, 32);
  };
  const sync = () => {
    if (!isOwner()) return;
    const toolName = store.get('toolName');
    const mode = store.get('mode');
    const loading = chat.status === 'streaming' || chat.status === 'submitted';
    const content =
      toolName === 'comment'
        ? ''
        : (chat.messages
            .findLast((message) => message.role === 'assistant')
            ?.parts.filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('') ?? '');
    if (!previousLoading && loading) insertedText = '';
    const changed = content !== previousContent;
    const chunk =
      content && changed && (previousLoading || loading)
        ? content.slice(insertedText.length)
        : '';
    const isFirst = insertedText === '';
    const finished = previousLoading && !loading;
    if (content && changed) insertedText = content;
    previousContent = content;
    previousLoading = loading;
    const publishedChat = store.get('chat');
    if (
      !publishedChat ||
      publishedChat.status !== chat.status ||
      publishedChat.error !== chat.error ||
      publishedChat.messages.length !== chat.messages.length
    ) {
      publishChat();
    } else if (mode !== 'insert' || !loading) {
      queueChatPublish();
    }
    if (chunk && isLive() && !request?.signal.aborted) {
      if (isFirst) store.set({ streaming: true });
      if (!store.get('streaming')) return;
      queueInsert(content);
    }
    if (finished) finish();
  };
  const subscribe = () => [
    chat['~registerMessagesCallback'](sync),
    chat['~registerStatusCallback'](sync),
    chat['~registerErrorCallback'](sync),
  ];
  let unsubscribe = subscribe();
  const beginRequest = () => {
    request?.abort();
    void chat.stop();
    unsubscribe.forEach((off) => off());
    clearPendingChatPublish();
    clearPendingInsert();
    insertedText = '';
    previousContent = '';
    previousLoading = false;
    request = new AbortController();
    // SDK callbacks carry no request identity. Give each request its own SDK
    // instance so a retired response cannot mutate the current conversation.
    chat = createChat(chat.messages, request.signal);
    unsubscribe = subscribe();
    return chat;
  };
  const session: EditorChatSession = {
    transport,
    attach(view) {
      const key = Symbol('chat-view');
      views.set(key, view);
      const observer = new MutationObserver(session.refresh);
      observer.observe(view.element, {
        attributes: true,
        attributeFilter: ['data-readonly', 'aria-readonly', 'aria-disabled'],
      });
      sync();
      session.refresh();
      return () => {
        observer.disconnect();
        views.delete(key);
        if (views.size === 0) session.dispose();
        else session.refresh();
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      retire();
      unsubscribe.forEach((off) => off());
      if (sessions.get(editor) === session) {
        sessions.delete(editor);
        if (store.get('chat')?.stop === stop) store.set({ chat: null });
      }
    },
    refresh() {
      if (!isLive()) void stop();
    },
  };
  return session;
}

/**
 * Binds one AI chat session to an editor's writable views.
 * Share a transport between views of the same editor. Replacing it or detaching
 * the last view cancels the request. Check the data callback's signal after await.
 */
export function useAIChat({
  editableRef,
  transport,
  onData,
}: {
  editableRef: React.RefObject<HTMLElement | null>;
  transport: ChatTransport<UIMessage>;
  onData?: (
    part: DataUIPart<Record<string, unknown>>,
    signal: AbortSignal
  ) => void;
}) {
  const mountedEditor = useEditor();
  const editor = getEditorRuntimeOwner(mountedEditor) as Editor;

  const readOnly = useEditorViewState(mountedEditor, (state) =>
    state.isReadOnly()
  );
  const attachment = React.useRef<{
    view: ChatView;
    element: HTMLElement;
    session: EditorChatSession;
    detach: () => void;
  } | null>(null);
  React.useLayoutEffect(() => {
    const element = editableRef.current;
    const previous = attachment.current;
    if (
      previous?.element === element &&
      previous.session === sessions.get(editor) &&
      previous.session.transport === transport
    ) {
      previous.view.onData = onData;
      return;
    }
    previous?.detach();
    attachment.current = null;
    if (!element) return;
    let session = sessions.get(editor);
    if (session && session.transport !== transport) {
      session.dispose();
      session = undefined;
    }
    if (!session) {
      session = createEditorChat(editor, transport);
      sessions.set(editor, session);
    }
    const view = { element, onData };
    attachment.current = {
      element,
      view,
      session,
      detach: session.attach(view),
    };
  });
  React.useLayoutEffect(
    () => () => {
      attachment.current?.detach();
      attachment.current = null;
    },
    []
  );
  React.useEffect(() => {
    sessions.get(editor)?.refresh();
  }, [editor, readOnly]);
}
