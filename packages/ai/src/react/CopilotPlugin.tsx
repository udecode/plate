'use client';

import React from 'react';
import debounce from 'lodash/debounce.js';

import { type MarkdownEditor, MarkdownPlugin } from '@platejs/markdown';
import { type DefinitionOf, NodeIdPlugin } from '@platejs/core';
import { type PlateEditor, definePlatePlugin } from '@platejs/core/react';
import {
  type Range,
  RangeApi,
  defineEffect,
  defineStateField,
  editorCommands,
  NodeApi,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { AIChatPlugin } from './AIChatPlugin';

const nonSpaceRegex = /^\s*(\S)/;
const cjkCharRegex =
  /[\u1100-\u11FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/;
const cjkMatchRegex =
  /^(\s*)([\u1100-\u11FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF])([\u3000-\u303F\uFF00-\uFFEF])?/;
const nonCjkMatchRegex =
  /^(\s*\S+?)(?=[\s\u1100-\u11FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]|$)/;

type CallCompletionOptions = {
  prompt: string;
  api?: string;
  body?: Record<string, unknown>;
  credentials?: RequestCredentials;
  fetch?: typeof fetch;
  headers?: HeadersInit;
  onError?: (error: Error) => void;
  onFinish?: (prompt: string, completion: string) => void;
  onResponse?: (response: Response) => Promise<void> | void;
};

export type CopilotPluginState = {
  abortController: AbortController | null;
  autoTriggerQuery: (options: {
    editor: MarkdownEditor<PlateEditor>;
  }) => boolean;
  completeOptions: Partial<CallCompletionOptions>;
  completion: string | null;
  debounceDelay: number;
  error: Error | null;
  getNextWord: (options: { text: string }) => {
    firstWord: string;
    remainingText: string;
  };
  getPrompt: (options: { editor: MarkdownEditor<PlateEditor> }) => string;
  isLoading: boolean;
  renderGhostText: (() => React.ReactNode) | null;
  shouldAbort: boolean;
  suggestionNodeId: string | null;
  suggestionText: string | null;
  triggerQuery: (options: { editor: MarkdownEditor<PlateEditor> }) => boolean;
};

type CopilotSuggestionState = {
  id: string | null;
  text: string | null;
};

const COPILOT_SKIP_ABORT_TAG = 'skip-copilot-abort';
const copilotSuggestionEffect = defineEffect<{
  next: CopilotSuggestionState;
  previous: CopilotSuggestionState;
}>({
  invert: ({ next, previous }) => ({ next: previous, previous: next }),
  key: 'copilot.suggestion',
});
const copilotSuggestionField = defineStateField<CopilotSuggestionState>({
  key: 'copilot.suggestion',
  collab: 'local',
  history: 'push',
  initial: () => ({ id: null, text: null }),
  reduce: (value, effect) =>
    effect.type === copilotSuggestionEffect ? effect.value.next : value,
});

const dependencies = [NodeIdPlugin, MarkdownPlugin] as const;

const initialState: CopilotPluginState = {
  abortController: null,
  completeOptions: {},
  completion: '',
  debounceDelay: 0,
  error: null,
  getNextWord: ({ text }) => {
    if (!text) return { firstWord: '', remainingText: '' };

    const firstNonSpaceCharacter = nonSpaceRegex.exec(text)?.[1];

    if (!firstNonSpaceCharacter) {
      return { firstWord: '', remainingText: '' };
    }

    const match = cjkCharRegex.test(firstNonSpaceCharacter)
      ? cjkMatchRegex.exec(text)
      : nonCjkMatchRegex.exec(text);

    if (!match) {
      return cjkCharRegex.test(firstNonSpaceCharacter)
        ? { firstWord: '', remainingText: text }
        : { firstWord: text, remainingText: '' };
    }

    const firstWord = match[0];

    return {
      firstWord,
      remainingText: text.slice(firstWord.length),
    };
  },
  isLoading: false,
  renderGhostText: null,
  shouldAbort: true,
  suggestionNodeId: null,
  suggestionText: null,
  autoTriggerQuery: ({ editor }) => {
    if (editor.read.getField(copilotSuggestionField).text) {
      return false;
    }

    const block = editor.read.nodes.block();

    return (
      !!block &&
      !editor.read.nodes.isEmpty(block[0]) &&
      NodeApi.string(block[0]).at(-1) === ' '
    );
  },
  getPrompt: ({ editor }) => {
    const block = editor.read.nodes.block({ mode: 'highest' });

    return block
      ? editor.api.markdown.serialize({
          value: { children: [block[0]] },
        })
      : '';
  },
  triggerQuery: ({ editor }) =>
    editor.read.selection.isCollapsed() && editor.read.selection.isAtBlockEnd(),
};

export const CopilotPlugin = definePlatePlugin(PLUGINS.copilot, {
  dependencies,
  effectTypes: [copilotSuggestionEffect],
  stateFields: [copilotSuggestionField],
  initialState,
  update: ({ context, editor, store, tx }) => {
    const setSuggestion = (next: CopilotSuggestionState) => {
      tx.effects.emit(copilotSuggestionEffect, {
        next,
        previous: tx.getField(copilotSuggestionField),
      });
    };

    return {
      accept: () => {
        const { suggestionText } = store.get();

        if (!suggestionText?.length) return false;

        tx.tags.add(COPILOT_SKIP_ABORT_TAG);
        setSuggestion({ id: null, text: null });
        tx.fragment.replace(
          editor.api.markdown.deserializeInline(suggestionText)
        );
      },
      acceptNextWord: () => {
        const { getNextWord, suggestionNodeId, suggestionText } = store.get();

        if (!getNextWord || !suggestionText?.length) return false;

        const { firstWord, remainingText } = getNextWord({
          text: suggestionText,
        });

        tx.tags.add(COPILOT_SKIP_ABORT_TAG);
        setSuggestion({
          id: remainingText.length ? (suggestionNodeId ?? null) : null,
          text: remainingText,
        });
        tx.fragment.replace(editor.api.markdown.deserializeInline(firstWord));
      },
      reject: () => {
        const { abortController, suggestionText } = store.get();

        if (!suggestionText?.length) return false;

        tx.tags.add('history-skip');
        tx.tags.add(COPILOT_SKIP_ABORT_TAG);
        setSuggestion({ id: null, text: null });
        context.afterCommit(() => {
          abortController?.abort();
          store.set({ abortController: null });
          store.set({ completion: null });
        });
      },
      setBlockSuggestion: ({
        id = store.get().suggestionNodeId,
        text,
      }: {
        text: string;
        id?: string | null;
      }) => {
        tx.tags.add('history-skip');
        const block = tx.nodes.block();
        const blockId =
          id ??
          (block
            ? tx.schema.getElementProperty(
                block[0],
                editor.plugin(NodeIdPlugin).store.get('idKey') ?? 'id'
              )
            : undefined);

        if (typeof blockId !== 'string') return;

        setSuggestion({ id: blockId, text });
      },
      setSuggestion,
    };
  },
})
  .extend((context) => {
    let debouncedTrigger: ReturnType<
      typeof debounce<typeof triggerImmediately>
    > | null = null;
    const stop = () => {
      const { abortController } = context.store.get();

      debouncedTrigger?.cancel();

      if (abortController) {
        abortController.abort();
        context.store.set({ abortController: null });
      }
    };
    const callCompletion = async ({
      api = '/api/completion',
      body,
      credentials,
      fetch: fetcher = fetch,
      headers,
      prompt,
      onError,
      onFinish,
      onResponse,
    }: CallCompletionOptions) => {
      try {
        context.store.set({ isLoading: true });
        context.store.set({ error: null });

        const abortController = new AbortController();

        context.store.set({ abortController });
        context.store.set({ completion: '' });

        const response = await fetcher(api, {
          body: JSON.stringify({ prompt, ...body }),
          credentials,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          method: 'POST',
          signal: abortController.signal,
        });

        await onResponse?.(response);

        if (!response.ok) {
          throw new Error(
            (await response.text()) ||
              'Failed to fetch the completion response.'
          );
        }
        if (!response.body) throw new Error('The response body is empty.');

        let text = '';

        if (
          response.headers.get('content-type')?.includes('application/json')
        ) {
          const payload: unknown = await response.json();

          if (
            typeof payload === 'object' &&
            payload !== null &&
            'text' in payload &&
            typeof payload.text === 'string'
          ) {
            text = payload.text;
            context.store.set({ completion: text });
          }
        } else {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            text += decoder.decode(value, { stream: true });
            context.store.set({ completion: text });
          }

          const tail = decoder.decode();

          if (tail) {
            text += tail;
            context.store.set({ completion: text });
          }
        }

        if (!text) {
          throw new Error('The response does not contain completion text.');
        }

        onFinish?.(prompt, text);
        context.store.set({ abortController: null });

        return text;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          context.store.set({ abortController: null });

          return null;
        }
        if (error instanceof Error) onError?.(error);

        context.store.set({
          error: error instanceof Error ? error : new Error(String(error)),
        });
      } finally {
        context.store.set({ isLoading: false });
      }
    };
    async function triggerImmediately() {
      const { completeOptions, getPrompt, isLoading, triggerQuery } =
        context.store.get();
      const aiChat = context.editor.plugin(AIChatPlugin);
      const chatStatus = aiChat.installed
        ? aiChat.store.get('chat')?.status
        : undefined;

      if (
        isLoading ||
        chatStatus === 'submitted' ||
        chatStatus === 'streaming' ||
        !triggerQuery?.({ editor: context.editor })
      ) {
        return false;
      }

      const prompt = getPrompt?.({ editor: context.editor });

      if (!prompt) return false;

      stop();

      const headers = completeOptions?.headers;
      const isHeaderTupleList = (
        value: unknown
      ): value is readonly (readonly [string, string])[] =>
        Array.isArray(value);

      await callCompletion({
        prompt,
        ...completeOptions,
        headers:
          headers instanceof Headers
            ? Object.fromEntries(headers.entries())
            : isHeaderTupleList(headers)
              ? Object.fromEntries(headers)
              : headers
                ? { ...headers }
                : undefined,
        onError: (error) => {
          context.store.set({ error });
          completeOptions?.onError?.(error);
        },
        onFinish: (sourcePrompt, completion) => {
          context.update.setBlockSuggestion({ text: completion });
          completeOptions?.onFinish?.(sourcePrompt, completion);
        },
      });
    }

    debouncedTrigger = context.store.get().debounceDelay
      ? debounce(triggerImmediately, context.store.get().debounceDelay)
      : null;

    return {
      api: () => ({
        stop,
        triggerSuggestion: debouncedTrigger ?? triggerImmediately,
      }),
    };
  })
  .extend((context) => {
    let previousSelection: Range | null = null;

    return {
      render: {
        belowNodes: () => {
          const GhostText = context.store.get().renderGhostText;

          if (!GhostText) return;

          return ({ children }) => (
            <>
              {children}
              <GhostText />
            </>
          );
        },
      },
      selectors: {
        isSuggested: (state, id: string) => state.suggestionNodeId === id,
      },
      shortcuts: {
        accept: {
          keys: 'tab',
          target: 'update',
        },
        reject: {
          keys: 'escape',
          target: 'update',
        },
      },
      on: {
        blur: () => {
          context.update.reject();
        },
        commit({ commit }) {
          if (
            (!commit.changes.empty || commit.selectionChanged) &&
            context.store.get().shouldAbort &&
            !commit.tags.includes(COPILOT_SKIP_ABORT_TAG) &&
            context.store.get().suggestionText?.length
          ) {
            context.update.reject();
            context.store.set({
              completion: null,
              suggestionNodeId: null,
              suggestionText: null,
            });
          }

          const next = commit.effects.findLast(
            (candidate) => candidate.type === copilotSuggestionEffect
          )?.value.next;

          if (next) {
            context.store.set({
              suggestionNodeId: next.id,
              suggestionText: next.text,
            });
          }
          if (!commit.selectionChanged) return;

          const selection = context.editor.read.selection();

          if (
            selection &&
            (!previousSelection ||
              !RangeApi.equals(previousSelection, selection)) &&
            context.store
              .get()
              .autoTriggerQuery?.({ editor: context.editor }) &&
            context.editor.read.view.isFocused()
          ) {
            void context.api.triggerSuggestion();
          }

          previousSelection = selection;
        },
        mouseDown: () => {
          context.update.reject();
        },
      },
      commands: ({ around }) => [
        around(editorCommands.insertText, ({ input, state, next }) => {
          const suggestionText = context.store.get().suggestionText;

          if (!suggestionText?.startsWith(input.text)) return next();

          const prefix = state.transaction((tx) => {
            tx.tags.add(COPILOT_SKIP_ABORT_TAG);
            tx.effects.emit(copilotSuggestionEffect, {
              next: {
                id: context.store.get().suggestionNodeId ?? null,
                text: suggestionText.slice(input.text.length),
              },
              previous: tx.getField(copilotSuggestionField),
            });
          });

          return next.after(prefix);
        }),
      ],
    };
  });

export type CopilotDefinition = DefinitionOf<typeof CopilotPlugin>;
