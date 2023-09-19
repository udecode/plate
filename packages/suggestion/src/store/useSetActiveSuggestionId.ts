import { PlateEditor, useEditorRef, Value } from '@udecode/plate-common';

import { SuggestionEditorProps } from '../types';
import { useSuggestionActions } from './SuggestionProvider';

export const useSetActiveSuggestionId = () => {
  const editor = useEditorRef<Value, PlateEditor & SuggestionEditorProps>();
  const setActiveSuggestionId = useSuggestionActions().activeSuggestionId();

  return (value: string | null) => {
    setActiveSuggestionId(value);
    editor.activeSuggestionId = value;
  };
};
