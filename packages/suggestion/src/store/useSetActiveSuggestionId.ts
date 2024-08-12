import type { PlateEditor } from '@udecode/plate-common';

import { useEditorRef } from '@udecode/plate-common/react';

import type { SuggestionEditorProps } from '../types';

import { useSuggestionActions } from './SuggestionProvider';

export const useSetActiveSuggestionId = () => {
  const editor = useEditorRef<PlateEditor & SuggestionEditorProps>();
  const setActiveSuggestionId = useSuggestionActions().activeSuggestionId();

  return (value: null | string) => {
    setActiveSuggestionId(value);
    editor.activeSuggestionId = value;
  };
};
