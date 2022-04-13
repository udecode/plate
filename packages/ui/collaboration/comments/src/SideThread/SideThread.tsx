import React, { useCallback, useEffect, useRef } from 'react';
import { Comment, Thread } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
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
  getSideThreadStyles,
  getTextAreaStyles,
} from './SideThread.styles';
import { SideThreadComment } from './SideThreadComment';

export function SideThread({
  thread,
  show,
  position,
  onSubmitComment: onSubmitCommentCallback,
  ...props
}: {
  thread: Thread | null;
  show: boolean;
  position: { left: number; top: number };
  onSubmitComment: (comment: Comment) => void;
} & StyledProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmitComment = useCallback(
    function onSubmitComment() {
      const comment = {
        id: 1, // FIXME
        text: textAreaRef.current!.value,
      };
      onSubmitCommentCallback(comment);
    },
    [onSubmitCommentCallback]
  );

  useEffect(
    function onShow() {
      if (show) {
        const textArea = textAreaRef.current!;
        textArea.value = '';
        textArea.focus();
      }
    },
    [show, textAreaRef]
  );

  const { root } = getSideThreadStyles(props);
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
    <div
      css={root.css}
      className={root.className}
      style={{
        display: show ? 'block' : 'none',
        left: position.left,
        top: position.top,
      }}
    >
      {thread?.comments.map((comment: Comment) => (
        <SideThreadComment key={comment.id} comment={comment} />
      ))}

      <div>
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
          <textarea
            ref={textAreaRef}
            rows={1}
            css={textArea.css}
            className={textArea.className}
          />
          <div css={buttons.css} className={buttons.className}>
            <button
              type="button"
              css={commentButton.css}
              className={commentButton.className}
              onClick={onSubmitComment}
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
    </div>
  );
}
