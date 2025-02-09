import React from 'react';

import type { UseHooks } from '@udecode/plate/react';

import { useEditorVersion } from '@udecode/plate/react';

import {
  type SuggestionConfig,
  findSuggestionNode,
  getSuggestionKeyId,
} from '../lib';

export const useHooksSuggestion: UseHooks<SuggestionConfig> = ({
  editor,
  setOption,
}) => {
  const version = useEditorVersion();

  /**
   * Set the active suggestion to the selected suggestion (or the first such
   * suggestion if there are multiple). If there is no selected suggestion, set
   * the active suggestion to null.
   */
  React.useEffect(() => {
    if (!editor.selection) return;

    const resetActiveSuggestion = () => {
      setOption('activeSuggestionId', null);
    };

    const suggestionEntry = findSuggestionNode(editor);

    if (!suggestionEntry) return resetActiveSuggestion();

    const [suggestionNode] = suggestionEntry;

    const id = getSuggestionKeyId(suggestionNode);

    if (!id) return resetActiveSuggestion();

    setOption('activeSuggestionId', id);
  }, [editor, version, setOption]);
};
