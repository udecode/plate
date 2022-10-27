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
      if (floatingLinkSelectors.mode() !== 'edit') return;

      if (floatingLinkSelectors.isEditing()) {
        floatingLinkActions.show('edit');
        focusEditor(editor, editor.selection!);
        return;
      }

      floatingLinkActions.hide();
    },
    {
      enableOnTags: ['INPUT'],
      enableOnContentEditable: true,
    },
    []
  );
};
