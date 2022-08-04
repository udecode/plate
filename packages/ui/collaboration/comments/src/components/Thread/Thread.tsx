import '@material/checkbox/dist/mdc.checkbox.css';
import '@material/form-field/dist/mdc.form-field.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MDCCheckbox } from '@material/checkbox';
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
import {
  FetchContacts,
  OnCancelCreateThread,
  OnReOpenThread,
  OnResolveThread,
  OnSaveComment,
  OnSubmitComment,
  RetrieveUser,
} from '../../types';
import { determineAssigningVerb as determineAssigningVerbBase } from '../../utils/determineAssigningVerb';
import { generateUserDisplayIdentifier } from '../../utils/generateUserDisplayIdentifier';
import { useLoggedInUser } from '../../utils/useLoggedInUser';
import { AssignedToHeader } from '../AssignedToHeader/AssignedToHeader';
import { Avatar } from '../Avatar/Avatar';
import { TextArea } from '../TextArea/TextArea';
import { ThreadComment } from '../ThreadComment';
import {
  createAuthorTimestampStyles,
  createButtonsStyles,
  createCancelButtonStyles,
  createCommentButtonStyles,
  createCommenterNameStyles,
  createCommentHeaderStyles,
  createCommentInputStyles,
  createThreadStyles,
} from './Thread.styles';

type RetrieveUserByEmailAddressReturnType = User | null;
type RetrieveUserByEmailAddress = (
  emailAddress: string
) =>
  | RetrieveUserByEmailAddressReturnType
  | Promise<RetrieveUserByEmailAddressReturnType>;

export interface CommonThreadAndSideThreadProps {
  thread: ThreadModel;
  onSaveComment: OnSaveComment;
  onSubmitComment: OnSubmitComment;
  onCancelCreateThread: OnCancelCreateThread;
  onResolveThread: OnResolveThread;
  fetchContacts: FetchContacts;
  retrieveUser: RetrieveUser;
  retrieveUserByEmailAddress: RetrieveUserByEmailAddress;
}

export type ThreadProps = {
  showResolveThreadButton: boolean;
  showReOpenThreadButton: boolean;
  showMoreButton: boolean;
} & StyledProps &
  CommonThreadAndSideThreadProps;

function findMentionedUsers(commentText: string): string[] {
  const mentionedUserIdentifiers: string[] = [];
  /**
   * The email regular expression is based on the one that has been published here: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
   * Source of license: https://github.com/whatwg/html/blob/main/LICENSE
   *
   * Copyright © WHATWG (Apple, Google, Mozilla, Microsoft).
   *
   * BSD 3-Clause License
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice, this
   *    list of conditions and the following disclaimer.
   *
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   *    this list of conditions and the following disclaimer in the documentation
   *    and/or other materials provided with the distribution.
   *
   * 3. Neither the name of the copyright holder nor the names of its
   *    contributors may be used to endorse or promote products derived from
   *    this software without specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
   * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
   * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
   * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
   * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
   * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
   * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   */
  const emailRegExp =
    "[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*";
  const mentionRegExp = new RegExp(`@(${emailRegExp})\\b`, 'g');
  let match: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((match = mentionRegExp.exec(commentText))) {
    const mentionedUser = match[1];
    mentionedUserIdentifiers.push(mentionedUser);
  }
  return mentionedUserIdentifiers;
}

