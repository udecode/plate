import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  TElement,
} from '@udecode/plate-core';

export type PlateDragHandleProps = {
  element: TElement;
} & HTMLPropsAs<'button'>;
export const usePlateDragHandleProps = (
  props: PlateDragHandleProps
): HTMLPropsAs<'button'> => {
  return {
    ...props,
    onMouseDown: (e: any) => e.stopPropagation(),
  };
};
export const DragHandle = createComponentAs<PlateDragHandleProps>((props) => {
  const htmlProps = usePlateDragHandleProps(props);
  return createElementAs('button', htmlProps);
});
