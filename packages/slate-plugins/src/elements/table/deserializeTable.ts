import { DeserializeHtml } from 'deserializers/types';
import { TableType, TableTypeOptions } from './types';

export const deserializeTable = ({
  typeTable = TableType.TABLE,
  typeTr = TableType.ROW,
  typeTd = TableType.CELL,
}: TableTypeOptions = {}): DeserializeHtml => ({
  element: {
    TABLE: () => ({ type: typeTable }),
    TR: () => ({ type: typeTr }),
    TD: () => ({ type: typeTd }),
  },
});
