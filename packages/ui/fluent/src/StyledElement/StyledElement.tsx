import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { getStyledNodeStyles } from '../StyledNode/StyledNode.styles';
import { ClassName, RootStyleSet } from '../StyledNode/StyledNode.types';
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
  as: Tag = 'div',
  nodeProps,
  ...otherProps
}: StyledElementProps) => {
  const classNames = getClassNames(styles, {
    className,
  });

  return (
    <Tag
      {...attributes}
      className={classNames.root}
      {...nodeProps}
      {...otherProps}
    >
      {children}
    </Tag>
  );
};

export const StyledElement = styled<
  StyledElementProps,
  ClassName,
  RootStyleSet
>(StyledElementBase, getStyledNodeStyles, undefined, {
  scope: 'StyledElement',
});
