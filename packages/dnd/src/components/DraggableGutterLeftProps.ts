import {
  AsProps,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type DraggableGutterLeftProps = {} & HTMLPropsAs<'div'>;

export const useDraggableGutterLeft = (
  props: DraggableGutterLeftProps
): HTMLPropsAs<'div'> => {
  return {
    contentEditable: false,
    ...props,
  };
};

export const DraggableGutterLeft = createComponentAs<AsProps<'div'>>(
  (props) => {
    const htmlProps = useDraggableGutterLeft(props);

    return createElementAs('div', htmlProps);
  }
);
