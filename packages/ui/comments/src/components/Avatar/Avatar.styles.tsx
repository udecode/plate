import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { AvatarStyleProps } from './Avatar.types';

export const getAvatarStyles = (props: AvatarStyleProps) => {
  return createStyles(
    {
      prefixClassNames: 'Avatar',
      ...props,
    },
    {
      root: [tw`font-normal h-8 w-8 object-cover rounded-full`],
      avatar: [tw`rounded-full text-gray-400`],
    }
  );
};
