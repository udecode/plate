import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { Path } from 'slate';

export type LicSelection = {
  path: Path;
  level: boolean;
};

type Param = {
  id: string;
  selection?: LicSelection;
};

export const licSelectionState = atomFamily(
  (param: Param) => atom(param.selection),
  (a: Param, b: Param) => a.id === b.id
);
