import { useCallback } from 'react';
import { createComponentAs, createElementAs } from '@udecode/plate-core';
import {
  ThreadCommentEditing,
  ThreadCommentEditingCancelButtonProps,
} from '../ThreadCommentEditing';
import { threadCommentStoreActions } from './threadCommentStore';

export type ThreadCommentCancelButtonProps = {
  value: string;
} & ThreadCommentEditingCancelButtonProps;

export const useThreadCommentCancelButton = (
  props: ThreadCommentCancelButtonProps
) => {
  const { onCancel, value } = props;

  const onCancelPressed = useCallback(() => {
    onCancel?.(value);
    threadCommentStoreActions.isEditing(false);
  }, [onCancel, value]);

  return { ...props, onCancel: onCancelPressed };
};

export const ThreadCommentCancelButton = createComponentAs<ThreadCommentCancelButtonProps>(
  (props) => {
    const threadCommentCancelButtonProps = useThreadCommentCancelButton(props);
    return createElementAs(
      ThreadCommentEditing.CancelButton,
      threadCommentCancelButtonProps
    );
  }
);
