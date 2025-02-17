import type { SlateEditor } from '@udecode/plate';

import type { TCommentText } from '../types';

// TODO: MOVE TO POTION CLIENT
export const getCommentTop = (
  editor: SlateEditor,
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
