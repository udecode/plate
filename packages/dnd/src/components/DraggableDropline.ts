import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type DraggableDroplineProps = {} & HTMLPropsAs<'div'>;

export const useDraggableDroplineProps = (
  props: DraggableDroplineProps
): HTMLPropsAs<'div'> => {
  return {
    contentEditable: false,
    ...props,
  };
};

export const DraggableDropline = createComponentAs<DraggableDroplineProps>(
  (props) => {
    const htmlProps = useDraggableDroplineProps(props);

    return createElementAs('div', htmlProps);
  }
);
