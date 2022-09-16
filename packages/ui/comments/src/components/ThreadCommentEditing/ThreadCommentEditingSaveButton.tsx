import { useCallback } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { cloneDeep } from 'lodash';
import { Comment, Thread } from '../../types';
import { threadCommentStoreActions } from '../ThreadComment/threadCommentStore';

export type ThreadCommentEditingSaveButtonProps = {
  onSave?: (comment: Comment) => Thread;
  value: string;
  initialValue: string;
  comment: Comment;
} & HTMLPropsAs<'button'>;

export const useThreadCommentEditingSaveButton = (
  props: ThreadCommentEditingSaveButtonProps
) => {
  const { initialValue, onSave, value, comment, ...rest } = props;

  const onSaveComment = useCallback(() => {
    const updatedComment = cloneDeep(comment);
    updatedComment.text = value;
    onSave?.(updatedComment);
    threadCommentStoreActions.isEditing(false);
  }, [comment, onSave, value]);

  const disabled =
    value.trim().length === 0 || value.trim() === initialValue.trim();

  return { ...rest, onClick: onSaveComment, disabled };
};

export const ThreadCommentEditingSaveButton = createComponentAs<ThreadCommentEditingSaveButtonProps>(
  (props) => {
    const htmlProps = useThreadCommentEditingSaveButton(props);
    return createElementAs('button', htmlProps);
  }
);
