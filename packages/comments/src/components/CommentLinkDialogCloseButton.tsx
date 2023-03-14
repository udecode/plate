import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';

export type CommentLinkDialogCloseButtonProps = {} & HTMLPropsAs<'div'>;

export const useCommentLinkDialogCloseButton = ({
  ...props
}: CommentLinkDialogCloseButtonProps): HTMLPropsAs<'div'> => {
  return {
    onClick: () => {
      // onClose?.();
    },
    ...props,
  };
};

export const CommentLinkDialogCloseButton = createComponentAs<CommentLinkDialogCloseButtonProps>(
  (props) => {
    const htmlProps = useCommentLinkDialogCloseButton(props);
    return createElementAs('div', htmlProps);
  }
);
