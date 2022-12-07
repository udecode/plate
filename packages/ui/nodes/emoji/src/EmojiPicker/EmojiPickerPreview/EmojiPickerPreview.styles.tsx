import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { EmojiPickerPreviewStyleProps } from './EmojiPickerPreview.types';

export const getEmojiPickerPreviewStyles = (
  props?: EmojiPickerPreviewStyleProps
) =>
  createStyles(
    { prefixClassNames: 'EmojiPickerPreview', ...props },
    {
      root: [
        tw`flex p-2 items-center border-t border-t-gray-100`,
        css`
          border-top-style: solid;
        `,
      ],
      content: [tw`pl-2`],
      emoji: [tw`flex items-center justify-center text-3xl`],
      title: [tw`text-gray-600 text-sm`],
      subtitle: [tw`text-gray-400 text-xs`],
      text: [tw`text-gray-400 text-lg`],
    }
  );
