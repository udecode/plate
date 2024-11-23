import { useEditorSelector } from '@udecode/plate-core/react';
import { getEditorString } from '@udecode/slate';

export const useEditorString = () => {
  return useEditorSelector((editor) => getEditorString(editor, []), []);
};
