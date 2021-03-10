import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { ElementProps, getRootClassNames, NodeStyleProps } from '../../types';
import { getBlockquoteElementStyles } from './BlockquoteElement.styles';

const getClassNames = getRootClassNames();

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
}: ElementProps) => {
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
  ElementProps,
  NodeStyleProps,
  NonNullable<ElementProps['styles']>
>(BlockquoteElementBase, getBlockquoteElementStyles, undefined, {
  scope: 'BlockquoteElement',
});
