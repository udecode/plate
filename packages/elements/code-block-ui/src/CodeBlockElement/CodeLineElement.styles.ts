import { createStyles, StyledElementProps } from '@udecode/slate-plugins-ui';

export const getCodeLineElementStyles = (props: StyledElementProps) =>
  createStyles(
    { prefixClassNames: 'CodeLineElement', ...props },
    {
      root: [{}],
    }
  );
