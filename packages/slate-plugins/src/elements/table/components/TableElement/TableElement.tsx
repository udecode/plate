import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import {
  TableElementProps,
  TableElementStyleProps,
  TableElementStyles,
} from '../../types';
import { getTableElementStyles } from './TableElement.styles';

const getClassNames = classNamesFunction<
  TableElementStyleProps,
  TableElementStyles
>();

/**
 * TableElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const TableElementBase = ({
  attributes,
  children,
  className,
  styles,
  htmlAttributes,
}: TableElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  return (
    <table {...attributes} className={classNames.root} {...htmlAttributes}>
      <tbody>{children}</tbody>
    </table>
  );
};

/**
 * TableElement
 */
export const TableElement = styled<
  TableElementProps,
  TableElementStyleProps,
  TableElementStyles
>(TableElementBase, getTableElementStyles, undefined, {
  scope: 'TableElement',
});
