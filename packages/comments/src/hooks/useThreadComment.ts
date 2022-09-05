import { useCallback, useState } from 'react';
import { Contact, generateThreadLink, Thread } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export type ThreadCommentStyleProps = ThreadCommentProps;

export type ThreadCommentStyles = {
  actions: CSSProp;
  authorTimestamp: CSSProp;
  commenterName: CSSProp;
  commentHeader: CSSProp;
  threadCommentText: CSSProp;
  timestamp: CSSProp;
};

export type ThreadCommentProps = {
  comment: Comment;
  thread: Thread;
  showResolveThreadButton: boolean;
  showReOpenThreadButton: boolean;
  showMoreButton?: boolean;
  showLinkToThisComment: boolean;
  onSaveComment: (comment: Comment) => void;
  onResolveThread: () => void;
  onReOpenThread: () => void;
  onDelete: (comment: Comment) => void;
  fetchContacts: () => Contact[];
} & StyledProps<ThreadCommentStyles>;

export const useThreadComment = (props: ThreadCommentProps) => {
  const {
    comment,
    thread,
    showResolveThreadButton,
    showReOpenThreadButton,
    showMoreButton,
    showLinkToThisComment,
    onSaveComment,
    onResolveThread,
    onReOpenThread,
    onDelete: onDeleteCallback,
    fetchContacts,
  } = props;

  const [isEdited, setIsEdited] = useState(false);
  const [threadLink, setThreadLink] = useState<string | null>(null);

  const onEdit = useCallback(() => {
    setIsEdited(true);
  }, []);

  const onCancel = useCallback(() => {
    setIsEdited(false);
  }, []);

  const onDelete = useCallback(() => {
    onDeleteCallback(comment);
  }, [comment, onDeleteCallback]);

  const onLinkToThisComment = useCallback(() => {
    setThreadLink(generateThreadLink(thread));
  }, [thread]);

  const onCloseCommentLinkDialog = useCallback(() => {
    setThreadLink(null);
  }, []);

  const onSave = useCallback(
    (text: string) => {
      setIsEdited(false);
      // @ts-ignore
      onSaveComment({ ...comment, text });
    },
    [comment, onSaveComment]
  );

  return {
    comment,
    fetchContacts,
    isEdited,
    onCancel,
    onCloseCommentLinkDialog,
    onDelete,
    onEdit,
    onLinkToThisComment,
    onReOpenThread,
    onResolveThread,
    onSave,
    showLinkToThisComment,
    showMoreButton,
    showReOpenThreadButton,
    showResolveThreadButton,
    thread,
    threadLink,
  } as const;
};
