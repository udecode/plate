import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePlateEditorRef } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import {
  Comment,
  createNullUser,
  deleteThreadAtSelection,
  findThreadNodeEntries,
  isFirstComment,
  Thread as ThreadModel,
  upsertThread,
  upsertThreadAtSelection,
  User,
} from '@xolvio/plate-comments';
import { FetchContacts } from '../FetchContacts';
import { OnSaveComment, OnSubmitComment, RetrieveUser } from '../useComments';
import { TextArea } from './TextArea';
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
  createThreadStyles,
} from './Thread.styles';
import { ThreadComment } from './ThreadComment';

export interface CommonThreadAndSideThreadProps {
  thread: ThreadModel;
  onSaveComment: OnSaveComment;
  onSubmitComment: OnSubmitComment;
  onCancelCreateThread: () => void;
  fetchContacts: FetchContacts;
  retrieveUser: RetrieveUser;
}

export type ThreadProps = {
  showResolveThreadButton: boolean;
  showReOpenThreadButton: boolean;
  showMoreButton: boolean;
} & StyledProps &
  CommonThreadAndSideThreadProps;

export function Thread({
  thread,
  showResolveThreadButton,
  showReOpenThreadButton,
  showMoreButton,
  onSaveComment,
  onSubmitComment: onSubmitCommentCallback,
  onCancelCreateThread,
  fetchContacts,
  retrieveUser,
  ...props
}: ThreadProps) {
  const editor = usePlateEditorRef();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [haveContactsBeenClosed, setHaveContactsBeenClosed] = useState<boolean>(
    false
  );

  const [user, setUser] = useState<User>(createNullUser());

  useEffect(() => {
    (async () => {
      setUser(await retrieveUser());
    })();
  }, [retrieveUser]);

  const onSubmitComment = useCallback(
    function onSubmitComment() {
      onSubmitCommentCallback(textAreaRef.current!.value);
    },
    [onSubmitCommentCallback]
  );

  const hasComments = useCallback(
    function hasComments() {
      return thread.comments.length >= 1;
    },
    [thread]
  );

  const clearTextArea = useCallback(
    function clearTextArea() {
      textAreaRef.current!.value = '';
    },
    [textAreaRef]
  );

  const onCancel = useCallback(
    function onCancel() {
      if (hasComments()) {
        clearTextArea();
      }

      onCancelCreateThread();
    },
    [hasComments, onCancelCreateThread, clearTextArea]
  );

  const onResolveThread = useCallback(
    function onResolveThread() {
      const newThread = {
        ...thread,
        isResolved: true,
      };
      upsertThreadAtSelection(editor, newThread);
    },
    [editor, thread]
  );

  const onReOpenThread = useCallback(
    function onReOpenThread() {
      const threadNodeEntry = Array.from(findThreadNodeEntries(editor)).find(
        (threadNodeEntry2: any) => threadNodeEntry2[0].thread.id === thread.id
      );
      if (threadNodeEntry) {
        const newThread = {
          ...thread,
          isResolved: false,
        };
        upsertThread(editor, {
          at: threadNodeEntry[1],
          thread: newThread,
        });
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
      upsertThreadAtSelection(editor, thread);
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
  const { root: commentInput, commentInputReply } = createCommentInputStyles(
    props
  );
  const { root: buttons } = createButtonsStyles(props);
  const { root: commentButton } = createCommentButtonStyles(props);
  const { root: cancelButton } = createCancelButtonStyles(props);

  let commentInputCss = [...commentInput.css];
  let commentInputClassName = commentInput.className;
  if (hasComments()) {
    commentInputCss = commentInputCss.concat(commentInputReply!.css);
    commentInputClassName += ` ${commentInputReply!.className}`;
  }

  return (
    <div css={root.css} className={root.className}>
      {thread.comments.map((comment: Comment, index) => (
        <ThreadComment
          key={comment.id}
          comment={comment}
          thread={thread}
          showResolveThreadButton={showResolveThreadButton && index === 0}
          showReOpenThreadButton={showReOpenThreadButton && index === 0}
          showMoreButton={showMoreButton}
          showLinkToThisComment={index === 0}
          onSaveComment={onSaveComment}
          onResolveThread={onResolveThread}
          onReOpenThread={onReOpenThread}
          onDelete={onDelete}
          fetchContacts={fetchContacts}
        />
      ))}

      <div>
        {!hasComments() && (
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
            <div
              css={authorTimestamp.css}
              className={authorTimestamp.className}
            >
              <div css={commenterName.css} className={commenterName.className}>
                {user.name}
              </div>
            </div>
          </div>
        )}
        <div css={commentInputCss} className={commentInputClassName}>
          <TextArea
            ref={textAreaRef}
            thread={thread}
            fetchContacts={fetchContacts}
            haveContactsBeenClosed={haveContactsBeenClosed}
            setHaveContactsBeenClosed={setHaveContactsBeenClosed}
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
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
