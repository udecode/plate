import { Value } from '@udecode/plate-common';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { HrElementStyleProps } from './HrElement.types';

export const getHrElementStyles = <V extends Value>(
  props: HrElementStyleProps<V>
) => {
  const { selected, focused } = props;

  return createStyles(
    { prefixClassNames: 'HrElement', ...props },
    {
      root: [],
      hr: [
        tw`cursor-pointer py-1 my-6 bg-clip-content border-none bg-gray-200`,
        css`
          height: 2px;
          border-radius: 1px;
        `,
        selected && focused && tw`bg-blue-500`,
      ],
    }
  );
};
