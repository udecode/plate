import { Value } from '@udecode/plate-common';
import {
  createStyles,
  PlateElementProps,
} from '@udecode/plate-styled-components';

export const getCodeLineElementStyles = <V extends Value>(
  props: PlateElementProps<V>
) =>
  createStyles(
    { prefixClassNames: 'CodeLineElement', ...props },
    {
      root: [{}],
    }
  );
