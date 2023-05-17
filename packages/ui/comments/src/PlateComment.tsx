import React from 'react';
import {
  CommentProvider,
  useComment,
  useCommentById,
  useCommentSelectors,
  useCommentsSelectors,
  useCommentText,
  useCommentUser,
} from '@udecode/plate-comments';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlateAvatar } from './PlateAvatar';
import { PlateCommentMenuButton } from './PlateCommentMenuButton';
import { PlateCommentResolveButton } from './PlateCommentResolveButton';
import { PlateCommentValue } from './PlateCommentValue';

type PlateCommentProps = {
  commentId: string;
};

export const commentsHeaderCss = css`
  ${tw`box-content cursor-default flex items-center h-10 text-sm m-0 text-left text-black whitespace-nowrap`};
  font-weight: normal;
`;

export const commentHeaderInfoCss = css`
  ${tw`cursor-pointer flex flex-col ml-2 justify-center flex-grow text-sm text-left text-black truncate`};
  font-weight: normal;
  align-items: start;
`;

export const commentHeaderUserNameCss = css`
  ${tw`cursor-default self-stretch font-medium h-4 text-sm leading-5 text-left tracking-wide truncate`};
  color: rgba(60, 64, 67, 1);
`;

export const commentHeaderCreatedDateCss = css`
  ${tw`text-xs leading-4 tracking-wide`};
  color: rgba(60, 64, 67, 1);
`;

export const commentTextCss = css`
  ${tw`whitespace-pre-wrap`};
`;

const PlateCommentContent = () => {
  const comment = useComment()!;
  const isReplyComment = !!comment.parentId;
  const commentText = useCommentText();
  const user = useCommentUser();
  const myUserId = useCommentsSelectors().myUserId();
  const editingValue = useCommentSelectors().editingValue();

  const isMyComment = myUserId === comment.userId;

  return (
    <div>
      <div css={commentsHeaderCss}>
        <PlateAvatar userId={comment.userId} />

        <div css={commentHeaderInfoCss}>
          <div css={commentHeaderUserNameCss}>{user?.name}</div>

          <div css={commentHeaderCreatedDateCss}>
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>

        {isMyComment && (
          <div className="flex space-x-1">
            {!isReplyComment ? <PlateCommentResolveButton /> : null}

            <PlateCommentMenuButton />
          </div>
        )}
      </div>

      <div className="pl-10">
        {editingValue ? (
          <PlateCommentValue />
        ) : (
          <div css={commentTextCss}>{commentText}</div>
        )}
      </div>
    </div>
  );
};

export const PlateComment = ({ commentId }: PlateCommentProps) => {
  const comment = useCommentById(commentId);
  if (!comment) return null;

  return (
    <CommentProvider key={commentId} id={commentId}>
      <PlateCommentContent />
    </CommentProvider>
  );
};
