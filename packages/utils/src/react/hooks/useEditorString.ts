import { useEditorSelector } from '@platejs/core/react';

export const useEditorString = () => {
  return useEditorSelector((editor) => editor.api.string([]), []);
};
