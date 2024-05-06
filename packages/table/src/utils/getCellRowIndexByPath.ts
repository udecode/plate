import type { Path } from 'slate';

export const getCellRowIndexByPath = (cellPath: Path): number => {
  const index = cellPath.at(-2);

  if (index === undefined)
    throw new Error(`can not get rowIndex of path ${cellPath}`);

  return index;
};
