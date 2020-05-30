import { defaultTableTypes } from '../types';

export const getEmptyCellNode = (options = defaultTableTypes) => ({
  type: options.typeTd,
  children: [{ text: '' }],
});
