import type { SlateEditor } from '@udecode/plate-common';

import { useEditorRef } from '@udecode/plate-common/react';

import type { SuggestionEditorProps } from '../../lib';

import { useSuggestionActions } from './SuggestionProvider';

export const useSetIsSuggesting = () => {
  const editor = useEditorRef<SlateEditor & SuggestionEditorProps>();
  const setIsSuggesting = useSuggestionActions().isSuggesting();

  return (value: boolean) => {
    setIsSuggesting(value);
    editor.isSuggesting = value;
  };
};
