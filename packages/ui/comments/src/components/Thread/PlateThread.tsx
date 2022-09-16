import React, { useCallback, useState } from 'react';
import { Comment, Thread as ThreadType, User } from '../../types';
import { PlateAssignedToHeader } from '../AssignedToHeader';
import { PlateCommentTextArea } from '../CommentTextArea';
import { PlateThreadComment } from '../ThreadComment';
import {
  threadButtonsCss,
  threadCancelButtonCss,
  threadRootCss,
  threadSubmitButtonCss,
} from './styles';
import { Thread } from './Thread';

export type PlateThreadProps = {
  fetchContacts: () => User[];
  onCancel?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onLink?: () => void;
  onReOpenThread?: () => void;
  onResolveThread?: () => void;
  onSave: (comment: Comment) => ThreadType;
  onSubmitComment?: (value: string, assignedTo?: User) => void;
  onValueChange?: (value: string) => void;
  retrieveUser: () => User;
  showMoreButton?: boolean;
  showReOpenThreadButton?: boolean;
  showResolveThreadButton?: boolean;
  thread: ThreadType;
  user?: User;
  noHeader?: boolean;
  noActions?: boolean;
};

export const PlateThread = (props: PlateThreadProps) => {
  const {
    thread,
    showReOpenThreadButton,
    showResolveThreadButton,
    noHeader,
    noActions,
  } = props;

  const [value, setValue] = useState('');

  const onValueChange = useCallback((val: string) => {
    setValue(val);
  }, []);

  console.log('thread.assignedTO', thread.assignedTo);
  return (
    <div css={threadRootCss}>
      {!noHeader && thread.createdBy ? (
        <PlateAssignedToHeader {...props} />
      ) : null}
      {thread.comments.map((comment: Comment, index: number) => {
        return (
          <PlateThreadComment
            {...props}
            key={comment.id}
            comment={comment}
            showResolveThreadButton={showResolveThreadButton && index === 0}
            showReOpenThreadButton={showReOpenThreadButton && index === 0}
            showLinkButton={index === 0}
            initialValue={comment.text}
          />
        );
      })}
      {!noActions ? (
        <div>
          <PlateCommentTextArea {...props} onValueChange={onValueChange} />
          <div css={threadButtonsCss}>
            <Thread.SubmitButton
              {...props}
              css={threadSubmitButtonCss}
              value={value}
            >
              Comment
            </Thread.SubmitButton>
            <Thread.CancelButton {...props} css={threadCancelButtonCss}>
              Cancel
            </Thread.CancelButton>
          </div>
        </div>
      ) : null}
    </div>
  );
};
