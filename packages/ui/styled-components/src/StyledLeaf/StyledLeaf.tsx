import * as React from 'react';
import { getStyledNodeStyles } from '../utils/getStyledNodeStyles';
import { StyledLeafProps } from './StyledLeaf.types';

/**
 * StyledLeaf with no default styles.
 */
export const StyledLeaf = ({
  children,
  styles,
  as = 'span',
  nodeProps,
  className,
}: StyledLeafProps) => {
  const { root } = getStyledNodeStyles({ styles, ...nodeProps });

  return (
    <span as={as} css={root.css} className={className} {...nodeProps}>
      {children}
    </span>
  );
};
