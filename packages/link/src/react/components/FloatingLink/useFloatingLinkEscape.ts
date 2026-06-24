import { useEditorPlugin, useHotkeys, usePluginOption } from 'platejs/react';

import { LinkPlugin } from '../../LinkPlugin';
import { focusEditorAtSelection } from '../../utils';

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
        focusEditorAtSelection(editor);

        return;
      }
      if (mode === 'insert') {
        focusEditorAtSelection(editor);
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
