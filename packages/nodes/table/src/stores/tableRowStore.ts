import { createAtomStore } from '@udecode/plate-common';
import { ELEMENT_TR } from '../createTablePlugin';

export const { tableRowStore, useTableRowStore } = createAtomStore(
  {
    overrideSize: null as number | null,
  },
  { name: 'tableRow' as const, scope: ELEMENT_TR }
);
