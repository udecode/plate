import { Path } from 'slate';

export const getCellRowIndexByPath = (cellPath: Path): number => {
  return cellPath.slice(0, -1)[cellPath.length - 2];
};
