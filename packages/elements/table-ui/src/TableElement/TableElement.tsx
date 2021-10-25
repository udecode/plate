import * as React from 'react';
import { withProviders } from '@udecode/plate-common';
import { Provider } from 'jotai';
import { useStoreElementAtom } from '../hooks/useStoreElementAtom';
import { useTableColSizes } from '../hooks/useTableColSizes';
import { TablePopover } from '../TablePopover/TablePopover';
import { getTableElementStyles } from './TableElement.styles';
import { TableElementProps } from './TableElement.types';

const TableElementRaw = (props: TableElementProps) => {
  const {
    attributes,
    children,
    nodeProps,
    styles,
    element,
    classNames,
    prefixClassNames,
    transformColSizes,
    ...rootProps
  } = props;

  const { root, tbody } = getTableElementStyles(props);

  let colSizes = useTableColSizes(element);

  if (transformColSizes) {
    colSizes = transformColSizes(colSizes);
  }

  useStoreElementAtom(element);

  return (
    <TablePopover>
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
    </TablePopover>
  );
};

export const TableElement = withProviders(Provider)(TableElementRaw);
