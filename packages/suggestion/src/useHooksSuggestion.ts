import { useEffect } from 'react';
import {
  PlateEditor,
  usePlateSelectors,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { findSuggestionNode } from './queries/index';
import { useSetActiveSuggestionId } from './store/useSetActiveSuggestionId';
import { getSuggestionId } from './utils/getSuggestionId';
import { SuggestionPlugin } from './types';

export const useHooksSuggestion = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  // eslint-disable-next-line unused-imports/no-unused-vars
  plugin: WithPlatePlugin<SuggestionPlugin>
) => {
  const key = usePlateSelectors().keyEditor();
  const setActiveSuggestionId = useSetActiveSuggestionId();

  /**
   * Set the active suggestion to the selected suggestion (or the first such
   * suggestion if there are multiple). If there is no selected suggestion,
   * set the active suggestion to null.
   */
  useEffect(() => {
    if (!editor.selection) return;

    const resetActiveSuggestion = () => {
      setActiveSuggestionId(null);
    };

    const suggestionEntry = findSuggestionNode(editor);
    if (!suggestionEntry) return resetActiveSuggestion();

    const [suggestionNode] = suggestionEntry;

    const id = getSuggestionId(suggestionNode);
    if (!id) return resetActiveSuggestion();

    setActiveSuggestionId(id);
  }, [editor, key, setActiveSuggestionId]);
};
