import type { PlateEditor } from 'platejs/react';

import { serializeInlineMd } from '@platejs/markdown';
import {
  type EditorExtensionInput,
  type Operation,
  type Range,
  type SlateEditor,
  defineEditorExtension,
  Editor as EditorApi,
  RangeApi,
} from 'platejs';
import type { PlatePluginContext } from 'platejs/react';

import type { CopilotPluginConfig } from './CopilotPlugin';

import { withoutAbort } from './utils/withoutAbort';

type CopilotBatch = PlateEditor['history']['undos'][number] & {
  shouldAbort: boolean;
};

const getPatchString = (editor: SlateEditor, operations: Operation[]) => {
  let string = '';

  for (const operation of operations) {
    if (operation.type === 'insert_node') {
      const node = operation.node;
      const text = serializeInlineMd(editor, { value: [node] });
      string += text;
    } else if (operation.type === 'insert_text') {
      string += operation.text;
    }
  }

  return string;
};

type HistoryCommand = {
  type: 'history_redo' | 'history_undo';
};

export const createCopilotExtension = ({
  api,
  editor,
  getOptions,
  setOption,
}: PlatePluginContext<CopilotPluginConfig>): EditorExtensionInput => {
  let prevSelection: Range | null = null;

  return defineEditorExtension({
    name: 'plate:copilot',
    operations: {
      apply({ next, operation }) {
        const { shouldAbort } = getOptions();

        if (shouldAbort) {
          api.copilot.reject();
        }

        next(operation);
      },
    },
    setup() {
      const unregisterRedo = EditorApi.registerCommand<HistoryCommand>(
        editor,
        'history_redo',
        (_context, next) => {
          if (!getOptions().suggestionText) return next();

          const topRedo = editor.history.redos.at(-1) as CopilotBatch;
          const prevSuggestion = getOptions().suggestionText;

          if (topRedo && topRedo.shouldAbort === false && prevSuggestion) {
            let result = false;

            withoutAbort(editor, () => {
              const shouldRemoveText = getPatchString(
                editor,
                topRedo.operations
              );

              const newText = prevSuggestion.slice(shouldRemoveText.length);
              setOption('suggestionText', newText);

              result = next();
            });

            return result;
          }

          return next();
        },
        { priority: 100 }
      );

      const unregisterUndo = EditorApi.registerCommand<HistoryCommand>(
        editor,
        'history_undo',
        (_context, next) => {
          if (!getOptions().suggestionText) return next();

          const lastUndos = editor.history.undos.at(-1) as CopilotBatch;
          const oldText = getOptions().suggestionText;

          if (lastUndos && lastUndos.shouldAbort === false && oldText) {
            let result = false;

            withoutAbort(editor, () => {
              const shouldInsertText = getPatchString(
                editor,
                lastUndos.operations
              );

              const newText = shouldInsertText + oldText;
              setOption('suggestionText', newText);

              result = next();
            });

            return result;
          }

          return next();
        },
        { priority: 100 }
      );

      return {
        cleanup() {
          unregisterRedo();
          unregisterUndo();
        },
        onCommit() {
          if (getOptions().isLoading) return;

          const lastBatch = editor.history.undos.at(-1) as
            | CopilotBatch
            | undefined;

          if (lastBatch && lastBatch.shouldAbort === undefined) {
            lastBatch.shouldAbort = getOptions().shouldAbort ?? true;
          }
        },
      };
    },
    transforms: {
      insertText({ next, options, text }) {
        const suggestionText = getOptions().suggestionText;

        // When using IME input, it's possible to enter two characters at once.
        if (suggestionText?.startsWith(text)) {
          withoutAbort(editor, () => {
            editor.api.history.withoutMerging(() => {
              const newText = suggestionText?.slice(text.length);
              setOption('suggestionText', newText);
              next({ options, text });
            });
          });

          return true;
        }

        return next({ options, text });
      },
      setSelection({ next, props }) {
        const handled = next({ props });

        if (
          editor.selection &&
          (!prevSelection ||
            !RangeApi.equals(prevSelection, editor.selection)) &&
          getOptions().autoTriggerQuery!({ editor }) &&
          editor.api.isFocused()
        ) {
          void api.copilot.triggerSuggestion();
        }

        prevSelection = editor.selection;

        return handled;
      },
    },
  });
};
