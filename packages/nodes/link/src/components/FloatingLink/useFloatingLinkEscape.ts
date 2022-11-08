import { focusEditor, useEditorRef, useHotkeys } from '@udecode/plate-core';
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
    () => {
      if (floatingLinkSelectors.mode() !== 'edit') return;

      if (floatingLinkSelectors.isEditing()) {
        floatingLinkActions.show('edit', editor.id);
        focusEditor(editor, editor.selection!);
        return;
      }

      floatingLinkActions.hide();
    },
    {
      enabled: open,
      enableOnTags: ['INPUT'],
      enableOnContentEditable: true,
    },
    []
  );
};
