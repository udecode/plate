import React, { useRef } from 'react';
import { useOnClickOutside } from '@udecode/plate-core';
import { SCOPE_ACTIVE_COMMENT } from '../ActiveCommentProvider';
import { PlateAvatar } from '../Avatar/index';
import { PlateComment } from '../Comment';
import { CommentProvider, useCommentReplies } from '../CommentProvider';
import {
  useCommentById,
  useCommentsActions,
  useCommentsSelectors,
} from '../CommentsProvider';
import { PlateCommentTextArea } from '../CommentTextArea';
import { PlateNewCommentSubmitButton } from '../NewCommentSubmitButton/PlateNewCommentSubmitButton';
import { PlateCommentReplies } from './PlateCommentReplies';
import {
  commentActionsCss,
  commentFormCss,
  commentsRootCss,
  threadCommentInputReplyCss,
} from './styles';

export type PlateFloatingCommentsContentProps = {
  disableForm?: boolean;
};

export const PlateFloatingCommentsContent = (
  props: PlateFloatingCommentsContentProps
) => {
  const { disableForm } = props;

  const activeCommentId = useCommentsSelectors().activeCommentId()!;
  const currentUserId = useCommentsSelectors().currentUserId();
  const activeComment = useCommentById(activeCommentId);
  const commentReplies = useCommentReplies(SCOPE_ACTIVE_COMMENT);
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const ref = useRef(null);

  useOnClickOutside(
    () => {
      setActiveCommentId(null);
    },
    { refs: [ref] }
  );

  return (
    <CommentProvider
      key={activeCommentId}
      id={activeCommentId}
      scope={SCOPE_ACTIVE_COMMENT}
    >
      <div css={commentsRootCss} ref={ref}>
        {!!activeComment && (
          <>
            <PlateComment
              key={activeCommentId}
              commentId={activeCommentId}
              showResolveCommentButton
              showUnresolveCommentButton
              // showMoreButton={showMoreButton}
              showLinkToThisComment
            />

            <PlateCommentReplies />
          </>
        )}

        {!!currentUserId && !disableForm && (
          <div
            css={[
              commentFormCss,
              !!commentReplies.length && threadCommentInputReplyCss,
            ]}
          >
            <div tw="flex space-x-2 w-full">
              <PlateAvatar userId={currentUserId} />

              <div tw="flex flex-col flex-grow space-y-2">
                <PlateCommentTextArea ref={textAreaRef} />

                <div css={commentActionsCss}>
                  <PlateNewCommentSubmitButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CommentProvider>
  );
};
