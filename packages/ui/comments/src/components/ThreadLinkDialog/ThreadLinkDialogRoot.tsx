import { useEffect, useRef } from 'react';
import { MDCDialog } from '@material/dialog';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useHotkeys,
} from '@udecode/plate-core';

export type ThreadLinkDialogRootProps = {
  onClose: () => void;
} & HTMLPropsAs<'div'>;

export const useThreadLinkDialogRoot = (
  props: ThreadLinkDialogRootProps
): HTMLPropsAs<'div'> => {
  const { onClose } = props;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    new MDCDialog(ref.current!);
  }, []);

  useHotkeys('escape', onClose);

  return { ...props, ref };
};

export const ThreadLinkDialogRoot = createComponentAs<ThreadLinkDialogRootProps>(
  (props) => {
    const htmlProps = useThreadLinkDialogRoot(props);
    return createElementAs('div', htmlProps);
  }
);
