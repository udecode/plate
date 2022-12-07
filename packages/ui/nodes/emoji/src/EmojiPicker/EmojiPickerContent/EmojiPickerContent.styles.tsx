import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { EmojiPickerContentStyleProps } from './EmojiPickerContent.types';

export const getEmojiPickerContentStyles = (
  props?: EmojiPickerContentStyleProps
) =>
  createStyles(
    { prefixClassNames: 'EmojiPickerPreview', ...props },
    {
      root: [tw`px-3 overflow-x-hidden overflow-y-auto h-full min-h-[50%]`],
      content: [tw`h-full w-[288px]`],
      sticky: [
        tw`sticky z-[1] backdrop-blur-[4px] bg-white/90  font-medium -top-px py-1 px-1`,
      ],
      category: [tw`relative flex flex-wrap`],
      button: [
        tw`relative cursor-pointer flex justify-center items-center w-[36px] h-[36px] text-2xl leading-none border-none bg-transparent`,
      ],
      buttonBg: [
        tw`rounded-full opacity-0 absolute group-hover:opacity-100`,
        css`
          inset: 0;
          background-color: rgba(0, 0, 0, 0.05);
        `,
      ],
    }
  );
