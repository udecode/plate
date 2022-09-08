import React from 'react';
import { TextArea } from '../CommentTextArea/TextArea';
import { getThreadCommentEditingStyles } from './ThreadCommentEditing.styles';
import { ThreadCommentEditingProps } from './ThreadCommentEditing.types';
import { useThreadCommentEditing } from './useThreadCommentEditing';

export const ThreadCommentEditing = (props: ThreadCommentEditingProps) => {
  const {
    disabled,
    fetchContacts,
    haveContactsBeenClosed,
    onCancel,
    onChange,
    onSaveComment,
    setHaveContactsBeenClosed,
    textAreaRef,
    thread,
    value,
  } = useThreadCommentEditing(props);

  const styles = getThreadCommentEditingStyles(props);

  return (
    <div css={styles.root.css} className={styles.root.className}>
      <TextArea
        fetchContacts={fetchContacts}
        haveContactsBeenClosed={haveContactsBeenClosed}
        onChange={onChange}
        onSubmit={onSaveComment}
        ref={textAreaRef}
        setHaveContactsBeenClosed={setHaveContactsBeenClosed}
        thread={thread}
        value={value}
      />
      <div css={styles.buttons?.css} className={styles.buttons?.className}>
        <button
          className={styles.commentButton?.className}
          css={styles.commentButton?.css}
          disabled={disabled}
          onClick={onSaveComment}
          type="button"
        >
          Save
        </button>
        <button
          className={styles.cancelButton?.className}
          css={styles.cancelButton?.css}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
