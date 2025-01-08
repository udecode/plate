import type { Operation } from '@udecode/plate';
import type { ExtendEditorTransforms, PlateEditor } from '@udecode/plate/react';

import { serializeInlineMd } from '@udecode/plate-markdown';

import type { CopilotPluginConfig } from './CopilotPlugin';

import { withoutAbort } from './utils/withoutAbort';

type CopilotBatch = PlateEditor['history']['undos'][number] & {
  shouldAbort: boolean;
};

const getPatchString = (operations: Operation[]) => {
  let string = '';

  for (const operation of operations) {
    if (operation.type === 'insert_node') {
      const node = operation.node;
      const text = serializeInlineMd([node as any]);
      string += text;
    } else if (operation.type === 'insert_text') {
      string += operation.text;
    }
  }

  return string;
};

export const withCopilot: ExtendEditorTransforms<CopilotPluginConfig> = ({
  api,
  editor,
  getOptions,
  setOption,
  tf: { apply, insertText, redo, undo, writeHistory },
}) => {
  return {
    apply(operation) {
      const { shouldAbort } = getOptions();

      if (shouldAbort) {
        api.copilot.reset();
      }

      apply(operation);
    },

    insertText(text) {
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

      insertText(text);
    },

    redo() {
      if (!getOptions().suggestionText) return redo();

      const topRedo = editor.history.redos.at(-1) as CopilotBatch;
      const prevSuggestion = getOptions().suggestionText;

      if (topRedo && topRedo.shouldAbort === false && prevSuggestion) {
        withoutAbort(editor, () => {
          const shouldRemoveText = getPatchString(topRedo.operations);

          const newText = prevSuggestion.slice(shouldRemoveText.length);
          setOption('suggestionText', newText);

          redo();
        });

        return;
      }

      return redo();
    },

    undo() {
      if (!getOptions().suggestionText) return undo();

      const lastUndos = editor.history.undos.at(-1) as CopilotBatch;
      const oldText = getOptions().suggestionText;

      if (lastUndos && lastUndos.shouldAbort === false && oldText) {
        withoutAbort(editor, () => {
          const shouldInsertText = getPatchString(lastUndos.operations);

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
  };
};
