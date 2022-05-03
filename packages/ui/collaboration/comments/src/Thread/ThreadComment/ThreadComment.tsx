import '@material/menu-surface/dist/mdc.menu-surface.css';
import React, { useCallback, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Check } from '@styled-icons/material/Check';
// eslint-disable-next-line no-restricted-imports
import { Unarchive } from '@styled-icons/material/Unarchive';
import { Comment, generateThreadLink, Thread } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { ThreadLinkDialog } from '../../ThreadLinkDialog';
import {
  createAuthorTimestampStyles,
  createAvatarHolderStyles,
  createCommenterNameStyles,
  createCommentHeaderStyles,
  createCommentProfileImageStyles,
  createTimestampStyles,
} from '../Thread.styles';
import { MenuButton } from './MenuButton';
import {
  createReOpenThreadButtonStyles,
  createResolveThreadButtonStyles,
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
    onResolveThread: () => void;
    onReOpenThread: () => void;
    onDelete: (comment: Comment) => void;
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
  } = props;

  const [isEdited, setIsEdited] = useState(false);

  const { root } = createThreadCommentStyled(props);
  const { root: commentHeader } = createCommentHeaderStyles(props);
  const { root: avatarHolder } = createAvatarHolderStyles(props);
  const { root: commentProfileImage } = createCommentProfileImageStyles(props);
  const { root: authorTimestamp } = createAuthorTimestampStyles(props);
  const { root: commenterName } = createCommenterNameStyles(props);
  const { root: timestamp } = createTimestampStyles(props);
  const { root: resolveThreadButton } = createResolveThreadButtonStyles(props);
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
    function onSave(text: string) {
      setIsEdited(false);
      onSaveComment({
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
        <div css={avatarHolder.css} className={avatarHolder.className}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/59/User-avatar.svg"
            alt="Profile"
            width={32}
            height={32}
            css={commentProfileImage.css}
            className={commentProfileImage.className}
          />
        </div>
        <div css={authorTimestamp.css} className={authorTimestamp.className}>
          <div css={commenterName.css} className={commenterName.className}>
            Jon Doe
          </div>
          <div css={timestamp.css} className={timestamp.className}>
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>
        {showResolveThreadButton ? (
          <button
            type="button"
            css={resolveThreadButton.css}
            className={`${resolveThreadButton.className} mdc-icon-button`}
            onClick={onResolveThread}
          >
            <div className="mdc-icon-button__ripple" />
            <Check style={{ color: '#2196f3' }} />
          </button>
        ) : null}
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
          defaultText={comment.text}
          onSave={onSave}
          onCancel={onCancel}
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
