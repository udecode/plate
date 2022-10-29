import { Value } from '@udecode/plate-core';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { CloudImageElementStyleProps } from './CloudImageElement.types';

export const getCloudImageElementStyles = <V extends Value>(
  props: CloudImageElementStyleProps<V>
) => {
  const { focused, selected } = props;
  return createStyles(
    { prefixClassNames: 'CloudAttachmentElement', ...props },
    {
      // container
      root: [tw`relative my-4`],
      img: [
        tw`rounded-lg`,
        focused &&
          selected &&
          css`
            box-shadow: 0 0 1px 3px #60a5fa;
          `,
      ],
      // // file icon
      // file: [tw`flex-shrink-0 text-gray-400`],
      // filename: [tw`text-base`],
      // caption: [tw`text-sm text-gray-500`],
      // // filename and progress bar
      // body: [tw`flex-grow`],
      // // download
      // download: [tw`flex-shrink-0 w-8 h-8 ml-4 duration-200`],
      // downloadIcon: [tw`text-gray-400 cursor-pointer hover:text-blue-500`],
    }
  );
};
