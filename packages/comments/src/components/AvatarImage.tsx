import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';
import { useUserById } from '../stores/comments/CommentsProvider';

export type AvatarImageProps = { userId: string } & HTMLPropsAs<'img'>;

export const useAvatarImage = ({
  userId,
  ...props
}: AvatarImageProps): HTMLPropsAs<'img'> => {
  const user = useUserById(userId);
  const src = user?.avatarUrl;
  const alt = `Avatar of ${user?.name}`;

  return { src, alt, ...props };
};

export const AvatarImage = createComponentAs<AvatarImageProps>((props) => {
  const htmlProps = useAvatarImage(props);
  return createElementAs('img', htmlProps);
});
