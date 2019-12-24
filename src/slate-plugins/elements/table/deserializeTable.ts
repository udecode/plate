import { DeserializeHtml } from 'slate-plugins';
import { TableType } from './types';

export const deserializeTable = (): DeserializeHtml => ({
  element: {
    TABLE: () => ({ type: TableType.TABLE }),
    TR: () => ({ type: TableType.ROW }),
    TD: () => ({ type: TableType.CELL }),
  },
});
