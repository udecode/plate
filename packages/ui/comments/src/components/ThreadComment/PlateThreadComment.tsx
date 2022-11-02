// import '@material/menu-surface/dist/mdc.menu-surface.css';
import React, { useCallback, useState } from 'react';
import { Comment, Thread, User } from '@udecode/plate-comments';
import { generateThreadLink } from '../../utils';
import { PlateAvatar } from '../Avatar';
import { PlateMenuButton } from '../MenuButton';
import { PlateReOpenThreadButton } from '../ReOpenThreadButton';
import { PlateResolveButton } from '../ResolveButton';
import { PlateThreadCommentEditing } from '../ThreadCommentEditing/PlateThreadCommentEditing';
import { PlateThreadLinkDialog } from '../ThreadLinkDialog';
import {
  threadCommentHeaderCreatedByNameCss,
  threadCommentHeaderCreatedDateCss,
  threadCommentHeaderCss,
  threadCommentHeaderInfoCss,
  threadCommentRootCss,
  threadCommentTextCss,
} from './styles';

type PlateThreadCommentProps = {
  comment: Comment;
  thread: Thread;
  showResolveThreadButton: boolean;
  showReOpenThreadButton: boolean;
  showMoreButton: boolean;
  showLinkToThisComment: boolean;
  onSaveComment: (comment: Comment) => void;
  onResolveThread: () => void;
  onReOpenThread: () => void;
  onDelete: (comment: Comment) => void;
  fetchContacts: () => User[];
};

export const PlateThreadComment = (props: PlateThreadCommentProps) => {
  const {
    comment,
    fetchContacts,
    onDelete: onDeleteCallback,
    onReOpenThread,
    onResolveThread,
    onSaveComment,
    showLinkToThisComment,
    showMoreButton,
    showReOpenThreadButton,
    showResolveThreadButton,
    thread,
  } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [threadLink, setThreadLink] = useState<string | null>(null);

  const onEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const onDelete = useCallback(() => {
    onDeleteCallback(comment);
  }, [comment, onDeleteCallback]);

  const onLinkToThisComment = useCallback(() => {
    setThreadLink(generateThreadLink(thread));
  }, [thread]);

  const onCloseCommentLinkDialog = useCallback(() => {
    setThreadLink(null);
  }, []);

  const onSave = useCallback(
    (text: string) => {
      setIsEditing(false);
      onSaveComment({
        ...comment,
        text,
      });
    },
    [comment, onSaveComment]
  );

  const onCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <div css={threadCommentRootCss}>
      <div css={threadCommentHeaderCss}>
        <PlateAvatar user={comment.createdBy} />
        <div css={threadCommentHeaderInfoCss}>
          <div css={threadCommentHeaderCreatedByNameCss}>
            {comment.createdBy.name}
          </div>
          <div css={threadCommentHeaderCreatedDateCss}>
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>
        {showResolveThreadButton ? (
          <PlateResolveButton
            thread={thread}
            onResolveThread={onResolveThread}
          />
        ) : null}
        {showReOpenThreadButton && (
          <PlateReOpenThreadButton onReOpenThread={onReOpenThread} />
        )}
        {showMoreButton ? (
          <PlateMenuButton
            showLinkToThisComment={showLinkToThisComment}
            onEdit={onEdit}
            onDelete={onDelete}
            onLinkToThisComment={onLinkToThisComment}
          />
        ) : null}
      </div>
      {isEditing ? (
        <PlateThreadCommentEditing
          thread={thread}
          defaultText={comment.text}
          onSave={onSave}
          onCancel={onCancel}
          fetchContacts={fetchContacts}
        />
      ) : (
        <div css={threadCommentTextCss}>{comment.text}</div>
      )}
      {threadLink ? (
        <PlateThreadLinkDialog
          threadLink={threadLink}
          onClose={onCloseCommentLinkDialog}
        />
      ) : null}
    </div>
  );
};
