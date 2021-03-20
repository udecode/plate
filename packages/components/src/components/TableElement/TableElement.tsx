import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { getRootClassNames } from '../../types';
import { StyledElementProps } from '../StyledElement/StyledElement.types';
import { NodeStyleProps } from '../StyledNode/StyledNode.types';
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
  nodeProps,
}: StyledElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  return (
    <table {...attributes} className={classNames.root} {...nodeProps}>
      <tbody>{children}</tbody>
    </table>
  );
};

/**
 * TableElement
 */
export const TableElement = styled<
  StyledElementProps,
  NodeStyleProps,
  NonNullable<StyledElementProps['styles']>
>(TableElementBase, getTableElementStyles, undefined, {
  scope: 'TableElement',
});
