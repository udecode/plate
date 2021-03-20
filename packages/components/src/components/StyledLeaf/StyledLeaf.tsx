import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { getRootClassNames } from '../../types';
import { getStyledNodeStyles } from '../StyledNode/StyledNode.styles';
import { NodeStyleProps } from '../StyledNode/StyledNode.types';
import { StyledLeafProps } from './StyledLeaf.types';

const getClassNames = getRootClassNames();

/**
 * StyledLeaf with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const StyledLeafBase = ({
  children,
  className,
  styles,
  as = 'span',
  nodeProps,
}: StyledLeafProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  const Tag = as;

  return (
    <Tag className={classNames.root} {...nodeProps}>
      {children}
    </Tag>
  );
};

export const StyledLeaf = styled<
  StyledLeafProps,
  NodeStyleProps,
  NonNullable<StyledLeafProps['styles']>
>(StyledLeafBase, getStyledNodeStyles, undefined, {
  scope: 'StyledLeaf',
});
