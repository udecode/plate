import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { ToolbarButtonProps } from './ToolbarButton.types';

export const getToolbarButtonStyles = (props: ToolbarButtonProps) =>
  createStyles(
    { prefixClassNames: 'ToolbarButton', ...props },
    {
      root: [
        tw`flex justify-center items-center select-none cursor-pointer align-middle`,
        tw`width[32px] height[40px]`,
        tw`bg-white border-none outline-none`,
        css`
          > svg {
            ${tw`block w-5 h-5`}
          }
        `,
      ],
      ...(props.active && { active: {} }),
    }
  );
