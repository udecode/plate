import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { getStyledNodeStyles } from '../StyledNode/StyledNode.styles';
import { ClassName, RootStyleSet } from '../StyledNode/StyledNode.types';
import { getRootClassNames } from '../types';
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
  as: Tag = 'span',
  nodeProps,
}: StyledLeafProps) => {
  const classNames = getClassNames(styles, {
    className,
  });

  return (
    <Tag className={classNames.root} {...nodeProps}>
      {children}
    </Tag>
  );
};

export const StyledLeaf = styled<StyledLeafProps, ClassName, RootStyleSet>(
  StyledLeafBase,
  getStyledNodeStyles,
  undefined,
  {
    scope: 'StyledLeaf',
  }
);
