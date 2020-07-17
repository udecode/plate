import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { getStyledComponentStyles } from './StyledComponent.styles';
import {
  StyledComponentStyleProps,
  StyledComponentStyles,
  StyledLeafProps,
} from './StyledComponent.types';

const getClassNames = classNamesFunction<
  StyledComponentStyleProps,
  StyledComponentStyles
>();

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
  StyledComponentStyleProps,
  StyledComponentStyles
>(StyledLeafBase, getStyledComponentStyles, undefined, {
  scope: 'StyledLeaf',
});
