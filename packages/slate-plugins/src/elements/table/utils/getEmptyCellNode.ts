import { defaultTableTypes } from 'elements/table/types';

export const getEmptyCellNode = (options = defaultTableTypes) => ({
  type: options.typeTd,
  children: [{ text: '' }],
});
