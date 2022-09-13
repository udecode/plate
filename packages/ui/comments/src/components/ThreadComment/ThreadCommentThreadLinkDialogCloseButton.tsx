import { useCallback } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { ThreadLinkDialog } from '../ThreadLinkDialog';
import { threadCommentStoreActions } from './threadCommentStore';

export type ThreadCommentThreadLinkDialogCloseButtonProps = HTMLPropsAs<'button'>;

export const useThreadCommentThreadLinkDialogCloseButton = (
  props: ThreadCommentThreadLinkDialogCloseButtonProps
) => {
  const onClose = useCallback(() => {
    threadCommentStoreActions.isOpen(false);
  }, []);

  return { ...props, onClose };
};

export const ThreadCommentThreadLinkDialogCloseButton = createComponentAs<ThreadCommentThreadLinkDialogCloseButtonProps>(
  (props) => {
    const htmlProps = useThreadCommentThreadLinkDialogCloseButton(props);
    return createElementAs(ThreadLinkDialog.CloseButton, htmlProps);
  }
);
