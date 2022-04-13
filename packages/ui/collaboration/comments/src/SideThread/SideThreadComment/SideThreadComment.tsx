import React, { useCallback, useState } from 'react';
import { Comment } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import {
  createAuthorTimestampStyles,
  createAvatarHolderStyles,
  createCommenterNameStyles,
  createCommentHeaderStyles,
  createCommentProfileImageStyles,
} from '../SideThread.styles';
import { MenuButton } from './MenuButton';
import {
  createSideThreadCommentStyled,
  createSideThreadCommentTextStyles,
} from './SideThreadComment.styles';
import { SideThreadCommentEditing } from './SideThreadCommentEditing';

export function SideThreadComment(props: { comment: Comment } & StyledProps) {
  const { comment } = props;

  const [isEdited, setIsEdited] = useState(false);

  const { root } = createSideThreadCommentStyled(props);
  const { root: commentHeader } = createCommentHeaderStyles(props);
  const { root: avatarHolder } = createAvatarHolderStyles(props);
  const { root: commentProfileImage } = createCommentProfileImageStyles(props);
  const { root: authorTimestamp } = createAuthorTimestampStyles(props);
  const { root: commenterName } = createCommenterNameStyles(props);
  const { root: threadCommentText } = createSideThreadCommentTextStyles(props);

  const onEdit = useCallback(function onEdit() {
    setIsEdited(true);
  }, []);

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
            Jonas Aschenbrenner
          </div>
        </div>
        <MenuButton onEdit={onEdit} />
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
    </div>
  );
}
