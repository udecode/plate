import React from 'react';
import { StyledElementProps } from '@udecode/plate-styled-components';
import {
  getAuthorTimestampStyles,
  getAvatarHolderStyles,
  getButtonsStyles,
  getCancelButtonStyles,
  getCommentButtonStyles,
  getCommenterNameStyles,
  getCommentHeaderStyles,
  getCommentInputStyles,
  getCommentProfileImageStyles,
  getTextAreaStyles,
  getThreadStyles,
} from './Thread.styles';

export function Thread({
  position,
  ...props
}: { position: { left: number; top: number } } & StyledElementProps) {
  const { root } = getThreadStyles(props);
  const { root: commentHeader } = getCommentHeaderStyles(props);
  const { root: avatarHolder } = getAvatarHolderStyles(props);
  const { root: commentProfileImage } = getCommentProfileImageStyles(props);
  const { root: authorTimestamp } = getAuthorTimestampStyles(props);
  const { root: commenterName } = getCommenterNameStyles(props);
  const { root: commentInput } = getCommentInputStyles(props);
  const { root: textArea } = getTextAreaStyles(props);
  const { root: buttons } = getButtonsStyles(props);
  const { root: commentButton } = getCommentButtonStyles(props);
  const { root: cancelButton } = getCancelButtonStyles(props);

  return (
    <div css={root.css} className={root.className} style={{ ...position }}>
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
      <div css={commentInput.css} className={commentInput.className}>
        <textarea rows={1} css={textArea.css} className={textArea.className} />
        <div css={buttons.css} className={buttons.className}>
          <button
            type="button"
            css={commentButton.css}
            className={commentButton.className}
          >
            Comment
          </button>
          <button
            type="button"
            css={cancelButton.css}
            className={cancelButton.className}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
