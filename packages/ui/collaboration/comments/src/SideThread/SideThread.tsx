import React, { useCallback, useEffect, useRef } from 'react';
import { addThread, Comment, Thread } from '@udecode/plate-comments';
import { usePlateEditorRef } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import {
  createAuthorTimestampStyles,
  createAvatarHolderStyles,
  createButtonsStyles,
  createCancelButtonStyles,
  createCommentButtonStyles,
  createCommenterNameStyles,
  createCommentHeaderStyles,
  createCommentInputStyles,
  createCommentProfileImageStyles,
  createSideThreadStyles,
  createTextAreaStyles,
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
  const editor = usePlateEditorRef();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmitComment = useCallback(
    function onSubmitComment() {
      const comment = {
        id: Math.floor(Math.random() * 1000), // FIXME
        text: textAreaRef.current!.value,
      };
      onSubmitCommentCallback(comment);
    },
    [onSubmitCommentCallback]
  );

  const onResolveThread = useCallback(
    function onResolveThread() {
      if (thread) {
        thread.isResolved = true;
        addThread(editor, thread);
      }
    },
    [editor, thread]
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

  const { root } = createSideThreadStyles(props);
  const { root: commentHeader } = createCommentHeaderStyles(props);
  const { root: avatarHolder } = createAvatarHolderStyles(props);
  const { root: commentProfileImage } = createCommentProfileImageStyles(props);
  const { root: authorTimestamp } = createAuthorTimestampStyles(props);
  const { root: commenterName } = createCommenterNameStyles(props);
  const { root: commentInput } = createCommentInputStyles(props);
  const { root: textArea } = createTextAreaStyles(props);
  const { root: buttons } = createButtonsStyles(props);
  const { root: commentButton } = createCommentButtonStyles(props);
  const { root: cancelButton } = createCancelButtonStyles(props);

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
      {thread?.comments.map((comment: Comment, index) => (
        <SideThreadComment
          key={comment.id}
          comment={comment}
          showResolveThreadButton={index === 0}
          onResolveThread={onResolveThread}
        />
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
