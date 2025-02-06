import {
  useEditorPlugin,
  useHotkeys,
  usePluginOption,
} from '@udecode/plate/react';

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
        editor.tf.focus({ at: editor.selection! });

        return;
      }
      if (mode === 'insert') {
        editor.tf.focus({ at: editor.selection! });
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
