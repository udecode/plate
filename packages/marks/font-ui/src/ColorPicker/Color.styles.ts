import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';

type ColorStyleProps = {
  value: string;
  isBrightColor: boolean;
};

export const getColorStyles = (props: ColorStyleProps) =>
  createStyles(
    { prefixClassNames: 'Color', ...props },
    {
      root: [
        tw`cursor-pointer h-8 w-8 border-0 rounded-full`,
        css`
          background-color: ${props.value};

          :hover {
            box-shadow: 0px 0px 5px 1px #9a9a9a;
          }
          :focus {
            box-shadow: 0px 0px 5px 1px #676767;
          }
        `,
        tw`border-2 border-gray-300 border-solid`,
        !props.isBrightColor && tw`border-transparent text-white`,
      ],
    }
  );
