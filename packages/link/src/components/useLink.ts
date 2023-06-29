import { usePlateEditorRef } from '@udecode/plate-common';

import { TLinkElement } from '../types';
import { getLinkAttributes } from '../utils/index';

export const useLink = ({ element }: { element: TLinkElement }) => {
  const editor = usePlateEditorRef();

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
