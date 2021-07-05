import { createStyles, StyledElementProps } from '@udecode/slate-plugins-ui';

export const getBlockquoteElementStyles = (props: StyledElementProps) =>
  createStyles(
    { prefixClassNames: 'BlockquoteElement', ...props },
    {
      root: [
        {
          borderLeft: '2px solid #ddd',
          padding: '10px 20px 10px 16px',
          color: '#aaa',
          margin: '8px 0',
        },
      ],
    }
  );
