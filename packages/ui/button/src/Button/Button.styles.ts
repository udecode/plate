import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { ButtonStyleProps } from './Button.types';

export const getButtonStyles = (props: ButtonStyleProps) => {
  const { px, py, size } = props;

  return createStyles(
    { prefixClassNames: 'Button', ...props },
    {
      root: [
        tw`relative inline-flex justify-center items-center text-center max-w-full p-0`,
        tw`border-0 font-medium cursor-pointer`,
        tw`bg-white hover:bg-gray-100 active:bg-gray-200`,
        !size
          ? tw`px-2.5 py-1`
          : {
              width: size,
              height: size,
            },
        px && {
          paddingLeft: px,
          paddingRight: px,
        },
        py && {
          paddingTop: py,
          paddingBottom: py,
        },
        css`
          font-family: inherit;
          font-size: 14px;
          border-radius: 3px;
        `,
      ],
    }
  );
};
