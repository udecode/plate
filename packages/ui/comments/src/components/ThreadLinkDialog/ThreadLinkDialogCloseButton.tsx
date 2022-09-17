import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadLinkDialogCloseButtonProps = {
  onClose: () => void;
} & HTMLPropsAs<'button'>;

export const useThreadLinkDialogCloseButton = (
  props: ThreadLinkDialogCloseButtonProps
): HTMLPropsAs<'button'> => {
  const { onClose, ...rest } = props;
  return { ...rest, onClick: onClose };
};

export const ThreadLinkDialogCloseButton = createComponentAs<ThreadLinkDialogCloseButtonProps>(
  (props) => {
    const htmlProps = useThreadLinkDialogCloseButton(props);
    return createElementAs('button', htmlProps);
  }
);
