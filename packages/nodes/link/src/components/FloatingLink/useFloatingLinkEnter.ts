import { useEditorRef, useHotkeys } from '@udecode/plate-core';
import { submitFloatingLink } from '../../transforms/submitFloatingLink';

export const useFloatingLinkEnter = () => {
  const editor = useEditorRef();

  useHotkeys(
    '*',
    (e) => {
      if (e.key !== 'Enter') return;

      if (submitFloatingLink(editor)) {
        e.preventDefault();
      }
    },
    {
      enableOnTags: ['INPUT'],
    },
    []
  );
};
