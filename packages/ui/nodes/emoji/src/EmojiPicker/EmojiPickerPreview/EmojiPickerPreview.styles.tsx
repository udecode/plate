import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { EmojiPickerPreviewStyleProps } from './EmojiPickerPreview.types';

export const getEmojiPickerPreviewStyles = (
  props?: EmojiPickerPreviewStyleProps
) => {
  return createStyles(
    { prefixClassNames: 'EmojiPickerPreview', ...props },
    {
      root: [
        tw`flex p-2 items-center border-solid border-0 border-t border-t-gray-100`,
      ],
      content: [tw`pl-2 overflow-hidden`],
      emoji: [tw`flex items-center justify-center text-3xl`],
      title: [tw`text-gray-600 text-sm truncate`],
      subtitle: [tw`text-gray-400 text-xs truncate`],
      text: [tw`text-gray-400 text-lg truncate`],
    }
  );
};
