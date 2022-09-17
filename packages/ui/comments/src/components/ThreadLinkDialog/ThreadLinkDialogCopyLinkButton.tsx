import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadLinkDialogCopyLinkRootProps = {
  threadLink: string;
} & HTMLPropsAs<'div'>;

export const useThreadLinkDialogCopyLinkRoot = (
  props: ThreadLinkDialogCopyLinkRootProps
): HTMLPropsAs<'div'> => {
  const { threadLink } = props;

  const onCopyLink = () => navigator.clipboard.writeText(threadLink);

  return { ...props, onClick: onCopyLink };
};

export const ThreadLinkDialogCopyLinkRoot = createComponentAs<ThreadLinkDialogCopyLinkRootProps>(
  (props) => {
    const htmlProps = useThreadLinkDialogCopyLinkRoot(props);
    return createElementAs('div', htmlProps);
  }
);
