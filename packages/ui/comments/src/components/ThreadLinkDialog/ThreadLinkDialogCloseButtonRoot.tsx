import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadLinkDialogCloseButtonRootProps = {
  onClose: () => void;
} & HTMLPropsAs<'div'>;

export const useThreadLinkDialogCloseButtonRoot = (
  props: ThreadLinkDialogCloseButtonRootProps
): HTMLPropsAs<'div'> => {
  const { onClose, ...rest } = props;
  return { ...rest, onClick: onClose };
};

export const ThreadLinkDialogCloseButtonRoot = createComponentAs<ThreadLinkDialogCloseButtonRootProps>(
  (props) => {
    const htmlProps = useThreadLinkDialogCloseButtonRoot(props);
    return createElementAs('div', htmlProps);
  }
);
