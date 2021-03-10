import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { getRootClassNames, NodeStyleProps } from '../../types';
import { getStyledComponentStyles } from '../StyledComponent/StyledComponent.styles';
import { StyledLeafProps } from './StyledLeaf.types';

const getClassNames = getRootClassNames();

/**
 * StyledLeaf with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const StyledLeafBase = ({
  attributes,
  children,
  className,
  styles,
  as = 'span',
}: StyledLeafProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  const Tag = as;

  return (
    <Tag {...attributes} className={classNames.root}>
      {children}
    </Tag>
  );
};

export const StyledLeaf = styled<
  StyledLeafProps,
  NodeStyleProps,
  NonNullable<StyledLeafProps['styles']>
>(StyledLeafBase, getStyledComponentStyles, undefined, {
  scope: 'StyledLeaf',
});
