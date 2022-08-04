import '@material/menu-surface/dist/mdc.menu-surface.css';
import React, { useCallback, useState } from 'react';
import { StyledProps } from '@udecode/plate-styled-components';
import { Comment, generateThreadLink, Thread } from '@xolvio/plate-comments';
import { FetchContacts, OnReOpenThread, OnResolveThread } from '../../types';
import { Avatar } from '../Avatar/Avatar';
import { MenuButton } from '../MenuButton';
import { ReOpenThreadButton } from '../ReOpenThreadButton/ReOpenThreadButton';
import { ResolveButton } from '../ResolveButton/ResolveButton';
import {
  createAuthorTimestampStyles,
  createCommenterNameStyles,
  createCommentHeaderStyles,
  createTimestampStyles,
} from '../Thread/Thread.styles';
import { ThreadCommentEditing } from '../ThreadCommentEditing/ThreadCommentEditing';
import { ThreadLinkDialog } from '../ThreadLinkDialog';
import {
  createThreadCommentStyled,
  createThreadCommentTextStyles,
} from './ThreadComment.styles';

export function ThreadComment(
  props: {
    comment: Comment;
    thread: Thread;
    showResolveThreadButton: boolean;
    showReOpenThreadButton: boolean;
    showMoreButton: boolean;
    showLinkToThisComment: boolean;
    onSaveComment: (comment: Comment) => void;
    onResolveThread: OnResolveThread;
    onReOpenThread: OnReOpenThread;
    onDelete: (comment: Comment) => void;
    fetchContacts: FetchContacts;
  } & StyledProps
) {
  const {
    comment,
    thread,
    showResolveThreadButton,
    showReOpenThreadButton,
    showMoreButton,
    showLinkToThisComment,
    onSaveComment,
    onResolveThread,
    onReOpenThread,
    onDelete: onDeleteCallback,
    fetchContacts,
  } = props;

  const [isEdited, setIsEdited] = useState(false);

  const { root } = createThreadCommentStyled(props);
  const { root: commentHeader } = createCommentHeaderStyles(props);
  const { root: authorTimestamp } = createAuthorTimestampStyles(props);
  const { root: commenterName } = createCommenterNameStyles(props);
  const { root: timestamp } = createTimestampStyles(props);
  const { root: threadCommentText } = createThreadCommentTextStyles(props);

  const [threadLink, setThreadLink] = useState<string | null>(null);

  const onEdit = useCallback(function onEdit() {
    setIsEdited(true);
  }, []);

  const onDelete = useCallback(
    function onDelete() {
      onDeleteCallback(comment);
    },
    [comment, onDeleteCallback]
  );

  const onLinkToThisComment = useCallback(
    function onLinkToThisComment() {
      setThreadLink(generateThreadLink(thread));
    },
    [thread]
  );

  const onCloseCommentLinkDialog = useCallback(
    function onCloseCommentLinkDialog() {
      setThreadLink(null);
    },
    []
  );

  const onSave = useCallback(
    async function onSave(text: string) {
      setIsEdited(false);
      await onSaveComment({
        ...comment,
        text,
      });
    },
    [comment, onSaveComment]
  );

  const onCancel = useCallback(function onCancel() {
    setIsEdited(false);
  }, []);

  return (
    <div css={root.css} className={root.className}>
      <div css={commentHeader.css} className={commentHeader.className}>
        <Avatar user={comment.createdBy} />
        <div css={authorTimestamp.css} className={authorTimestamp.className}>
          <div css={commenterName.css} className={commenterName.className}>
            {comment.createdBy.name}
          </div>
          <div css={timestamp.css} className={timestamp.className}>
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>
        {showResolveThreadButton && (
          <ResolveButton thread={thread} onResolveThread={onResolveThread} />
        )}
        {showReOpenThreadButton && (
          <ReOpenThreadButton onReOpenThread={onReOpenThread} />
        )}
        {showMoreButton ? (
          <MenuButton
            showLinkToThisComment={showLinkToThisComment}
            onEdit={onEdit}
            onDelete={onDelete}
            onLinkToThisComment={onLinkToThisComment}
          />
        ) : null}
      </div>
      {isEdited ? (
        <ThreadCommentEditing
          thread={thread}
          defaultText={comment.text}
          onSave={onSave}
          onCancel={onCancel}
          fetchContacts={fetchContacts}
        />
      ) : (
        <div
          css={threadCommentText.css}
          className={threadCommentText.className}
        >
          {comment.text}
        </div>
      )}
      {threadLink ? (
        <ThreadLinkDialog
          threadLink={threadLink}
          onClose={onCloseCommentLinkDialog}
        />
      ) : null}
    </div>
  );
}
