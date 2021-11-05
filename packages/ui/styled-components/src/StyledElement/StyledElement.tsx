import React from 'react';
import castArray from 'lodash/castArray';
import { getRootProps } from '../utils/getRootProps';
import { getStyledNodeStyles } from '../utils/getStyledNodeStyles';
import { StyledElementProps } from './StyledElement.types';

/**
 * StyledElement with no default styles.
 */
export const StyledElement = (props: StyledElementProps) => {
  const { attributes, children, nodeProps, styles } = props;

  const rootProps = getRootProps(props);
  const rootStyles = castArray(styles?.root ?? []);
  const nodePropsStyles = nodeProps?.styles?.root?.css ?? [];

  const { root } = getStyledNodeStyles({
    ...nodeProps,
    styles: { root: [...rootStyles, ...nodePropsStyles] },
  });

  return (
    <div {...attributes} css={root.css} {...rootProps} {...nodeProps}>
      {children}
    </div>
  );
};
