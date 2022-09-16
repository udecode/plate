import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { Comment } from '../../types';
import { Avatar } from '../Avatar';

export type ThreadCommentAvatarImageProps = {
  comment: Comment;
} & HTMLPropsAs<'img'>;

export const useThreadCommentAvatarImage = (
  props: ThreadCommentAvatarImageProps
) => {
  const { comment } = props;
  const user = comment.createdBy;
  return { ...props, user };
};

export const ThreadCommentAvatarImage = createComponentAs<ThreadCommentAvatarImageProps>(
  (props) => {
    const avatarProps = useThreadCommentAvatarImage(props);
    return createElementAs(Avatar.Image, avatarProps);
  }
);
