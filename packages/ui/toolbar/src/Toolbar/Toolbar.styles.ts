import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { ToolbarProps } from './Toolbar.types';

export const getToolbarStyles = (props: ToolbarProps) =>
  createStyles(
    { prefixClassNames: 'Toolbar', ...props },
    {
      root: [
        tw`flex items-center select-none box-content`,
        tw`text-[rgb(68, 68, 68)] min-h-[40px]`,
      ],
    }
  );
