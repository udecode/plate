import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { getStyledComponentStyles } from './StyledComponent.styles';
import {
  StyledComponentStyleProps,
  StyledComponentStyles,
  StyledElementProps,
} from './StyledComponent.types';

const getClassNames = classNamesFunction<
  StyledComponentStyleProps,
  StyledComponentStyles
>();

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

  const Tag = as;

  return (
    <Tag {...attributes} className={classNames.root} {...htmlAttributes}>
      {children}
    </Tag>
  );
};

export const StyledElement = styled<
  StyledElementProps,
  StyledComponentStyleProps,
  StyledComponentStyles
>(StyledElementBase, getStyledComponentStyles, undefined, {
  scope: 'StyledElement',
});
