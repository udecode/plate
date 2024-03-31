import { Path } from 'slate';

export const getCellRowIndexByPath = (cellPath: Path): number => {
  return cellPath.at(-2) ?? -1;
};
