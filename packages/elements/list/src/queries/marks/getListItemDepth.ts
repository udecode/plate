import { castArray } from 'lodash';
import { Path } from 'slate';

export const getListItemDepth = (relativePath: Path): number =>
  (castArray(relativePath).length - 1) / 2 - 1;
