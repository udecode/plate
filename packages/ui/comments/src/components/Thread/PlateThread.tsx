import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Comment,
  deleteThreadAtSelection,
  getThreadNodeEntries,
  isFirstComment,
  Thread as ThreadType,
  upsertThread,
  upsertThreadAtSelection,
  User,
} from '@udecode/plate-comments';
import { usePlateEditorRef } from '@udecode/plate-core';
import { cloneDeep } from 'lodash';
import { findMentionedUsers, nullUser } from '../../utils';
import { determineAssigningVerb as determineAssigningVerbBase } from '../../utils/determineAssigningVerb';
import { PlateAssignedToHeader } from '../AssignedToHeader';
import { PlateAvatar } from '../Avatar';
import { PlateTextArea } from '../TextArea';
import { PlateThreadComment } from '../ThreadComment';
import {
  threadActionsCss,
  threadAuthorTimestampCss,
  threadCancelButtonCss,
  threadCommentButtonCss,
  threadCommenterNameCss,
  threadCommentHeadCss,
  threadCommentInputCss,
  threadCommentInputReplyCss,
  threadRootCss,
} from './styles';
import { ThreadCheckbox } from './ThreadCheckbox';

export interface CommonThreadAndSideThreadProps {
  thread: ThreadType;
  onSaveComment: (comment: Comment) => ThreadType;
  onSubmitComment: (commentText: string, assignedTo?: User) => ThreadType;
  onCancelCreateThread: () => void;
  onResolveThread: () => void;
  fetchContacts: () => User[];
  retrieveUser: () => User;
  retrieveUserByEmailAddress: (emailAddress: string) => User | null;
}

export type PlateThreadProps = {
  showResolveThreadButton: boolean;
  showReOpenThreadButton: boolean;
  showMoreButton: boolean;
  noTextArea?: boolean;
} & CommonThreadAndSideThreadProps;

