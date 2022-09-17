import { useEffect, useRef } from 'react';
import { MDCSnackbar } from '@material/snackbar';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadLinkDialogSnackbarProps = {} & HTMLPropsAs<'aside'>;

export const useThreadLinkDialogSnackbar = (
  props: ThreadLinkDialogSnackbarProps
): HTMLPropsAs<'aside'> => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    new MDCSnackbar(ref.current!);
  }, []);

  return { ...props, ref };
};

export const ThreadLinkDialogSnackbar = createComponentAs<ThreadLinkDialogSnackbarProps>(
  (props) => {
    const htmlProps = useThreadLinkDialogSnackbar(props);
    return createElementAs('aside', htmlProps);
  }
);
