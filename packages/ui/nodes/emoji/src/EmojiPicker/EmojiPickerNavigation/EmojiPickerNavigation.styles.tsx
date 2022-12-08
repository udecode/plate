import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { EmojiPickerNavigationStyleProps } from './EmojiPickerNavigation.types';

export const getEmojiPickerNavigationStyles = (
  props?: EmojiPickerNavigationStyleProps
) =>
  createStyles(
    { prefixClassNames: 'EmojiPickerNavigation', ...props },
    {
      root: [tw`p-3`],
      button: [
        tw`flex flex-grow items-center border-none bg-transparent text-sm cursor-pointer text-gray-500 fill-current hover:text-gray-800`,
      ],
      selected: [tw`text-purple-500 fill-current`],
      bar: [
        tw`absolute opacity-100 left-0 -bottom-3 h-[3px] w-full bg-purple-500 transition-transform duration-200 rounded-t`,
      ],
    }
  );
