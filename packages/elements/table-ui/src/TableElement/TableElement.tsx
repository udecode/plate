import * as React from 'react';
import { withProviders } from '@udecode/plate-common';
import { getTableColumnCount } from '@udecode/plate-table';
import { Provider } from 'jotai';
import { useTableColSizes } from '../hooks/useTableColSizes';
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
    ...rootProps
  } = props;

  const { root, tbody } = getTableElementStyles(props);

  const colCount = getTableColumnCount(element);

  const colSizes = useTableColSizes(element);

  return (
    <table
      {...attributes}
      css={root.css}
      className={root.className}
      {...rootProps}
      {...nodeProps}
    >
      <colgroup>
        {Array.from(Array(colCount), (e, index) => {
          const width = colSizes?.[index];

          return <col key={index} style={width ? { width } : undefined} />;
        })}
      </colgroup>
      <tbody css={tbody?.css} className={tbody?.className}>
        {children}
      </tbody>
    </table>
  );
};

export const TableElement = withProviders(Provider)(TableElementRaw);
