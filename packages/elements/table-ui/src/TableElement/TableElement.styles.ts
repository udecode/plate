import { createStyles, StyledElementProps } from '@udecode/slate-plugins-ui';

export const getTableElementStyles = (props: StyledElementProps) =>
  createStyles(
    { prefixClassNames: 'TableElement', ...props },
    {
      root: [
        {
          margin: '10px 0',
          borderCollapse: 'collapse',
          width: '100%',
        },
      ],
    }
  );
