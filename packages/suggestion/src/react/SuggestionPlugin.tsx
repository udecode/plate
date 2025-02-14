import { useEffect } from 'react';

import { isSlateEditor, isSlateElement, isSlateString } from '@udecode/plate';
import { toPlatePlugin, useEditorVersion } from '@udecode/plate/react';

import {
  findSuggestionNode,
  getAllSuggestionId,
  getSuggestionId,
} from '../lib';
import { BaseSuggestionPlugin } from '../lib/BaseSuggestionPlugin';
import { getAllSuggestionNodes } from '../lib/queries/getAllSuggestionNodes';

/** Enables support for suggestions in the editor. */
export const SuggestionPlugin = toPlatePlugin(BaseSuggestionPlugin, {
  handlers: {
    // unset active suggestion when clicking outside of suggestion
    onClick: ({ editor, event, setOption }) => {
      let leaf = event.target as HTMLElement;
      let isSet = false;

      const unsetActiveSuggestion = () => {
        setOption('activeSuggestionId', null);
        isSet = true;
      };

      if (!isSlateString(leaf)) unsetActiveSuggestion();

      while (
        leaf.parentElement &&
        !isSlateElement(leaf.parentElement) &&
        !isSlateEditor(leaf.parentElement)
      ) {
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
  },
  useHooks: ({ editor, getOption, setOption }) => {
    const version = useEditorVersion();
    useEffect(() => {
      setOption('uniquePathMap', new Map());

      const suggestionNodes = [...getAllSuggestionNodes(editor)];

      suggestionNodes.forEach(([node, path]) => {
        const id = getAllSuggestionId(node);
        const map = getOption('uniquePathMap');

        if (!id || map.has(id)) return;

        setOption('uniquePathMap', new Map(map).set(id, path.slice(0, 1)));
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [version]);
  },
});
