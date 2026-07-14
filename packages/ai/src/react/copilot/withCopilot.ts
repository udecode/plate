import type { ExtendPlateEditorExtension } from '@platejs/core/react';

import { type Range, defineStateField, RangeApi } from '@platejs/plite';

import type { CopilotPluginConfig } from './CopilotPlugin';

import { withoutAbort } from './utils/withoutAbort';

export type CopilotSuggestionState = {
  id: string | null;
  text: string | null;
};

export const copilotSuggestionField = defineStateField<CopilotSuggestionState>({
  key: 'copilot.suggestion',
  collab: 'local',
  history: 'push',
  initial: () => ({ id: null, text: null }),
});

const isCopilotSuggestionState = (
  value: unknown
): value is CopilotSuggestionState =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  (typeof value.id === 'string' || value.id === null) &&
  'text' in value &&
  (typeof value.text === 'string' || value.text === null);

export const withCopilot: ExtendPlateEditorExtension<CopilotPluginConfig> = ({
  api,
  editor,
  getOptions,
  setOptions,
}) => {
  let prevSelection: Range | null = null;

  const rejectSuggestionMirror = () => {
    if (!getOptions().suggestionText?.length) return;

    api.stop();
    setOptions({
      completion: null,
      suggestionNodeId: null,
      suggestionText: null,
    });
  };

  return {
    onCommit({ commit }) {
      const patch = commit.statePatches.find(
        (statePatch) => statePatch.key === copilotSuggestionField.key
      );

      if (patch && 'value' in patch && isCopilotSuggestionState(patch.value)) {
        setOptions({
          suggestionNodeId: patch.value.id,
          suggestionText: patch.value.text,
        });
      }

      if (!commit.operations.some(({ type }) => type === 'set_selection')) {
        return;
      }

      const selection = editor.read.selection();
      const autoTriggerQuery = getOptions().autoTriggerQuery;

      if (
        selection &&
        (!prevSelection || !RangeApi.equals(prevSelection, selection)) &&
        autoTriggerQuery?.({ editor }) &&
        editor.read.view.isFocused()
      ) {
        void api.triggerSuggestion();
      }

      prevSelection = selection;
    },
    operations: {
      apply({ next, operation }) {
        if (getOptions().shouldAbort) {
          rejectSuggestionMirror();
        }

        next(operation);
      },
    },
    transforms: {
      insertText({ next, options, text, tx }) {
        const suggestionText = getOptions().suggestionText;

        // When using IME input, it's possible to enter two characters at once.
        if (suggestionText?.startsWith(text)) {
          return withoutAbort(editor, () => {
            const newText = suggestionText.slice(text.length);
            const suggestionNodeId = getOptions().suggestionNodeId;

            tx.setField(copilotSuggestionField, {
              id: suggestionNodeId ?? null,
              text: newText,
            });
            return next({ options, text });
          });
        }

        return next({ options, text });
      },
    },
  };
};
