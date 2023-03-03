import React, { CSSProperties } from 'react';
import { collapseSelection, Value } from '@udecode/plate-core';
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
  const {
    attributes,
    children,
    nodeProps,
    editor,
    element,
    minColWidth = 48,
  } = props;

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

  // if the last colSize is bigger than 0, we add a new colSize of 100% to the end
  if (!colSizes.some((size) => size === 0)) {
    colSizes.push('100%' as any);
  }

  useSelectedCells();

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <table
      {...attributes}
      css={root.css}
      className={root.className}
      onMouseDown={() => {
        // until cell dnd is supported, we collapse the selection on mouse down
        if (selectedCells) {
          collapseSelection(editor);
        }
      }}
      {...rootProps}
      {...nodeProps}
    >
      <colgroup contentEditable={false} style={{ width: '100%' }}>
        {colSizes.map((width, index) => {
          const style: CSSProperties = {
            minWidth: minColWidth,
          };
          if (width) {
            style.width = width;
          }

          return <col key={index} style={style} />;
        })}
      </colgroup>

      <TablePopover {...popoverProps}>
        <tbody css={tbody?.css} className={tbody?.className}>
          {children}
        </tbody>
      </TablePopover>
    </table>
  );
};
