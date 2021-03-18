import { useEffect } from 'react';
import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { getRootClassNames, NodeStyleProps } from '../../types';
import { getStyledComponentStyles } from '../StyledComponent/StyledComponent.styles';
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
  htmlAttributes,
  as = 'div',
}: StyledElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  useEffect(() => {
    console.log('mount');
  }, []);

  const Tag = as;

  return (
    <Tag {...attributes} className={classNames.root} {...htmlAttributes}>
      {children}
    </Tag>
  );
};

export const StyledElement = styled<
  StyledElementProps,
  NodeStyleProps,
  NonNullable<StyledElementProps['styles']>
>(StyledElementBase, getStyledComponentStyles, undefined, {
  scope: 'StyledElement',
});
