import { createStyles } from '@udecode/slate-plugins-ui';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { TagElementStyleProps } from './TagElement.types';

export const getTagElementStyles = (props: TagElementStyleProps) => {
  const { focused, selected } = props;

  const selectedFocused = selected && focused;

  return createStyles(
    { prefixClassNames: 'TagElement', ...props },
    {
      root: [
        tw`inline-block`,
        tw`lineHeight[1.2]`,
        selectedFocused && tw`outline[rgb(0, 120, 212) auto 1px]`,
      ],
      link: [
        tw`no-underline hover:underline whitespace-nowrap `,
        css`
          color: rgb(0, 120, 212) !important;
        `,
      ],
    }
  );
};
