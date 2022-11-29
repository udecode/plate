import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type CommentValueCancelButtonProps = HTMLPropsAs<'button'>;

export const useCommentValueCancelButton = (
  props: CommentValueCancelButtonProps
) => {
  return {
    onClick: () => {
      // onCancel?.();
    },
    ...props,
  };
};

export const CommentValueCancelButton = createComponentAs<CommentValueCancelButtonProps>(
  (props) => {
    const htmlProps = useCommentValueCancelButton(props);
    return createElementAs('button', htmlProps);
  }
);