export function Thread({
  thread,
  showResolveThreadButton,
  showReOpenThreadButton,
  showMoreButton,
  onSaveComment,
  onSubmitComment: onSubmitCommentCallback,
  onCancelCreateThread,
  onResolveThread,
  fetchContacts,
  retrieveUser,
  retrieveUserByEmailAddress,
  ...props
}: ThreadProps) {
  const editor = usePlateEditorRef();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [haveContactsBeenClosed, setHaveContactsBeenClosed] = useState<boolean>(
    false
  );

  const loggedInUser = useLoggedInUser(retrieveUser);
  const [user, setUser] = useState<User>(createNullUser());

  const [
    userThatCanBeAssignedTo,
    setUserThatCanBeAssignedTo,
  ] = useState<User | null>(null);
  const [assignedTo, setAssignedTo] = useState<User | undefined>(undefined);

  const isAssigned = useCallback(
    function isAssigned() {
      return Boolean(assignedTo);
    },
    [assignedTo]
  );

  const determineAssigningVerb = useCallback(
    function determineAssigningVerb() {
      return determineAssigningVerbBase({
        assignedTo: thread.assignedTo ?? null,
        userThatCanBeAssignedTo,
      });
    },
    [thread.assignedTo, userThatCanBeAssignedTo]
  );

  const [value, setValue] = useState<string>('');

  const retrieveUserThatCanBeAssignedTo = useCallback(
    async function retrieveUserThatCanBeAssignedTo(text: string) {
      const mentionedUsersEmailAddresses = findMentionedUsers(text);
      const unassignedMentionedUsersEmailAddresses = thread.assignedTo
        ? mentionedUsersEmailAddresses.filter(
            (emailAddress) => emailAddress !== thread.assignedTo!.email
          )
        : mentionedUsersEmailAddresses;
      if (unassignedMentionedUsersEmailAddresses.length >= 1) {
        const emailAddress = unassignedMentionedUsersEmailAddresses[0];
        const user2 = await retrieveUserByEmailAddress(emailAddress);
        return user2;
      }
      return null;
    },
    [retrieveUserByEmailAddress, thread.assignedTo]
  );

  const onToggleAssign = useCallback(
    async function onToggleAssign() {
      if (isAssigned()) {
        setAssignedTo(undefined);
      } else if (userThatCanBeAssignedTo) {
        setAssignedTo(userThatCanBeAssignedTo);
      }
    },
    [isAssigned, userThatCanBeAssignedTo]
  );

  const onChange = useCallback(function onChange(newValue) {
    setValue(newValue);
  }, []);

  const handleValueChange = useCallback(
    async function handleValueChange(newValue) {
      const userThatCanBeAssignedTo2 = await retrieveUserThatCanBeAssignedTo(
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

  useEffect(
    function onValueChange() {
      handleValueChange(value).catch(console.error);
    },
    [value, handleValueChange]
  );

  useEffect(() => {
    (async () => {
      setUser(await retrieveUser());
    })();
  }, [retrieveUser]);

  const clearTextArea = useCallback(function clearTextArea() {
    setValue('');
  }, []);

  const onSubmitComment = useCallback(
    async function onSubmitComment() {
      onSubmitCommentCallback(value, assignedTo);
      clearTextArea();
    },
    [assignedTo, clearTextArea, onSubmitCommentCallback, value]
  );

  const hasComments = useCallback(
    function hasComments() {
      return thread.comments.length >= 1;
    },
    [thread]
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

  const onReOpenThread = useCallback<OnReOpenThread>(
    function onReOpenThread() {
      if (editor) {
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
      }
    },
    [editor, thread]
  );

  const deleteThread = useCallback(
    function deleteThread() {
      if (editor) {
        deleteThreadAtSelection(editor);
      }
    },
    [editor]
  );

  const deleteComment = useCallback(
    function deleteComment(comment) {
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
    function clearTextAreaWhenSwitchingToDifferentThread() {
      clearTextArea();
    },
    [clearTextArea, thread]
  );

  const { root } = createThreadStyles(props);
  const { root: commentHeader } = createCommentHeaderStyles(props);
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

  const initializeCheckbox = useCallback(function initializeCheckbox(checkbox) {
    if (checkbox) {
      new MDCCheckbox(checkbox);
    }
  }, []);

  const determineSubmitButtonText = useCallback(
    function determineSubmitButtonText() {
      if (isAssigned()) {
        return determineAssigningVerb();
      }
      return thread.comments.length === 0 ? 'Comment' : 'Reply';
    },
    [determineAssigningVerb, isAssigned, thread.comments.length]
  );

  return (
    <div css={root.css} className={root.className}>
      {thread.assignedTo && (
        <AssignedToHeader
          thread={thread}
          assignedTo={thread.assignedTo}
          showResolveThreadButton={showResolveThreadButton}
          showReOpenThreadButton={showReOpenThreadButton}
          retrieveUser={retrieveUser}
          onResolveThread={onResolveThread}
          onReOpenThread={onReOpenThread}
        />
      )}
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
            <Avatar user={user} />
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
            value={value}
            onChange={onChange}
            thread={thread}
            fetchContacts={fetchContacts}
            haveContactsBeenClosed={haveContactsBeenClosed}
            setHaveContactsBeenClosed={setHaveContactsBeenClosed}
            onSubmit={onSubmitComment}
          />
          {userThatCanBeAssignedTo && (
            <div className="mdc-form-field">
              <div
                ref={initializeCheckbox}
                className="mdc-checkbox mdc-checkbox--touch"
              >
                <input
                  type="checkbox"
                  className="mdc-checkbox__native-control"
                  id="assign"
                  checked={isAssigned()}
                  onChange={onToggleAssign}
                />
                <div className="mdc-checkbox__background">
                  <svg className="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                    <path
                      className="mdc-checkbox__checkmark-path"
                      fill="none"
                      d="M1.73,12.91 8.1,19.28 22.79,4.59"
                    />
                  </svg>
                  <div className="mdc-checkbox__mixedmark" />
                </div>
                <div className="mdc-checkbox__ripple" />
              </div>
              <label htmlFor="assign">
                {userThatCanBeAssignedTo
                  ? `${determineAssigningVerb()} to ${generateUserDisplayIdentifier(
                      {
                        user: userThatCanBeAssignedTo,
                        isLoggedInUser:
                          userThatCanBeAssignedTo.id === loggedInUser.id,
                      }
                    )}`
                  : `${determineAssigningVerb()}`}
              </label>
            </div>
          )}
          <div css={buttons.css} className={buttons.className}>
            <button
              type="button"
              css={commentButton.css}
              className={commentButton.className}
              onClick={onSubmitComment}
              disabled={value.trim().length === 0}
            >
              {determineSubmitButtonText()}
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
