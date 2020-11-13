import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import {
  LinkElementProps,
  LinkElementStyleProps,
  LinkElementStyles,
} from '../types';
import { getLinkElementStyles } from './LinkElement.styles';

const getClassNames = classNamesFunction<
  LinkElementStyleProps,
  LinkElementStyles
>();

/**
 * LinkElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const LinkElementBase = ({
  attributes,
  children,
  element,
  styles,
  className,
  htmlAttributes,
}: LinkElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  return (
    <a
      {...attributes}
      href={element.url}
      className={classNames.root}
      {...htmlAttributes}
    >
      {children}
    </a>
  );
};

/**
 * LinkElement
 */
export const LinkElement = styled<
  LinkElementProps,
  LinkElementStyleProps,
  LinkElementStyles
>(LinkElementBase, getLinkElementStyles, undefined, {
  scope: 'LinkElement',
});
