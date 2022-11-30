import React, { useRef } from 'react';
import { useOnClickOutside, usePlateEditorRef } from '@udecode/plate-core';
import { unsetCommentNodesById } from '../../../../../comments/src/utils/unsetCommentNodesById';
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
  const myUserId = useCommentsSelectors().myUserId();
  const activeComment = useCommentById(activeCommentId);
  const commentReplies = useCommentReplies(SCOPE_ACTIVE_COMMENT);
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const editor = usePlateEditorRef();

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = useRef(null);

  const refs: any[] = [ref];
  // if (menuRef) refs.push(menuRef);

  useOnClickOutside(
    () => {
      if (!activeComment) {
        unsetCommentNodesById(editor, { id: activeCommentId });
      }

      setActiveCommentId(null);
    },
    { refs }
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
            <PlateComment key={activeCommentId} commentId={activeCommentId} />

            <PlateCommentReplies />
          </>
        )}

        {!!myUserId && !disableForm && (
          <div
            css={[
              commentFormCss,
              !!commentReplies.length && threadCommentInputReplyCss,
            ]}
          >
            <div tw="flex space-x-2 w-full">
              <PlateAvatar userId={myUserId} />

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
