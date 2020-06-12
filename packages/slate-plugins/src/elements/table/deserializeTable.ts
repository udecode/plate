import { DeserializeHtml } from '../../common';
import { getElementDeserializer } from '../../element/utils';
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
