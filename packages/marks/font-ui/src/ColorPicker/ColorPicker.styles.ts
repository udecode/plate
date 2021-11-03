import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';

export const getColorPickerStyles = () =>
  createStyles(
    { prefixClassNames: 'ColorPicker' },
    {
      root: [tw`p-4 flex flex-col space-y-4`],
    }
  );
