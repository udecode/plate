import type { OverrideEditor, PlateEditor } from '@udecode/plate/react';

import {
  type Operation,
  type SlateEditor,
  type TRange,
  RangeApi,
} from '@udecode/plate';
import { serializeInlineMd } from '@udecode/plate-markdown';

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

export const withCopilot: OverrideEditor<CopilotPluginConfig> = ({
  api,
  editor,
  getOptions,
  setOption,
  tf: { apply, insertText, redo, setSelection, undo, writeHistory },
}) => {
  let prevSelection: TRange | null = null;

  return {
    transforms: {
      apply(operation) {
        const { shouldAbort } = getOptions();

        if (shouldAbort) {
          api.copilot.reset();
        }

        apply(operation);
      },
      insertText(text, options) {
        const suggestionText = getOptions().suggestionText;

        // When using IME input, it's possible to enter two characters at once.
        if (suggestionText?.startsWith(text)) {
          withoutAbort(editor, () => {
            editor.tf.withoutMerging(() => {
              const newText = suggestionText?.slice(text.length);
              setOption('suggestionText', newText);
              insertText(text);
            });
          });

          return;
        }

        insertText(text, options);
      },

      redo() {
        if (!getOptions().suggestionText) return redo();

        const topRedo = editor.history.redos.at(-1) as CopilotBatch;
        const prevSuggestion = getOptions().suggestionText;

        if (topRedo && topRedo.shouldAbort === false && prevSuggestion) {
          withoutAbort(editor, () => {
            const shouldRemoveText = getPatchString(editor, topRedo.operations);

            const newText = prevSuggestion.slice(shouldRemoveText.length);
            setOption('suggestionText', newText);

            redo();
          });

          return;
        }

        return redo();
      },

      setSelection(props) {
        setSelection(props);

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
      },

      undo() {
        if (!getOptions().suggestionText) return undo();

        const lastUndos = editor.history.undos.at(-1) as CopilotBatch;
        const oldText = getOptions().suggestionText;

        if (lastUndos && lastUndos.shouldAbort === false && oldText) {
          withoutAbort(editor, () => {
            const shouldInsertText = getPatchString(
              editor,
              lastUndos.operations
            );

            const newText = shouldInsertText + oldText;
            setOption('suggestionText', newText);

            undo();
          });

          return;
        }

        return undo();
      },

      writeHistory(stacks, batch) {
        if (!getOptions().isLoading) {
          batch.shouldAbort = getOptions().shouldAbort;
        }

        return writeHistory(stacks, batch);
      },
    },
  };
};
