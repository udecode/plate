import { useCallback, useEffect, useRef, useState } from 'react';
import { MDCCheckbox } from '@material/checkbox';
import {
  Comment,
  createNullUser,
  deleteThreadAtSelection,
  findThreadNodeEntries,
  isFirstComment,
  Thread,
  upsertThread,
  upsertThreadAtSelection,
  User,
} from '@udecode/plate-comments';
import { usePlateEditorRef } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import { CommonThreadAndSideThreadProps } from '@udecode/plate-ui-comments';
import { CSSProp } from 'styled-components';
import { OnReOpenThread } from '../../../ui/comments/src/types';
import { findMentionedUsers } from '../../../ui/comments/src/utils';
import { determineAssigningVerb as determineAssigningVerbBase } from '../../../ui/comments/src/utils/determineAssigningVerb';
import { useLoggedInUser } from '../utils/useLoggedInUser';

export type ThreadStyleProps = ThreadProps;

export type ThreadStyles = {
  commentHeader: CSSProp;
  authorTimestamp: CSSProp;
  commenterName: CSSProp;
  buttons: CSSProp;
  commentButton: CSSProp;
  cancelButton: CSSProp;
};

export type ThreadProps = {
  assignedTo?: User;
  onReOpenThread?: () => void;
  onResolveThread: () => void;
  retrieveUser: () => User;
  showMoreButton?: boolean;
  showReOpenThreadButton: boolean;
  showResolveThreadButton: boolean;
  thread: Thread;
} & CommonThreadAndSideThreadProps &
  StyledProps<ThreadStyles>;

export const useThread = (props: ThreadProps) => {
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
  } = props;

  const [haveContactsBeenClosed, setHaveContactsBeenClosed] = useState(false);
  const [user, setUser] = useState(createNullUser());
  const [
    userThatCanBeAssignedTo,
    setUserThatCanBeAssignedTo,
  ] = useState<User | null>(null);
  const [assignedTo, setAssignedTo] = useState<User>();
  const [value, setValue] = useState('');

  const editor = usePlateEditorRef();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  false;

  const loggedInUser = useLoggedInUser(retrieveUser);

  const isAssigned = Boolean(assignedTo);
  const hasComments = thread.comments.length >= 1;

  const determineAssigningVerb = useCallback(() => {
    const verbBase = determineAssigningVerbBase({
      assignedTo: thread.assignedTo ?? null,
      userThatCanBeAssignedTo,
    });
    return verbBase;
  }, [thread.assignedTo, userThatCanBeAssignedTo]);

  const retrieveUserThatCanBeAssignedTo = useCallback(
    async (text: string) => {
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

  const onToggleAssign = useCallback(async () => {
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

  useEffect(() => {
    handleValueChange(value).catch(console.error);
  }, [value, handleValueChange]);

  useEffect(() => {
    (async () => {
      setUser(await retrieveUser());
    })();
  }, [retrieveUser]);

  const clearTextArea = useCallback(function clearTextArea() {
    setValue('');
  }, []);

  const onSubmitComment = useCallback(() => {
    onSubmitCommentCallback(value, assignedTo);
    clearTextArea();
  }, [assignedTo, clearTextArea, onSubmitCommentCallback, value]);

  const onCancel = useCallback(() => {
    if (hasComments) {
      clearTextArea();
    }

    onCancelCreateThread();
  }, [hasComments, onCancelCreateThread, clearTextArea]);

  const onReOpenThread = useCallback<OnReOpenThread>(() => {
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

  useEffect(
    function clearTextAreaWhenSwitchingToDifferentThread() {
      clearTextArea();
    },
    [clearTextArea, thread]
  );

  const initializeCheckbox = useCallback((checkbox) => {
    if (checkbox) {
      new MDCCheckbox(checkbox);
    }
  }, []);

  const determineSubmitButtonText = useCallback(() => {
    if (isAssigned) {
      return determineAssigningVerb();
    }
    return thread.comments.length === 0 ? 'Comment' : 'Reply';
  }, [determineAssigningVerb, isAssigned, thread.comments.length]);

  return {
    determineAssigningVerb,
    determineSubmitButtonText,
    fetchContacts,
    hasComments,
    haveContactsBeenClosed,
    initializeCheckbox,
    isAssigned,
    loggedInUser,
    onCancel,
    onChange,
    onDelete,
    onReOpenThread,
    onResolveThread,
    onSaveComment,
    onSubmitComment,
    onToggleAssign,
    retrieveUser,
    setHaveContactsBeenClosed,
    showMoreButton,
    showReOpenThreadButton,
    showResolveThreadButton,
    textAreaRef,
    thread,
    user,
    userThatCanBeAssignedTo,
    value,
  } as const;
};
