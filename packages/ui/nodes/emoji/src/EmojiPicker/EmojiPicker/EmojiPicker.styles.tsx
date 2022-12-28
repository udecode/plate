import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { EmojiPickerStyleProps } from './EmojiPicker.types';

export const getEmojiPickerStyles = (props?: EmojiPickerStyleProps) =>
  createStyles(
    { prefixClassNames: 'EmojiPicker', ...props },
    {
      root: [
        css`
          box-shadow: rgb(15 15 15 / 5%) 0 0 0 1px,
            rgb(15 15 15 / 10%) 0 3px 6px, rgb(15 15 15 / 20%) 0 9px 24px;
        `,
        tw`w-[316px] h-[350px] flex flex-col bg-white rounded`,
      ],
    }
  );
