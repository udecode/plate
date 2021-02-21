import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import {
  CodeBlockElementProps,
  CodeBlockElementStyleProps,
  CodeBlockElementStyles,
} from '../types';
import { getCodeBlockElementStyles } from './CodeBlockElement.styles';

const getClassNames = classNamesFunction<
  CodeBlockElementStyleProps,
  CodeBlockElementStyles
>();

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
}: CodeBlockElementProps) => {
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
  CodeBlockElementProps,
  CodeBlockElementStyleProps,
  CodeBlockElementStyles
>(CodeBlockElementBase, getCodeBlockElementStyles, undefined, {
  scope: 'CodeBlockElement',
});
