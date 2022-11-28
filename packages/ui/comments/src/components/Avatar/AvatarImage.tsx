import { useCommentsSelectors } from '@udecode/plate-comments';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type AvatarImageProps = {
  userId: string;
} & HTMLPropsAs<'img'>;

export const useAvatarImage = (props: AvatarImageProps): HTMLPropsAs<'img'> => {
  const { userId } = props;

  const user = useCommentsSelectors().user(userId);

  const src = user?.avatarUrl;
  const alt = `Avatar of ${user?.name}`;

  return { ...props, src, alt };
};

export const AvatarImage = createComponentAs<AvatarImageProps>((props) => {
  const htmlProps = useAvatarImage(props);
  return createElementAs('img', htmlProps);
});
