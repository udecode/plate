import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { getStyledNodeStyles } from '../StyledNode/StyledNode.styles';
import { NodeStyleProps } from '../StyledNode/StyledNode.types';
import { getRootClassNames } from '../types';
import { StyledElementProps } from './StyledElement.types';

const getClassNames = getRootClassNames();

/**
 * StyledElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const StyledElementBase = ({
  attributes,
  children,
  className,
  styles,
  as = 'div',
  nodeProps,
}: StyledElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  const Tag = as;

  return (
    <Tag {...attributes} className={classNames.root} {...nodeProps}>
      {children}
    </Tag>
  );
};

export const StyledElement = styled<
  StyledElementProps,
  NodeStyleProps,
  NonNullable<StyledElementProps['styles']>
>(StyledElementBase, getStyledNodeStyles, undefined, {
  scope: 'StyledElement',
});
