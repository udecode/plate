import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { ElementProps, getRootClassNames, NodeStyleProps } from '../../types';
import { getCodeLineElementStyles } from './CodeLineElement.styles';

const getClassNames = getRootClassNames();

/**
 *   CodeLineElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const CodeLineElementBase = ({
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
    <div {...attributes} className={classNames.root} {...htmlAttributes}>
      {children}
    </div>
  );
};

/**
 * CodeBlockElement
 */
export const CodeLineElement = styled<
  ElementProps,
  NodeStyleProps,
  NonNullable<ElementProps['styles']>
>(CodeLineElementBase, getCodeLineElementStyles, undefined, {
  scope: 'CodeBlockElement',
});
