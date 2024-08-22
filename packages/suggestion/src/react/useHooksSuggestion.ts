import React from 'react';

import type { PlateUseHooks } from '@udecode/plate-common/react';

import { useEditorVersion } from '@udecode/plate-common/react';

import { findSuggestionNode, getSuggestionId } from '../lib';
import { useSetActiveSuggestionId } from './store/useSetActiveSuggestionId';

export const useHooksSuggestion: PlateUseHooks = ({ editor }) => {
  const version = useEditorVersion();
  const setActiveSuggestionId = useSetActiveSuggestionId();

  /**
   * Set the active suggestion to the selected suggestion (or the first such
   * suggestion if there are multiple). If there is no selected suggestion, set
   * the active suggestion to null.
   */
  React.useEffect(() => {
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
