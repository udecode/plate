import * as React from 'react';
import castArray from 'lodash/castArray';
import { getStyledNodeStyles } from '../utils/getStyledNodeStyles';
import { StyledElementProps } from './StyledElement.types';

/**
 * StyledElement with no default styles.
 */
export const StyledElement = (props: StyledElementProps) => {
  const { attributes, children, as, nodeProps, className, styles } = props;

  const rootStyles = castArray(styles?.root ?? []);
  const nodePropsStyles = nodeProps?.styles?.root?.css ?? [];

  const { root } = getStyledNodeStyles({
    ...nodeProps,
    styles: { root: [...rootStyles, ...nodePropsStyles] },
  });

  return (
    <div
      {...attributes}
      as={as}
      css={root.css}
      className={className}
      {...nodeProps}
    >
      {children}
    </div>
  );
};
