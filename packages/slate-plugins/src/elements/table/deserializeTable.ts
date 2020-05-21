import { DeserializeHtml } from 'common/types';
import { getElementDeserializer } from 'element/utils';
import { TableDeserializeOptions, TableType } from './types';

export const deserializeTable = ({
  typeTable = TableType.TABLE,
  typeTr = TableType.ROW,
  typeTd = TableType.CELL,
}: TableDeserializeOptions = {}): DeserializeHtml => ({
  element: {
    ...getElementDeserializer(typeTable, { tagNames: ['TABLE'] }),
    ...getElementDeserializer(typeTr, { tagNames: ['TR'] }),
    ...getElementDeserializer(typeTd, { tagNames: ['TD'] }),
  },
});
