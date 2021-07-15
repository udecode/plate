import {
  createStyles,
  StyledElementProps,
} from '@udecode/slate-plugins-styled-components';

export const getCodeLineElementStyles = (props: StyledElementProps) =>
  createStyles(
    { prefixClassNames: 'CodeLineElement', ...props },
    {
      root: [{}],
    }
  );
