// import '@material/menu-surface/dist/mdc.menu-surface.css';
import React from 'react';
import { PlateAvatar } from '../Avatar';
import {
  CommentProvider,
  useComment,
  useCommentText,
  useCommentUser,
} from '../CommentProvider';
import { useCommentById } from '../CommentsProvider';
import { PlateCommentValue } from '../CommentValue/PlateCommentValue';
import { PlateMenuButton } from '../MenuButton';
import { PlateResolveCommentButton } from '../ResolveButton';
import { PlateUnresolveCommentButton } from '../UnresolveButton/index';
import {
  commentsHeaderCss,
  threadCommentHeaderCreatedDateCss,
  threadCommentHeaderInfoCss,
  threadCommentHeaderUserNameCss,
  threadCommentRootCss,
  threadCommentTextCss,
} from './styles';

type PlateCommentProps = {
  commentId: string;
  showResolveCommentButton?: boolean;
  showUnresolveCommentButton?: boolean;
  showMoreButton?: boolean;
  showLinkToThisComment?: boolean;
  disableTextarea?: boolean;
};

const PlateCommentContent = (props: Omit<PlateCommentProps, 'commentId'>) => {
  const {
    showLinkToThisComment,
    showMoreButton,
    showUnresolveCommentButton,
    showResolveCommentButton,
  } = props;

  const comment = useComment()!;
  const commentText = useCommentText();
  const user = useCommentUser();

  // TODO
  const isEditing = false;

  return (
    <div css={threadCommentRootCss}>
      <div css={commentsHeaderCss}>
        <PlateAvatar userId={comment.userId} />

        <div css={threadCommentHeaderInfoCss}>
          <div css={threadCommentHeaderUserNameCss}>{user?.name}</div>
          <div css={threadCommentHeaderCreatedDateCss}>
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>

        {showResolveCommentButton ? <PlateResolveCommentButton /> : null}

        {showUnresolveCommentButton && <PlateUnresolveCommentButton />}

        {showMoreButton ? (
          <PlateMenuButton showLinkToThisComment={showLinkToThisComment} />
        ) : null}
      </div>

      <div tw="pl-10">
        {isEditing ? (
          <PlateCommentValue />
        ) : (
          <div css={threadCommentTextCss}>{commentText}</div>
        )}
      </div>
    </div>
  );
};

export const PlateComment = ({ commentId, ...props }: PlateCommentProps) => {
  const comment = useCommentById(commentId);
  if (!comment) return null;

  return (
    <CommentProvider id={commentId}>
      <PlateCommentContent {...props} />
    </CommentProvider>
  );
};
