import {
  createStyles,
  StyledElementProps,
} from '@udecode/plate-styled-components';

export const getCodeLineElementStyles = (props: StyledElementProps) =>
  createStyles(
    { prefixClassNames: 'CodeLineElement', ...props },
    {
      root: [{}],
    }
  );
