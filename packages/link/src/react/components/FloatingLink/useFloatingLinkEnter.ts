import { useEditorPlugin, useHotkeys } from '@udecode/plate-common/react';

import { LinkPlugin } from '../../LinkPlugin';
import { submitFloatingLink } from '../../transforms/submitFloatingLink';

export const useFloatingLinkEnter = () => {
  const { editor, useOption } = useEditorPlugin(LinkPlugin);

  const open = useOption('isOpen', editor.id);

  useHotkeys(
    '*',
    (e) => {
      if (e.key !== 'Enter') return;
      if (submitFloatingLink(editor)) {
        e.preventDefault();
      }
    },
    {
      enableOnFormTags: ['INPUT'],
      enabled: open,
    },
    []
  );
};
