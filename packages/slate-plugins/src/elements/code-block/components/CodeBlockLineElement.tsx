import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import {
  CodeBlockLineElementProps,
  CodeBlockLineElementStyleProps,
  CodeBlockLineElementStyles,
} from '../types';
import { getCodeBlockLineElementStyles } from './CodeBlockLineElement.styles';

const getClassNames = classNamesFunction<
  CodeBlockLineElementStyleProps,
  CodeBlockLineElementStyles
>();

/**
 *   CodeBlockLIneElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const CodeBlockElementBase = ({
  attributes,
  children,
  className,
  styles,
  htmlAttributes,
}: CodeBlockLineElementProps) => {
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
export const CodeBlockLineElement = styled<
  CodeBlockLineElementProps,
  CodeBlockLineElementStyleProps,
  CodeBlockLineElementStyles
>(CodeBlockElementBase, getCodeBlockLineElementStyles, undefined, {
  scope: 'CodeBlockElement',
});
