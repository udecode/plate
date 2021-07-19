import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { ToolbarProps } from './Toolbar.types';

export const getToolbarStyles = (props: ToolbarProps) =>
  createStyles(
    { prefixClassNames: 'Toolbar', ...props },
    {
      root: [
        tw`flex items-center select-none box-content`,
        tw`color[rgb(68, 68, 68)] minHeight[40px]`,
      ],
    }
  );
