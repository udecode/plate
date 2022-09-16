import React, { RefObject } from 'react';
import { Close } from '@styled-icons/material';
import { Comment, Thread, User } from '../../types';
import { Avatar, avatarImageCss, avatarRootCss } from '../Avatar';
import { PlateMoreMenu } from '../MoreMenu';
import {
  ReOpenThreadButton,
  reOpenThreadButtonRootStyles,
} from '../ReOpenThreadButton';
import { ResolveButton, resolveButtonRootStyles } from '../ResolveButton';
import {
  PlateThreadCommentEditing,
  threadCommentEditingRootCss,
} from '../ThreadCommentEditing';
import {
  ThreadLinkDialog,
  threadLinkDialogCloseButtonCss,
  threadLinkDialogHeaderCss,
  threadLinkDialogLinkCss,
  threadLinkDialogRootCss,
} from '../ThreadLinkDialog';
import {
  threadCommentActionsCss,
  threadCommentAuthorTimestampCss,
  threadCommentCommenterNameCss,
  threadCommentCommentHeaderCss,
  threadCommentRootCss,
  threadCommentThreadCommentTextCss,
  threadCommentTimestampCss,
} from './styles';
import { ThreadComment } from './ThreadComment';
import { useThreadCommentStoreSelectors } from './threadCommentStore';

export type PlateThreadCommentProps = {
  comment: Comment;
  fetchContacts: () => User[];
  initialValue: string;
  onCancel?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onLink?: () => void;
  onReOpenThread?: () => void;
  onResolveThread?: () => void;
  onSave: (comment: Comment) => Thread;
  onSubmitComment?: (value: string, assignedTo: User) => void;
  onValueChange?: (value: string) => void;
  showLinkButton?: boolean;
  showMoreButton?: boolean;
  showReOpenThreadButton?: boolean;
  showResolveThreadButton?: boolean;
  textAreaRef?: RefObject<HTMLTextAreaElement> | null;
  thread: Thread;
  threadLink?: string;
};

export const PlateThreadComment = (props: PlateThreadCommentProps) => {
  const {
    comment,
    showResolveThreadButton,
    showReOpenThreadButton,
    showMoreButton,
  } = props;

  const isThreadLinkDialogOpen = useThreadCommentStoreSelectors().isOpen();
  const isEditing = useThreadCommentStoreSelectors().isEditing();

  return (
    <div css={threadCommentRootCss}>
      <div css={threadCommentCommentHeaderCss}>
        <Avatar.Root css={avatarRootCss}>
          <ThreadComment.AvatarImage {...props} css={avatarImageCss} />
        </Avatar.Root>
        <div css={threadCommentAuthorTimestampCss}>
          <div css={threadCommentCommenterNameCss}>
            {comment.createdBy.name}
          </div>
          <div css={threadCommentTimestampCss}>
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>
        <div css={threadCommentActionsCss}>
          {showResolveThreadButton && (
            <ResolveButton.Root {...props} css={resolveButtonRootStyles}>
              <ResolveButton.Check />
            </ResolveButton.Root>
          )}
          {showReOpenThreadButton && (
            <ReOpenThreadButton.Root
              {...props}
              css={reOpenThreadButtonRootStyles}
            >
              <ReOpenThreadButton.Unarchive />
            </ReOpenThreadButton.Root>
          )}
          {showMoreButton ? <PlateMoreMenu {...props} /> : null}
        </div>
      </div>
      {isEditing ? (
        <div css={threadCommentEditingRootCss}>
          <PlateThreadCommentEditing {...props} initialValue={comment.text} />
        </div>
      ) : (
        <div css={threadCommentThreadCommentTextCss}>{comment.text}</div>
      )}

      {isThreadLinkDialogOpen ? (
        <div css={threadLinkDialogRootCss}>
          <div css={threadLinkDialogHeaderCss}>
            <h3>Link To Thread</h3>
            <ThreadComment.ThreadLinkDialogCloseButton
              css={threadLinkDialogCloseButtonCss}
            >
              <Close />
            </ThreadComment.ThreadLinkDialogCloseButton>
          </div>
          <div css={threadLinkDialogLinkCss}>
            <ThreadLinkDialog.Input {...props} />
            <ThreadLinkDialog.CopyIcon {...props} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
