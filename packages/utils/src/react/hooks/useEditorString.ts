import { useEditorSelector } from '@platejs/core/react';

export const useEditorString = () =>
  useEditorSelector((editor) => editor.api.string([]), []);
