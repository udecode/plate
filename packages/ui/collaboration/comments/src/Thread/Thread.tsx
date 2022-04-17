import React, { useCallback, useEffect, useRef } from 'react';
import {
  Comment,
  deleteThreadAtSelection,
  findThreadNodeEntries,
  isFirstComment,
  Thread as ThreadModel,
  ThreadNode,
  upsertThread,
} from '@udecode/plate-comments';
import { usePlateEditorRef } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import { Transforms } from 'slate';
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
  createTextAreaStyles,
  createThreadStyles,
} from './Thread.styles';
import { ThreadComment } from './ThreadComment';

export interface ThreadProps extends StyledProps {
  thread: ThreadModel;
  showResolveThreadButton: boolean;
  showReOpenThreadButton: boolean;
  showMoreButton: boolean;
  onSubmitComment: (comment: Comment) => void;
  onCancelCreateThread: () => void;
}

export function Thread({
  thread,
  showResolveThreadButton,
  showReOpenThreadButton,
  showMoreButton,
  onSubmitComment: onSubmitCommentCallback,
  onCancelCreateThread,
  ...props
}: ThreadProps) {
  const editor = usePlateEditorRef();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmitComment = useCallback(
    function onSubmitComment() {
      const newComment = {
        id: Math.floor(Math.random() * 1000), // FIXME
        text: textAreaRef.current!.value,
      };
      onSubmitCommentCallback(newComment);
    },
    [onSubmitCommentCallback]
  );

  const onResolveThread = useCallback(
    function onResolveThread() {
      thread.isResolved = true;
      upsertThread(editor, thread);
    },
    [editor, thread]
  );

  const onReOpenThread = useCallback(
    function onReOpenThread() {
      thread.isResolved = false;
      const threadNodeEntry = Array.from(findThreadNodeEntries(editor)).find(
        (threadNodeEntry2: any) => threadNodeEntry2[0].thread === thread
      );
      if (threadNodeEntry) {
        Transforms.setNodes<ThreadNode>(
          editor,
          {
            thread: { ...thread },
          },
          { at: threadNodeEntry[1] }
        );
      }
    },
    [editor, thread]
  );

  const deleteThread = useCallback(
    function deleteThread() {
      deleteThreadAtSelection(editor);
    },
    [editor]
  );

  const deleteComment = useCallback(
    function deleteComment(comment) {
      thread.comments = thread.comments.filter(
        (comment2) => comment2 !== comment
      );
      upsertThread(editor, thread);
    },
    [editor, thread]
  );

  const onDelete = useCallback(
    function onDelete(comment: Comment) {
      if (isFirstComment(thread, comment)) {
        deleteThread();
      } else {
        deleteComment(comment);
      }
    },
    [deleteComment, deleteThread, thread]
  );

  useEffect(
    function onShow() {
      const textArea = textAreaRef.current!;
      textArea.value = '';
      if (thread.comments.length === 0) {
        textArea.focus();
      }
    },
    [textAreaRef, thread]
  );

  const { root } = createThreadStyles(props);
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
    <div css={root.css} className={root.className}>
      {thread.comments.map((comment: Comment, index) => (
        <ThreadComment
          key={comment.id}
          comment={comment}
          thread={thread}
          showResolveThreadButton={showResolveThreadButton && index === 0}
          showReOpenThreadButton={showReOpenThreadButton}
          showMoreButton={showMoreButton}
          showLinkToThisComment={index === 0}
          onResolveThread={onResolveThread}
          onReOpenThread={onReOpenThread}
          onDelete={onDelete}
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
              Jon Doe
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
              {thread.comments.length === 0 ? 'Comment' : 'Reply'}
            </button>
            <button
              type="button"
              css={cancelButton.css}
              className={cancelButton.className}
              onClick={onCancelCreateThread}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
