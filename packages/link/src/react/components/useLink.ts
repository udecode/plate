import type { TLinkElement } from 'platejs';

import { useEditorRef } from 'platejs/react';

import { getLinkAttributes } from '../../lib';

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
