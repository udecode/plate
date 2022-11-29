import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { useCommentUser } from '../CommentProvider';

export type AvatarImageProps = {} & HTMLPropsAs<'img'>;

export const useAvatarImage = (props: AvatarImageProps): HTMLPropsAs<'img'> => {
  const user = useCommentUser();

  const src = user?.avatarUrl;
  const alt = `Avatar of ${user?.name}`;

  return { src, alt, ...props };
};

export const AvatarImage = createComponentAs<AvatarImageProps>((props) => {
  const htmlProps = useAvatarImage(props);
  return createElementAs('img', htmlProps);
});
