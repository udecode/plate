import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import {
  CodeLineElementProps,
  CodeLineElementStyleProps,
  CodeLineElementStyles,
} from '../types';
import { getCodeLineElementStyles } from './CodeLineElement.styles';

const getClassNames = classNamesFunction<
  CodeLineElementStyleProps,
  CodeLineElementStyles
>();

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
}: CodeLineElementProps) => {
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
  CodeLineElementProps,
  CodeLineElementStyleProps,
  CodeLineElementStyles
>(CodeLineElementBase, getCodeLineElementStyles, undefined, {
  scope: 'CodeBlockElement',
});
