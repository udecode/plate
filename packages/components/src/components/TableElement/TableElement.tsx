import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { ElementProps, getRootClassNames, NodeStyleProps } from '../../types';
import { getTableElementStyles } from './TableElement.styles';

const getClassNames = getRootClassNames();

/**
 * TableElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const TableElementBase = ({
  attributes,
  children,
  className,
  styles,
}: ElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  return (
    <table {...attributes} className={classNames.root}>
      <tbody>{children}</tbody>
    </table>
  );
};

/**
 * TableElement
 */
export const TableElement = styled<
  ElementProps,
  NodeStyleProps,
  NonNullable<ElementProps['styles']>
>(TableElementBase, getTableElementStyles, undefined, {
  scope: 'TableElement',
});
