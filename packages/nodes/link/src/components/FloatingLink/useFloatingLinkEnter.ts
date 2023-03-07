import { useEditorRef, useHotkeys } from '@udecode/plate-common';
import { submitFloatingLink } from '../../transforms/submitFloatingLink';
import { useFloatingLinkSelectors } from './floatingLinkStore';

export const useFloatingLinkEnter = () => {
  const editor = useEditorRef();

  const open = useFloatingLinkSelectors().isOpen(editor.id);

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
