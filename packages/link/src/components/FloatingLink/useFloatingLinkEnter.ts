import { useHotkeys, usePlateEditorRef } from '@udecode/plate-common';
import { submitFloatingLink } from '../../transforms/submitFloatingLink';
import { useFloatingLinkSelectors } from './floatingLinkStore';

export const useFloatingLinkEnter = () => {
  const editor = usePlateEditorRef();

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
