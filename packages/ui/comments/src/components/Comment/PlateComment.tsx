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
import { PlateMenuButton } from '../MenuButton';
import { PlateResolveCommentButton } from '../ResolveButton';
import { PlateCommentValue } from '../ThreadCommentEditing/PlateCommentValue';
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
        <PlateAvatar />

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

      {isEditing ? (
        <PlateCommentValue />
      ) : (
        <div css={threadCommentTextCss}>{commentText}</div>
      )}
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
