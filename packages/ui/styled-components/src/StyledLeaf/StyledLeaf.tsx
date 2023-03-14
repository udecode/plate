import React from 'react';
import { EText, TText, Value } from '@udecode/plate-common';
import castArray from 'lodash/castArray';
import { getRootProps } from '../utils/getRootProps';
import { getStyledNodeStyles } from '../utils/getStyledNodeStyles';
import { StyledLeafProps } from './StyledLeaf.types';

/**
 * StyledLeaf with no default styles.
 */
export const StyledLeaf = <V extends Value = Value, N extends TText = EText<V>>(
  props: StyledLeafProps<V, N>
) => {
  const { attributes, children, nodeProps, styles } = props;

  const rootProps = getRootProps(props);
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
