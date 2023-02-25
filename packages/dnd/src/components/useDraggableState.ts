import { useRef } from 'react';
import { TElement } from '@udecode/plate-core';
import { useDndBlock } from '../hooks';
import { DraggableState } from './DraggableRoot';

export const useDraggableState = (props: {
  element: TElement;
}): DraggableState => {
  const { element } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const { dropLine, isDragging, dragRef } = useDndBlock({
    id: element.id as string,
    nodeRef: rootRef,
  });

  return { dropLine, isDragging, rootRef, dragRef };
};
``;
