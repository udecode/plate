import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { getRootClassNames } from '../../types';
import { StyledElementProps } from '../StyledElement/StyledElement.types';
import { NodeStyleProps } from '../StyledNode/StyledNode.types';
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
}: StyledElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  return (
    <div {...attributes} className={classNames.root}>
      {children}
    </div>
  );
};

/**
 * CodeBlockElement
 */
export const CodeLineElement = styled<
  StyledElementProps,
  NodeStyleProps,
  NonNullable<StyledElementProps['styles']>
>(CodeLineElementBase, getCodeLineElementStyles, undefined, {
  scope: 'CodeBlockElement',
});
