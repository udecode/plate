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
      // content: [tw`h-full w-[288px]`],
      // sticky: [
      //   tw`sticky z-[1] backdrop-blur-[4px] bg-white/90  font-medium -top-px py-1 px-1`,
      // ],
      // category: [tw`relative flex flex-wrap`],
      button: [
        tw`flex flex-grow items-center border-none bg-transparent text-sm cursor-pointer text-gray-500 fill-current hover:text-gray-800`,
      ],
      // button: [
      //   tw`relative cursor-pointer flex justify-center items-center w-[36px] h-[36px] text-2xl leading-none border-none bg-transparent`,
      // ],
      // buttonBg: [
      //   tw`rounded-full opacity-0 absolute group-hover:opacity-100`,
      //   css`
      //     inset: 0;
      //     background-color: rgba(0, 0, 0, 0.05);
      //   `,
      // ],
    }
  );
