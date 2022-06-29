import '@material/menu-surface/dist/mdc.menu-surface.css';
import React, { useCallback, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
// eslint-disable-next-line no-restricted-imports
import { Unarchive } from '@styled-icons/material/Unarchive';
import { StyledProps } from '@udecode/plate-styled-components';
import { Comment, generateThreadLink, Thread } from '@xolvio/plate-comments';
import { Avatar } from '../../Avatar/Avatar';
import { FetchContacts } from '../../FetchContacts';
import { OnResolveThread } from '../../OnResolveThread';
import { ResolveButton } from '../../ResolveButton';
import { ThreadLinkDialog } from '../../ThreadLinkDialog';
import {
  createAuthorTimestampStyles,
  createCommenterNameStyles,
  createCommentHeaderStyles,
  createTimestampStyles,
} from '../Thread.styles';
import { MenuButton } from './MenuButton';
import {
  createReOpenThreadButtonStyles,
  createThreadCommentStyled,
  createThreadCommentTextStyles,
} from './ThreadComment.styles';
import { ThreadCommentEditing } from './ThreadCommentEditing';

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
    onReOpenThread: () => void;
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
  const { root: reOpenThreadButton } = createReOpenThreadButtonStyles(props);
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
          <ResolveButton onResolveThread={onResolveThread} />
        )}
        {showReOpenThreadButton ? (
          <button
            type="button"
            css={reOpenThreadButton.css}
            className={`${reOpenThreadButton.className} mdc-icon-button`}
            onClick={onReOpenThread}
          >
            <div className="mdc-icon-button__ripple" />
            <Unarchive />
          </button>
        ) : null}
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
