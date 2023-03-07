import { Value } from '@udecode/plate-common';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { statusBarStyleValues } from '../StatusBar/StatusBar.styles';
import { CloudAttachmentElementStyleProps } from './CloudAttachmentElement.types';

export const getCloudAttachmentElementStyles = <V extends Value>(
  props: CloudAttachmentElementStyleProps<V>
) => {
  const { focused, selected } = props;

  return createStyles(
    { prefixClassNames: 'CloudAttachmentElement', ...props },
    {
      // container
      root: [
        tw`relative flex items-center h-10 max-w-sm gap-2 p-4 my-4 bg-black bg-white border border-gray-200 border-solid rounded-lg`,
        focused &&
          selected &&
          tw`border-blue-400` &&
          css`
            box-shadow: 0 0 1px 3px #60a5fa;
          `,
      ],
      // attachment icon
      attachmentContainer: [tw`flex-shrink-0 text-gray-400`],
      attachmentIcon: [],
      // body
      bodyContainer: [tw`flex-grow`],
      bodyFilename: [tw`text-base`],
      bodyCaption: [tw`text-sm text-gray-500`],
      // download
      downloadContainer: [tw`flex-shrink-0 w-8 h-8 ml-4 duration-200`],
      downloadIcon: [tw`text-gray-400 cursor-pointer hover:text-blue-500`],
      ...statusBarStyleValues,
    }
  );
};
