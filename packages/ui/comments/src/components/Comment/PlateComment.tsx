// import '@material/menu-surface/dist/mdc.menu-surface.css';
import React from 'react';
import { useCommentsSelectors } from '@udecode/plate-comments';
import { PlateAvatar } from '../Avatar';
import { PlateMenuButton } from '../MenuButton';
import { PlateResolveCommentButton } from '../ResolveButton';
import { PlateThreadCommentEditing } from '../ThreadCommentEditing/PlateThreadCommentEditing';
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

export const PlateComment = (props: PlateCommentProps) => {
  const {
    commentId,
    showLinkToThisComment,
    showMoreButton,
    showUnresolveCommentButton,
    showResolveCommentButton,
  } = props;

  const comment = useCommentsSelectors().comment(commentId);
  const commentText = useCommentsSelectors().commentText(commentId);
  const user = useCommentsSelectors().commentUser(commentId);

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

        {showResolveCommentButton ? (
          <PlateResolveCommentButton commentId={commentId} />
        ) : null}

        {showUnresolveCommentButton && (
          <PlateUnresolveCommentButton commentId={commentId} />
        )}

        {showMoreButton ? (
          <PlateMenuButton showLinkToThisComment={showLinkToThisComment} />
        ) : null}
      </div>

      {isEditing ? (
        <PlateThreadCommentEditing commentId={commentId} />
      ) : (
        <div css={threadCommentTextCss}>{commentText}</div>
      )}
    </div>
  );
};
