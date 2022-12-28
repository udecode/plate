import { createStyles } from '@udecode/plate-styled-components';
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
    }
  );
