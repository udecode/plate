import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { ElementProps, getRootClassNames, NodeStyleProps } from '../../types';
import { getCodeBlockElementStyles } from './CodeBlockElement.styles';

const getClassNames = getRootClassNames();

/**
 *   CodeBlockElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const CodeBlockElementBase = ({
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
    <pre {...attributes} className={classNames.root} {...htmlAttributes}>
      <code>{children}</code>
    </pre>
  );
};

/**
 * CodeBlockElement
 */
export const CodeBlockElement = styled<
  ElementProps,
  NodeStyleProps,
  NonNullable<ElementProps['styles']>
>(CodeBlockElementBase, getCodeBlockElementStyles, undefined, {
  scope: 'CodeBlockElement',
});
