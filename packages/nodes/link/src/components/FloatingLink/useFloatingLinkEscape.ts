import { focusEditor, useEditorRef, useHotkeys } from '@udecode/plate-core';
import { floatingLinkActions } from './floatingLinkStore';

export const useFloatingLinkEscape = () => {
  const editor = useEditorRef();

  useHotkeys(
    'escape',
    () => {
      floatingLinkActions.hide();
      focusEditor(editor, editor.selection!);
    },
    {
      enableOnTags: ['INPUT'],
    },
    []
  );
};
