import { useEditor } from '@platejs/core/react';
import type { LinkElement } from '../lib/BaseLinkPlugin';

import { BaseLinkPlugin } from '../lib';

export const useLink = ({ element }: { element: LinkElement }) => {
  const editor = useEditor();

  return {
    props: {
      ...editor.plugin(BaseLinkPlugin).api.getAttributes(element),
      // quick fix: hovering <a> with href loses the editor focus
      onMouseOver: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
      },
    },
  };
};
