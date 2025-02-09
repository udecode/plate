import { toPlatePlugin } from '@udecode/plate/react';

import { BaseSuggestionPlugin } from '../lib/BaseSuggestionPlugin';
import { useHooksSuggestion } from './useHooksSuggestion';
import { isSlateString } from '@udecode/plate';
import { findSuggestionNode, getSuggestionId } from '../lib';

/** Enables support for suggestions in the editor. */
export const SuggestionPlugin = toPlatePlugin(BaseSuggestionPlugin, {
  useHooks: useHooksSuggestion as any,
  handlers:{
    // unset active suggestion when clicking outside of suggestion
    onClick: ({ editor, event, setOption }) => {
      let leaf = event.target as HTMLElement;
      let isSet = false;

      const unsetActiveSuggestion = () => {
        setOption('activeSuggestionId', null);
        isSet = true;
      };

      if (!isSlateString(leaf)) unsetActiveSuggestion();

      while (leaf.parentElement) {
        if (leaf.classList.contains(`slate-${BaseSuggestionPlugin.key}`)) {
          const suggestionEntry = findSuggestionNode(editor);

          if (!suggestionEntry) {
            unsetActiveSuggestion();

            break;
          }

          const id = getSuggestionId(suggestionEntry[0]);

          setOption('activeSuggestionId', id ?? null);
          isSet = true;

          break;
        }

        leaf = leaf.parentElement;
      }

      if (!isSet) unsetActiveSuggestion();
    },
  }
});
