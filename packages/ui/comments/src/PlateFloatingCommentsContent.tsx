import React, { useRef } from 'react';
import {
  CommentProvider,
  SCOPE_ACTIVE_COMMENT,
  unsetCommentNodesById,
  useCommentById,
  useCommentsActions,
  useCommentsSelectors,
} from '@udecode/plate-comments';
import { useOnClickOutside, usePlateEditorRef } from '@udecode/plate-core';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlateComment } from './PlateComment';
import { PlateCommentNewForm } from './PlateCommentNewForm';
import { PlateCommentReplies } from './PlateCommentReplies';

export type PlateFloatingCommentsContentProps = {
  disableForm?: boolean;
};

export const commentsRootCss = css`
  ${tw`rounded-lg bg-white p-3 flex flex-col space-y-2`};
  box-shadow: 0 2px 6px 2px rgb(60 64 67 / 15%);
  border: 1px solid white;
`;

export const PlateFloatingCommentsContent = (
  props: PlateFloatingCommentsContentProps
) => {
  const { disableForm } = props;

  const activeCommentId = useCommentsSelectors().activeCommentId()!;
  const myUserId = useCommentsSelectors().myUserId();
  const activeComment = useCommentById(activeCommentId);
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const editor = usePlateEditorRef();

  const ref = useRef(null);

  const hasNoComment = !activeComment;
  const refs: any[] = [ref];

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
        {!hasNoComment && (
          <>
            <PlateComment key={activeCommentId} commentId={activeCommentId} />

            <PlateCommentReplies />
          </>
        )}

        {!!myUserId && !disableForm && <PlateCommentNewForm />}
      </div>
    </CommentProvider>
  );
};
