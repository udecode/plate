'use client';

import React from 'react';
import debounce from 'lodash/debounce.js';

import { type MarkdownEditor, MarkdownPlugin } from '@platejs/markdown';
import { type InferConfig, NodeIdPlugin } from '@platejs/core';
import { type PlateEditor, createPlatePlugin } from '@platejs/core/react';
import {
  type Range,
  RangeApi,
  defineEffect,
  defineStateField,
  editorCommands,
  NodeApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { AIChatPlugin } from '../ai-chat/AIChatPlugin';
import { type GetNextWord, getNextWord } from './getNextWord';

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

type CopilotOptions = {
  abortController?: AbortController | null;
  autoTriggerQuery?: (options: {
    editor: MarkdownEditor<PlateEditor>;
  }) => boolean;
  completeOptions?: Partial<CallCompletionOptions>;
  completion?: string | null;
  debounceDelay?: number;
  error?: Error | null;
  getNextWord?: GetNextWord;
  getPrompt?: (options: { editor: MarkdownEditor<PlateEditor> }) => string;
  isLoading?: boolean;
  renderGhostText?: (() => React.ReactNode) | null;
  shouldAbort?: boolean;
  suggestionNodeId?: string | null;
  suggestionText?: string | null;
  triggerQuery?: (options: { editor: MarkdownEditor<PlateEditor> }) => boolean;
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

export const CopilotPlugin = createPlatePlugin({
  dependencies,
  extension: {
    effects: [copilotSuggestionEffect],
    fields: [copilotSuggestionField],
    name: 'copilot-suggestion',
  },
  key: KEYS.copilot,
  options: {
    abortController: null,
    completeOptions: {},
    completion: '',
    debounceDelay: 0,
    error: null,
    getNextWord,
    isLoading: false,
    renderGhostText: null,
    shouldAbort: true,
    suggestionNodeId: null,
    suggestionText: null,
    autoTriggerQuery: ({ editor }) => {
      if (editor.plugin({ key: KEYS.copilot }).getOption('suggestionText')) {
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
      editor.read.selection.isCollapsed() &&
      editor.read.selection.isAtBlockEnd(),
  } as CopilotOptions,
  update: ({ editor, tx }) => {
    const setSuggestion = (next: CopilotSuggestionState) => {
      tx.effects.emit(copilotSuggestionEffect, {
        next,
        previous: tx.getField(copilotSuggestionField),
      });
    };

    return {
      accept: () => {
        const { suggestionText } = editor
          .plugin({ key: KEYS.copilot })
          .getOptions();

        if (!suggestionText?.length) return false;

        tx.tags.add(COPILOT_SKIP_ABORT_TAG);
        setSuggestion({ id: null, text: null });
        tx.fragment.replace(
          editor.api.markdown.deserializeInline(suggestionText)
        );
      },
      acceptNextWord: () => {
        const { getNextWord, suggestionNodeId, suggestionText } = editor
          .plugin({ key: KEYS.copilot })
          .getOptions();

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
      setSuggestion,
    };
  },
})
  .extend((context) => {
    let debouncedTrigger: ReturnType<
      typeof debounce<typeof triggerImmediately>
    > | null = null;
    const stop = () => {
      const { abortController } = context.getOptions();

      debouncedTrigger?.cancel();

      if (abortController) {
        abortController.abort();
        context.setOption('abortController', null);
      }
    };
    const setBlockSuggestion = ({
      id = context.getOptions().suggestionNodeId,
      text,
    }: {
      text: string;
      id?: string | null;
    }) => {
      const block = context.editor.read.nodes.block();
      const blockId =
        id ??
        (block
          ? context.editor.read.schema.getElementProperty(
              block[0],
              NodeIdPlugin
            )
          : undefined);

      if (typeof blockId !== 'string') return;

      context.editor.update({ history: 'skip' }, (tx) => {
        tx.copilot.setSuggestion({ id: blockId, text });
      });
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
        context.setOption('isLoading', true);
        context.setOption('error', null);

        const abortController = new AbortController();

        context.setOption('abortController', abortController);
        context.setOption('completion', '');

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
            context.setOption('completion', text);
          }
        } else {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            text += decoder.decode(value, { stream: true });
            context.setOption('completion', text);
          }

          const tail = decoder.decode();

          if (tail) {
            text += tail;
            context.setOption('completion', text);
          }
        }

        if (!text) {
          throw new Error('The response does not contain completion text.');
        }

        onFinish?.(prompt, text);
        context.setOption('abortController', null);

        return text;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          context.setOption('abortController', null);

          return null;
        }
        if (error instanceof Error) onError?.(error);

        context.setOption(
          'error',
          error instanceof Error ? error : new Error(String(error))
        );
      } finally {
        context.setOption('isLoading', false);
      }
    };
    async function triggerImmediately() {
      const { completeOptions, getPrompt, isLoading, triggerQuery } =
        context.getOptions();
      const aiChat = context.editor.plugin(AIChatPlugin);
      const chatStatus = aiChat.installed
        ? aiChat.getOption('chat')?.status
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
          context.setOption('error', error);
          completeOptions?.onError?.(error);
        },
        onFinish: (sourcePrompt, completion) => {
          setBlockSuggestion({ text: completion });
          completeOptions?.onFinish?.(sourcePrompt, completion);
        },
      });
    }

    debouncedTrigger = context.getOptions().debounceDelay
      ? debounce(triggerImmediately, context.getOptions().debounceDelay)
      : null;

    const reject = () => {
      if (!context.getOptions().suggestionText?.length) return false;

      stop();
      context.editor.update({ history: 'skip' }, (tx) => {
        tx.copilot.setSuggestion({ id: null, text: null });
      });
      context.setOption('completion', null);
    };

    return {
      api: {
        reject,
        setBlockSuggestion,
        stop,
        triggerSuggestion: debouncedTrigger ?? triggerImmediately,
      },
    };
  })
  .extend((context) => {
    let previousSelection: Range | null = null;

    return {
      handlers: {
        onBlur: () => {
          context.api.reject();
        },
        onMouseDown: () => {
          context.api.reject();
        },
      },
      render: {
        belowNodes: () => {
          const GhostText = context.getOptions().renderGhostText;

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
        isSuggested: (id: string) =>
          context.getOptions().suggestionNodeId === id,
      },
      shortcuts: {
        accept: {
          keys: 'tab',
          target: 'update',
        },
        reject: {
          keys: 'escape',
        },
      },
      extension: {
        onCommit({ commit }) {
          if (
            (!commit.changes.empty || commit.selectionChanged) &&
            context.getOptions().shouldAbort &&
            !commit.tags.includes(COPILOT_SKIP_ABORT_TAG) &&
            context.getOptions().suggestionText?.length
          ) {
            context.api.reject();
            context.setOptions({
              completion: null,
              suggestionNodeId: null,
              suggestionText: null,
            });
          }

          const next = commit.effects.findLast(
            (candidate) => candidate.type === copilotSuggestionEffect
          )?.value.next;

          if (next) {
            context.setOptions({
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
            context
              .getOptions()
              .autoTriggerQuery?.({ editor: context.editor }) &&
            context.editor.read.view.isFocused()
          ) {
            void context.api.triggerSuggestion();
          }

          previousSelection = selection;
        },
        commands: ({ around }) => [
          around(editorCommands.insertText, ({ input, state, next }) => {
            const suggestionText = context.getOptions().suggestionText;

            if (!suggestionText?.startsWith(input.text)) return next();

            const prefix = state.transaction((tx) => {
              tx.tags.add(COPILOT_SKIP_ABORT_TAG);
              tx.copilot.setSuggestion({
                id: context.getOptions().suggestionNodeId ?? null,
                text: suggestionText.slice(input.text.length),
              });
            });

            return next.after(prefix);
          }),
        ],
      },
    };
  });

export type CopilotPluginConfig = InferConfig<typeof CopilotPlugin>;
