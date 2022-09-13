import { useCallback } from 'react';
import { createComponentAs, createElementAs } from '@udecode/plate-core';
import { MoreMenuEditButton, MoreMenuEditButtonProps } from '../MoreMenu';
import { threadCommentStoreActions } from './threadCommentStore';

export type ThreadCommentMoreMenuEditButtonProps = MoreMenuEditButtonProps;

export const useThreadCommentMoreMenuEditButton = (
  props: ThreadCommentMoreMenuEditButtonProps
) => {
  const { onEdit } = props;

  const onEditPressed = useCallback(() => {
    onEdit?.();
    threadCommentStoreActions.isEditing(true);
  }, [onEdit]);

  return { ...props, onEdit: onEditPressed };
};

export const ThreadCommentMoreMenuEditButton = createComponentAs<ThreadCommentMoreMenuEditButtonProps>(
  (props) => {
    const moreMenuEditButtonProps = useThreadCommentMoreMenuEditButton(props);
    return createElementAs(MoreMenuEditButton, moreMenuEditButtonProps);
  }
);
