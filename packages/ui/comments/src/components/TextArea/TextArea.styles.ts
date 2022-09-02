import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { TextAreaStyleProps } from './TextArea.types';

export const getTextAreaStyles = (props: TextAreaStyleProps) => {
  return createStyles(
    {
      prefixClassNames: 'TextArea',
      ...props,
    },
    {
      root: [
        tw`h-10 w-full resize-none border-solid border border-gray-300 text-gray-600 rounded outline-none p-2 break-words text-sm`,
      ],
    }
  );
};
