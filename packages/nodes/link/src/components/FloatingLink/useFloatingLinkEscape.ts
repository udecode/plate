import { focusEditor, useEditorRef, useHotkeys } from '@udecode/plate-core';
import {
  floatingLinkActions,
  floatingLinkSelectors,
} from './floatingLinkStore';

export const useFloatingLinkEscape = () => {
  const editor = useEditorRef();

  useHotkeys(
    'escape',
    () => {
      if (floatingLinkSelectors.mode() !== 'insert') return;

      floatingLinkActions.hide();
      focusEditor(editor, editor.selection!);
    },
    {
      enableOnContentEditable: true,
      enableOnTags: ['INPUT'],
    },
    []
  );
};
