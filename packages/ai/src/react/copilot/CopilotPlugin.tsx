'use client';

import type React from 'react';

import type { DebouncedFunc } from 'lodash';

import { serializeMd } from '@platejs/markdown';
import debounce from 'lodash/debounce.js';
import {
  type OmitFirst,
  type PluginConfig,
  type TElement,
  bindFirst,
  KEYS,
  NodeApi,
} from 'platejs';
import { type PlateEditor, createTPlatePlugin } from 'platejs/react';

import type { CompleteOptions } from './utils/callCompletionApi';

import { renderCopilotBelowNodes } from './renderCopilotBelowNodes';
import { acceptCopilot } from './transforms/acceptCopilot';
import { acceptCopilotNextWord } from './transforms/acceptCopilotNextWord';
import { type GetNextWord, getNextWord } from './utils/getNextWord';
import { triggerCopilotSuggestion } from './utils/triggerCopilotSuggestion';
import { withCopilot } from './withCopilot';

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
     * @default serializeMdNodes(editor.api.block({ highest: true }))
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
      triggerSuggestion: OmitFirst<typeof triggerCopilotSuggestion>;
      // Function to abort the current API request and reject the completion state.
      reject: () => false | undefined;
      setBlockSuggestion: (options: { text: string; id?: string }) => void;
      // Function to abort the current API request.
      stop: () => void;
    };
  },
  {
    copilot: {
      accept: OmitFirst<typeof acceptCopilot>;
      acceptNextWord: OmitFirst<typeof acceptCopilotNextWord>;
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

export const CopilotPlugin = createTPlatePlugin<CopilotPluginConfig>({
  key: KEYS.copilot,
  handlers: {
    onBlur: ({ api }) => {
      api.copilot.reject();
    },
    onMouseDown: ({ api }) => {
      api.copilot.reject();
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
        editor.getOptions<CopilotPluginConfig>({ key: KEYS.copilot })
          .suggestionText
      ) {
        return false;
      }

      const isEmpty = editor.api.isEmpty(editor.selection, { block: true });

      if (isEmpty) return false;

      const blockAbove = editor.api.block();

      if (!blockAbove) return false;

      const blockString = NodeApi.string(blockAbove[0]);

      return blockString.at(-1) === ' ';
    },
    getPrompt: ({ editor }) => {
      const contextEntry = editor.api.block({ highest: true });

      if (!contextEntry) return '';

      return serializeMd(editor, {
        value: [contextEntry[0] as TElement],
      });
    },
    triggerQuery: ({ editor }) => {
      if (editor.api.isExpanded()) return false;

      const isEnd = editor.api.isAt({ end: true });

      if (!isEnd) return false;

      return true;
    },
  },
})
  .overrideEditor(withCopilot)
  .extendSelectors<CopilotPluginConfig['selectors']>(({ getOptions }) => ({
    isSuggested: (id) => getOptions().suggestionNodeId === id,
  }))
  .extendTransforms(({ editor }) => ({
    accept: bindFirst(acceptCopilot, editor),
    acceptNextWord: bindFirst(acceptCopilotNextWord, editor),
  }))
  .extendApi<Omit<CopilotPluginConfig['api']['copilot'], 'reject'>>(
    ({ api, editor, getOptions, setOption, setOptions }) => {
      const debounceDelay = getOptions().debounceDelay;

      let triggerSuggestion = bindFirst(triggerCopilotSuggestion, editor);

      if (debounceDelay) {
        triggerSuggestion = debounce(
          bindFirst(triggerCopilotSuggestion, editor),
          debounceDelay
        ) as any;
      }

      return {
        triggerSuggestion,
        setBlockSuggestion: ({ id = getOptions().suggestionNodeId, text }) => {
          if (!id) {
            id = editor.api.block()![0].id as string;
          }

          setOptions({
            suggestionNodeId: id,
            suggestionText: text,
          });
        },
        stop: () => {
          const { abortController } = getOptions();

          (api.copilot.triggerSuggestion as DebouncedFunc<any>)?.cancel();

          if (abortController) {
            abortController.abort();
            setOption('abortController', null);
          }
        },
      };
    }
  )
  .extendApi(({ api, getOptions, setOptions }) => ({
    reject: () => {
      if (!getOptions().suggestionText?.length) return false;

      api.copilot.stop();

      setOptions({
        completion: null,
        suggestionNodeId: null,
        suggestionText: null,
      });
    },
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
