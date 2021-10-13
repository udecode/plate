import * as React from 'react';
import castArray from 'lodash/castArray';
import { getStyledNodeStyles } from '../utils/getStyledNodeStyles';
import { StyledLeafProps } from './StyledLeaf.types';

/**
 * StyledLeaf with no default styles.
 */
export const StyledLeaf = (props: StyledLeafProps) => {
  const {
    attributes,
    children,
    nodeProps,
    styles,
    classNames,
    prefixClassNames,
    leaf,
    text,
    ...rootProps
  } = props;

  const rootStyles = castArray(styles?.root ?? []);
  const nodePropsStyles = nodeProps?.styles?.root?.css ?? [];

  const { root } = getStyledNodeStyles({
    ...nodeProps,
    styles: { root: [...rootStyles, ...nodePropsStyles] },
  });

  return (
    <span {...attributes} css={root.css} {...rootProps} {...nodeProps}>
      {children}
    </span>
  );
};
