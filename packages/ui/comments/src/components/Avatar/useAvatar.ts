import { AvatarProps } from './Avatar.types';

export const useAvatar = (props: AvatarProps) => {
  const { user } = props;

  return { user } as const;
};
