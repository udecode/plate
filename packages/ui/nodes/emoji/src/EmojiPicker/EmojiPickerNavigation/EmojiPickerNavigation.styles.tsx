import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { EmojiPickerNavigationStyleProps } from './EmojiPickerNavigation.types';

export const getEmojiPickerNavigationStyles = (
  props?: EmojiPickerNavigationStyleProps
) =>
  createStyles(
    { prefixClassNames: 'EmojiPickerNavigation', ...props },
    {
      root: [tw`p-3 mb-2.5 border-solid border-0 border-b border-b-gray-100`],
      button: [
        tw`flex flex-grow items-center justify-center border-none bg-transparent text-sm cursor-pointer text-gray-500 fill-current hover:text-gray-800`,
      ],
      selected: [tw`text-blue-600 fill-current pointer-events-none`],
      bar: [
        tw`absolute opacity-100 left-0 -bottom-3 h-[3px] w-full bg-blue-600 transition-transform duration-200 rounded-t`,
      ],
    }
  );
