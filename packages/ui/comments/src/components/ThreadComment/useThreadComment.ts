import { useCallback, useState } from 'react';
import { generateThreadLink } from '@udecode/plate-comments';
import { ThreadCommentProps } from './ThreadComment.types';

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
      onSaveComment({
        ...comment,
        text,
      });
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
