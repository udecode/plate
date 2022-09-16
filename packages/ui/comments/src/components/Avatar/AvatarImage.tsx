import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { User } from '../../types';

export type AvatarImageProps = {
  user?: User;
} & HTMLPropsAs<'img'>;

export const useAvatarImage = (props: AvatarImageProps): HTMLPropsAs<'img'> => {
  const { user } = props;
  const src = user?.avatarUrl;
  const alt = `Avatar of ${user?.name}`;

  return { ...props, src, alt };
};

export const AvatarImage = createComponentAs<AvatarImageProps>((props) => {
  const htmlProps = useAvatarImage(props);
  return createElementAs('img', htmlProps);
});