export const PlateThread = (props: PlateThreadProps) => {
  const {
    fetchContacts,
    onCancelCreateThread,
    onResolveThread,
    onSaveComment,
    onSubmitComment: onSubmitCommentCallback,
    retrieveUser,
    retrieveUserByEmailAddress,
    showMoreButton,
    showReOpenThreadButton,
    showResolveThreadButton,
    thread,
    noTextArea,
  } = props;

  const [haveContactsBeenClosed, setHaveContactsBeenClosed] = useState<boolean>(
    false
  );
  const [user, setUser] = useState<User>(nullUser);
  const [
    userThatCanBeAssignedTo,
    setUserThatCanBeAssignedTo,
  ] = useState<User | null>(null);
  const [assignedTo, setAssignedTo] = useState<User>();
  const [value, setValue] = useState('');

  const editor = usePlateEditorRef();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  false;

  const isAssigned = Boolean(assignedTo);

  const determineAssigningVerb = useCallback(() => {
    const verbBase = determineAssigningVerbBase({
      assignedTo: thread.assignedTo ?? null,
      userThatCanBeAssignedTo,
    });
    return verbBase;
  }, [thread.assignedTo, userThatCanBeAssignedTo]);

  const retrieveUserThatCanBeAssignedTo = useCallback(
    (text: string) => {
      const mentionedUsersEmailAddresses = findMentionedUsers(text);
      const unassignedMentionedUsersEmailAddresses = thread.assignedTo
        ? mentionedUsersEmailAddresses.filter(
            (emailAddress) => emailAddress !== thread.assignedTo!.email
          )
        : mentionedUsersEmailAddresses;
      if (unassignedMentionedUsersEmailAddresses.length >= 1) {
        const emailAddress = unassignedMentionedUsersEmailAddresses[0];
        const user2 = retrieveUserByEmailAddress(emailAddress);
        return user2;
      }
      return null;
    },
    [retrieveUserByEmailAddress, thread.assignedTo]
  );

  const onToggleAssign = useCallback(() => {
    if (isAssigned) {
      setAssignedTo(undefined);
    } else if (userThatCanBeAssignedTo) {
      setAssignedTo(userThatCanBeAssignedTo);
    }
  }, [isAssigned, userThatCanBeAssignedTo]);

  const onChange = useCallback((newValue) => {
    setValue(newValue);
  }, []);

  const handleValueChange = useCallback(
    (newValue) => {
      const userThatCanBeAssignedTo2 = retrieveUserThatCanBeAssignedTo(
        newValue
      );
      if (userThatCanBeAssignedTo2) {
        setUserThatCanBeAssignedTo(userThatCanBeAssignedTo2);
      } else {
        setUserThatCanBeAssignedTo(null);
        setAssignedTo(undefined);
      }
    },
    [retrieveUserThatCanBeAssignedTo]
  );

  const clearTextArea = useCallback(() => {
    setValue('');
  }, []);

  const onSubmitComment = useCallback(() => {
    onSubmitCommentCallback(value, assignedTo);
    clearTextArea();
  }, [assignedTo, clearTextArea, onSubmitCommentCallback, value]);

  const hasComments = thread.comments?.length >= 1;

  const onCancel = useCallback(() => {
    if (hasComments) {
      clearTextArea();
    }

    onCancelCreateThread();
  }, [hasComments, onCancelCreateThread, clearTextArea]);

  const onReOpenThread = useCallback(() => {
    if (!editor) return;
    const threadNodeEntries = Array.from(getThreadNodeEntries(editor));
    const threadNodeEntry = threadNodeEntries.find(
      ([threadNode]) => (threadNode.thread as ThreadType).id === thread.id
    );
    if (threadNodeEntry) {
      const [, threadNodePath] = threadNodeEntry;
      const newThread = cloneDeep(thread);
      newThread.isResolved = false;
      upsertThread(editor, {
        at: threadNodePath,
        thread: newThread,
      });
    }
  }, [editor, thread]);

  const deleteThread = useCallback(() => {
    if (editor) {
      deleteThreadAtSelection(editor);
    }
  }, [editor]);

  const deleteComment = useCallback(
    (comment) => {
      if (editor) {
        thread.comments = thread.comments.filter(
          (comment2) => comment2 !== comment
        );
        upsertThreadAtSelection(editor, thread);
      }
    },
    [editor, thread]
  );

  const onDelete = useCallback(
    (comment: Comment) => {
      if (isFirstComment(thread, comment)) {
        deleteThread();
      } else {
        deleteComment(comment);
      }
    },
    [deleteComment, deleteThread, thread]
  );

  const determineSubmitButtonText = useCallback(() => {
    if (isAssigned) {
      return determineAssigningVerb();
    }
    return thread.comments.length === 0 ? 'Comment' : 'Reply';
  }, [determineAssigningVerb, isAssigned, thread.comments.length]);

  useEffect(() => {
    handleValueChange(value);
  }, [value, handleValueChange]);

  useEffect(() => {
    setUser(retrieveUser());
  }, [retrieveUser]);

  useEffect(
    function clearTextAreaWhenSwitchingToDifferentThread() {
      clearTextArea();
    },
    [clearTextArea, thread]
  );

  return (
    <div css={threadRootCss}>
      {thread.assignedTo ? (
        <PlateAssignedToHeader
          thread={thread}
          assignedTo={thread.assignedTo}
          showResolveThreadButton={showResolveThreadButton}
          showReOpenThreadButton={showReOpenThreadButton}
          retrieveUser={retrieveUser}
          onResolveThread={onResolveThread}
          onReOpenThread={onReOpenThread}
        />
      ) : null}
      {thread.comments.map((comment: Comment, index) => (
        <PlateThreadComment
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
        {!hasComments ? (
          <div css={threadCommentHeadCss}>
            <PlateAvatar user={user} />
            <div css={threadAuthorTimestampCss}>
              <div css={threadCommenterNameCss}>{user.name}</div>
            </div>
          </div>
        ) : null}
        {!noTextArea ? (
          <div
            css={[
              threadCommentInputCss,
              hasComments ? threadCommentInputReplyCss : null,
            ]}
          >
            <PlateTextArea
              ref={textAreaRef}
              value={value}
              onValueChange={onChange}
              thread={thread}
              fetchContacts={fetchContacts}
              haveContactsBeenClosed={haveContactsBeenClosed}
              setHaveContactsBeenClosed={setHaveContactsBeenClosed}
              onSubmit={onSubmitComment}
            />
            <ThreadCheckbox
              determineAssigningVerb={determineAssigningVerb}
              isAssigned={isAssigned}
              onToggleAssign={onToggleAssign}
              retrieveUser={retrieveUser}
              userThatCanBeAssignedTo={userThatCanBeAssignedTo}
            />
            <div css={threadActionsCss}>
              <button
                type="button"
                css={threadCommentButtonCss}
                onClick={onSubmitComment}
                disabled={value.trim().length === 0}
              >
                {determineSubmitButtonText()}
              </button>
              <button
                css={threadCancelButtonCss}
                onClick={onCancel}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
