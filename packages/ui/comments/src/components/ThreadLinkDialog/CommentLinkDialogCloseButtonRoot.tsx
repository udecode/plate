import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadLinkDialogCloseButtonRootProps = {} & HTMLPropsAs<'div'>;

export const useThreadLinkDialogCloseButtonRoot = ({
  ...props
}: ThreadLinkDialogCloseButtonRootProps): HTMLPropsAs<'div'> => {
  return {
    onClick: () => {
      // onClose?.();
    },
    ...props,
  };
};

export const CommentLinkDialogCloseButtonRoot = createComponentAs<ThreadLinkDialogCloseButtonRootProps>(
  (props) => {
    const htmlProps = useThreadLinkDialogCloseButtonRoot(props);
    return createElementAs('div', htmlProps);
  }
);
