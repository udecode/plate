import { useEditorRef } from '@udecode/plate-common/react';

import { type TLinkElement, getLinkAttributes } from '../../lib';

export const useLink = ({ element }: { element: TLinkElement }) => {
  const editor = useEditorRef();

  return {
    props: {
      ...getLinkAttributes(editor, element),
      // quick fix: hovering <a> with href loses the editor focus
      onMouseOver: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
      },
    },
  };
};
