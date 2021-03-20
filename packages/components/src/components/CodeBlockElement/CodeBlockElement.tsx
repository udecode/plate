import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { getRootClassNames } from '../../types';
import { StyledElementProps } from '../StyledElement/StyledElement.types';
import { NodeStyleProps } from '../StyledNode/StyledNode.types';
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
  nodeProps,
}: StyledElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  return (
    <pre {...attributes} className={classNames.root} {...nodeProps}>
      <code>{children}</code>
    </pre>
  );
};

/**
 * CodeBlockElement
 */
export const CodeBlockElement = styled<
  StyledElementProps,
  NodeStyleProps,
  NonNullable<StyledElementProps['styles']>
>(CodeBlockElementBase, getCodeBlockElementStyles, undefined, {
  scope: 'CodeBlockElement',
});
