import React from 'react';
import { Value } from '@udecode/plate-core';
import { getRootProps } from '@udecode/plate-styled-components';
import { useSelectedCells } from '../hooks/useSelectedCells';
import { useTableColSizes } from '../hooks/useTableColSizes';
import { useTableStore } from '../table.atoms';
import { TablePopover } from '../TablePopover/TablePopover';
import { getTableElementStyles } from './TableElement.styles';
import { TableElementProps } from './TableElement.types';

export const TableElement = <V extends Value>({
  transformColSizes,
  popoverProps,
  ...props
}: TableElementProps<V>) => {
  const { attributes, children, nodeProps, element } = props;

  const rootProps = getRootProps(props);

  const selectedCells = useTableStore().get.selectedCells();

  const { root, tbody } = getTableElementStyles({
    ...props,
    isSelectingCell: !!selectedCells,
  });

  let colSizes = useTableColSizes(element);

  if (transformColSizes) {
    colSizes = transformColSizes(colSizes);
  }

  useSelectedCells();

  return (
    <table
      {...attributes}
      css={root.css}
      className={root.className}
      {...rootProps}
      {...nodeProps}
    >
      <colgroup contentEditable={false}>
        {colSizes.map((width, index) => (
          <col key={index} style={width ? { width } : undefined} />
        ))}
      </colgroup>

      <TablePopover {...popoverProps}>
        <tbody css={tbody?.css} className={tbody?.className}>
          {children}
        </tbody>
      </TablePopover>
    </table>
  );
};
