import type { PlateEditor } from '@udecode/plate-common';

import { useEditorRef } from '@udecode/plate-common/react';

import type { SuggestionEditorProps } from '../types';

import { useSuggestionActions } from './SuggestionProvider';

export const useSetIsSuggesting = () => {
  const editor = useEditorRef<PlateEditor & SuggestionEditorProps>();
  const setIsSuggesting = useSuggestionActions().isSuggesting();

  return (value: boolean) => {
    setIsSuggesting(value);
    editor.isSuggesting = value;
  };
};
