import { useEditorPlugin, usePluginOption } from '@platejs/core/react';
import { useHotkeys } from '@udecode/react-hotkeys';

import { LinkPlugin } from '../../LinkPlugin';

export const useFloatingLinkEscape = () => {
  const { api, editor, getOptions } = useEditorPlugin(LinkPlugin);

  const open = usePluginOption(LinkPlugin, 'isOpen', editor.id);

  useHotkeys(
    'escape',
    (e) => {
      const { isEditing, mode } = getOptions();

      if (!mode) return;

      e.preventDefault();

      if (mode === 'edit' && isEditing) {
        api.floatingLink.show('edit', editor.id);
        editor.api.dom.focus();

        return;
      }
      if (mode === 'insert') {
        editor.api.dom.focus();
      }

      api.floatingLink.hide();
    },
    {
      enabled: open,
      enableOnContentEditable: true,
      enableOnFormTags: ['INPUT'],
    },
    []
  );
};
