import { isSlateEditor, isSlateElement, isSlateString } from '@udecode/plate';
import { toPlatePlugin } from '@udecode/plate/react';

import { findInlineSuggestionNode, getInlineSuggestionId } from '../lib';
import { BaseSuggestionPlugin } from '../lib/BaseSuggestionPlugin';

/** @experimental Enables support for suggestions in the editor. */
export const SuggestionPlugin = toPlatePlugin(BaseSuggestionPlugin, {
  handlers: {
    // unset active suggestion when clicking outside of suggestion
    onClick: ({ editor, event, setOption }) => {
      let leaf = event.target as HTMLElement;
      let isSet = false;

      const unsetActiveSuggestion = () => {
        setOption('activeId', null);
        isSet = true;
      };

      if (!isSlateString(leaf)) unsetActiveSuggestion();

      while (
        leaf.parentElement &&
        !isSlateElement(leaf.parentElement) &&
        !isSlateEditor(leaf.parentElement)
      ) {
        if (leaf.classList.contains(`slate-${BaseSuggestionPlugin.key}`)) {
          const suggestionEntry = findInlineSuggestionNode(editor);

          if (!suggestionEntry) {
            unsetActiveSuggestion();

            break;
          }

          const id = getInlineSuggestionId(suggestionEntry[0]);

          setOption('activeId', id ?? null);
          isSet = true;

          break;
        }

        leaf = leaf.parentElement;
      }

      if (!isSet) unsetActiveSuggestion();
    },
  },
});
