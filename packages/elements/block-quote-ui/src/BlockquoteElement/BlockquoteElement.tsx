import * as React from 'react';
import {
  ClassName,
  getRootClassNames,
  RootStyleSet,
  StyledElementProps,
} from '@udecode/slate-plugins-ui-fluent';
import { styled } from '@uifabric/utilities';
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
  ClassName,
  RootStyleSet
>(BlockquoteElementBase, getBlockquoteElementStyles, undefined, {
  scope: 'BlockquoteElement',
});
