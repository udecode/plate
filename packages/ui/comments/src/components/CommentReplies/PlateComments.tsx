import React, { useMemo, useRef } from 'react';
import { commentsActions, useCommentsSelectors } from '@udecode/plate-comments';
import { useOnClickOutside } from '@udecode/plate-core';
import { PlateComment } from '../Comment';
import { PlateCommentTextArea } from '../TextArea';
import {
  cancelCommentButtonCss,
  commentsRootCss,
  submitCommentButtonCss,
  threadActionsCss,
  threadCommentInputCss,
  threadCommentInputReplyCss,
} from './styles';

export type PlateCommentsProps = {
  commentId: string;
  showResolveCommentButton: boolean;
  showUnresolveCommentButton: boolean;
  showMoreButton: boolean;
  noTextArea?: boolean;
};

export const PlateComments = (props: PlateCommentsProps) => {
  const { commentId, showMoreButton, noTextArea } = props;

  const comment = useCommentsSelectors().comment(commentId);
  const commentText = useCommentsSelectors().commentText(commentId);
  const commentReplies = useCommentsSelectors().commentReplies(commentId);

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const submitButtonText = useMemo(
    () => (!comment.value ? 'Comment' : 'Reply'),
    [comment.value]
  );

  const ref = useRef(null);

  useOnClickOutside(
    () => {
      commentsActions.activeCommentId(null);
    },
    { refs: [ref] }
  );

  return (
    <div css={commentsRootCss} ref={ref}>
      <PlateComment
        key={comment.id}
        commentId={commentId}
        showResolveCommentButton
        showUnresolveCommentButton
        showMoreButton={showMoreButton}
        showLinkToThisComment
      />

      {Object.keys(commentReplies).map((id) => (
        <PlateComment key={id} commentId={id} showMoreButton={showMoreButton} />
      ))}

      <div>
        {!noTextArea ? (
          <div
            css={[
              threadCommentInputCss,
              !!commentReplies.length && threadCommentInputReplyCss,
            ]}
          >
            <PlateCommentTextArea ref={textAreaRef} commentId={commentId} />

            <div css={threadActionsCss}>
              <button
                type="button"
                css={submitCommentButtonCss}
                disabled={!commentText.trim().length}
              >
                {submitButtonText}
              </button>

              <button css={cancelCommentButtonCss} type="button">
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
