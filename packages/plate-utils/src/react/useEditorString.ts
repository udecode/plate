import { useEditorSelector } from '@udecode/plate-core/react';

export const useEditorString = () => {
  return useEditorSelector((editor) => editor.api.string([]), []);
};
