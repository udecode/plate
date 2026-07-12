import { useEditorRef } from '@platejs/core/react';
import type { TLinkElement } from '@platejs/utils';

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
