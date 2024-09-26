import React from 'react';

import type { InsertTextOperation } from 'slate';

import {
  type PluginConfig,
  type QueryNodeOptions,
  withoutMergingHistory,
} from '@udecode/plate-common';
import {
  ParagraphPlugin,
  createTPlatePlugin,
} from '@udecode/plate-common/react';

import { generateCopilotTextDebounce } from './generateCopilotText';
import { InjectCopilot } from './injectCopilot';
import { onKeyDownCopilot } from './onKeyDownCopilot';
import { withoutAbort } from './utils/withoutAbort';

export interface CopilotHoverCardProps {
  suggestionText: string;
}

export interface FetchCopilotSuggestionProps {
  abortSignal: AbortController;
  prompt: string;
}

export type CopilotPluginConfig = PluginConfig<
  'copilot',
  {
    hoverCard: (props: CopilotHoverCardProps) => JSX.Element;
    abortController?: AbortController | null;
    completedNodeId?: string | null;
    copilotState?: 'completed' | 'idle';
    enableDebounce?: boolean;
    enableShortCut?: boolean;
    fetchSuggestion?: (props: FetchCopilotSuggestionProps) => Promise<string>;
    query?: QueryNodeOptions;
    shouldAbort?: boolean;
    suggestionText?: string | null;
  } & CopilotApi &
    CopilotSelectors
>;

type CopilotSelectors = {
  isCompleted?: (id: string) => boolean;
};

type CopilotApi = {
  abortCopilot?: () => void;
  setCopilot?: (id: string, text: string) => void;
};

export const CopilotPlugin = createTPlatePlugin<CopilotPluginConfig>({
  key: 'copilot',
  options: {
    copilotState: 'idle',
    enableDebounce: false,
    hoverCard: (props) => <span>{props.suggestionText}</span>,
    query: {
      allow: [ParagraphPlugin.key],
    },
    shouldAbort: true,
  },
})
  .extendOptions<Required<CopilotSelectors>>(({ getOptions }) => ({
    isCompleted: (id) => getOptions().completedNodeId === id,
  }))
  .extendApi<Required<CopilotApi>>(({ getOptions, setOptions }) => ({
    abortCopilot: () => {
      const { abortController } = getOptions();

      abortController?.abort();

      setOptions({
        abortController: null,
        completedNodeId: null,
        copilotState: 'idle',
      });
    },
    setCopilot: (id, text) => {
      setOptions({
        completedNodeId: id,
        copilotState: 'completed',
        suggestionText: text,
      });
    },
  }))
  .extend({
    extendEditor: ({ api, editor, getOptions, setOptions }) => {
      type CopilotBatch = (typeof editor.history.undos)[number] & {
        shouldAbort: boolean;
      };

      const { apply, insertText, redo, setSelection, undo, writeHistory } =
        editor;

      editor.undo = () => {
        if (getOptions().copilotState === 'idle') return undo();

        const topUndo = editor.history.undos.at(-1) as CopilotBatch;
        const oldText = getOptions().suggestionText;

        if (
          topUndo &&
          topUndo.shouldAbort === false &&
          topUndo.operations[0].type === 'insert_text' &&
          oldText
        ) {
          withoutAbort(editor, () => {
            const shouldInsertText = (
              topUndo.operations[0] as InsertTextOperation
            ).text;

            const newText = shouldInsertText + oldText;
            setOptions({ suggestionText: newText });

            undo();
          });

          return;
        }

        return undo();
      };

      editor.redo = () => {
        if (getOptions().copilotState === 'idle') return redo();

        const topRedo = editor.history.redos.at(-1) as CopilotBatch;
        const oldText = getOptions().suggestionText;

        if (
          topRedo &&
          topRedo.shouldAbort === false &&
          topRedo.operations[0].type === 'insert_text' &&
          oldText
        ) {
          withoutAbort(editor, () => {
            const shouldRemoveText = (
              topRedo.operations[0] as InsertTextOperation
            ).text;

            const newText = oldText.slice(shouldRemoveText.length);
            setOptions({ suggestionText: newText });

            redo();
          });

          return;
        }

        return redo();
      };

      editor.writeHistory = (stacks, batch) => {
        if (getOptions().copilotState === 'idle')
          return writeHistory(stacks, batch);

        const { shouldAbort } = getOptions();
        batch.shouldAbort = shouldAbort;

        return writeHistory(stacks, batch);
      };

      editor.insertText = (text) => {
        if (getOptions().copilotState === 'idle') return insertText(text);

        const oldText = getOptions().suggestionText;

        if (text.length === 1 && text === oldText?.at(0)) {
          withoutAbort(editor, () => {
            withoutMergingHistory(editor, () => {
              const newText = oldText?.slice(1);
              setOptions({ suggestionText: newText });
              insertText(text);
            });
          });

          return;
        }

        insertText(text);
      };

      editor.apply = (operation) => {
        const { shouldAbort } = getOptions();

        if (shouldAbort) {
          api.copilot.abortCopilot();
        }

        apply(operation);
      };

      editor.setSelection = (selection) => {
        if (getOptions().enableDebounce) {
          void generateCopilotTextDebounce(editor, { isDebounce: true });
        }

        return setSelection(selection);
      };

      return editor;
    },
    render: {
      // TODO: type
      belowNodes: InjectCopilot as any,
    },
    handlers: {
      onKeyDown: onKeyDownCopilot as any,
    },
  });
