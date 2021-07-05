import { createStyles } from '@udecode/slate-plugins-ui';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { ToolbarButtonProps } from './ToolbarButton.types';

export const getToolbarButtonStyles = (props: ToolbarButtonProps) =>
  createStyles(
    { prefixClassNames: 'ToolbarButton', ...props },
    {
      root: [
        {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '28px',
          height: '24px',
          userSelect: 'none',
          cursor: 'pointer',
          verticalAlign: 'middle',
        },
        css`
          > svg {
            ${tw`block w-5 h-5`}
          }
        `,
      ],
      ...(props.active && { active: {} }),
    }
  );
