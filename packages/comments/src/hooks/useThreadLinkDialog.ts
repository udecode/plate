import { useCallback, useEffect, useRef } from 'react';
import { MDCRipple } from '@material/ripple';
import { MDCSnackbar } from '@material/snackbar';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export type ThreadLinkDialogStyleProps = ThreadLinkDialogProps;

export type ThreadLinkDialogStyles = {
  closeButton: CSSProp;
  icon: CSSProp;
};

export type ThreadLinkDialogProps = {
  onClose: () => void;
  threadLink: string;
} & StyledProps<ThreadLinkDialogStyles>;

let snackbar: MDCSnackbar;
export const useThreadLinkDialog = (props: ThreadLinkDialogProps) => {
  const { threadLink, onClose } = props;

  const ref = useRef<HTMLDivElement | null>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const copyLinkButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const snackbarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    new MDCRipple(doneButtonRef.current!);
    new MDCRipple(copyLinkButtonRef.current!);
    inputRef.current!.select();
    snackbar = new MDCSnackbar(snackbarRef.current!);
  }, []);

  const onCopyLink = useCallback(() => {
    navigator.clipboard.writeText(threadLink).then(() => {
      snackbar!.open();
      inputRef.current!.select();
    });
  }, [threadLink]);

  return {
    copyLinkButtonRef,
    doneButtonRef,
    inputRef,
    onClose,
    onCopyLink,
    ref,
    snackbarRef,
    threadLink,
  } as const;
};
