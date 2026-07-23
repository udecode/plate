import type { ExtendPlateEditorExtension } from '@platejs/core/react';

import {
  defineEditorExtension,
  defineEffect,
  defineStateField,
  editorCommands,
  type EditorUpdateTransaction,
  type Range,
  RangeApi,
} from '@platejs/plite';

import type { CopilotPluginConfig } from './CopilotPlugin';

import { COPILOT_SKIP_ABORT_TAG, withoutAbort } from './utils/withoutAbort';

export type CopilotSuggestionState = {
  id: string | null;
  text: string | null;
};

type CopilotSuggestionTransition = {
  next: CopilotSuggestionState;
  previous: CopilotSuggestionState;
};

export const copilotSuggestionEffect =
  defineEffect<CopilotSuggestionTransition>({
    invert: ({ next, previous }) => ({ next: previous, previous: next }),
    key: 'copilot.suggestion',
  });

export const copilotSuggestionField = defineStateField<CopilotSuggestionState>({
  key: 'copilot.suggestion',
  collab: 'local',
  history: 'push',
  initial: () => ({ id: null, text: null }),
  reduce: (value, effect) =>
    effect.type === copilotSuggestionEffect ? effect.value.next : value,
});

export const copilotSuggestionEffectExtension = defineEditorExtension({
  effects: [copilotSuggestionEffect],
  name: 'copilot-suggestion-effect',
});

export const setCopilotSuggestion = (
  tx: Pick<EditorUpdateTransaction, 'effects' | 'getField'>,
  next: CopilotSuggestionState
) => {
  tx.effects.emit(copilotSuggestionEffect, {
    next,
    previous: tx.getField(copilotSuggestionField),
  });
};

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
      if (
        (!commit.changes.empty || commit.selectionChanged) &&
        getOptions().shouldAbort &&
        !commit.tags.includes(COPILOT_SKIP_ABORT_TAG)
      ) {
        rejectSuggestionMirror();
      }

      const effect = commit.effects.findLast(
        (candidate) => candidate.type === copilotSuggestionEffect
      );

      if (effect && isCopilotSuggestionState(effect.value.next)) {
        setOptions({
          suggestionNodeId: effect.value.next.id,
          suggestionText: effect.value.next.text,
        });
      }

      if (!commit.selectionChanged) {
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
    commands: ({ around }) => [
      around(editorCommands.insertText, ({ input, state, next }) => {
        const suggestionText = getOptions().suggestionText;

        // When using IME input, it's possible to enter two characters at once.
        if (suggestionText?.startsWith(input.text)) {
          const prefix = state.transaction((tx) => {
            const newText = suggestionText.slice(input.text.length);
            const suggestionNodeId = getOptions().suggestionNodeId;

            withoutAbort(tx, () => {
              setCopilotSuggestion(tx, {
                id: suggestionNodeId ?? null,
                text: newText,
              });
            });
          });

          return next.after(prefix);
        }

        return next();
      }),
    ],
  };
};
