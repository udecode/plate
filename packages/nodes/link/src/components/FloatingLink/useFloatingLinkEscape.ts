import { focusEditor, useEditorRef, useHotkeys } from '@udecode/plate-common';
import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';

export const useFloatingLinkEscape = () => {
  const editor = useEditorRef();

  const open = useFloatingLinkSelectors().isOpen(editor.id);

  useHotkeys(
    'escape',
    (e) => {
      if (!floatingLinkSelectors.mode()) return;

      e.preventDefault();

      if (
        floatingLinkSelectors.mode() === 'edit' &&
        floatingLinkSelectors.isEditing()
      ) {
        floatingLinkActions.show('edit', editor.id);
        focusEditor(editor, editor.selection!);
        return;
      }

      if (floatingLinkSelectors.mode() === 'insert') {
        focusEditor(editor, editor.selection!);
      }

      floatingLinkActions.hide();
    },
    {
      enabled: open,
      enableOnFormTags: ['INPUT'],
      enableOnContentEditable: true,
    },
    []
  );
};
