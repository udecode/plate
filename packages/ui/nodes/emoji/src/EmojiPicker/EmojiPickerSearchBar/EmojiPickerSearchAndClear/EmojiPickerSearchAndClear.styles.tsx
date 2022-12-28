import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { EmojiPickerSearchAndClearStyleProps } from './EmojiPickerSearchAndClear.types';

export const getEmojiPickerSearchAndClearStyles = (
  props?: EmojiPickerSearchAndClearStyleProps
) =>
  createStyles(
    { prefixClassNames: 'EmojiPickerSearchAndClear', ...props },
    {
      loupeIcon: [
        tw`flex absolute w-5 h-5 z-10 top-1/2 left-2`,
        css`
          transform: translateY(-50%);
        `,
      ],
      clearIcon: [
        tw`border-none bg-transparent flex absolute w-8 h-8 top-1/2 right-0 cursor-pointer`,
        css`
          transform: translateY(-50%);
        `,
      ],
    }
  );
