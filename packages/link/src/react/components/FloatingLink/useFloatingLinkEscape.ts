import { useEditorPlugin, useHotkeys } from '@udecode/plate-common/react';

import { LinkPlugin } from '../../LinkPlugin';

export const useFloatingLinkEscape = () => {
  const { api, editor, getOptions, useOption } = useEditorPlugin(LinkPlugin);

  const open = useOption('isOpen', editor.id);

  useHotkeys(
    'escape',
    (e) => {
      const { isEditing, mode } = getOptions();

      if (!mode) return;

      e.preventDefault();

      if (mode === 'edit' && isEditing) {
        api.floatingLink.show('edit', editor.id);
        editor.focus(editor.selection!);

        return;
      }
      if (mode === 'insert') {
        editor.focus(editor.selection!);
      }

      api.floatingLink.hide();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: ['INPUT'],
      enabled: open,
    },
    []
  );
};
