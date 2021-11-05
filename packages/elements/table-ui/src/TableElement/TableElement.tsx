import React from 'react';
import { withProviders } from '@udecode/plate-common';
import { getRootProps } from '@udecode/plate-styled-components';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { Provider } from 'jotai';
import { useTableColSizes } from '../hooks/useTableColSizes';
import { TablePopover } from '../TablePopover/TablePopover';
import { getTableElementStyles } from './TableElement.styles';
import { TableElementProps } from './TableElement.types';

export const TableElementBase = (props: TableElementProps) => {
  const {
    attributes,
    children,
    nodeProps,
    element,
    transformColSizes,
    onRenderContainer: Popover = TablePopover,
  } = props;

  const rootProps = getRootProps(props);

  const { root, tbody } = getTableElementStyles(props);

  let colSizes = useTableColSizes(element);

  if (transformColSizes) {
    colSizes = transformColSizes(colSizes);
  }

  return (
    <Popover {...props}>
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
        <tbody css={tbody?.css} className={tbody?.className}>
          {children}
        </tbody>
      </table>
    </Popover>
  );
};

export const TableElement = withProviders([Provider, { scope: ELEMENT_TABLE }])(
  TableElementBase
);
