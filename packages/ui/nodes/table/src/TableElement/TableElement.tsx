import React from 'react';
import { Value, withProviders } from '@udecode/plate-core';
import { getRootProps } from '@udecode/plate-styled-components';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { Provider, useAtom } from 'jotai';
import { useSelectedCells } from '../hooks/useSelectedCells';
import { useTableColSizes } from '../hooks/useTableColSizes';
import { selectedCellsAtom } from '../table.atoms';
import { TablePopover } from '../TablePopover/TablePopover';
import { getTableElementStyles } from './TableElement.styles';
import { TableElementProps } from './TableElement.types';

export const TableElementBase = <V extends Value>({
  transformColSizes,
  floatingOptions,
  ...props
}: TableElementProps<V>) => {
  const { attributes, children, nodeProps, element } = props;

  const rootProps = getRootProps(props);

  const [selectedCells] = useAtom(selectedCellsAtom);

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
      <colgroup>
        {colSizes.map((width, index) => (
          <col key={index} style={width ? { width } : undefined} />
        ))}
      </colgroup>

      <TablePopover floatingOptions={floatingOptions}>
        <tbody css={tbody?.css} className={tbody?.className}>
          {children}
        </tbody>
      </TablePopover>
    </table>
  );
};

export const TableElement = withProviders([Provider, { scope: ELEMENT_TABLE }])(
  TableElementBase
);
