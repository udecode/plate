import '@material/checkbox/dist/mdc.checkbox.css';
import '@material/form-field/dist/mdc.form-field.css';
import React from 'react';
import { Comment } from '@udecode/plate-comments';
import { generateUserDisplayIdentifier } from '../../utils/generateUserDisplayIdentifier';
import { AssignedToHeader } from '../AssignedToHeader/AssignedToHeader';
import { Avatar } from '../Avatar/PlateAvatar';
import { TextArea } from '../CommentTextArea/TextArea';
import { ThreadComment } from '../ThreadComment';
import { getThreadStyles } from './Thread.styles';
import { ThreadStyleProps } from './Thread.types';
import { useThread } from './useThread';

export const Thread = (props: ThreadStyleProps) => {
  const {
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
  } = useThread(props);

  const styles = getThreadStyles(props);
  // const { root: commentHeader } = createCommentHeaderStyles(otherProps);
  // const { root: authorTimestamp } = createAuthorTimestampStyles(otherProps);
  // const { root: commenterName } = createCommenterNameStyles(otherProps);
  // const { root: commentInput, commentInputReply } = createCommentInputStyles(
  //   otherProps
  // );
  // const { root: buttons } = createButtonsStyles(otherProps);
  // const { root: commentButton } = createCommentButtonStyles(otherProps);
  // const { root: cancelButton } = createCancelButtonStyles(otherProps);

  // let commentInputCss = [...commentInput.css];
  // let commentInputClassName = commentInput.className;
  // if (hasComments) {
  //   commentInputCss = commentInputCss.concat(commentInputReply!.css);
  //   commentInputClassName += ` ${commentInputReply!.className}`;
  // }

  return (
    <div css={styles.root.css} className={styles.root.className}>
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
      {thread.comments.map((comment: Comment, index: number) => (
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
        {!hasComments ? (
          <div
            css={styles.commentHeader?.css}
            className={styles.commentHeader?.className}
          >
            <Avatar user={user} />
            <div
              css={styles.authorTimestamp?.css}
              className={styles.authorTimestamp?.className}
            >
              <div
                css={styles.commenterName?.css}
                className={styles.commenterName?.className}
              >
                {user.name}
              </div>
            </div>
          </div>
        ) : null}
        <div
        // css={commentInputCss} className={commentInputClassName}
        >
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
                  checked={isAssigned}
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
          <div css={styles.buttons?.css} className={styles.buttons?.className}>
            <button
              type="button"
              css={styles.commentButton?.css}
              className={styles.commentButton?.className}
              onClick={onSubmitComment}
              disabled={value.trim().length === 0}
            >
              {determineSubmitButtonText()}
            </button>
            <button
              type="button"
              css={styles.cancelButton?.css}
              className={styles.cancelButton?.className}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
