import { Value } from '@udecode/plate-core';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { CloudAttachmentElementStyleProps } from './CloudAttachmentElement.types';

export const getCloudAttachmentElementStyles = <V extends Value>(
  props: CloudAttachmentElementStyleProps<V>
) => {
  const { focused, selected } = props;
  return createStyles(
    { prefixClassNames: 'CloudAttachmentElement', ...props },
    {
      root: [
        tw`relative flex items-center h-10 max-w-sm gap-2 p-4 my-4 bg-black bg-white border border-gray-200 border-solid rounded-lg`,
        focused && selected && tw`border-blue-400`,
      ],
      file: [tw`flex-shrink-0 text-gray-400`],
      body: [tw`flex-grow`],
      download: [
        tw`flex-shrink-0 w-8 h-8 text-gray-400 duration-200 cursor-pointer hover:text-blue-500`,
      ],
    }
  );
};
