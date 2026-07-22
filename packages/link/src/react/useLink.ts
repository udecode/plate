import { useEditor } from '@platejs/core/react';
import type { TLinkElement } from '@platejs/utils';

import { BaseLinkPlugin } from '../lib';

export const useLink = ({ element }: { element: TLinkElement }) => {
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
