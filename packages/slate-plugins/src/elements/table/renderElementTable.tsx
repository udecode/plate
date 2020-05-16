import { getElementComponent, getRenderElements } from 'element/utils';
import { TableCell } from 'elements/table/components/TableCell';
import { TableElement } from 'elements/table/components/TableElement';
import { RenderElementTableOptions, TableType } from './types';

export const renderElementTable = ({
  Table = TableElement,
  Row = getElementComponent('tr'),
  Cell = getElementComponent(TableCell),
  typeTable = TableType.TABLE,
  typeTr = TableType.ROW,
  typeTd = TableType.CELL,
}: RenderElementTableOptions = {}) =>
  getRenderElements([
    { component: Table, type: typeTable },
    { component: Row, type: typeTr },
    { component: Cell, type: typeTd },
  ]);
