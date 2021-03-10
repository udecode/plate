import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { getRootClassNames, NodeStyleProps } from '../../types';
import { getStyledComponentStyles } from './StyledComponent.styles';
import { StyledComponentProps } from './StyledComponent.types';

const getClassNames = getRootClassNames();

/**
 * StyledComponent with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const StyledComponentBase = ({
  children,
  styles,
  className,
  as = 'div',
}: StyledComponentProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  const Tag = as;

  return <Tag className={classNames.root}>{children}</Tag>;
};

/**
 * StyledComponent
 */
export const StyledComponent = styled<
  StyledComponentProps,
  NodeStyleProps,
  NonNullable<StyledComponentProps['styles']>
>(StyledComponentBase, getStyledComponentStyles, undefined, {
  scope: 'StyledComponent',
});
