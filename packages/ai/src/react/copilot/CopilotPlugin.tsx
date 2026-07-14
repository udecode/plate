'use client';

import type React from 'react';

import { serializeMd } from '@platejs/markdown';
import debounce from 'lodash/debounce.js';
import type { PluginConfig } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import { NodeApi } from '@platejs/plite';
import { type PlateEditor, createPlatePlugin } from '@platejs/core/react';

import type { CompleteOptions } from './utils/callCompletionApi';

import { renderCopilotBelowNodes } from './renderCopilotBelowNodes';
import { acceptCopilot } from './transforms/acceptCopilot';
import { acceptCopilotNextWord } from './transforms/acceptCopilotNextWord';
import { type GetNextWord, getNextWord } from './utils/getNextWord';
import { triggerCopilotSuggestion } from './utils/triggerCopilotSuggestion';
import { copilotSuggestionField, withCopilot } from './withCopilot';

export type CopilotPluginConfig = PluginConfig<
  'copilot',
  CompletionState & {
    /**
     * AI completion options. See:
     * {@link https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-completion#parameters | AI SDK UI useCompletion Parameters}
     */
    completeOptions?: Partial<CompleteOptions>;
    /**
     * Debounce delay for auto triggering AI completion.
     *
     * @default 0
     */
    debounceDelay?: number;
    /** Get the next word to be inserted. */
    getNextWord?: GetNextWord;
    /** Render the ghost text. */
    renderGhostText?: (() => React.ReactNode) | null;
    shouldAbort?: boolean;
    /** The node id where the suggestion is located. */
    suggestionNodeId?: string | null;
    /** The text of the suggestion. */
    suggestionText?: string | null;
    /**
     * Conditions to auto trigger copilot, used in addition to triggerQuery.
     * Disabling defaults to:
     *
     * - Block above is empty
     * - Block above ends with a space
     * - There is already a suggestion
     */
    autoTriggerQuery?: (options: { editor: PlateEditor }) => boolean;
    /**
     * Get the prompt for AI completion.
     *
     * @default serializeMd(editor, { value: [editor.read.nodes.block({ mode: 'highest' })[0]] })
     */
    getPrompt?: (options: { editor: PlateEditor }) => string;
    /**
     * Conditions to trigger copilot. Disabling defaults to:
     *
     * - Selection is expanded
     * - Selection is not at the end of block
     */
    triggerQuery?: (options: { editor: PlateEditor }) => boolean;
    // query?: QueryEditorOptions;
  },
  {
    copilot: {
      triggerSuggestion: () =>
        | ReturnType<typeof triggerCopilotSuggestion>
        | undefined;
      // Function to abort the current API request and reject the completion state.
      reject: () => false | undefined;
      setBlockSuggestion: (options: { text: string; id?: string }) => void;
      // Function to abort the current API request.
      stop: () => void;
    };
  },
  {
    copilot: {
      accept: () => false | undefined;
      acceptNextWord: () => false | undefined;
    };
  },
  {
    isSuggested?: (id: string) => boolean;
  }
>;

type CompletionState = {
  abortController?: AbortController | null;
  // The current text completion.
  completion?: string | null;
  // The error thrown during the completion process, if any.
  error?: Error | null;
  // Boolean flag indicating whether a fetch operation is currently in progress.
  isLoading?: boolean;
};

export const CopilotPlugin = createPlatePlugin<CopilotPluginConfig>({
  key: KEYS.copilot,
  handlers: {
    onBlur: ({ api }) => {
      api.reject();
    },
    onMouseDown: ({ api }) => {
      api.reject();
    },
  },
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
      if (
        editor
          .plugin<CopilotPluginConfig>(KEYS.copilot)
          .getOption('suggestionText')
      ) {
        return false;
      }

      const blockAbove = editor.read.nodes.block();

      if (!blockAbove || editor.read.nodes.isEmpty(blockAbove[0])) return false;

      const blockString = NodeApi.string(blockAbove[0]);

      return blockString.at(-1) === ' ';
    },
    getPrompt: ({ editor }) => {
      const contextEntry = editor.read.nodes.block({ mode: 'highest' });

      if (!contextEntry) return '';

      return serializeMd(editor, {
        value: [contextEntry[0]],
      });
    },
    triggerQuery: ({ editor }) => {
      if (editor.read.selection.isExpanded()) return false;
      if (!editor.read.selection.isAtBlockEnd()) return false;

      return true;
    },
  },
})
  .extendExtension(copilotSuggestionField)
  .extendExtension(withCopilot)
  .extendSelectors<CopilotPluginConfig['selectors']>(({ getOptions }) => ({
    isSuggested: (id) => getOptions().suggestionNodeId === id,
  }))
  .extendApi<Omit<CopilotPluginConfig['api']['copilot'], 'reject'>>(
    ({ editor, getOptions, setOption }) => {
      const debounceDelay = getOptions().debounceDelay;
      const triggerImmediately = () => triggerCopilotSuggestion(editor);
      const debouncedTrigger = debounceDelay
        ? debounce(triggerImmediately, debounceDelay)
        : null;

      return {
        triggerSuggestion: debouncedTrigger ?? triggerImmediately,
        setBlockSuggestion: ({ id = getOptions().suggestionNodeId, text }) => {
          const blockId = id ?? editor.read.nodes.block()?.[0].id;

          if (typeof blockId !== 'string') return;

          editor.update.history.skip((tx) => {
            tx.setField(copilotSuggestionField, { id: blockId, text });
          });
        },
        stop: () => {
          const { abortController } = getOptions();

          debouncedTrigger?.cancel();

          if (abortController) {
            abortController.abort();
            setOption('abortController', null);
          }
        },
      };
    }
  )
  .extendApi(({ api, editor, getOptions, setOptions }) => ({
    reject: () => {
      if (!getOptions().suggestionText?.length) return false;

      api.stop();

      editor.update.history.skip((tx) => {
        tx.setField(copilotSuggestionField, { id: null, text: null });
      });
      setOptions({ completion: null });
    },
  }))
  .extendTx(({ editor }) => (tx) => ({
    accept: () => acceptCopilot(editor, tx),
    acceptNextWord: () => acceptCopilotNextWord(editor, tx),
  }))
  .extend({
    render: {
      belowNodes: renderCopilotBelowNodes,
    },
    shortcuts: {
      accept: {
        keys: 'tab',
      },
      reject: {
        keys: 'escape',
      },
    },
  });
