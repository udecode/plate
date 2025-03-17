import {
  useEditorRef,
  useHotkeys,
  usePluginOption,
} from '@udecode/plate/react';

import { LinkPlugin } from '../../LinkPlugin';
import { submitFloatingLink } from '../../transforms/submitFloatingLink';

export const useFloatingLinkEnter = () => {
  const editor = useEditorRef();

  const open = usePluginOption(LinkPlugin, 'isOpen', editor.id);

  useHotkeys(
    '*',
    (e) => {
      if (e.key !== 'Enter') return;
      if (submitFloatingLink(editor)) {
        e.preventDefault();
      }
    },
    {
      enabled: open,
      enableOnFormTags: ['INPUT'],
    },
    []
  );
};
