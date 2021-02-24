import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { getBlockquoteElementStyles } from './BlockquoteElement.styles';
import {
  BlockquoteElementProps,
  BlockquoteElementStyleProps,
  BlockquoteElementStyles,
} from './BlockquoteElement.types';

const getClassNames = classNamesFunction<
  BlockquoteElementStyleProps,
  BlockquoteElementStyles
>();

/**
 * BlockquoteElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const BlockquoteElementBase = ({
  attributes,
  children,
  className,
  styles,
  htmlAttributes,
}: BlockquoteElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  return (
    <blockquote {...attributes} className={classNames.root} {...htmlAttributes}>
      {children}
    </blockquote>
  );
};

/**
 * BlockquoteElement
 */
export const BlockquoteElement = styled<
  BlockquoteElementProps,
  BlockquoteElementStyleProps,
  BlockquoteElementStyles
>(BlockquoteElementBase, getBlockquoteElementStyles, undefined, {
  scope: 'BlockquoteElement',
});
