import { useEffect, useRef } from 'react';
import { MDCRipple } from '@material/ripple';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadLinkDialogCopyLinkButtonProps = {
  threadLink: string;
} & HTMLPropsAs<'button'>;

export const useThreadLinkDialogCopyLinkButton = (
  props: ThreadLinkDialogCopyLinkButtonProps
): HTMLPropsAs<'button'> => {
  const { threadLink } = props;

  const ref = useRef<HTMLButtonElement>(null);

  const onCopyLink = () => navigator.clipboard.writeText(threadLink);

  useEffect(() => {
    new MDCRipple(ref.current!);
  }, []);

  return { ...props, onClick: onCopyLink, ref };
};

export const ThreadLinkDialogCopyLinkButton = createComponentAs<ThreadLinkDialogCopyLinkButtonProps>(
  (props) => {
    const htmlProps = useThreadLinkDialogCopyLinkButton(props);
    return createElementAs('button', htmlProps);
  }
);
