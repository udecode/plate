import '@material/menu-surface/dist/mdc.menu-surface.css';
import React from 'react';
import { Avatar } from '../Avatar/PlateAvatar';
import { MenuButton } from '../MenuButton';
import { ReOpenThreadButton } from '../ReOpenThreadButton/ReOpenThreadButton';
import { ResolveButton } from '../ResolveButton/ResolveButton';
import { ThreadCommentEditing } from '../ThreadCommentEditing/ThreadCommentEditing';
import { ThreadLinkDialog } from '../ThreadLinkDialog';
import { getThreadCommentStyles } from './ThreadComment.styles';
import { ThreadCommentStyleProps } from './ThreadComment.types';
import { useThreadComment } from './useThreadComment';

export const ThreadComment = (props: ThreadCommentStyleProps) => {
  const {
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
  } = useThreadComment(props);

  const styles = getThreadCommentStyles(props);

  return (
    <div css={styles.root.css} className={styles.root.className}>
      <div
        css={styles.commentHeader?.css}
        className={styles.commentHeader?.className}
      >
        <Avatar user={comment.createdBy} />
        <div
          css={styles.authorTimestamp?.css}
          className={styles.authorTimestamp?.className}
        >
          <div
            css={styles.commenterName?.css}
            className={styles.commenterName?.className}
          >
            {comment.createdBy.name}
          </div>
          <div
            css={styles.timestamp?.css}
            className={styles.timestamp?.className}
          >
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>
        <div css={styles.actions?.css} className={styles.actions?.className}>
          {showResolveThreadButton && (
            <ResolveButton thread={thread} onResolveThread={onResolveThread} />
          )}
          {showReOpenThreadButton && (
            <ReOpenThreadButton onReOpenThread={onReOpenThread} />
          )}
        </div>
        {showMoreButton ? (
          <MenuButton
            showLinkToThisComment={showLinkToThisComment}
            onEdit={onEdit}
            onDelete={onDelete}
            onLinkToThisComment={onLinkToThisComment}
          />
        ) : null}
      </div>
      {isEdited ? (
        <ThreadCommentEditing
          thread={thread}
          defaultText={comment.text}
          onSave={onSave}
          onCancel={onCancel}
          fetchContacts={fetchContacts}
        />
      ) : (
        <div
          css={styles.threadCommentText?.css}
          className={styles.threadCommentText?.className}
        >
          {comment.text}
        </div>
      )}
      {threadLink ? (
        <ThreadLinkDialog
          threadLink={threadLink}
          onClose={onCloseCommentLinkDialog}
        />
      ) : null}
    </div>
  );
};
