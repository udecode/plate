import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { EmojiPickerPreviewStyleProps } from './EmojiPickerPreview.types';

export const getEmojiPickerPreviewStyles = (
  props?: EmojiPickerPreviewStyleProps
) => {
  const text = [
    tw`overflow-hidden whitespace-nowrap`,
    css`
      text-overflow: ellipsis;
    `,
  ];

  return createStyles(
    { prefixClassNames: 'EmojiPickerPreview', ...props },
    {
      root: [
        tw`flex p-2 items-center border-solid border-0 border-t border-t-gray-100`,
      ],
      content: [tw`pl-2 overflow-hidden`],
      emoji: [tw`flex items-center justify-center text-3xl`],
      title: [...text, tw`text-gray-600 text-sm`],
      subtitle: [...text, tw`text-gray-400 text-xs`],
      text: [...text, tw`text-gray-400 text-lg`],
    }
  );
};
