'use client';

import { Chat as SDKChat } from '@ai-sdk/react';
import type { ChatTransport, DataUIPart, UIMessage } from 'ai';
import cloneDeep from 'lodash/cloneDeep.js';
import * as React from 'react';

import {
  ElementApi,
  getEditorRuntimeOwner,
  PathApi,
  PLUGINS,
} from '../../core';
import { MarkdownPlugin } from '../../markdown';
import { type Editor, useEditor, useEditorViewState } from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';
import { AIPlugin } from './AIPlugin';

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
  const { store, read } = editor.plugin(AIChatPlugin);

  const views = new Map<symbol, ChatView>();
  let disposed = false;
  let insertedText = '';
  let previousContent = '';
  let previousLoading = false;
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
  const chat = new SDKChat<UIMessage>({
    id: 'editor',
    transport,
    onData(data) {
      const signal = request?.signal;
      if (!isLive() || !signal || signal.aborted) return;
      if (data.type === 'data-toolName' && isToolName(data.data)) {
        editor.plugin(AIChatPlugin).store.set({ toolName: data.data });
      }

      if (data.type === 'data-table' && isTableCellUpdate(data.data)) {
        const tableData = data.data;

        if (tableData.status === 'finished') {
          const chatSelection = editor
            .plugin(AIChatPlugin)
            .store.get('chatSelection');

          if (!chatSelection) return;

          editor.update.selection.set(chatSelection);

          return;
        }

        const { cellUpdate } = tableData;

        if (cellUpdate == null) {
          throw new Error('Streaming table data requires a cell update');
        }

        editor.plugin(AIChatPlugin).update.applyTableCellSuggestion(cellUpdate);
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
  const finish = () => {
    if (store.get('chat')?.stop === stop) {
      store.set({
        streaming: false,
        _blockChunks: '',
        _blockPath: null,
        _mdxName: null,
      });
    }
  };
  const stop = () => {
    request?.abort();
    finish();
    return chat.stop();
  };
  const assertLive = () => {
    if (!isLive()) {
      throw new Error(
        'AI commands require a writable editor and mounted view.'
      );
    }
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
    store.set({
      chat: {
        clear: () => {
          chat.messages = [];
        },
        messages: chat.messages,
        regenerate: async (requestOptions) => {
          assertLive();
          request?.abort();
          request = new AbortController();
          await chat.regenerate(requestOptions);
        },
        sendMessage: async (text, requestOptions) => {
          assertLive();
          request?.abort();
          request = new AbortController();
          await chat.sendMessage({ text }, requestOptions);
        },
        status: chat.status,
        stop,
      },
    });
    if (
      changed &&
      isLive() &&
      !request?.signal.aborted &&
      mode === 'chat' &&
      toolName === 'generate'
    ) {
      store.set({
        previewValue: content
          ? editor.plugin(MarkdownPlugin).api.deserialize(content).children
          : [],
      });
    }
    if (chunk && isLive() && !request?.signal.aborted) {
      if (isFirst && mode === 'insert') {
        const selection = editor.read.selection();

        if (!selection) return;

        const { path, startBlock, startInEmptyParagraph } = read.insertStart();

        editor.plugin(AIPlugin).update.beginPreview({
          originalBlocks:
            startInEmptyParagraph &&
            startBlock &&
            ElementApi.isElement(startBlock)
              ? [cloneDeep(startBlock)]
              : [],
        });

        editor.update({ history: 'skip' }).nodes.insert(
          {
            children: [{ text: '' }],
            type: editor.plugin(PLUGINS.aiChat).schema.type,
          },
          {
            at: PathApi.next(path),
          }
        );
        store.set({ streaming: true });
      }

      if (mode === 'insert' && chunk.length > 0) {
        if (!store.get('streaming')) return;

        editor.plugin(AIChatPlugin).update.insertChunk(chunk, {
          autoScroll: true,
          textProps: {
            [editor.plugin(PLUGINS.ai).schema.key]: true,
          },
        });
      }

      if (toolName === 'edit' && mode === 'chat') {
        editor
          .plugin(AIChatPlugin)
          .update.applySuggestions(content, { split: isFirst });
      }
    }
    if (finished) finish();
  };
  const unsubscribe = [
    chat['~registerMessagesCallback'](sync),
    chat['~registerStatusCallback'](sync),
  ];
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
      void stop();
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
