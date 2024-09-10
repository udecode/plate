import React from 'react';

import type { UseHooks } from '@udecode/plate-common/react';

import { useEditorVersion } from '@udecode/plate-common/react';

import {
  type SuggestionConfig,
  findSuggestionNode,
  getSuggestionId,
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

    const id = getSuggestionId(suggestionNode);

    if (!id) return resetActiveSuggestion();

    setOption('activeSuggestionId', id);
  }, [editor, version, setOption]);
};
