import { useEffect } from 'react';
import {
  PlateEditor,
  useEditorVersion,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';

import { findSuggestionNode } from './queries/index';
import { useSetActiveSuggestionId } from './store/useSetActiveSuggestionId';
import { SuggestionPlugin } from './types';
import { getSuggestionId } from './utils/getSuggestionId';

export const useHooksSuggestion = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  // eslint-disable-next-line unused-imports/no-unused-vars
  plugin: WithPlatePlugin<SuggestionPlugin>
) => {
  const version = useEditorVersion();
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
  }, [editor, version, setActiveSuggestionId]);
};
