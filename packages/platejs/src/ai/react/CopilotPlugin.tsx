'use client';

import debounce from 'lodash/debounce.js';
import React from 'react';

import {
  type DefinitionOf,
  NodeApi,
  type NodeKey,
  PLUGINS,
  type Range,
  RangeApi,
  defineEffect,
  defineStateField,
  editorCommands,
} from '../../core';
import { type MarkdownEditor, MarkdownPlugin } from '../../markdown';
import { type Editor, definePlatePlugin } from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';

const nonSpaceRegex = /^\s*(\S)/;
const cjkCharRegex =
  /[\u1100-\u11FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/;
const cjkMatchRegex =
  /^(\s*)([\u1100-\u11FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF])([\u3000-\u303F\uFF00-\uFFEF])?/;
const nonCjkMatchRegex =
  /^(\s*\S+?)(?=[\s\u1100-\u11FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]|$)/;

type CallCompletionOptions = {
  api: string;
  prompt: string;
  body?: Record<string, unknown>;
  credentials?: RequestCredentials;
  fetch?: typeof fetch;
  headers?: HeadersInit;
  onError?: (error: Error) => void;
  onFinish?: (prompt: string, completion: string) => void;
  onResponse?: (response: Response) => Promise<void> | void;
};

export type CopilotCompleteOptions = Omit<CallCompletionOptions, 'prompt'>;

export type CopilotPluginState = {
  abortController: AbortController | null;
  autoTriggerQuery: (options: { editor: MarkdownEditor<Editor> }) => boolean;
  completeOptions: CopilotCompleteOptions | null;
  completion: string | null;
  debounceDelay: number;
  error: Error | null;
  getNextWord: (options: { text: string }) => {
    firstWord: string;
    remainingText: string;
  };
  getPrompt: (options: { editor: MarkdownEditor<Editor> }) => string;
  isLoading: boolean;
  renderGhostText: (() => React.ReactNode) | null;
  shouldAbort: boolean;
  suggestionNodeKey: NodeKey | null;
  suggestionText: string | null;
  triggerQuery: (options: { editor: MarkdownEditor<Editor> }) => boolean;
};

type CopilotSuggestionState = {
  nodeKey: NodeKey | null;
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
  initial: () => ({ nodeKey: null, text: null }),
  reduce: (value, effect) =>
    effect.type === copilotSuggestionEffect ? effect.value.next : value,
});

const dependencies = [MarkdownPlugin] as const;

const initialState: CopilotPluginState = {
  abortController: null,
  completeOptions: null,
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
  suggestionNodeKey: null,
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
        setSuggestion({ nodeKey: null, text: null });
        tx.fragment.replace(
          editor.api.markdown.deserializeInline(suggestionText)
        );

        return undefined;
      },
      acceptNextWord: () => {
        const { getNextWord, suggestionNodeKey, suggestionText } = store.get();

        if (!getNextWord || !suggestionText?.length) return false;

        const { firstWord, remainingText } = getNextWord({
          text: suggestionText,
        });

        tx.tags.add(COPILOT_SKIP_ABORT_TAG);
        setSuggestion({
          nodeKey: remainingText.length ? (suggestionNodeKey ?? null) : null,
          text: remainingText,
        });
        tx.fragment.replace(editor.api.markdown.deserializeInline(firstWord));

        return undefined;
      },
      reject: () => {
        const { abortController, suggestionText } = store.get();

        if (!suggestionText?.length) return false;

        tx.tags.add('history-skip');
        tx.tags.add(COPILOT_SKIP_ABORT_TAG);
        setSuggestion({ nodeKey: null, text: null });
        context.afterCommit(() => {
          abortController?.abort();
          store.set({ abortController: null });
          store.set({ completion: null });
        });

        return undefined;
      },
      setBlockSuggestion: ({
        key = store.get().suggestionNodeKey,
        text,
      }: {
        text: string;
        key?: NodeKey | null;
      }) => {
        tx.tags.add('history-skip');
        const block = tx.nodes.block();
        const blockKey = key ?? (block ? tx.key(block[1]) : null);

        if (!blockKey) return;

        setSuggestion({ nodeKey: blockKey, text });
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
      api,
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

        const requestHeaders: Record<string, string> = {};

        if (headers instanceof Headers) {
          headers.forEach((value, key) => {
            requestHeaders[key] = value;
          });
        } else if (Array.isArray(headers)) {
          for (const [key, value] of headers) {
            requestHeaders[key] = value;
          }
        } else if (headers) {
          Object.assign(requestHeaders, headers);
        }

        if (
          !Object.keys(requestHeaders).some(
            (key) => key.toLowerCase() === 'content-type'
          )
        ) {
          requestHeaders['Content-Type'] = 'application/json';
        }

        const response = await fetcher(api, {
          body: JSON.stringify({ prompt, ...body }),
          credentials,
          headers: requestHeaders,
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
            ({ text } = payload);
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

      return undefined;
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

      if (!completeOptions) {
        context.store.set({
          error: new Error(
            'CopilotPlugin requires completeOptions.api before requesting a completion.'
          ),
        });

        return false;
      }

      stop();

      const { headers } = completeOptions;
      const isHeaderTupleList = (
        value: unknown
      ): value is ReadonlyArray<readonly [string, string]> =>
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
          completeOptions.onError?.(error);
        },
        onFinish: (sourcePrompt, completion) => {
          context.update.setBlockSuggestion({ text: completion });
          completeOptions.onFinish?.(sourcePrompt, completion);
        },
      });

      return undefined;
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

          if (!GhostText) return undefined;

          return ({ children }) => (
            <>
              {children}
              <GhostText />
            </>
          );
        },
      },
      selectors: {
        isSuggested: (state, key: NodeKey) => state.suggestionNodeKey === key,
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
              suggestionNodeKey: null,
              suggestionText: null,
            });
          }

          const next = commit.effects.findLast(
            (candidate) => candidate.type === copilotSuggestionEffect
          )?.value.next;

          if (next) {
            context.store.set({
              suggestionNodeKey: next.nodeKey,
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
          const { suggestionText } = context.store.get();

          if (!suggestionText?.startsWith(input.text)) return next();

          const prefix = state.transaction((tx) => {
            tx.tags.add(COPILOT_SKIP_ABORT_TAG);
            tx.effects.emit(copilotSuggestionEffect, {
              next: {
                nodeKey: context.store.get().suggestionNodeKey ?? null,
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
