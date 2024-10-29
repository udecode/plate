'use client';

import type React from 'react';

import type { DebouncedFunc } from 'lodash';

import {
  type OmitFirst,
  type PluginConfig,
  type TElement,
  bindFirst,
  getAncestorNode,
  getBlockAbove,
  getNodeString,
  isBlockAboveEmpty,
  isExpanded,
  isSelectionAtBlockEnd,
} from '@udecode/plate-common';
import {
  type PlateEditor,
  Key,
  createTPlatePlugin,
} from '@udecode/plate-common/react';
import { serializeMdNodes } from '@udecode/plate-markdown';

import type { CompleteOptions } from './utils/callCompletionApi';

import { renderCopilotBelowNodes } from './renderCopilotBelowNodes';
import { acceptCopilot } from './transforms/acceptCopilot';
import { acceptCopilotNextWord } from './transforms/acceptCopilotNextWord';
import { type GetNextWord, getNextWord } from './utils/getNextWord';
import { triggerCopilotSuggestion } from './utils/triggerCopilotSuggestion';
import { withCopilot } from './withCopilot';

type CompletionState = {
  abortController?: AbortController | null;
  // The current text completion.
  completion?: string | null;
  // The error thrown during the completion process, if any.
  error?: Error | null;
  // Boolean flag indicating whether a fetch operation is currently in progress.
  isLoading?: boolean;
};

export type CopilotPluginConfig = PluginConfig<
  'copilot',
  CompletionState & {
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
    /**
     * Get the prompt for AI completion.
     *
     * @default serializeMdNodes(getAncestorNode(editor))
     */
    getPrompt?: (options: { editor: PlateEditor }) => string;
    /** Render the ghost text. */
    renderGhostText?: (() => React.ReactNode) | null;
    shouldAbort?: boolean;
    /** The node id where the suggestion is located. */
    suggestionNodeId?: string | null;
    /** The text of the suggestion. */
    suggestionText?: string | null;
    /**
     * Conditions to trigger copilot. Disabling defaults to:
     *
     * - Selection is expanded
     * - Selection is not at the end of block
     */
    triggerQuery?: (options: { editor: PlateEditor }) => boolean;
    // query?: QueryEditorOptions;
  } & CopilotSelectors,
  {
    copilot: CopilotApi;
  }
>;

type CopilotSelectors = {
  isSuggested?: (id: string) => boolean;
};

type CopilotApi = {
  accept: OmitFirst<typeof acceptCopilot>;
  acceptNextWord: OmitFirst<typeof acceptCopilotNextWord>;
  // Function to abort the current API request and reset the completion state.
  reset: () => void;
  setBlockSuggestion: (options: { text: string; id?: string }) => void;
  // Function to abort the current API request.
  stop: () => void;
  triggerSuggestion: OmitFirst<typeof triggerCopilotSuggestion>;
};

export const CopilotPlugin = createTPlatePlugin<CopilotPluginConfig>({
  key: 'copilot',
  options: {
    abortController: null,
    autoTriggerQuery: ({ editor }) => {
      if (
        editor.getOptions<CopilotPluginConfig>({ key: 'copilot' })
          .suggestionText
      ) {
        return false;
      }

      const isEmpty = isBlockAboveEmpty(editor);

      if (isEmpty) return false;

      const blockAbove = getBlockAbove(editor);

      if (!blockAbove) return false;

      const blockString = getNodeString(blockAbove[0]);

      return blockString.at(-1) === ' ';
    },
    completeOptions: {},
    completion: '',
    debounceDelay: 0,
    error: null,
    getNextWord: getNextWord,
    getPrompt: ({ editor }) => {
      const contextEntry = getAncestorNode(editor);

      if (!contextEntry) return '';

      return serializeMdNodes([contextEntry[0] as TElement]);
    },
    isLoading: false,
    renderGhostText: null,
    shouldAbort: true,
    suggestionNodeId: null,
    suggestionText: null,
    triggerQuery: ({ editor }) => {
      if (isExpanded(editor.selection)) return false;

      const isEnd = isSelectionAtBlockEnd(editor);

      if (!isEnd) return false;

      return true;
    },
  },
  handlers: {
    onBlur: ({ api }) => {
      api.copilot.reset();
    },
  },
})
  .extendOptions<Required<CopilotSelectors>>(({ getOptions }) => ({
    isSuggested: (id) => getOptions().suggestionNodeId === id,
  }))
  .extendApi<Omit<CopilotApi, 'reset'>>(
    ({ api, editor, getOptions, setOption, setOptions }) => ({
      accept: bindFirst(acceptCopilot, editor),
      acceptNextWord: bindFirst(acceptCopilotNextWord, editor),
      setBlockSuggestion: ({ id = getOptions().suggestionNodeId, text }) => {
        if (!id) {
          id = getBlockAbove(editor)![0].id;
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
      triggerSuggestion: bindFirst(triggerCopilotSuggestion, editor),
    })
  )
  .extendApi(({ api, setOptions }) => ({
    reset: () => {
      api.copilot.stop();

      setOptions({
        completion: null,
        suggestionNodeId: null,
        suggestionText: null,
      });
    },
  }))
  .extend({
    extendEditor: withCopilot,
    render: {
      belowNodes: renderCopilotBelowNodes,
    },
  })
  .extend(({ api, getOptions }) => {
    return {
      shortcuts: {
        acceptCopilot: {
          keys: [[Key.Tab]],
          handler: ({ event }) => {
            if (!getOptions().suggestionText?.length) return;

            event.preventDefault();
            api.copilot.accept();
          },
        },
        acceptCopilotNextWord: {
          keys: [[Key.Meta, Key.ArrowRight]],
          handler: ({ event }) => {
            if (!getOptions().suggestionText?.length) return;

            event.preventDefault();
            api.copilot.acceptNextWord();
          },
        },
        hideCopilot: {
          keys: [[Key.Escape]],
          handler: ({ event }) => {
            if (!getOptions().suggestionText?.length) return;

            event.preventDefault();
            api.copilot.reset();
          },
        },
        triggerCopilot: {
          keys: [[Key.Control, 'space']],
          preventDefault: true,
          handler: () => {
            void api.copilot.triggerSuggestion();
          },
        },
      },
    };
  });
