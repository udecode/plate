import { getElementComponent } from '../../common/utils/getElementComponent';
import { getRenderElements } from '../../common/utils/getRenderElement';
import { TableCell, TableElement } from './components';
import { TableRenderElementOptions, TableType } from './types';

export const renderElementTable = ({
  Table = TableElement,
  Row = getElementComponent('tr'),
  Cell = getElementComponent(TableCell),
  typeTable = TableType.TABLE,
  typeTr = TableType.ROW,
  typeTd = TableType.CELL,
  typeTh = TableType.HEAD,
}: TableRenderElementOptions = {}) =>
  getRenderElements([
    { component: Table, type: typeTable },
    { component: Row, type: typeTr },
    { component: Cell, type: typeTd },
    { component: Cell, type: typeTh },
  ]);
