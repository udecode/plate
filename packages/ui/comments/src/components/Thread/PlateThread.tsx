import React from 'react';
import { Comment, Contact, Thread as ThreadType, User } from '../../utils';
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
  fetchContacts: () => Contact[];
  onCancel?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onLink?: () => void;
  onReOpenThread?: () => void;
  onResolveThread?: () => void;
  onSave?: (value: string) => void;
  onSubmitComment?: (value: string, assignedTo: User) => void;
  onValueChange?: (value: string) => void;
  retrieveUser: () => User;
  showMoreButton?: boolean;
  showReOpenThreadButton?: boolean;
  showResolveThreadButton?: boolean;
  thread: ThreadType;
  user?: User;
  value: string;
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

  return (
    <div css={threadRootCss}>
      {!noHeader && thread.assignedTo ? (
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
          <PlateCommentTextArea {...props} />
          <div css={threadButtonsCss}>
            <Thread.SubmitButton {...props} css={threadSubmitButtonCss}>
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
