import React from 'react';
import { Comment } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import {
  getAuthorTimestampStyles,
  getAvatarHolderStyles,
  getCommenterNameStyles,
  getCommentHeaderStyles,
  getCommentProfileImageStyles,
} from '../SideThread.styles';
import { getSideThreadCommentStyled } from './SideThreadComment.styles';

export function SideThreadComment(props: { comment: Comment } & StyledProps) {
  const { comment } = props;

  const { root } = getSideThreadCommentStyled(props);
  const { root: commentHeader } = getCommentHeaderStyles(props);
  const { root: avatarHolder } = getAvatarHolderStyles(props);
  const { root: commentProfileImage } = getCommentProfileImageStyles(props);
  const { root: authorTimestamp } = getAuthorTimestampStyles(props);
  const { root: commenterName } = getCommenterNameStyles(props);

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
      </div>
      <div>{comment.text}</div>
    </div>
  );
}
