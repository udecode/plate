import * as React from 'react';
import {
  ClassName,
  getRootClassNames,
  RootStyleSet,
  StyledElementProps,
} from '@udecode/slate-plugins-ui-fluent';
import { styled } from '@uifabric/utilities';
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
  ClassName,
  RootStyleSet
>(CodeLineElementBase, getCodeLineElementStyles, undefined, {
  scope: 'CodeBlockElement',
});
