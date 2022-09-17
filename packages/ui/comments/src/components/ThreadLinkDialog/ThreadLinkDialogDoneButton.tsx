import { useEffect, useRef } from 'react';
import { MDCRipple } from '@material/ripple';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadLinkDialogDoneButtonProps = {
  onClose: () => void;
} & HTMLPropsAs<'button'>;

export const useThreadLinkDialogDoneButton = (
  props: ThreadLinkDialogDoneButtonProps
): HTMLPropsAs<'button'> => {
  const { onClose } = props;

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    new MDCRipple(ref.current!);
  }, []);

  return { ...props, ref, onClick: onClose };
};

export const ThreadLinkDialogDoneButton = createComponentAs<ThreadLinkDialogDoneButtonProps>(
  (props) => {
    const htmlProps = useThreadLinkDialogDoneButton(props);
    return createElementAs('button', htmlProps);
  }
);
