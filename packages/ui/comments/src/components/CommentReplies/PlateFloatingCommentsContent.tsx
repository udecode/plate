import React, { useMemo, useRef } from 'react';
import { useOnClickOutside } from '@udecode/plate-core';
import { SCOPE_ACTIVE_COMMENT } from '../ActiveCommentProvider';
import { PlateComment } from '../Comment';
import {
  CommentProvider,
  useCommentReplies,
  useCommentText,
} from '../CommentProvider';
import { useCommentsActions, useCommentsSelectors } from '../CommentsProvider';
import { PlateCommentTextArea } from '../TextArea';
import {
  cancelCommentButtonCss,
  commentActionsCss,
  commentFormCss,
  commentsRootCss,
  submitCommentButtonCss,
  threadCommentInputReplyCss,
} from './styles';

export type PlateFloatingCommentsContentProps = {
  showResolveCommentButton: boolean;
  showUnresolveCommentButton: boolean;
  showMoreButton: boolean;
  disableForm?: boolean;
};

export const PlateFloatingCommentsContent = (
  props: PlateFloatingCommentsContentProps
) => {
  const { showMoreButton, disableForm } = props;

  const activeCommentId = useCommentsSelectors().activeCommentId()!;
  const commentText = useCommentText(activeCommentId);
  const commentReplies = useCommentReplies(activeCommentId);
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const submitButtonText = useMemo(() => (!commentText ? 'Comment' : 'Reply'), [
    commentText,
  ]);

  const ref = useRef(null);

  useOnClickOutside(
    () => {
      setActiveCommentId(null);
    },
    { refs: [ref] }
  );

  return (
    <CommentProvider scope={SCOPE_ACTIVE_COMMENT} id={activeCommentId}>
      <div css={commentsRootCss} ref={ref}>
        <PlateComment
          key={activeCommentId}
          commentId={activeCommentId}
          showResolveCommentButton
          showUnresolveCommentButton
          showMoreButton={showMoreButton}
          showLinkToThisComment
        />

        {Object.keys(commentReplies).map((id) => (
          <PlateComment
            key={id}
            commentId={id}
            showMoreButton={showMoreButton}
          />
        ))}

        <div>
          {!disableForm ? (
            <div
              css={[
                commentFormCss,
                !!commentReplies.length && threadCommentInputReplyCss,
              ]}
            >
              <PlateCommentTextArea ref={textAreaRef} />

              <div css={commentActionsCss}>
                <button
                  type="button"
                  css={submitCommentButtonCss}
                  disabled={!commentText?.trim().length}
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
    </CommentProvider>
  );
};
