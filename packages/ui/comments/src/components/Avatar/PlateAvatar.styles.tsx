import { AvatarStyleProps } from '@udecode/plate-comments';
import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';

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
