import { createStyles } from '@udecode/slate-plugins-ui';
import { ToolbarProps } from './Toolbar.types';

export const getToolbarStyles = (props: ToolbarProps) =>
  createStyles(
    { prefixClassNames: 'Toolbar', ...props },
    {
      root: [
        {
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'content-box',
          userSelect: 'none',
          minHeight: 40,
          color: 'rgb(68, 68, 68)',
        },
      ],
    }
  );
