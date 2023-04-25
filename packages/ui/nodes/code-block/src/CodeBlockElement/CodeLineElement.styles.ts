import { Value } from '@udecode/plate-common';
import {
  createStyles,
  StyledElementProps,
} from '@udecode/plate-styled-components';

export const getCodeLineElementStyles = <V extends Value>(
  props: StyledElementProps<V>
) =>
  createStyles(
    { prefixClassNames: 'CodeLineElement', ...props },
    {
      root: [{}],
    }
  );
