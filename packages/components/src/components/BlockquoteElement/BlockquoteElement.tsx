import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { getRootClassNames } from '../../types';
import { StyledElementProps } from '../StyledElement/StyledElement.types';
import { NodeStyleProps } from '../StyledNode/StyledNode.types';
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
  nodeProps,
}: StyledElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  return (
    <blockquote {...attributes} className={classNames.root} {...nodeProps}>
      {children}
    </blockquote>
  );
};

/**
 * BlockquoteElement
 */
export const BlockquoteElement = styled<
  StyledElementProps,
  NodeStyleProps,
  NonNullable<StyledElementProps['styles']>
>(BlockquoteElementBase, getBlockquoteElementStyles, undefined, {
  scope: 'BlockquoteElement',
});
