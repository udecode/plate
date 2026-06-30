import { useEditorRef, useHotkeys, usePluginOption } from 'platejs/react';

import { LinkPlugin } from '../../LinkPlugin';
import { submitFloatingLink } from '../../transforms/submitFloatingLink';

export const useFloatingLinkEnter = () => {
  const editor = useEditorRef();

  const open = usePluginOption(LinkPlugin, 'isOpen', editor.id);

  useHotkeys(
    '*',
    (e) => {
      if (e.key !== 'Enter') return;
      // `keyCode === 229` is the Safari + Japanese IME composition-commit Enter,
      // where `isComposing` is false. Ignore it so it doesn't submit the link
      // mid-composition. Mirrors the Enter guard in `cmdk`.
      if (e.isComposing || e.keyCode === 229) return;
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
