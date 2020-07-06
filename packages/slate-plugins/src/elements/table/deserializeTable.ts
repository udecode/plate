import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import { TableDeserializeOptions, TableType } from './types';

export const deserializeTable = ({
  typeTable = TableType.TABLE,
  typeTr = TableType.ROW,
  typeTd = TableType.CELL,
  typeTh = TableType.HEAD,
}: TableDeserializeOptions = {}): DeserializeHtml => ({
  element: {
    ...getElementDeserializer(typeTable, { tagNames: ['TABLE'] }),
    ...getElementDeserializer(typeTr, { tagNames: ['TR'] }),
    ...getElementDeserializer(typeTd, { tagNames: ['TD'] }),
    ...getElementDeserializer(typeTh, { tagNames: ['TH'] }),
  },
});
