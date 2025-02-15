import type { PlateEditor } from '@udecode/plate/react';

import type { TCommentText } from '../types';

export const getCommentTop = (
  editor: PlateEditor,
  {
    node,
    relativeElement,
    topOffset = 30,
  }: {
    node: TCommentText;
    relativeElement: HTMLDivElement;
    topOffset?: number;
  }
) => {
  const commentLeafDomNode = editor.api.toDOMNode(node);

  const relativeElementRect = relativeElement.getBoundingClientRect();
  const commentLeafRect = commentLeafDomNode!.getBoundingClientRect();

  const top = commentLeafRect.top - relativeElementRect.top;

  return top > topOffset ? top - topOffset : 0;
};
