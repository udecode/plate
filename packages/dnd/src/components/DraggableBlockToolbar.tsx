import { useRef } from 'react';
import { ConnectDragSource } from 'react-dnd';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  TElement,
  useComposedRef,
} from '@udecode/plate-core';

export type DraggableBlockToolbarProps = {
  element: TElement;
  dragRef: ConnectDragSource;
} & HTMLPropsAs<'div'>;
export const useDraggableBlockToolbarProps = ({
  element,
  dragRef,
  ...props
}: DraggableBlockToolbarProps): HTMLPropsAs<'div'> => {
  const dragWrapperRef = useRef(null);

  const multiDragRef = useComposedRef<HTMLDivElement>(dragRef, dragWrapperRef);

  return {
    ...props,
    ref: useComposedRef<HTMLDivElement>(props.ref, multiDragRef),
  };
};
export const DraggableBlockToolbar = createComponentAs<DraggableBlockToolbarProps>(
  (props) => {
    const htmlProps = useDraggableBlockToolbarProps(props);
    return createElementAs('div', htmlProps);
  }
);
