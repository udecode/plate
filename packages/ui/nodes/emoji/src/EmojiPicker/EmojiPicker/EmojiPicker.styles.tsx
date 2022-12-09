import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { EmojiPickerStyleProps } from './EmojiPicker.types';

export const getEmojiPickerStyles = (props?: EmojiPickerStyleProps) =>
  createStyles(
    { prefixClassNames: 'EmojiPicker', ...props },
    {
      root: [tw` w-[312px] h-[350px] flex flex-col`],
    }
  );
