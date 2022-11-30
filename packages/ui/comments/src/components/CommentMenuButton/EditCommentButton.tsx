import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type EditCommentButtonProps = {} & HTMLPropsAs<'div'>;

export const useEditCommentButton = (
  props: EditCommentButtonProps
): HTMLPropsAs<'div'> => {
  return { onClick: () => {}, ...props };
};

export const EditCommentButton = createComponentAs<EditCommentButtonProps>(
  (props) => {
    const htmlProps = useEditCommentButton(props);
    return createElementAs('div', htmlProps);
  }
);
