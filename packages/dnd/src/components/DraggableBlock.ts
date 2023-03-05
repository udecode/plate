import { useRef } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useComposedRef,
} from '@udecode/plate-core';

export type DraggableBlockProps = {} & HTMLPropsAs<'div'>;

export const useDraggableBlockProps = (
  props: DraggableBlockProps
): HTMLPropsAs<'div'> => {
  const blockRef = useRef<HTMLDivElement>(null);

  return {
    ...props,
    ref: useComposedRef<HTMLDivElement>(props.ref, blockRef),
  };
};

export const DraggableBlock = createComponentAs<DraggableBlockProps>(
  (props) => {
    const htmlProps = useDraggableBlockProps(props);

    return createElementAs('div', htmlProps);
  }
);
