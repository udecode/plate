import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePlateEditorRef } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import {
  Comment,
  Contact,
  createNullUser,
  deleteThreadAtSelection,
  doesContactMatchString,
  findThreadNodeEntries,
  isFirstComment,
  Thread as ThreadModel,
  upsertThread,
  upsertThreadAtSelection,
  User,
} from '@xolvio/plate-comments';
import { FetchContacts } from '../FetchContacts';
import { OnSaveComment, OnSubmitComment, RetrieveUser } from '../useComments';
import { Contacts } from './Contacts';
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
  const [areContactsShown, setAreContactsShown] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts2] = useState<Contact[]>([]);
  const [haveContactsBeenClosed, setHaveContactsBeenClosed] = useState<boolean>(
    false
  );
  const [selectedContactIndex, setSelectedContactIndex] = useState<number>(0);

  const [user, setUser] = useState<User>(createNullUser());

  useEffect(() => {
    (async () => {
      setUser(await retrieveUser());
    })();
  }, [retrieveUser]);

  const retrieveMentionStringAtCaretPosition = useCallback(
    function retrieveMentionStringAtCaretPosition() {
      const textArea = textAreaRef.current!;

      function isMentionStringNextToCaret(
        indexOfLastCharacterOfMentionString: number
      ): boolean {
        return (
          indexOfLastCharacterOfMentionString > textArea.selectionStart ||
          textArea.selectionStart - indexOfLastCharacterOfMentionString === 1
        );
      }

      const { value } = textArea;
      const mentionStringStartIndex = value
        .substr(0, textArea.selectionStart)
        .indexOf('@');
      if (mentionStringStartIndex !== -1) {
        const mentionRegExp = /@(?:\w+ ?\w* ?)?/;
        const match = mentionRegExp.exec(value);
        if (match) {
          const indexOfLastCharacterOfMentionString =
            mentionRegExp.lastIndex + match[0].length - 1;
          if (isMentionStringNextToCaret(indexOfLastCharacterOfMentionString)) {
            const mentionString = match[0].trim();
            const mentionStringEndIndex =
              mentionStringStartIndex + mentionString.length;
            return {
              string: mentionString,
              startIndex: mentionStringStartIndex,
              endIndex: mentionStringEndIndex,
            };
          }
        }
      }
      return null;
    },
    [textAreaRef]
  );

  const retrieveMentionStringAfterAtCharacter = useCallback(
    function retrieveMentionStringAfterAtCharacter(): string | null {
      const mentionString = retrieveMentionStringAtCaretPosition();
      return mentionString ? mentionString.string.substr(1) : null;
    },
    [retrieveMentionStringAtCaretPosition]
  );

  const filterContacts = useCallback(
    function filterContacts(contacts2: Contact[]) {
      const mentionStringAfterAtCharacter = retrieveMentionStringAfterAtCharacter();
      let newFilteredContacts;
      if (mentionStringAfterAtCharacter) {
        newFilteredContacts = contacts2.filter(
          doesContactMatchString.bind(null, mentionStringAfterAtCharacter)
        );
      } else {
        newFilteredContacts = contacts2;
      }
      return newFilteredContacts;
    },
    [retrieveMentionStringAfterAtCharacter]
  );

  const setFilteredContacts = useCallback(
    function setFilteredContacts(filteredContacts2) {
      setFilteredContacts2(filteredContacts2);
      setSelectedContactIndex(
        Math.min(selectedContactIndex, filteredContacts2.length - 1)
      );
    },
    [selectedContactIndex]
  );

  const updateFilteredContacts = useCallback(
    function updateFilteredContacts() {
      setFilteredContacts(filterContacts(contacts));
    },
    [contacts, filterContacts, setFilteredContacts]
  );

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

  const showContacts = useCallback(
    function showContacts() {
      if (!haveContactsBeenClosed) {
        setAreContactsShown(true);
      }
    },
    [haveContactsBeenClosed]
  );

  const hideContacts = useCallback(function hideContacts() {
    setAreContactsShown(false);
    setSelectedContactIndex(0);
  }, []);

  const insertMention = useCallback(
    function insertMention(mentionedContact) {
      const mentionString = retrieveMentionStringAtCaretPosition();
      if (mentionString) {
        const textArea = textAreaRef.current!;
        const { value } = textArea;
        const mentionInsertString = `@${mentionedContact.email} `;
        textArea.value = `${value.substr(
          0,
          mentionString.startIndex
        )}${mentionInsertString}${value.substr(mentionString.endIndex + 1)}`;
        const selectionIndex =
          mentionString.startIndex + mentionInsertString.length;
        textArea.focus();
        textArea.setSelectionRange(selectionIndex, selectionIndex);
      }
    },
    [retrieveMentionStringAtCaretPosition]
  );

  const onContactSelected = useCallback(
    function onContactSelected(selectedContact: Contact) {
      hideContacts();
      insertMention(selectedContact);
    },
    [insertMention, hideContacts]
  );

  const onKeyDown = useCallback(
    function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
      if (event.key === '@' && !areContactsShown) {
        showContacts();
      }

      if (event.code === 'ArrowUp') {
        event.preventDefault();
        setSelectedContactIndex(Math.max(0, selectedContactIndex - 1));
      } else if (event.code === 'ArrowDown') {
        setSelectedContactIndex(
          Math.min(selectedContactIndex + 1, filteredContacts.length - 1)
        );
      } else if (event.code === 'Enter') {
        const selectedContact = filteredContacts[selectedContactIndex];
        onContactSelected(selectedContact);
        event.preventDefault();
      }
    },
    [
      areContactsShown,
      showContacts,
      selectedContactIndex,
      filteredContacts,
      onContactSelected,
    ]
  );

  const onKeyUp = useCallback(
    function onKeyUp() {
      setHaveContactsBeenClosed(false);

      updateFilteredContacts();

      const mentionStringAfterAtCharacter = retrieveMentionStringAfterAtCharacter();
      if (
        mentionStringAfterAtCharacter !== null &&
        (mentionStringAfterAtCharacter === '' ||
          contacts.some(
            doesContactMatchString.bind(null, mentionStringAfterAtCharacter)
          ))
      ) {
        if (!areContactsShown) {
          showContacts();
        }
      } else {
        hideContacts();
      }
    },
    [
      updateFilteredContacts,
      retrieveMentionStringAfterAtCharacter,
      contacts,
      areContactsShown,
      showContacts,
      hideContacts,
    ]
  );

  const onContactsClosed = useCallback(function onContactsClosed() {
    setHaveContactsBeenClosed(true);
  }, []);

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

  useEffect(
    function loadContacts() {
      async function loadContacts2() {
        const contacts2 = await fetchContacts();
        setContacts(contacts2);
        setFilteredContacts(filterContacts(contacts2));
      }

      loadContacts2();
    },
    [fetchContacts, filterContacts, setFilteredContacts]
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
  const { root: textArea } = createTextAreaStyles(props);
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
          <div className="mdc-menu-surface--anchor">
            <textarea
              ref={textAreaRef}
              rows={1}
              css={textArea.css}
              className={textArea.className}
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}
              placeholder={`${
                hasComments() ? 'Reply' : 'Comment'
              } or add others with @`}
            />
            {areContactsShown && (
              <Contacts
                contacts={filteredContacts}
                onSelected={onContactSelected}
                onClosed={onContactsClosed}
                selectedIndex={selectedContactIndex}
              />
            )}
          </div>
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
