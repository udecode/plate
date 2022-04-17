import React, { useCallback, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Check } from '@styled-icons/material/Check';
import { Comment, generateThreadLink, Thread } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { ThreadLinkDialog } from '../../ThreadLinkDialog';
import {
  createAuthorTimestampStyles,
  createAvatarHolderStyles,
  createCommenterNameStyles,
  createCommentHeaderStyles,
  createCommentProfileImageStyles,
} from '../SideThread.styles';
import { MenuButton } from './MenuButton';
import {
  createResolveThreadButtonStyles,
  createSideThreadCommentStyled,
  createSideThreadCommentTextStyles,
} from './SideThreadComment.styles';
import { SideThreadCommentEditing } from './SideThreadCommentEditing';

export function SideThreadComment(
  props: {
    comment: Comment;
    thread: Thread;
    showResolveThreadButton: boolean;
    showLinkToThisComment: boolean;
    onResolveThread: () => void;
    onDelete: (comment: Comment) => void;
  } & StyledProps
) {
  const {
    comment,
    thread,
    showResolveThreadButton,
    showLinkToThisComment,
    onResolveThread,
    onDelete: onDeleteCallback,
  } = props;

  const [isEdited, setIsEdited] = useState(false);

  const { root } = createSideThreadCommentStyled(props);
  const { root: commentHeader } = createCommentHeaderStyles(props);
  const { root: avatarHolder } = createAvatarHolderStyles(props);
  const { root: commentProfileImage } = createCommentProfileImageStyles(props);
  const { root: authorTimestamp } = createAuthorTimestampStyles(props);
  const { root: commenterName } = createCommenterNameStyles(props);
  const { root: resolveThreadButton } = createResolveThreadButtonStyles(props);
  const { root: threadCommentText } = createSideThreadCommentTextStyles(props);

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
      comment.text = text; // FIXME
      setIsEdited(false);
    },
    [comment]
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
        <MenuButton
          showLinkToThisComment={showLinkToThisComment}
          onEdit={onEdit}
          onDelete={onDelete}
          onLinkToThisComment={onLinkToThisComment}
        />
      </div>
      {isEdited ? (
        <SideThreadCommentEditing
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
