import { useMemo } from 'react';
import {
  getActiveSuggestionDescriptions,
  TSuggestionDescription,
  usePlateEditorRef,
  usePlateSelectors,
} from '@udecode/plate';

export const useFloatingSuggestionsContentState = () => {
  const editor = usePlateEditorRef();
  const key = usePlateSelectors().keyEditor();

  const descriptions: TSuggestionDescription[] = useMemo(() => {
    if (!key) return [];
    return getActiveSuggestionDescriptions(editor);
  }, [key, editor]);

  return {
    editor,
    descriptions,
  };
};
