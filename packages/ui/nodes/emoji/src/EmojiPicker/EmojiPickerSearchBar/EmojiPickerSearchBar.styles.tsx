import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { EmojiPickerSearchBarStyleProps } from './EmojiPickerSearchBar.types';

export const getEmojiPickerSearchBarStyles = (
  props?: EmojiPickerSearchBarStyleProps
) =>
  createStyles(
    { prefixClassNames: 'EmojiPickerSearchBar', ...props },
    {
      root: [tw`flex px-2 items-center`],
      input: [
        tw`w-full border-0 rounded-lg block px-8 py-2 outline-none bg-gray-100 appearance-none`,
      ],
      loupeIcon: [
        tw`flex absolute w-5 h-5 z-10 top-1/2 left-2`,
        css`
          transform: translateY(-50%);
        `,
      ],
      button: [
        tw`border-none bg-transparent flex absolute w-8 h-8 top-1/2 right-0 cursor-pointer`,
        css`
          transform: translateY(-50%);
        `,
      ],
    }
  );
