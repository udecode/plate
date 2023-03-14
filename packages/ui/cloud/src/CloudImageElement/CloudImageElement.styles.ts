import { Value } from '@udecode/plate-common';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { statusBarStyleValues } from '../StatusBar/StatusBar.styles';
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
        tw`block rounded-lg`,
        focused &&
          selected &&
          css`
            box-shadow: 0 0 1px 3px #60a5fa;
          `,
      ],
      statusBarContainer: [tw`absolute top-[50%] left-2 right-2 -mt-2`],
      ...statusBarStyleValues,
    }
  );
};
