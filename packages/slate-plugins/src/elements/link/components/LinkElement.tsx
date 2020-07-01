import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { getLinkElementStyles } from './LinkElement.styles';
import {
  LinkElementProps,
  LinkElementStyleProps,
  LinkElementStyles,
} from './LinkElement.types';

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
}: LinkElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  return (
    <a {...attributes} href={element.url} className={classNames.root}>
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
